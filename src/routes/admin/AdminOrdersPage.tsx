import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatPhp } from '../../data/mock/products'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { applyStaffOrderAction, fetchStaffOrders, staffFulfillActionId } from '../../services/admin/ordersAdmin'
import { friendlyAdminError } from '../../lib/admin/messages'
import type { OrderRecord, OrderStatus } from '../../types/order'
import { AdminCard, AdminPage } from '../../components/admin/AdminShell'
import { displayOrderNumber } from '../../services/orders'
import {
  formatOrderDate,
  fulfillmentBadge,
  FulfillmentPill,
  HighRiskPill,
  paymentBadge,
  StatusPill,
} from '../../components/admin/orderBadges'
import { KpiSparkline } from '../../components/admin/DashboardCharts'

type OrderTab = 'all' | 'unpaid' | 'review' | 'paid' | 'fulfilled' | 'cancelled' | 'high_risk'

const TABS: { id: OrderTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'review', label: 'In review' },
  { id: 'paid', label: 'Paid' },
  { id: 'fulfilled', label: 'Fulfilled' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'high_risk', label: 'High risk' },
]

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<OrderTab>('all')
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchStaffOrders,
  })

  const orders = data?.orders ?? []

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      switch (tab) {
        case 'unpaid':
          return o.status === 'pending_payment' || o.status === 'payment_rejected'
        case 'review':
          return o.status === 'proof_submitted' || o.status === 'payment_review'
        case 'paid':
          return o.status === 'paid'
        case 'fulfilled':
          return o.status === 'fulfilled'
        case 'cancelled':
          return o.status === 'cancelled'
        case 'high_risk':
          return Boolean(o.highRisk)
        default:
          return true
      }
    })
  }, [orders, tab])

  const stats = useMemo(() => computeOrderStats(orders), [orders])

  const exportCsv = () => {
    if (!orders.length) return
    const header = ['Order', 'Date', 'Customer', 'Total', 'Payment', 'Fulfillment', 'Items']
    const rows = orders.map((o) => [
      displayOrderNumber(o.id),
      o.createdAt,
      o.address.fullName,
      String(o.totalPhp),
      paymentLabel(o.status),
      fulfillmentLabel(o.status),
      String(itemCount(o)),
    ])
    const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zion-orders.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <p className="text-sm text-admin-muted">Loading orders…</p>

  return (
    <AdminPage
      title="Orders"
      actions={
        <button
          type="button"
          onClick={() => exportCsv()}
          disabled={!orders.length}
          className="rounded-lg border border-admin-input bg-white px-3 py-1.5 text-sm font-semibold text-admin-ink hover:bg-admin-canvas disabled:opacity-50"
        >
          Export
        </button>
      }
    >
      <p className="mb-4 text-sm text-admin-muted">
        Verify GCash / Maya / QR Ph proofs, then fulfill J&T shipments. Try sample{' '}
        <strong>#1001</strong> (paid — ready to fulfill) or <strong>#1002</strong> (verify &amp; fulfill in one step).
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <StatChip label="Orders" value={String(stats.ordersInRange)} delta={stats.ordersDelta} series={stats.ordersSeries} />
        <StatChip
          label="Items ordered"
          value={String(stats.itemsInRange)}
          delta={stats.itemsDelta}
          series={stats.itemsSeries}
        />
        <StatChip label="Total sales" value={formatPhp(stats.revenueInRange)} delta={stats.revenueDelta} series={stats.revenueSeries} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-admin-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.id ? 'bg-gold-400/35 text-admin-ink' : 'text-admin-muted hover:bg-admin-sidebar'
            }`}
          >
            {t.label}
            <TabCount tab={t.id} orders={orders} />
          </button>
        ))}
      </div>

      <AdminCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-admin-ink">No orders in this view</p>
            <p className="mt-2 text-sm text-admin-muted">Try another tab, or wait for customers to check out.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-admin-border bg-admin-canvas text-xs text-admin-muted">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-2 py-3 font-medium">Order</th>
                  <th className="px-2 py-3 font-medium">Date</th>
                  <th className="px-2 py-3 font-medium">Customer</th>
                  <th className="px-2 py-3 font-medium">Channel</th>
                  <th className="px-2 py-3 text-right font-medium">Total</th>
                  <th className="px-2 py-3 font-medium">Payment</th>
                  <th className="px-2 py-3 font-medium">Fulfillment</th>
                  <th className="px-2 py-3 text-right font-medium">Items</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onOpen={() => navigate(`/admin/orders/${order.id}`)}
                    onFulfilled={() => {
                      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
                      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminPage>
  )
}

function OrderRow({
  order,
  onOpen,
  onFulfilled,
}: {
  order: OrderRecord
  onOpen: () => void
  onFulfilled: () => void
}) {
  const { can } = useStaffPermissions()
  const payment = paymentBadge(order.status)
  const fulfillAction = staffFulfillActionId(order, can)
  const needsFulfillment = order.status === 'paid' || order.status === 'payment_review' || order.status === 'proof_submitted'

  const quickFulfill = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!fulfillAction) return
    const label = fulfillAction === 'verify_fulfill' ? 'Verify payment and mark fulfilled?' : 'Mark this order fulfilled?'
    if (!window.confirm(label)) return
    const tracking = window.prompt('J&T tracking number (optional):')?.trim()
    const note = tracking ? `J&T ${tracking}` : undefined
    const result = await applyStaffOrderAction(order.id, fulfillAction, { fulfillmentNote: note })
    if (result.error) {
      window.alert(friendlyAdminError(result.error))
      return
    }
    onFulfilled()
  }

  return (
    <tr
      className={`cursor-pointer border-b border-platinum-200 hover:bg-admin-subtle ${needsFulfillment ? 'bg-admin-highlight' : ''}`}
      onClick={onOpen}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" className="size-4 rounded border-admin-input" aria-label={`Select ${order.id}`} />
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/admin/orders/${order.id}`}
            className="font-medium text-admin-link hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {displayOrderNumber(order.id)}
          </Link>
          {order.highRisk ? <HighRiskPill /> : null}
        </div>
      </td>
      <td className="px-2 py-3 text-admin-muted">{formatOrderDate(order.createdAt)}</td>
      <td className="px-2 py-3 text-admin-ink">{order.address.fullName}</td>
      <td className="px-2 py-3 text-admin-muted">Online store</td>
      <td className="px-2 py-3 text-right font-medium">{formatPhp(order.totalPhp)}</td>
      <td className="px-2 py-3">
        <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <FulfillmentPill status={order.status} />
          {fulfillAction ? (
            <button
              type="button"
              className="rounded-md bg-admin-gold px-2 py-1 text-xs font-semibold text-white hover:bg-admin-gold-dark"
              onClick={(e) => void quickFulfill(e)}
            >
              {fulfillAction === 'verify_fulfill' ? 'Verify & fulfill' : 'Fulfill'}
            </button>
          ) : null}
        </div>
      </td>
      <td className="px-2 py-3 text-right text-admin-muted">
        {itemCount(order)} {itemCount(order) === 1 ? 'item' : 'items'}
      </td>
    </tr>
  )
}

function StatChip({
  label,
  value,
  delta,
  series,
}: {
  label: string
  value: string
  delta?: string | null
  series: number[]
}) {
  return (
    <AdminCard className="flex min-w-[160px] flex-1 items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-admin-muted">{label}</p>
        <p className="mt-0.5 text-lg font-semibold tracking-tight">{value}</p>
        {delta ? (
          <p className="text-xs text-admin-success">{delta}</p>
        ) : (
          <p className="text-xs text-admin-muted">Last 30 days</p>
        )}
      </div>
      <KpiSparkline values={series} />
    </AdminCard>
  )
}

function TabCount({ tab, orders }: { tab: OrderTab; orders: OrderRecord[] }) {
  const n = useMemo(() => {
    if (tab === 'all') return orders.length
    return orders.filter((o) => {
      switch (tab) {
        case 'unpaid':
          return o.status === 'pending_payment' || o.status === 'payment_rejected'
        case 'review':
          return o.status === 'proof_submitted' || o.status === 'payment_review'
        case 'paid':
          return o.status === 'paid'
        case 'fulfilled':
          return o.status === 'fulfilled'
        case 'cancelled':
          return o.status === 'cancelled'
        case 'high_risk':
          return Boolean(o.highRisk)
        default:
          return false
      }
    }).length
  }, [tab, orders])

  if (!n) return null
  return <span className="ml-1.5 text-xs text-admin-muted">({n})</span>
}

function paymentLabel(status: OrderStatus) {
  return paymentBadge(status).label
}

function fulfillmentLabel(status: OrderStatus) {
  return fulfillmentBadge(status)?.label ?? '—'
}

function itemCount(order: OrderRecord) {
  return order.lines.reduce((n, l) => n + l.quantity, 0)
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function computeOrderStats(orders: OrderRecord[]) {
  const days = 30
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    keys.push(d.toISOString().slice(0, 10))
  }
  const prevKeys: string[] = []
  for (let i = days * 2 - 1; i >= days; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    prevKeys.push(d.toISOString().slice(0, 10))
  }

  const bucket = (list: OrderRecord[], keySet: string[]) => {
    const ordersByDay = Object.fromEntries(keySet.map((k) => [k, 0]))
    const itemsByDay = Object.fromEntries(keySet.map((k) => [k, 0]))
    const revenueByDay = Object.fromEntries(keySet.map((k) => [k, 0]))
    let ordersTotal = 0
    let itemsTotal = 0
    let revenueTotal = 0

    for (const o of list) {
      const k = o.createdAt.slice(0, 10)
      if (!keySet.includes(k)) continue
      ordersByDay[k] = (ordersByDay[k] ?? 0) + 1
      ordersTotal++
      const items = itemCount(o)
      itemsByDay[k] = (itemsByDay[k] ?? 0) + items
      itemsTotal += items
      if (o.status === 'paid' || o.status === 'fulfilled') {
        revenueByDay[k] = (revenueByDay[k] ?? 0) + o.totalPhp
        revenueTotal += o.totalPhp
      }
    }

    return {
      ordersTotal,
      itemsTotal,
      revenueTotal,
      ordersSeries: keySet.map((k) => ordersByDay[k] ?? 0),
      itemsSeries: keySet.map((k) => itemsByDay[k] ?? 0),
      revenueSeries: keySet.map((k) => revenueByDay[k] ?? 0),
    }
  }

  const current = bucket(orders, keys)
  const previous = bucket(orders, prevKeys)

  const pct = (cur: number, prev: number) => {
    if (prev <= 0 && cur <= 0) return null
    if (prev <= 0) return 'New'
    const p = ((cur - prev) / prev) * 100
    return `${p >= 0 ? '↑' : '↓'} ${Math.abs(p).toFixed(1)}%`
  }

  return {
    ordersInRange: current.ordersTotal,
    itemsInRange: current.itemsTotal,
    revenueInRange: current.revenueTotal,
    ordersDelta: pct(current.ordersTotal, previous.ordersTotal),
    itemsDelta: pct(current.itemsTotal, previous.itemsTotal),
    revenueDelta: pct(current.revenueTotal, previous.revenueTotal),
    ordersSeries: current.ordersSeries,
    itemsSeries: current.itemsSeries,
    revenueSeries: current.revenueSeries,
  }
}
