import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatPhp } from '../../data/mock/products'
import { fetchStaffOrders } from '../../services/admin/ordersAdmin'
import { ORDER_STATUS_LABEL } from '../../lib/orders/orderFsm'
import { displayOrderNumber } from '../../services/orders'
import { paymentMethodLabel } from '../../lib/checkout/payment-instructions'
import { AdminCard, AdminPage } from '../../components/admin/AdminShell'
import { AdminOrderFulfillPanel } from '../../components/admin/AdminOrderFulfillPanel'
import { AdminOrderRiskPanel } from '../../components/admin/AdminOrderRiskPanel'
import { AdminOrderPaymentPanel } from '../../components/admin/AdminOrderPaymentPanel'
import { AdminOrderStaffActions } from '../../components/admin/AdminOrderStaffActions'
import {
  formatOrderDate,
  fulfillmentBadge,
  FulfillmentPill,
  HighRiskPill,
  paymentBadge,
  StatusPill,
} from '../../components/admin/orderBadges'

export function AdminOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchStaffOrders,
  })

  const order = data?.orders.find((o) => o.id === orderId)

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    void navigate(0)
  }

  if (isLoading) return <p className="text-sm text-admin-muted">Loading order…</p>
  if (!order) {
    return (
      <AdminPage title="Order not found">
        <Link to="/admin/orders" className="text-sm text-admin-link hover:underline">
          ← Back to orders
        </Link>
      </AdminPage>
    )
  }

  const payment = paymentBadge(order.status)
  const fulfillment = fulfillmentBadge(order.status)
  const paidPhp = order.status === 'paid' || order.status === 'fulfilled' ? order.totalPhp : 0
  const methodLabel = paymentMethodLabel(order.paymentMethod)
  return (
    <AdminPage
      title={displayOrderNumber(order.id)}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <AdminOrderStaffActions order={order} onDone={refresh} layout="toolbar" />
          <Link to="/admin/orders" className="text-sm text-admin-link hover:underline">
            All orders
          </Link>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
        <FulfillmentPill status={order.status} />
        {order.highRisk ? <HighRiskPill /> : null}
        <span className="text-sm text-admin-muted">
          {formatOrderDate(order.createdAt)} · {methodLabel} · {formatPhp(order.totalPhp)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AdminCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">
                {fulfillment?.label === 'Fulfilled' ? 'Fulfilled' : 'Unfulfilled'} (
                {order.lines.reduce((n, l) => n + l.quantity, 0)} items)
              </h2>
              <span className="text-xs text-admin-muted">{order.shipping.carrier}</span>
            </div>
            <ul className="mt-4 divide-y divide-platinum-200">
              {order.lines.map((line) => (
                <li key={`${line.productSlug}-${line.colorwayId}`} className="flex gap-4 py-4 first:pt-2">
                  <img
                    src={line.image}
                    alt=""
                    className="size-14 rounded-lg border border-admin-border object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{line.productName}</p>
                    <p className="text-sm text-admin-muted">
                      {line.colorwayName} · Grip {line.gripSizeLabel}
                    </p>
                    <p className="text-sm text-admin-muted">Qty {line.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPhp(line.pricePhp * line.quantity)}</p>
                </li>
              ))}
            </ul>
            {order.status === 'paid' ? (
              <p className="mt-4 text-sm text-admin-muted">
                Payment verified. Pack items and tap <strong>Mark fulfilled</strong> when J&T has the parcel.
              </p>
            ) : null}
          </AdminCard>

          <AdminOrderPaymentPanel order={order} />

          <AdminCard className="p-5">
            <h2 className="font-semibold">Order totals</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-admin-muted">Subtotal</dt>
                <dd>{formatPhp(order.subtotalPhp)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-admin-muted">
                  Shipping ({order.shipping.carrier} {order.shipping.service})
                </dt>
                <dd>{formatPhp(order.shippingPhp)}</dd>
              </div>
              <div className="flex justify-between border-t border-admin-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatPhp(order.totalPhp)}</dd>
              </div>
              <div className="flex justify-between text-admin-muted">
                <dt>Recorded as paid</dt>
                <dd>{formatPhp(paidPhp)}</dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-semibold">Timeline</h2>
            <ul className="mt-4 space-y-3 border-l-2 border-admin-border pl-4">
              {order.statusHistory.map((evt, i) => (
                <li key={`${evt.at}-${i}`} className="text-sm">
                  <p className="font-medium text-admin-ink">{ORDER_STATUS_LABEL[evt.status]}</p>
                  <p className="text-xs text-admin-muted">
                    {formatOrderDate(evt.at)}
                    {evt.by ? ` · ${evt.by}` : ''}
                    {evt.note ? ` — ${evt.note}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminOrderFulfillPanel order={order} onDone={refresh} />
          <AdminOrderRiskPanel order={order} onDone={refresh} />

          <AdminCard className="p-5">
            <h2 className="font-semibold">Payment & fulfillment</h2>
            <p className="mt-2 text-sm text-admin-muted">
              Compare the customer&apos;s GCash, Maya, or QR Ph screenshot against {formatPhp(order.totalPhp)} and{' '}
              {displayOrderNumber(order.id)}.
            </p>
            <AdminOrderStaffActions order={order} onDone={refresh} layout="sidebar" />
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-semibold">Customer</h2>
            <p className="mt-3 font-medium">{order.address.fullName}</p>
            <p className="mt-2 text-sm text-admin-muted">{order.address.email}</p>
            <p className="text-sm text-admin-muted">{order.address.phone}</p>
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-semibold">Shipping address</h2>
            <p className="mt-3 text-sm leading-relaxed text-admin-ink">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.barangay}, {order.address.city}
              <br />
              {order.address.province} {order.address.postalCode}
            </p>
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-semibold">Notes</h2>
            <p className="mt-2 text-sm text-admin-muted">{order.notes?.trim() || 'No notes from customer'}</p>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  )
}