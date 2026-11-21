import type { OrderRecord, OrderStatus, OrderStatusEvent, ShippingSnapshot } from '../types/order'
import { canTransition } from '../lib/orders/orderFsm'
import { applySaleForOrder } from './inventory'
import { getSupabase, supabaseConfigured } from '../lib/supabase/client'
import { isStandardOrderId } from '../lib/orders/orderNumbers'

const LOCAL_ORDERS_KEY = 'zion-orders-v1'
const LEGACY_ORDERS_KEY = 'dayo-orders-v1'

function saveLocalAll(orders: OrderRecord[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders))
}

function saveLocal(order: OrderRecord) {
  const existing = readLocalOrders().filter((o) => o.id !== order.id)
  saveLocalAll([order, ...existing])
}

export function mergeOrderLists(primary: OrderRecord[], secondary: OrderRecord[]): OrderRecord[] {
  const map = new Map<string, OrderRecord>()
  for (const o of secondary) map.set(o.id, o)
  for (const o of primary) map.set(o.id, o)
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function readLocalOrders(): OrderRecord[] {
  try {
    let raw = localStorage.getItem(LOCAL_ORDERS_KEY)
    if (!raw) {
      raw = localStorage.getItem(LEGACY_ORDERS_KEY)
      if (raw) localStorage.setItem(LOCAL_ORDERS_KEY, raw)
    }
    return raw ? (JSON.parse(raw) as OrderRecord[]).map(normalizeOrder) : []
  } catch {
    return []
  }
}

function normalizeOrder(o: OrderRecord): OrderRecord {
  const snapshot =
    o.shippingSnapshot ??
    ({
      ...o.shipping,
      quotedAt: o.createdAt,
      totalWeightGrams: 0,
      itemCount: o.lines.length,
      province: o.address.province,
    } as ShippingSnapshot)
  return {
    ...o,
    shipping: o.shipping ?? snapshot,
    shippingSnapshot: snapshot,
    statusHistory: o.statusHistory ?? [{ status: o.status, at: o.createdAt, by: 'system' }],
  }
}

export function getOrderById(id: string): OrderRecord | undefined {
  return readLocalOrders().find((o) => o.id === id)
}

export async function fetchOrderById(id: string): Promise<OrderRecord | undefined> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data, error } = await sb.from('orders').select('*').eq('id', id).maybeSingle()
    if (!error && data) return mapDbOrder(data as Record<string, unknown>)
  }
  return getOrderById(id)
}

export {
  allocateNextOrderId,
  displayOrderNumber,
  formatOrderId,
  isStandardOrderId,
  ORDER_NUMBER_START,
  sortByOrderNumber,
} from '../lib/orders/orderNumbers'

export function mapDbOrder(row: Record<string, unknown>): OrderRecord {
  const shipping = row.shipping as OrderRecord['shipping']
  const snapshot = (row.shipping_snapshot as ShippingSnapshot | null) ?? {
    ...shipping,
    quotedAt: String(row.created_at ?? new Date().toISOString()),
    totalWeightGrams: 0,
    itemCount: (row.lines as OrderRecord['lines']).length,
    province: (row.address as OrderRecord['address']).province,
  }
  return normalizeOrder({
    id: String(row.id),
    createdAt: String(row.created_at),
    status: row.status as OrderStatus,
    lines: row.lines as OrderRecord['lines'],
    subtotalPhp: row.subtotal_php as number,
    shippingPhp: row.shipping_php as number,
    totalPhp: row.total_php as number,
    address: row.address as OrderRecord['address'],
    shipping,
    shippingSnapshot: snapshot,
    paymentMethod: row.payment_method as OrderRecord['paymentMethod'],
    paymentReference: (row.payment_reference as string) ?? undefined,
    proofFileName: (row.proof_file_name as string) ?? undefined,
    proofDataUrl: (row.proof_data_url as string) ?? undefined,
    proofSubmittedAt: (row.proof_submitted_at as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    statusHistory: (row.status_history as OrderStatusEvent[]) ?? [],
    rejectionReason: (row.rejection_reason as string) ?? undefined,
    highRisk: Boolean(row.high_risk),
    highRiskNote: (row.high_risk_note as string) ?? undefined,
    shipmentTracking: (row.shipment_tracking as string) ?? undefined,
  })
}

type SubmitResult = { order: OrderRecord; persistence: 'supabase' | 'local' }

function rowFromOrder(order: OrderRecord) {
  return {
    id: order.id,
    status: order.status,
    lines: order.lines,
    subtotal_php: order.subtotalPhp,
    shipping_php: order.shippingPhp,
    total_php: order.totalPhp,
    address: order.address,
    shipping: order.shipping,
    shipping_snapshot: order.shippingSnapshot,
    payment_method: order.paymentMethod,
    payment_reference: order.paymentReference ?? null,
    proof_file_name: order.proofFileName ?? null,
    proof_data_url: order.proofDataUrl ?? null,
    proof_submitted_at: order.proofSubmittedAt ?? null,
    notes: order.notes ?? null,
    status_history: order.statusHistory,
    rejection_reason: order.rejectionReason ?? null,
    high_risk: Boolean(order.highRisk),
    high_risk_note: order.highRiskNote ?? null,
    shipment_tracking: order.shipmentTracking ?? null,
    updated_at: new Date().toISOString(),
  }
}

export function purgeLocalLegacyOrders() {
  saveLocalAll(readLocalOrders().filter((o) => isStandardOrderId(o.id)))
}

export function removeLocalOrderById(id: string) {
  saveLocalAll(readLocalOrders().filter((o) => o.id !== id))
}

export async function upsertOrderRecord(order: OrderRecord): Promise<void> {
  const normalized = normalizeOrder(order)
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: existing } = await sb.from('orders').select('id').eq('id', order.id).maybeSingle()
    if (existing) {
      await sb.from('orders').update(rowFromOrder(normalized)).eq('id', order.id)
    } else {
      await sb.from('orders').insert({
        ...rowFromOrder(normalized),
        created_at: normalized.createdAt,
      })
    }
  }
  saveLocal(normalized)
}

export async function submitOrder(order: OrderRecord): Promise<SubmitResult> {
  const normalized = normalizeOrder(order)
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('orders').insert({
      ...rowFromOrder(normalized),
      created_at: normalized.createdAt,
    })
    if (!error) return { order: normalized, persistence: 'supabase' }
    console.warn('[zion] Supabase order insert failed, using local fallback', error.message)
  }
  saveLocal(normalized)
  return { order: normalized, persistence: 'local' }
}

export function parseShipmentTrackingFromNote(note?: string) {
  if (!note?.trim()) return undefined
  const trimmed = note.trim()
  const withoutPrefix = trimmed.replace(/^J&T\s+/i, '').trim()
  return withoutPrefix || undefined
}

function pushHistory(
  order: OrderRecord,
  status: OrderStatus,
  by: OrderStatusEvent['by'],
  note?: string,
): OrderRecord {
  return {
    ...order,
    status,
    statusHistory: [...order.statusHistory, { status, at: new Date().toISOString(), by, note }],
  }
}

export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  actor: 'customer' | 'staff' | 'system',
  opts?: { note?: string; rejectionReason?: string; applyInventory?: boolean; shipmentTracking?: string },
): Promise<{ order?: OrderRecord; error?: string }> {
  const order = (await fetchOrderById(orderId)) ?? getOrderById(orderId)
  if (!order) return { error: 'Order not found' }

  if (!canTransition(order.status, to, actor)) {
    return { error: `Cannot move from ${order.status} to ${to}` }
  }

  let next = pushHistory(order, to, actor, opts?.note)
  if (to === 'payment_rejected' && opts?.rejectionReason) {
    next = { ...next, rejectionReason: opts.rejectionReason }
  }

  if (to === 'fulfilled') {
    const tracking = opts?.shipmentTracking?.trim() || parseShipmentTrackingFromNote(opts?.note)
    if (tracking) next = { ...next, shipmentTracking: tracking }
  }

  if (order.status === 'fulfilled' && to === 'paid') {
    next = { ...next, shipmentTracking: undefined }
  }

  if (to === 'paid' && opts?.applyInventory === true) {
    const inv = await applySaleForOrder(orderId, order.lines)
    if (inv.error) return { error: inv.error }
  }

  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('orders').update(rowFromOrder(next)).eq('id', orderId)
    if (error) {
      if (getOrderById(orderId)) {
        saveLocal(next)
        return { order: next }
      }
      return { error: error.message }
    }
    saveLocal(next)
    return { order: next }
  }

  saveLocal(next)
  return { order: next }
}

export async function submitPaymentProof(
  orderId: string,
  proof: { fileName: string; dataUrl: string; paymentReference?: string },
): Promise<{ order?: OrderRecord; error?: string }> {
  const order = (await fetchOrderById(orderId)) ?? getOrderById(orderId)
  if (!order) return { error: 'Order not found' }
  if (order.status !== 'pending_payment' && order.status !== 'payment_rejected') {
    return { error: 'Proof cannot be submitted for this order status' }
  }

  const now = new Date().toISOString()
  let updated: OrderRecord = {
    ...order,
    proofFileName: proof.fileName,
    proofDataUrl: proof.dataUrl,
    proofSubmittedAt: now,
    paymentReference: proof.paymentReference ?? order.paymentReference,
    rejectionReason: undefined,
  }

  updated = pushHistory(updated, 'proof_submitted', 'customer')
  updated = pushHistory(updated, 'payment_review', 'system')

  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('orders').update(rowFromOrder(updated)).eq('id', orderId)
    if (error) return { error: error.message }
    return { order: updated }
  }

  saveLocal(updated)
  return { order: updated }
}

/** Staff-only metadata — does not change order status. */
export async function updateOrderStaffFlags(
  orderId: string,
  flags: { highRisk?: boolean; highRiskNote?: string },
): Promise<{ order?: OrderRecord; error?: string }> {
  const order = (await fetchOrderById(orderId)) ?? getOrderById(orderId)
  if (!order) return { error: 'Order not found' }

  const next: OrderRecord = {
    ...order,
    highRisk: flags.highRisk ?? order.highRisk,
    highRiskNote: flags.highRiskNote !== undefined ? flags.highRiskNote || undefined : order.highRiskNote,
  }

  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('orders').update(rowFromOrder(next)).eq('id', orderId)
    if (error) {
      if (getOrderById(orderId)) {
        saveLocal(next)
        return { order: next }
      }
      return { error: error.message }
    }
    saveLocal(next)
    return { order: next }
  }

  saveLocal(next)
  return { order: next }
}