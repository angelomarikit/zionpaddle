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

export function saleCountdownUrgencyLine(remainingMs: number): string {
  const minutes = Math.floor(remainingMs / 60000)
  if (minutes >= 60) {
    return `${formatSaleCountdownRemaining(remainingMs)} left before this sale ends`
  }
  if (minutes >= 1) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} left before the sale ends`
  }
  return 'Less than a minute left — grab it before the sale ends'
}