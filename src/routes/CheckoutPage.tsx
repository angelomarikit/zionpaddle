import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Upload } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPhp, getProductBySlug } from '../data/mock/products'
import { shippingAddressSchema, type ShippingAddressForm } from '../schemas/checkout'
import { quoteJtShipping } from '../lib/checkout/shipping'
import { PAYMENT_METHODS, paymentInstructions } from '../lib/checkout/payment-instructions'
import type { OrderStatus, OrderStatusEvent, PaymentMethod, ShippingQuote } from '../types/order'
import type { CartLine } from '../types/commerce'
import { allocateNextOrderId, displayOrderNumber, submitOrder } from '../services/orders'
import { canFulfillLines } from '../services/inventory'
import { SectionShell } from '../components/tempo/SectionShell'
import { Button } from '../components/ui/Button'
import { ContentRail } from '../components/layout/ContentRail'

const fieldClass =
  'mt-1 w-full rounded border border-black/15 bg-white px-3 py-2 text-sm focus:border-accent-coral focus:outline-none'

export function CheckoutPage() {
  const { lines, subtotalPhp, clearCart } = useCart()
  const navigate = useNavigate()
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | undefined>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash')
  const [paymentReference, setPaymentReference] = useState('')
  const [notes, setNotes] = useState('')
  const [proofFileName, setProofFileName] = useState<string>()
  const [proofDataUrl, setProofDataUrl] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  const totalWeight = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const p = getProductBySlug(line.productSlug)
        return sum + (p?.weightGrams ?? 220) * line.quantity
      }, 0),
    [lines],
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingAddressForm>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      line1: '',
      line2: '',
      barangay: '',
      city: '',
      province: 'Metro Manila',
      postalCode: '',
    },
  })

  const province = watch('province')

  const quotes = useMemo(() => {
    if (!province || province.length < 2) return []
    return quoteJtShipping({ province, totalWeightGrams: totalWeight, itemCount: lines.length })
  }, [province, totalWeight, lines.length])

  const shippingPhp = shippingQuote?.feePhp ?? 0
  const totalPhp = subtotalPhp + shippingPhp
  const [draftOrderId, setDraftOrderId] = useState<string>()

  useEffect(() => {
    void allocateNextOrderId().then(setDraftOrderId)
  }, [])

  if (lines.length === 0) return <Navigate to="/cart" replace />

  const onQuotePick = (q: ShippingQuote) => setShippingQuote(q)

  const onProofChange = (file: File | undefined) => {
    if (!file) {
      setProofFileName(undefined)
      setProofDataUrl(undefined)
      return
    }
    if (file.size > 2_500_000) {
      setError('Proof image must be under 2.5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setProofFileName(file.name)
      setProofDataUrl(typeof reader.result === 'string' ? reader.result : undefined)
      setError(undefined)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = handleSubmit(async (address) => {
    if (!shippingQuote) {
      setError('Select a J&T shipping option')
      return
    }
    const stock = canFulfillLines(lines)
    if (!stock.ok) {
      setError(`Some items are out of stock: ${stock.shortages.join('; ')}`)
      return
    }
    if (!draftOrderId) {
      setError('Your order number is still being prepared. Please try again in a moment.')
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      const now = new Date().toISOString()
      const shippingSnapshot = {
        ...shippingQuote,
        quotedAt: now,
        totalWeightGrams: totalWeight,
        itemCount: lines.length,
        province: address.province,
      }
      let status: OrderStatus = 'pending_payment'
      const statusHistory: OrderStatusEvent[] = [{ status: 'pending_payment', at: now, by: 'system' }]
      if (proofDataUrl) {
        status = 'payment_review'
        statusHistory.push({ status: 'proof_submitted', at: now, by: 'customer' })
        statusHistory.push({ status: 'payment_review', at: now, by: 'system' })
      }
      const order = {
        id: draftOrderId,
        createdAt: now,
        status,
        lines: [...lines],
        subtotalPhp,
        shippingPhp,
        totalPhp,
        address,
        shipping: shippingQuote,
        shippingSnapshot,
        paymentMethod,
        paymentReference: paymentReference || undefined,
        proofFileName,
        proofDataUrl,
        proofSubmittedAt: proofDataUrl ? now : undefined,
        notes: notes || undefined,
        statusHistory,
      }
      const { persistence } = await submitOrder(order)
      clearCart()
      navigate(`/orders/${order.id}?store=${persistence}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place order')
    } finally {
      setSubmitting(false)
    }
  })

  const payPreview = draftOrderId
    ? paymentInstructions(paymentMethod, draftOrderId, totalPhp || subtotalPhp)
    : undefined

  return (
    <SectionShell surface="cream" className="min-h-[70vh] pt-28" wide>
      <ContentRail wide>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream-muted">Checkout</p>
        <h1 className="mt-2 text-4xl font-bold">Ship · Pay · Play</h1>
        <p className="mt-2 max-w-2xl text-sm text-cream-muted">
          Manual Philippine payments only — GCash, Maya, or QR Ph. Upload proof after paying. J&T shipping
          quote is estimated until carrier API keys are added.
        </p>

        <form onSubmit={onSubmit} className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold">Shipping address</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  Full name
                  <input className={fieldClass} {...register('fullName')} />
                  {errors.fullName ? (
                    <span className="text-xs text-accent-coral">{errors.fullName.message}</span>
                  ) : null}
                </label>
                <label>
                  Email
                  <input className={fieldClass} type="email" {...register('email')} />
                  {errors.email ? <span className="text-xs text-accent-coral">{errors.email.message}</span> : null}
                </label>
                <label>
                  Mobile
                  <input className={fieldClass} {...register('phone')} />
                  {errors.phone ? <span className="text-xs text-accent-coral">{errors.phone.message}</span> : null}
                </label>
                <label className="sm:col-span-2">
                  Street / unit
                  <input className={fieldClass} {...register('line1')} />
                  {errors.line1 ? <span className="text-xs text-accent-coral">{errors.line1.message}</span> : null}
                </label>
                <label className="sm:col-span-2">
                  Landmark (optional)
                  <input className={fieldClass} {...register('line2')} />
                </label>
                <label>
                  Barangay
                  <input className={fieldClass} {...register('barangay')} />
                  {errors.barangay ? (
                    <span className="text-xs text-accent-coral">{errors.barangay.message}</span>
                  ) : null}
                </label>
                <label>
                  City / municipality
                  <input className={fieldClass} {...register('city')} />
                  {errors.city ? <span className="text-xs text-accent-coral">{errors.city.message}</span> : null}
                </label>
                <label>
                  Province / region
                  <input className={fieldClass} {...register('province')} />
                  {errors.province ? (
                    <span className="text-xs text-accent-coral">{errors.province.message}</span>
                  ) : null}
                </label>
                <label>
                  Postal code
                  <input className={fieldClass} {...register('postalCode')} />
                  {errors.postalCode ? (
                    <span className="text-xs text-accent-coral">{errors.postalCode.message}</span>
                  ) : null}
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold">J&T shipping</h2>
              <p className="mt-2 text-sm text-cream-muted">
                Est. parcel weight {Math.max(0.5, totalWeight / 1000).toFixed(1)} kg · {lines.length} item
                {lines.length === 1 ? '' : 's'}
              </p>
              <QuotesPicker quotes={quotes} selected={shippingQuote} onPick={onQuotePick} />
            </section>

            <section>
              <h2 className="text-xl font-bold">Payment</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                      paymentMethod === m.id
                        ? 'border-accent-coral bg-accent-coral/10'
                        : 'border-black/15 bg-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {draftOrderId ? (
                <p className="mt-3 text-sm text-cream-muted">
                  Your order number: <strong className="text-surface-ink">{displayOrderNumber(draftOrderId)}</strong>
                </p>
              ) : null}
              <PayCard pay={payPreview} />
              <label className="mt-4 block text-sm">
                Payment reference (optional)
                <input
                  className={fieldClass}
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Last 4 digits / ref number"
                />
              </label>
            </section>

            <section>
              <h2 className="text-xl font-bold">Proof of payment</h2>
              <p className="mt-2 text-sm text-cream-muted">
                Screenshot or photo — JPG/PNG, max 2.5 MB. Required before we release to fulfillment.
              </p>
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-black/20 bg-white/80 px-4 py-6 text-sm">
                <Upload className="size-5 shrink-0" aria-hidden />
                <span>{proofFileName ?? 'Upload proof'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onProofChange(e.target.files?.[0])}
                />
              </label>
              {proofDataUrl ? (
                <img src={proofDataUrl} alt="" className="mt-4 max-h-40 rounded border border-black/10 object-contain" />
              ) : null}
            </section>

            <label className="block text-sm">
              Order notes (optional)
              <textarea className={`${fieldClass} min-h-[80px]`} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>

            {error ? <p className="text-sm font-medium text-accent-coral">{error}</p> : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CheckoutSummary
              lines={lines}
              subtotalPhp={subtotalPhp}
              shippingPhp={shippingPhp}
              totalPhp={totalPhp}
              shippingQuote={shippingQuote}
            />
            <Button
              type="submit"
              variant="coral"
              className="mt-6 w-full"
              disabled={submitting || !shippingQuote}
            >
              {submitting ? 'Placing order…' : 'Place order'}
              <ArrowRight className="size-4" />
            </Button>
          </aside>
        </form>
      </ContentRail>
    </SectionShell>
  )
}

function QuotesPicker({
  quotes,
  selected,
  onPick,
}: {
  quotes: ShippingQuote[]
  selected?: ShippingQuote
  onPick: (q: ShippingQuote) => void
}) {
  if (quotes.length === 0) {
    return <p className="mt-4 text-sm text-cream-muted">Enter province to load J&T rates.</p>
  }
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {quotes.map((q) => {
        const active = selected?.service === q.service
        return (
          <button
            key={q.service}
            type="button"
            onClick={() => onPick(q)}
            className={`rounded-lg border p-4 text-left transition ${
              active ? 'border-accent-coral bg-accent-coral/5' : 'border-black/10 bg-white'
            }`}
          >
            <p className="font-semibold">
              {q.carrier} · {q.service}
            </p>
            <p className="mt-1 text-sm text-cream-muted">{q.etaDays} business days</p>
            <p className="mt-2 text-lg font-bold">{formatPhp(q.feePhp)}</p>
          </button>
        )
      })}
    </div>
  )
}

function PayCard({ pay }: { pay?: ReturnType<typeof paymentInstructions> }) {
  if (!pay) {
    return <p className="mt-4 text-sm text-cream-muted">Preparing your order number…</p>
  }
  return (
    <div className="mt-4 rounded-lg border border-black/10 bg-white/80 p-5 text-sm">
      <p className="font-semibold">{pay.accountName}</p>
      <p className="mt-1 text-cream-muted">{pay.accountDetail}</p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-cream-muted">
        {pay.steps.slice(0, 3).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  )
}

function CheckoutSummary({
  lines,
  subtotalPhp,
  shippingPhp,
  totalPhp,
  shippingQuote,
}: {
  lines: CartLine[]
  subtotalPhp: number
  shippingPhp: number
  totalPhp: number
  shippingQuote?: ShippingQuote
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/80 p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-cream-muted">Summary</p>
      <ul className="mt-4 space-y-3 text-sm">
        {lines.map((line) => (
          <li key={`${line.productSlug}-${line.colorwayId}`} className="flex justify-between gap-2">
            <span>
              {line.productName} × {line.quantity}
            </span>
            <span className="font-medium">{formatPhp(line.pricePhp * line.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-2 border-t border-black/10 pt-4 text-sm">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPhp(subtotalPhp)}</span>
        </p>
        <p className="flex justify-between">
          <span>Shipping {shippingQuote ? `(${shippingQuote.service})` : ''}</span>
          <span>{shippingQuote ? formatPhp(shippingPhp) : '—'}</span>
        </p>
        <p className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPhp(totalPhp)}</span>
        </p>
      </div>
    </div>
  )
}