import { useState } from 'react'
import type { OrderRecord } from '../../types/order'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { applyStaffOrderAction, staffFulfillActionId } from '../../services/admin/ordersAdmin'
import { friendlyAdminError } from '../../lib/admin/messages'
import { AdminCard } from './AdminShell'

export function AdminOrderFulfillPanel({ order, onDone }: { order: OrderRecord; onDone: () => void }) {
  const { can } = useStaffPermissions()
  const actionId = staffFulfillActionId(order, can)
  const [tracking, setTracking] = useState('')
  const [busy, setBusy] = useState(false)

  if (!actionId) {
    if (order.status === 'fulfilled') {
      return (
        <AdminCard className="p-5 bg-admin-subtle">
          <h2 className="font-semibold text-admin-chrome">Fulfilled</h2>
          <p className="mt-2 text-sm text-admin-chrome">
            Packed for J&T. Use <strong className="font-semibold text-admin-muted">Mark unfulfilled</strong> to reopen
            fulfillment — tracking is cleared when you unfulfill.
            {order.shipmentTracking ? (
              <>
                <br />
                Tracking: <span className="font-medium text-admin-muted">{order.shipmentTracking}</span>
              </>
            ) : null}
          </p>
        </AdminCard>
      )
    }
    return null
  }

  const verifyAndShip = actionId === 'verify_fulfill'

  const submit = async () => {
    setBusy(true)
    const note = tracking.trim() ? `J&T ${tracking.trim()}` : undefined
    const result = await applyStaffOrderAction(order.id, actionId, { fulfillmentNote: note })
    setBusy(false)
    if (result.error) {
      window.alert(friendlyAdminError(result.error))
      return
    }
    onDone()
  }

  return (
    <AdminCard className="border-admin-border p-5 ring-1 ring-admin-ink/5">
      <h2 className="font-semibold">Fulfill order</h2>
      <p className="mt-2 text-sm text-admin-muted">
        {verifyAndShip
          ? 'Payment looks good? Verify, then mark fulfilled when the parcel is ready for J&T pickup.'
          : 'Pack the items, create the J&T shipment, then mark this order fulfilled.'}
      </p>
      <label className="mt-4 block text-xs font-medium text-admin-muted">
        J&T tracking number (optional)
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="e.g. 1234567890123"
          className="mt-1 w-full rounded-lg border border-admin-input px-3 py-2 text-sm text-admin-ink"
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="mt-4 w-full rounded-lg bg-admin-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-admin-gold-dark disabled:opacity-60"
      >
        {busy ? 'Saving…' : verifyAndShip ? 'Verify payment & fulfill' : 'Mark as fulfilled'}
      </button>
    </AdminCard>
  )
}