import type { OrderStatus } from '../../types/order'

export function paymentBadge(status: OrderStatus): { label: string; tone: 'neutral' | 'warning' | 'critical' } {
  if (status === 'paid' || status === 'fulfilled') return { label: 'Paid', tone: 'neutral' }
  if (status === 'payment_rejected') return { label: 'Failed', tone: 'critical' }
  if (status === 'cancelled') return { label: 'Cancelled', tone: 'neutral' }
  return { label: 'Pending', tone: 'warning' }
}

export function fulfillmentBadge(status: OrderStatus): { label: string; emphasis: 'action' | 'done' } | null {
  if (status === 'fulfilled') return { label: 'Fulfilled', emphasis: 'done' }
  if (status === 'cancelled') return null
  return { label: 'Unfulfilled', emphasis: 'action' }
}

/** Orders list / detail — dark label when work is needed; muted when done. */
export function FulfillmentPill({ status }: { status: OrderStatus }) {
  const badge = fulfillmentBadge(status)
  if (!badge) return <span className="text-xs text-admin-chrome">—</span>
  if (badge.emphasis === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-admin-sidebar px-2.5 py-0.5 text-xs font-medium text-admin-chrome">
        <span className="size-1.5 rounded-full bg-admin-chrome" aria-hidden />
        Fulfilled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-admin-ink/20 bg-white px-2.5 py-0.5 text-xs font-semibold text-admin-ink shadow-sm">
      <span className="size-1.5 rounded-full bg-admin-gold" aria-hidden />
      Unfulfilled
    </span>
  )
}

export function HighRiskPill() {
  return <StatusPill tone="critical">High risk</StatusPill>
}

export function StatusPill({ tone, children }: { tone: 'neutral' | 'warning' | 'critical'; children: string }) {
  const styles =
    tone === 'warning'
      ? 'bg-gold-400/40 text-gold-800'
      : tone === 'critical'
        ? 'bg-[#fee7e6] text-[#8e1f0b]'
        : 'bg-gold-400/35 text-admin-ink'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

export function formatOrderDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (d.toDateString() === now.toDateString()) return `Today at ${time}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  })
}