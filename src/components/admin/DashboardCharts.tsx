import { formatPhp } from '../../data/mock/products'

export type SalesPoint = { label: string; salesPhp: number; orderCount: number }
export type StatusSlice = { label: string; count: number; color: string }

const CHART_GOLD = '#c9a227'
const CHART_GOLD_LIGHT = '#e4d4a8'

export function SalesOverTimeChart({
  points,
  previousPoints,
}: {
  points: SalesPoint[]
  previousPoints?: SalesPoint[]
}) {
  const width = 640
  const height = 220
  const pad = { top: 16, right: 12, bottom: 32, left: 48 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const maxY = Math.max(
    1,
    ...points.map((p) => p.salesPhp),
    ...(previousPoints?.map((p) => p.salesPhp) ?? []),
  )

  const xAt = (i: number, n: number) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const yAt = (v: number) => pad.top + innerH - (v / maxY) * innerH

  const toPath = (series: SalesPoint[]) => {
    if (series.length === 0) return ''
    const d = series
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, series.length)} ${yAt(p.salesPhp)}`)
      .join(' ')
    return d
  }

  const areaPath = (series: SalesPoint[]) => {
    if (series.length === 0) return ''
    const line = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, series.length)} ${yAt(p.salesPhp)}`).join(' ')
    const last = series.length - 1
    const baseY = pad.top + innerH
    return `${line} L ${xAt(last, series.length)} ${baseY} L ${xAt(0, series.length)} ${baseY} Z`
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    v: maxY * t,
    y: yAt(maxY * t),
  }))

  const xLabelEvery = Math.ceil(points.length / 6)

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[320px] w-full" role="img" aria-label="Sales over time">
        {yTicks.map((t) => (
          <g key={t.v}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={t.y}
              y2={t.y}
              stroke="#e3e3e3"
              strokeWidth={1}
            />
            <text x={pad.left - 8} y={t.y + 4} textAnchor="end" className="fill-admin-muted text-[10px]">
              {t.v >= 1000 ? `${Math.round(t.v / 1000)}k` : Math.round(t.v)}
            </text>
          </g>
        ))}
        {previousPoints && previousPoints.length > 0 ? (
          <path
            d={toPath(previousPoints)}
            fill="none"
            stroke={CHART_GOLD_LIGHT}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        ) : null}
        <path d={areaPath(points)} fill={CHART_GOLD} fillOpacity={0.12} />
        <path d={toPath(points)} fill="none" stroke={CHART_GOLD} strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p, i) =>
          i % xLabelEvery === 0 || i === points.length - 1 ? (
            <text
              key={p.label}
              x={xAt(i, points.length)}
              y={height - 8}
              textAnchor="middle"
              className="fill-admin-muted text-[10px]"
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-admin-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded bg-admin-gold" />
          This period
        </span>
        {previousPoints ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded border border-dashed border-admin-gold-light bg-transparent" />
            Previous period
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function OrdersStatusChart({ slices }: { slices: StatusSlice[] }) {
  const total = slices.reduce((s, x) => s + x.count, 0)
  if (total === 0) {
    return <p className="text-sm text-admin-muted">No orders to chart yet.</p>
  }

  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 54
  const stroke = 22
  let angle = -90

  const arcs = slices.filter((s) => s.count > 0)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <svg width={size} height={size} role="img" aria-label="Orders by status">
        {arcs.map((slice) => {
          const portion = slice.count / total
          const sweep = portion * 360
          const start = polar(cx, cy, r, angle)
          const end = polar(cx, cy, r, angle + sweep)
          const large = sweep > 180 ? 1 : 0
          angle += sweep
          const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
          return (
            <path
              key={slice.label}
              d={d}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
            />
          )
        })}
      </svg>
      <ul className="flex-1 space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-admin-muted">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-medium">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TopProductsBars({ items }: { items: { name: string; units: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.units))
  if (items.length === 0) {
    return <p className="text-sm text-admin-muted">Sales by product will appear after orders come in.</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex justify-between gap-2 text-sm">
            <span className="truncate text-admin-ink">{item.name}</span>
            <span className="shrink-0 text-admin-muted">{item.units} sold</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gold-400/35">
            <div
              className="h-full rounded-full bg-admin-gold"
              style={{ width: `${(item.units / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function KpiSparkline({ values }: { values: number[] }) {
  const w = 96
  const h = 28
  const max = Math.max(1, ...values)
  const n = values.length
  const d = n
    ? values
        .map((v, i) => {
          const x = n <= 1 ? w / 2 : (i / (n - 1)) * w
          const y = h - (v / max) * (h - 4) - 2
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' ')
    : `M0,${h} L${w},${h}`

  return (
    <svg width={w} height={h} className="text-admin-gold" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

export function formatDelta(current: number, previous: number): { text: string; up: boolean } | null {
  if (previous <= 0 && current <= 0) return null
  if (previous <= 0) return { text: 'New activity', up: true }
  const pct = ((current - previous) / previous) * 100
  const up = pct >= 0
  return { text: `${up ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}%`, up }
}

export function formatSalesAxis(value: number) {
  return formatPhp(value)
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}