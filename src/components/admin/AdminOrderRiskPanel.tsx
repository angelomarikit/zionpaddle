import { useState } from 'react'
import type { OrderRecord } from '../../types/order'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { setOrderHighRisk } from '../../services/admin/ordersAdmin'
import { friendlyAdminError } from '../../lib/admin/messages'
import { AdminCard } from './AdminShell'
import { HighRiskPill } from './orderBadges'

export function AdminOrderRiskPanel({ order, onDone }: { order: OrderRecord; onDone: () => void }) {
  const { can } = useStaffPermissions()
  const [note, setNote] = useState(order.highRiskNote ?? '')
  const [busy, setBusy] = useState(false)

  const toggle = async (highRisk: boolean) => {
    if (highRisk) {
      const reason = note.trim() || window.prompt('Why is this order high risk? (recommended)')?.trim()
      if (!reason) return
      setNote(reason)
      setBusy(true)
      const result = await setOrderHighRisk(order.id, true, reason)
      setBusy(false)
      if (result.error) window.alert(friendlyAdminError(result.error))
      else onDone()
      return
    }
    const ok = window.confirm('Remove high risk tag from this order?')
    if (!ok) return
    setBusy(true)
    const result = await setOrderHighRisk(order.id, false)
    setBusy(false)
    if (result.error) window.alert(friendlyAdminError(result.error))
    else onDone()
  }

  if (!can('orders:risk')) {
    return order.highRisk ? (
      <AdminCard className="border-[#d72c0d]/40 bg-red-50 p-5">
        <h2 className="font-semibold">High risk</h2>
        <p className="mt-2 text-sm text-[#8e1f0b]">{order.highRiskNote ?? 'Flagged for review.'}</p>
      </AdminCard>
    ) : null
  }

  return (
    <AdminCard className={`p-5 ${order.highRisk ? 'border-[#d72c0d]/40 bg-red-50' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Risk review</h2>
        {order.highRisk ? <HighRiskPill /> : null}
      </div>
      <p className="mt-2 text-sm text-admin-muted">
        Tag suspicious GCash/Maya proofs, duplicate payments, or address mismatches before fulfilling.
      </p>
      {order.highRisk && order.highRiskNote ? (
        <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-sm text-[#8e1f0b]">{order.highRiskNote}</p>
      ) : null}
      <label className="mt-3 block text-xs font-medium text-admin-muted">
        Note (shown to your team)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          disabled={order.highRisk}
          placeholder="e.g. Screenshot amount does not match total"
          className="mt-1 w-full rounded-lg border border-admin-input px-3 py-2 text-sm text-admin-ink disabled:bg-admin-canvas"
        />
      </label>
      <div className="mt-3 flex flex-col gap-2">
        {order.highRisk ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggle(false)}
            className="rounded-lg border border-admin-input bg-white px-3 py-2 text-sm font-semibold text-admin-ink hover:bg-admin-canvas disabled:opacity-60"
          >
            Remove high risk tag
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggle(true)}
            className="rounded-lg border border-[#d72c0d] bg-[#fee7e6] px-3 py-2 text-sm font-semibold text-[#8e1f0b] hover:bg-[#fdd8d5] disabled:opacity-60"
          >
            Tag as high risk
          </button>
        )}
      </div>
    </AdminCard>
  )
}