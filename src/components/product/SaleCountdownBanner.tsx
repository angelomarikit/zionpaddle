import { useEffect, useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import {
  formatSaleCountdownRemaining,
  saleCountdownUrgencyLine,
  type ProductSaleCountdown,
} from '../../lib/catalog/saleCountdown'

type Props = {
  productSlug: string
  countdown: ProductSaleCountdown
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

export function SaleCountdownBanner({ productSlug, countdown }: Props) {
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
  const urgency = saleCountdownUrgencyLine(remainingMs)
  const expired = countdown.mode === 'fixed' && remainingMs <= 0

  if (expired) return null

  return (
    <div
      className="rounded-lg border border-red-700/40 bg-red-600 px-4 py-3 text-white shadow-[0_8px_24px_rgba(185,28,28,0.25)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 size-5 shrink-0 opacity-90" aria-hidden />
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.12em]">{headline}</p>
          <p className="mt-1 text-sm font-semibold leading-snug">{urgency}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-white/85">
            {formatSaleCountdownRemaining(remainingMs)}
          </p>
        </div>
      </div>
    </div>
  )
}