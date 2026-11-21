import { useState } from 'react'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { applyStaffOrderAction, staffActionsForOrderWithAccess } from '../../services/admin/ordersAdmin'
import { friendlyAdminError } from '../../lib/admin/messages'
import type { OrderRecord } from '../../types/order'

export function AdminOrderStaffActions({
  order,
  onDone,
  layout = 'sidebar',
}: {
  order: OrderRecord
  onDone: () => void
  layout?: 'sidebar' | 'toolbar'
}) {
  const { can } = useStaffPermissions()
  const actions = staffActionsForOrderWithAccess(order, can)
  const [busy, setBusy] = useState<string | null>(null)

  if (actions.length === 0) return null

  const run = async (actionId: string) => {
    let rejectionReason: string | undefined
    if (actionId === 'reject') {
      rejectionReason = window.prompt('Tell the customer why payment was rejected (required):') ?? undefined
      if (!rejectionReason?.trim()) return
    }
    if (actionId === 'fulfill') {
      const ok = window.confirm('Mark this order fulfilled and ready for J&T pickup?')
      if (!ok) return
    }
    if (actionId === 'unfulfill') {
      const ok = window.confirm(
        'Mark this order unfulfilled? Use this if shipment was reversed or packed by mistake.',
      )
      if (!ok) return
    }
    if (actionId === 'cancel') {
      const ok = window.confirm('Cancel this order? This cannot be undone from the storefront.')
      if (!ok) return
    }
    const cancelReason =
      actionId === 'cancel'
        ? window.prompt('Reason for cancellation (optional note for your team):') ?? undefined
        : undefined
    setBusy(actionId)
    const result = await applyStaffOrderAction(order.id, actionId, {
      rejectionReason,
      cancelReason: cancelReason?.trim() || undefined,
    })
    setBusy(null)
    if (result.error) {
      window.alert(friendlyAdminError(result.error))
      return
    }
    onDone()
  }

  const buttonClass = (id: string) => {
    if (layout === 'toolbar') {
      if (id === 'verify') return 'bg-admin-success text-white hover:bg-admin-success/90'
      if (id === 'fulfill') return 'bg-admin-gold text-white hover:bg-admin-gold-dark'
      if (id === 'reject' || id === 'cancel') return 'border-[#d72c0d] text-[#d72c0d] hover:bg-[#fff4f0]'
      if (id === 'unfulfill') return 'border-[#616161] text-admin-ink hover:bg-admin-canvas'
      return 'border-admin-input bg-white text-admin-ink hover:bg-admin-canvas'
    }
    if (id === 'verify') return 'border-admin-success bg-admin-success-bg text-admin-success hover:bg-admin-success-bg'
    if (id === 'fulfill') return 'bg-admin-gold text-white hover:bg-admin-gold-dark'
    if (id === 'reject' || id === 'cancel') return 'border-[#d72c0d] text-[#d72c0d] hover:bg-[#fff4f0]'
    if (id === 'unfulfill') return 'border-[#616161] bg-white text-admin-ink hover:bg-admin-canvas'
    return 'border-admin-input bg-white text-admin-ink hover:bg-admin-canvas'
  }

  const wrap =
    layout === 'toolbar'
      ? 'flex flex-wrap items-center gap-2'
      : 'mt-3 flex flex-col gap-2'

  return (
    <div className={wrap}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          disabled={busy !== null}
          className={`rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-60 ${buttonClass(a.id)}`}
          onClick={() => void run(a.id)}
        >
          {busy === a.id ? 'Saving…' : a.label}
        </button>
      ))}
    </div>
  )
}