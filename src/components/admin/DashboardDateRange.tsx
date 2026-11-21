import type { DashboardDateRange } from '../../services/admin/dashboard'

export const RANGE_PRESETS: { days: number; label: string }[] = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
]

export function formatRangeLabel(range: DashboardDateRange) {
  if ('days' in range) {
    const preset = RANGE_PRESETS.find((p) => p.days === range.days)
    return preset?.label ?? `Last ${range.days} days`
  }
  const from = new Date(range.from).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const to = new Date(range.to).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${from} – ${to}`
}

export function DashboardDateRangeBar({
  range,
  onChange,
}: {
  range: DashboardDateRange
  onChange: (next: DashboardDateRange) => void
}) {
  const customActive = 'from' in range
  const customFrom = customActive ? range.from : ''
  const customTo = customActive ? range.to : ''

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-admin-border bg-white px-4 py-3">
      <span className="text-sm font-medium text-admin-ink">Date range</span>
      <div className="flex flex-wrap gap-1">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.days}
            type="button"
            onClick={() => onChange({ days: p.days })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              !customActive && 'days' in range && range.days === p.days
                ? 'bg-gold-400/35 text-admin-ink'
                : 'text-admin-muted hover:bg-admin-sidebar'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-admin-muted">
          From
          <input
            type="date"
            value={customFrom}
            onChange={(e) => {
              const from = e.target.value
              const to = customTo || from
              if (from) onChange({ from, to })
            }}
            className="rounded-lg border border-admin-input px-2 py-1 text-admin-ink"
          />
        </label>
        <label className="flex items-center gap-1.5 text-admin-muted">
          To
          <input
            type="date"
            value={customTo}
            onChange={(e) => {
              const to = e.target.value
              const from = customFrom || to
              if (to && from) onChange({ from, to: to >= from ? to : from })
            }}
            className="rounded-lg border border-admin-input px-2 py-1 text-admin-ink"
          />
        </label>
      </div>
      <p className="ml-auto text-xs text-admin-muted">{formatRangeLabel(range)}</p>
    </div>
  )
}