import { ORDER_STATUS_LABEL } from '../../lib/orders/orderFsm'
import { displayOrderNumber } from '../orders'
import type { OrderRecord, OrderStatus } from '../../types/order'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { fetchStaffOrders } from './ordersAdmin'
import { fetchStaffContactInquiries } from './contactAdmin'
import { listStaffProducts } from './productsAdmin'
import { listStaffCollections } from './collectionsAdmin'
import type { SalesPoint, StatusSlice } from '../../components/admin/DashboardCharts'

export type DashboardDateRange = { days: number } | { from: string; to: string }

export type DashboardStats = {
  rangeLabel: string
  ordersInRange: number
  ordersPendingPayment: number
  revenuePaidPhp: number
  revenuePreviousPhp: number
  averageOrderValuePhp: number
  messagesUnread: number
  productsLive: number
  collectionsLive: number
  lowStock: { name: string; slug: string; qty: number }[]
  recentOrders: { id: string; totalPhp: number; status: string; customer: string }[]
  salesOverTime: SalesPoint[]
  salesPreviousPeriod: SalesPoint[]
  salesSparkline: number[]
  ordersByStatus: StatusSlice[]
  topProducts: { name: string; units: number }[]
}

const DEFAULT_RANGE: DashboardDateRange = { days: 30 }

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: '#b8871d',
  proof_submitted: '#d4af37',
  payment_review: '#c9a227',
  paid: '#a8871d',
  fulfilled: '#3d6b4a',
  payment_rejected: '#b91c1c',
  cancelled: '#9aa3ad',
}

function isPaid(status: string) {
  return status === 'paid' || status === 'fulfilled'
}

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

function addDays(base: Date, delta: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + delta)
  return d
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function formatDayLabel(ymd: string) {
  const [y, m, day] = ymd.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function dayRangeFromTo(from: Date, to: Date): string[] {
  const out: string[] = []
  let cursor = startOfDay(from)
  const end = startOfDay(to)
  while (cursor <= end) {
    out.push(dayKey(cursor.toISOString()))
    cursor = addDays(cursor, 1)
  }
  return out
}

function dayRange(endInclusive: Date, count: number): string[] {
  const end = startOfDay(endInclusive)
  const out: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    out.push(dayKey(addDays(end, -i).toISOString()))
  }
  return out
}

function resolvePeriods(range: DashboardDateRange) {
  const today = startOfDay(new Date())
  if ('days' in range) {
    const currentKeys = dayRange(today, range.days)
    const prevEnd = addDays(today, -range.days)
    const previousKeys = dayRange(prevEnd, range.days)
    const from = startOfDay(addDays(today, -(range.days - 1)))
    const prevFrom = startOfDay(addDays(from, -range.days))
    const prevTo = endOfDay(addDays(from, -1))
    return {
      currentKeys,
      previousKeys,
      from,
      to: endOfDay(today),
      prevFrom,
      prevTo,
      label: `Last ${range.days} days`,
    }
  }

  const from = startOfDay(new Date(range.from))
  const to = endOfDay(new Date(range.to))
  const spanDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1)
  const prevTo = endOfDay(addDays(from, -1))
  const prevFrom = startOfDay(addDays(prevTo, -(spanDays - 1)))

  return {
    currentKeys: dayRangeFromTo(from, to),
    previousKeys: dayRangeFromTo(prevFrom, prevTo),
    from,
    to,
    prevFrom,
    prevTo,
    label: 'Custom range',
  }
}

function orderInSpan(o: OrderRecord, from: Date, to: Date) {
  const t = new Date(o.createdAt).getTime()
  return t >= from.getTime() && t <= to.getTime()
}

function buildSalesSeries(orders: OrderRecord[], keys: string[]): SalesPoint[] {
  const salesByDay: Record<string, number> = {}
  const ordersByDay: Record<string, number> = {}
  for (const k of keys) {
    salesByDay[k] = 0
    ordersByDay[k] = 0
  }
  for (const o of orders) {
    const k = dayKey(o.createdAt)
    if (!keys.includes(k)) continue
    ordersByDay[k] = (ordersByDay[k] ?? 0) + 1
    if (isPaid(o.status)) salesByDay[k] = (salesByDay[k] ?? 0) + o.totalPhp
  }
  return keys.map((k) => ({
    label: formatDayLabel(k),
    salesPhp: salesByDay[k] ?? 0,
    orderCount: ordersByDay[k] ?? 0,
  }))
}

function buildStatusSlices(orders: OrderRecord[]): StatusSlice[] {
  const counts: Partial<Record<OrderStatus, number>> = {}
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1
  }
  return (Object.keys(ORDER_STATUS_LABEL) as OrderStatus[])
    .map((status) => ({
      label: ORDER_STATUS_LABEL[status],
      count: counts[status] ?? 0,
      color: STATUS_COLORS[status],
    }))
    .filter((s) => s.count > 0)
}

function buildTopProducts(orders: OrderRecord[], limit = 5) {
  const tallies: Record<string, number> = {}
  for (const o of orders) {
    if (!isPaid(o.status)) continue
    for (const line of o.lines) {
      tallies[line.productName] = (tallies[line.productName] ?? 0) + line.quantity
    }
  }
  return Object.entries(tallies)
    .map(([name, units]) => ({ name, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, limit)
}

async function fetchLowStock(): Promise<DashboardStats['lowStock']> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: stock } = await sb.from('product_stock').select('product_slug, quantity_on_hand')
    const { data: products } = await sb.from('products').select('slug, name')
    const nameBySlug = Object.fromEntries((products ?? []).map((p) => [p.slug, p.name]))
    return (stock ?? [])
      .filter((r) => (r.quantity_on_hand as number) <= 5)
      .map((r) => ({
        slug: r.product_slug as string,
        name: nameBySlug[r.product_slug as string] ?? (r.product_slug as string),
        qty: r.quantity_on_hand as number,
      }))
  }
  const { products } = await listStaffProducts()
  return products
    .filter((p) => p.quantity_on_hand <= 5)
    .map((p) => ({ slug: p.slug, name: p.name, qty: p.quantity_on_hand }))
}

export async function fetchDashboardStats(range: DashboardDateRange = DEFAULT_RANGE): Promise<DashboardStats> {
  const period = resolvePeriods(range)

  const [{ orders }, contact, catalog, collections, lowStock] = await Promise.all([
    fetchStaffOrders(),
    fetchStaffContactInquiries(),
    listStaffProducts(),
    listStaffCollections(),
    fetchLowStock(),
  ])

  const inRange = orders.filter((o) => orderInSpan(o, period.from, period.to))
  const inPrevious = orders.filter((o) => orderInSpan(o, period.prevFrom, period.prevTo))

  const pending = inRange.filter((o) => ['pending_payment', 'proof_submitted', 'payment_review'].includes(o.status))
  const paidInRange = inRange.filter((o) => isPaid(o.status))
  const revenue = paidInRange.reduce((s, o) => s + o.totalPhp, 0)
  const revenuePrevious = inPrevious.filter((o) => isPaid(o.status)).reduce((s, o) => s + o.totalPhp, 0)

  const salesOverTime = buildSalesSeries(inRange, period.currentKeys)
  const salesPreviousPeriod = buildSalesSeries(inPrevious, period.previousKeys)
  const sparkKeys =
    period.currentKeys.length > 14 ? period.currentKeys.slice(-14) : period.currentKeys
  const salesSparkline = buildSalesSeries(inRange, sparkKeys).map((p) => p.salesPhp)

  const productsLive = catalog.products.filter((p) => p.published).length
  const collectionsLive = collections.collections.filter((c) => c.published).length
  const messagesUnread = contact.items.filter((m) => m.status === 'new' || !m.status).length

  const recentSorted = [...inRange].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return {
    rangeLabel: period.label,
    ordersInRange: inRange.length,
    ordersPendingPayment: pending.length,
    revenuePaidPhp: revenue,
    revenuePreviousPhp: revenuePrevious,
    averageOrderValuePhp: paidInRange.length ? revenue / paidInRange.length : 0,
    messagesUnread,
    productsLive,
    collectionsLive,
    lowStock,
    salesOverTime,
    salesPreviousPeriod,
    salesSparkline,
    ordersByStatus: buildStatusSlices(inRange),
    topProducts: buildTopProducts(inRange),
    recentOrders: recentSorted.slice(0, 5).map((o) => ({
      id: displayOrderNumber(o.id),
      totalPhp: o.totalPhp,
      status: o.status,
      customer: o.address.fullName,
    })),
  }
}