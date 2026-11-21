import { useEffect, useState } from 'react'
import {
  bumpRollingCountdownEndMs,
  resolveRollingCountdownEndMs,
  saleCountdownOneLine,
  type ProductSaleCountdown,
} from '../../lib/catalog/saleCountdown'

type Props = {
  productSlug: string
  countdown: ProductSaleCountdown
  className?: string
}

export function SaleCountdownBanner({ productSlug, countdown, className = '' }: Props) {
  const rollingMinutes = countdown.rollingMinutes ?? 5
  const [endMs, setEndMs] = useState<number | null>(() => {
    if (countdown.mode === 'fixed' && countdown.endsAt) {
      return new Date(countdown.endsAt).getTime()
    }
    if (countdown.mode === 'rolling' && rollingMinutes > 0) {
      return resolveRollingCountdownEndMs(productSlug, rollingMinutes)
    }
    return null
  })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (countdown.mode === 'fixed' && countdown.endsAt) {
      setEndMs(new Date(countdown.endsAt).getTime())
      return
    }
    if (countdown.mode === 'rolling' && rollingMinutes > 0) {
      setEndMs(resolveRollingCountdownEndMs(productSlug, rollingMinutes))
    }
  }, [productSlug, countdown.mode, countdown.endsAt, rollingMinutes])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const remainingMs = endMs === null ? 0 : Math.max(0, endMs - now)

  useEffect(() => {
    if (countdown.mode !== 'rolling' || remainingMs > 0 || rollingMinutes <= 0) return
    setEndMs(bumpRollingCountdownEndMs(productSlug, rollingMinutes))
    setNow(Date.now())
  }, [countdown.mode, productSlug, remainingMs, rollingMinutes])

  if (countdown.mode === 'fixed' && !countdown.endsAt) return null
  if (countdown.mode === 'rolling' && rollingMinutes <= 0) return null

  const headline = countdown.headline?.trim() || 'Hurry!'
  const expired = countdown.mode === 'fixed' && remainingMs <= 0

  if (expired) return null

  const { clock, suffix } = saleCountdownOneLine(remainingMs)

  return (
    <p
      className={`text-base font-semibold leading-snug text-red-600 sm:text-lg ${className}`}
      role="status"
      aria-live="off"
      aria-atomic="true"
    >
      <span className="uppercase tracking-wide">{headline}</span>
      <span aria-hidden> — </span>
      <span className="font-mono text-[1.05em] font-bold tabular-nums tracking-tight text-red-700 sm:text-[1.1em]">
        {clock}
      </span>
      <span> {suffix}</span>
    </p>
  )
}