import { useEffect, useMemo, useState } from 'react'
import { saleCountdownOneLine, type ProductSaleCountdown } from '../../lib/catalog/saleCountdown'

type Props = {
  productSlug: string
  countdown: ProductSaleCountdown
  className?: string
}

function initialEndMs(countdown: ProductSaleCountdown): number | null {
  if (countdown.mode === 'fixed' && countdown.endsAt) {
    return new Date(countdown.endsAt).getTime()
  }
  if (countdown.mode === 'rolling' && countdown.rollingMinutes && countdown.rollingMinutes > 0) {
    return Date.now() + countdown.rollingMinutes * 60_000
  }
  return null
}

export function SaleCountdownBanner({ productSlug, countdown, className = '' }: Props) {
  const rollingMs = (countdown.rollingMinutes ?? 5) * 60_000
  const [endMs, setEndMs] = useState<number | null>(() => initialEndMs(countdown))

  useEffect(() => {
    setEndMs(initialEndMs(countdown))
  }, [productSlug, countdown.mode, countdown.endsAt, countdown.rollingMinutes])

  const [, tick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remainingMs = useMemo(() => {
    if (endMs === null) return 0
    return Math.max(0, endMs - Date.now())
  }, [endMs, tick])

  useEffect(() => {
    if (countdown.mode !== 'rolling' || remainingMs > 0) return
    if (rollingMs <= 0) return
    setEndMs(Date.now() + rollingMs)
  }, [countdown.mode, remainingMs, rollingMs])

  if (countdown.mode === 'fixed' && !countdown.endsAt) return null
  if (countdown.mode === 'rolling' && (!countdown.rollingMinutes || countdown.rollingMinutes <= 0)) {
    return null
  }

  const headline = countdown.headline?.trim() || 'Hurry!'
  const expired = countdown.mode === 'fixed' && remainingMs <= 0

  if (expired) return null

  const { clock, suffix } = saleCountdownOneLine(headline, remainingMs)

  return (
    <p
      className={`text-sm font-semibold leading-snug text-red-600 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="uppercase tracking-wide">{headline}</span>
      <span aria-hidden> — </span>
      <span className="font-mono text-[0.95em] font-bold tabular-nums tracking-tight text-red-700">
        {clock}
      </span>
      <span> {suffix}</span>
    </p>
  )
}