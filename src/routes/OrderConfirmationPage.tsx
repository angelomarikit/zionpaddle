import { type ReactNode, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { displayOrderNumber, fetchOrderById, submitPaymentProof } from '../services/orders'
import type { OrderRecord } from '../types/order'
import { formatPhp } from '../data/mock/products'
import { paymentInstructions } from '../lib/checkout/payment-instructions'
import { ORDER_STATUS_LABEL } from '../lib/orders/orderFsm'
import { SectionShell } from '../components/tempo/SectionShell'
import { Button } from '../components/ui/Button'
import { NotFoundPage } from './NotFoundPage'

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/70 p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-cream-muted">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [search] = useSearchParams()
  const persistence = search.get('store') ?? 'local'
  const [order, setOrder] = useState<OrderRecord | undefined>()
  const [loading, setLoading] = useState(true)
  const [proofError, setProofError] = useState<string>()
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    void fetchOrderById(orderId).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [orderId])

  const onProofChange = (file: File | undefined) => {
    if (!orderId || !file) return
    if (file.size > 2_500_000) {
      setProofError('Proof image must be under 2.5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : undefined
      if (!dataUrl) return
      setUploading(true)
      setProofError(undefined)
      const result = await submitPaymentProof(orderId, { fileName: file.name, dataUrl })
      setUploading(false)
      if (result.error) {
        setProofError(result.error)
        return
      }
      if (result.order) setOrder(result.order)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <SectionShell surface="cream" className="min-h-[50vh] pt-28" wide>
        <p className="text-cream-muted">Loading order…</p>
      </SectionShell>
    )
  }

  if (!order) return <NotFoundPage />

  const pay = paymentInstructions(order.paymentMethod, order.id, order.totalPhp)
  const canUploadProof =
    order.status === 'pending_payment' || order.status === 'payment_rejected'
  const snap = order.shippingSnapshot

  return (
    <SectionShell surface="cream" className="min-h-[70vh] pt-28" wide>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream-muted">Order placed</p>
      <h1 className="mt-2 text-4xl font-bold">Thank you — {displayOrderNumber(order.id)}</h1>
      <p className="mt-3 max-w-xl text-cream-muted">
        Status: <strong className="text-surface-ink">{ORDER_STATUS_LABEL[order.status]}</strong>. Our team confirms
        GCash / Maya / QR proofs manually (no automatic capture).
      </p>
      {order.rejectionReason ? (
        <p className="mt-2 text-sm text-accent-coral">Previous rejection: {order.rejectionReason}</p>
      ) : null}
      {persistence === 'supabase' ? (
        <p className="mt-2 text-sm text-accent-volt">Saved to Supabase.</p>
      ) : (
        <p className="mt-2 text-sm text-cream-muted">
          Saved on this device until Supabase credentials are configured.
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <InfoCard title="Pay now">
          <p className="text-sm">
            <span className="font-semibold">{pay.accountName}</span>
            <br />
            {pay.accountDetail}
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-cream-muted">
            {pay.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-6 text-2xl font-bold">{formatPhp(order.totalPhp)}</p>
          {canUploadProof ? (
            <label className="mt-6 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-black/20 bg-white/50 p-6 text-sm">
              <Upload className="size-5 text-cream-muted" aria-hidden />
              <span className="font-semibold">{uploading ? 'Uploading…' : 'Upload payment proof'}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => onProofChange(e.target.files?.[0])}
              />
            </label>
          ) : null}
          {proofError ? <p className="mt-2 text-sm text-accent-coral">{proofError}</p> : null}
          {order.proofDataUrl && !canUploadProof ? (
            <p className="mt-4 text-sm text-cream-muted">Proof on file: {order.proofFileName ?? 'uploaded'}</p>
          ) : null}
        </InfoCard>

        <InfoCard title="Delivery">
          <p className="text-sm text-cream-muted">
            {order.shipping.carrier} · {order.shipping.service} · {order.shipping.etaDays} business days
          </p>
          {snap ? (
            <p className="mt-2 text-xs text-cream-muted">
              Quoted {new Date(snap.quotedAt).toLocaleString()} · {snap.totalWeightGrams}g · {snap.province}
            </p>
          ) : null}
          <p className="mt-4 font-semibold">{order.address.fullName}</p>
          <p className="text-sm text-cream-muted">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}
            <br />
            {order.address.barangay}, {order.address.city}
            <br />
            {order.address.province} {order.address.postalCode}
            <br />
            {order.address.phone} · {order.address.email}
          </p>
        </InfoCard>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button to="/collections" variant="coral">
          Continue shopping
        </Button>
        <Link to="/" className="inline-flex items-center text-sm font-semibold uppercase tracking-wide underline">
          Back home
        </Link>
      </div>
    </SectionShell>
  )
}