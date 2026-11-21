import type { OrderRecord } from '../../types/order'
import type { StaffPermissionKey } from '../../types/staff'
import { parseShipmentTrackingFromNote, transitionOrder, updateOrderStaffFlags } from '../orders'
import { STAFF_FSM_ACTIONS } from '../../lib/orders/orderFsm'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { loadStaffOrders } from './sampleOrders'

export async function fetchStaffOrders(): Promise<{ orders: OrderRecord[]; store: 'supabase' | 'local' }> {
  const orders = await loadStaffOrders()
  const online = Boolean(getSupabase() && supabaseConfigured)
  return { orders, store: online ? 'supabase' : 'local' }
}

/** Orders not yet fulfilled (excludes fulfilled + cancelled) — for sidebar badge. */
export function countUnfulfilledOrders(orders: OrderRecord[]) {
  return orders.filter((o) => o.status !== 'fulfilled' && o.status !== 'cancelled').length
}

export function staffActionsForOrder(order: OrderRecord) {
  return STAFF_FSM_ACTIONS.filter((a) => a.from.includes(order.status))
}

export function staffActionsForOrderWithAccess(
  order: OrderRecord,
  can: (key: StaffPermissionKey) => boolean,
) {
  return staffActionsForOrder(order).filter((a) => {
    if (a.id === 'verify' || a.id === 'reject' || a.id === 'start_review') return can('orders:payment')
    if (a.id === 'fulfill' || a.id === 'unfulfill') return can('orders:fulfill')
    if (a.id === 'cancel') return can('orders:cancel')
    return true
  })
}

export function canStaffFulfillOrder(can: (key: StaffPermissionKey) => boolean) {
  return can('orders:fulfill')
}

export async function applyStaffOrderAction(
  id: string,
  actionId: string,
  opts?: { rejectionReason?: string; fulfillmentNote?: string; cancelReason?: string },
) {
  if (actionId === 'verify_fulfill') {
    const paid = await transitionOrder(id, 'paid', 'staff', { applyInventory: true })
    if (paid.error) return paid
    const tracking = parseShipmentTrackingFromNote(opts?.fulfillmentNote)
    return transitionOrder(id, 'fulfilled', 'staff', {
      note: opts?.fulfillmentNote,
      shipmentTracking: tracking,
    })
  }

  const action = STAFF_FSM_ACTIONS.find((a) => a.id === actionId)
  if (!action) return { error: 'Unknown action' }

  if (action.to === 'payment_rejected' && !opts?.rejectionReason?.trim()) {
    return { error: 'Rejection reason required' }
  }

  const note =
    action.to === 'fulfilled'
      ? opts?.fulfillmentNote
      : action.to === 'cancelled'
        ? opts?.cancelReason
        : action.to === 'paid' && action.id === 'unfulfill'
          ? opts?.cancelReason ?? 'Returned to unfulfilled for re-packing'
          : undefined

  const shipmentTracking =
    action.to === 'fulfilled' ? parseShipmentTrackingFromNote(opts?.fulfillmentNote ?? note) : undefined

  return transitionOrder(id, action.to, 'staff', {
    rejectionReason: opts?.rejectionReason,
    note,
    shipmentTracking,
    applyInventory: action.to === 'paid' && action.id === 'verify',
  })
}

export async function setOrderHighRisk(
  orderId: string,
  highRisk: boolean,
  highRiskNote?: string,
): Promise<{ error?: string }> {
  const result = await updateOrderStaffFlags(orderId, {
    highRisk,
    highRiskNote: highRisk ? highRiskNote : '',
  })
  return result.error ? { error: result.error } : {}
}

export function staffFulfillActionId(
  order: OrderRecord,
  can?: (key: StaffPermissionKey) => boolean,
) {
  if (can && !can('orders:fulfill')) return null
  if (order.status === 'paid') {
    if (can && !can('orders:payment') && !can('orders:fulfill')) return null
    return 'fulfill' as const
  }
  if (order.status === 'payment_review' || order.status === 'proof_submitted') {
    if (can && !can('orders:payment')) return null
    return 'verify_fulfill' as const
  }
  return null
}