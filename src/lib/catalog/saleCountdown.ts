export type SaleCountdownMode = 'fixed' | 'rolling'

export type ProductSaleCountdown = {
  enabled: boolean
  mode: SaleCountdownMode
  endsAt?: string
  rollingMinutes?: number
  headline?: string
}

export function saleCountdownFromRow(row: {
  sale_countdown_enabled?: boolean
  sale_countdown_mode?: string | null
  sale_countdown_ends_at?: string | null
  sale_countdown_rolling_minutes?: number | null
  sale_countdown_headline?: string | null
}): ProductSaleCountdown | undefined {
  if (!row.sale_countdown_enabled) return undefined
  const mode: SaleCountdownMode = row.sale_countdown_mode === 'rolling' ? 'rolling' : 'fixed'
  return {
    enabled: true,
    mode,
    endsAt: row.sale_countdown_ends_at ?? undefined,
    rollingMinutes: row.sale_countdown_rolling_minutes ?? undefined,
    headline: row.sale_countdown_headline?.trim() || undefined,
  }
}

export function formatSaleCountdownRemaining(ms: number): string {
  if (ms <= 0) return '0 seconds'
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds}s`
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`
}

/** Live clock segment for inline countdown (updates every second). */
export function formatSaleCountdownClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

export function saleCountdownOneLine(remainingMs: number): { clock: string; suffix: string } {
  const clock =
    remainingMs >= 86_400_000 ? formatSaleCountdownRemaining(remainingMs) : formatSaleCountdownClock(remainingMs)
  return {
    clock,
    suffix: 'left before the sale ends',
  }
}

const rollingEndStorageKey = (slug: string) => `zion-sale-countdown-end:${slug}`

/** Keeps a rolling countdown ticking instead of restarting every parent render. */
export function resolveRollingCountdownEndMs(slug: string, rollingMinutes: number, reset = false): number {
  const cycleMs = Math.max(1, rollingMinutes) * 60_000
  const key = rollingEndStorageKey(slug)
  if (!reset) {
    try {
      const raw = sessionStorage.getItem(key)
      if (raw) {
        const parsed = Number(raw)
        if (Number.isFinite(parsed) && parsed > Date.now()) return parsed
      }
    } catch {
      /* private mode */
    }
  }
  const end = Date.now() + cycleMs
  try {
    sessionStorage.setItem(key, String(end))
  } catch {
    /* private mode */
  }
  return end
}

export function bumpRollingCountdownEndMs(slug: string, rollingMinutes: number): number {
  return resolveRollingCountdownEndMs(slug, rollingMinutes, true)
}