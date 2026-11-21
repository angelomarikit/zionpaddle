import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatPhp } from '../../data/mock/products'
import { fetchDashboardStats, type DashboardDateRange } from '../../services/admin/dashboard'
import { DashboardDateRangeBar, formatRangeLabel } from '../../components/admin/DashboardDateRange'
import { ORDER_STATUS_LABEL } from '../../lib/orders/orderFsm'
import type { OrderStatus } from '../../types/order'
import { AdminCard, AdminPage } from '../../components/admin/AdminShell'
import {
  formatDelta,
  KpiSparkline,
  OrdersStatusChart,
  SalesOverTimeChart,
  TopProductsBars,
} from '../../components/admin/DashboardCharts'

export function AdminDashboardPage() {
  const [range, setRange] = useState<DashboardDateRange>({ days: 30 })
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', range],
    queryFn: () => fetchDashboardStats(range),
  })

  if (isLoading) return <p className="text-sm text-admin-muted">Loading your dashboard…</p>

  const stats = data!
  const salesDelta = formatDelta(stats.revenuePaidPhp, stats.revenuePreviousPhp)

  const rangeCaption = formatRangeLabel(range)

  return (
    <AdminPage title="Dashboard">
      <DashboardDateRangeBar range={range} onChange={setRange} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total sales"
          value={formatPhp(stats.revenuePaidPhp)}
          hint={salesDelta ? `${salesDelta.text} · ${rangeCaption}` : `Paid orders · ${rangeCaption}`}
          hintUp={salesDelta?.up}
          sparkline={stats.salesSparkline}
        />
        <Kpi
          label="Orders"
          value={String(stats.ordersInRange)}
          hint={`${stats.ordersPendingPayment} awaiting payment · ${rangeCaption}`}
        />
        <Kpi
          label="Average order"
          value={formatPhp(stats.averageOrderValuePhp)}
          hint="Based on paid orders"
        />
        <Kpi
          label="Products live"
          value={String(stats.productsLive)}
          hint={`${stats.collectionsLive} collections · ${stats.messagesUnread} new messages`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AdminCard className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">Total sales over time</h2>
              <p className="mt-1 text-xs text-admin-muted">{rangeCaption} vs previous period</p>
            </div>
            <p className="text-lg font-semibold">{formatPhp(stats.revenuePaidPhp)}</p>
          </div>
          <div className="mt-4">
            <SalesOverTimeChart points={stats.salesOverTime} previousPoints={stats.salesPreviousPeriod} />
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h2 className="font-semibold">Orders by status</h2>
          <div className="mt-4">
            <OrdersStatusChart slices={stats.ordersByStatus} />
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <AdminCard className="p-5">
          <h2 className="font-semibold">Total sales by product</h2>
          <div className="mt-4">
            <TopProductsBars items={stats.topProducts} />
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h2 className="font-semibold">Average order value</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatPhp(stats.averageOrderValuePhp)}</p>
          <p className="mt-1 text-sm text-admin-muted">
            {stats.ordersInRange > 0
              ? `Across ${stats.ordersInRange} order${stats.ordersInRange === 1 ? '' : 's'} in this range`
              : 'Waiting for your first order'}
          </p>
          <div className="mt-6 rounded-lg bg-admin-canvas p-4 text-sm text-admin-muted">
            <p className="font-medium text-admin-ink">Tip</p>
            <p className="mt-1">Confirm payments quickly so paid sales show up in your charts.</p>
            <Link to="/admin/orders" className="mt-2 inline-block text-admin-link hover:underline">
              Go to orders
            </Link>
          </div>
        </AdminCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-admin-link hover:underline">
              View all
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-admin-muted">No orders yet.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-admin-border text-xs text-admin-muted">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-platinum-200">
                    <td className="py-3 font-medium">{o.id}</td>
                    <td className="py-3 text-admin-muted">{o.customer}</td>
                    <td className="py-3 text-admin-muted">
                      {ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status}
                    </td>
                    <td className="py-3 text-right font-medium">{formatPhp(o.totalPhp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AdminCard>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <h2 className="font-semibold">Quick actions</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/admin/orders" className="text-admin-link hover:underline">
                  Review payments
                </Link>
              </li>
              <li>
                <Link to="/admin/products/new" className="text-admin-link hover:underline">
                  Add a product
                </Link>
              </li>
              <li>
                <Link to="/admin/collections" className="text-admin-link hover:underline">
                  Manage collections
                </Link>
              </li>
              <li>
                <Link to="/admin/content" className="text-admin-link hover:underline">
                  Edit announcement &amp; pages
                </Link>
              </li>
            </ul>
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-semibold">Low stock</h2>
            {stats.lowStock.length === 0 ? (
              <p className="mt-4 text-sm text-admin-muted">All products look healthy.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {stats.lowStock.map((p) => (
                  <li key={p.slug} className="flex justify-between gap-2">
                    <Link to={`/admin/products/${p.slug}`} className="text-admin-link hover:underline">
                      {p.name}
                    </Link>
                    <span className="text-admin-muted">{p.qty} left</span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  )
}

function Kpi({
  label,
  value,
  hint,
  hintUp,
  sparkline,
}: {
  label: string
  value: string
  hint: string
  hintUp?: boolean
  sparkline?: number[]
}) {
  return (
    <AdminCard className="p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-admin-muted">{label}</p>
        {sparkline && sparkline.length > 0 ? <KpiSparkline values={sparkline} /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p
        className={`mt-1 text-xs ${hintUp === undefined ? 'text-admin-muted' : hintUp ? 'text-admin-success' : 'text-[#d72c0d]'}`}
      >
        {hint}
      </p>
    </AdminCard>
  )
}
