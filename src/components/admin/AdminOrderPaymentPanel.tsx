import { useState } from 'react'
import type { OrderRecord } from '../../types/order'
import { formatPhp } from '../../data/mock/products'
import { paymentInstructions, paymentMethodLabel } from '../../lib/checkout/payment-instructions'
import { displayOrderNumber } from '../../services/orders'
import { formatOrderDate, paymentBadge, StatusPill } from './orderBadges'
import { AdminCard } from './AdminShell'

export function AdminOrderPaymentPanel({ order }: { order: OrderRecord }) {
  const payment = paymentBadge(order.status)
  const pay = paymentInstructions(order.paymentMethod, order.id, order.totalPhp)
  const methodLabel = paymentMethodLabel(order.paymentMethod)
  const [lightbox, setLightbox] = useState(false)

  return (
    <AdminCard className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Payment · {methodLabel}</h2>
        <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
      </div>

      <p className="mt-2 text-sm text-admin-muted">
        Manual {methodLabel}
        {order.paymentMethod === 'qrph' ? ' (InstaPay QR)' : ''} — match the customer screenshot to the amount and
        reference below.
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-admin-muted">Expected total</dt>
          <dd className="font-semibold">{formatPhp(order.totalPhp)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-admin-muted">Order reference</dt>
          <dd className="font-mono text-xs">{displayOrderNumber(order.id)}</dd>
        </div>
        {order.paymentReference ? (
          <div className="flex justify-between gap-4">
            <dt className="text-admin-muted">Customer reference</dt>
            <dd>{order.paymentReference}</dd>
          </div>
        ) : null}
        <div className="rounded-lg bg-admin-canvas px-3 py-2 text-admin-ink">
          <p className="text-xs font-medium text-admin-muted">Receive payment to</p>
          <p className="mt-1 font-medium">{pay.accountName}</p>
          <p className="text-sm">{pay.accountDetail}</p>
        </div>
      </dl>

      <div className="mt-4 border-t border-admin-border pt-4">
        <h3 className="text-sm font-semibold text-admin-ink">Customer payment screenshot</h3>
        {order.proofDataUrl ? (
          <>
            <p className="mt-1 text-xs text-admin-muted">
              {order.proofFileName ?? 'Proof image'}
              {order.proofSubmittedAt ? ` · Uploaded ${formatOrderDate(order.proofSubmittedAt)}` : ''}
            </p>
            <button
              type="button"
              className="mt-3 block w-full overflow-hidden rounded-lg border border-admin-border bg-admin-subtle text-left transition hover:border-admin-input"
              onClick={() => setLightbox(true)}
            >
              <img
                src={order.proofDataUrl}
                alt={`${methodLabel} payment proof from customer`}
                className="mx-auto max-h-72 w-full object-contain"
              />
            </button>
            <p className="mt-2 text-xs text-admin-muted">Tap image to enlarge. Verify amount, date, and reference match.</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-admin-muted">
            No screenshot yet. Customer pays via {methodLabel}
            {order.paymentMethod === 'qrph' ? ' / QR Ph' : ''} and uploads proof from the order confirmation page.
          </p>
        )}
      </div>

      <details className="mt-4 text-sm text-admin-muted">
        <summary className="cursor-pointer font-medium text-admin-ink">Customer checkout steps</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {pay.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>

      {lightbox && order.proofDataUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Payment proof full size"
          onClick={() => setLightbox(false)}
        >
          <img
            src={order.proofDataUrl}
            alt=""
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </AdminCard>
  )
}