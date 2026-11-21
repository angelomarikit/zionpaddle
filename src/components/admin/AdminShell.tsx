import type { ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { countUnfulfilledOrders, fetchStaffOrders } from '../../services/admin/ordersAdmin'
import { supabaseConfigured } from '../../lib/supabase/client'
import { STORE_OFFLINE_HINT } from '../../lib/admin/messages'
import type { StaffPermissionKey } from '../../types/staff'

type NavItem = { to: string; label: string; end?: boolean; perm?: StaffPermissionKey }
type NavGroup = { title: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    title: 'Store',
    items: [
      { to: '/admin', label: 'Dashboard', end: true, perm: 'dashboard:view' },
      { to: '/admin/orders', label: 'Orders', perm: 'orders:view' },
      { to: '/admin/products', label: 'Products', perm: 'products:edit' },
      { to: '/admin/collections', label: 'Collections', perm: 'collections:edit' },
      { to: '/admin/contact', label: 'Inbox', perm: 'inbox:view' },
    ],
  },
  {
    title: 'Online store',
    items: [{ to: '/admin/content', label: 'Website content', perm: 'content:edit' }],
  },
  {
    title: 'Settings',
    items: [{ to: '/admin/settings', label: 'Staff & access' }],
  },
]

export function AdminShell({ children }: { children?: ReactNode }) {
  const { signOut, profile, session } = useAuth()
  const { can } = useStaffPermissions()

  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.perm || can(item.perm)),
    }))
    .filter((g) => g.items.length > 0)

  const canViewOrders = can('orders:view')
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchStaffOrders,
    enabled: canViewOrders,
    staleTime: 20_000,
  })
  const unfulfilledCount = ordersData?.orders ? countUnfulfilledOrders(ordersData.orders) : 0

  return (
    <div className="admin-app flex min-h-[100svh] bg-admin-canvas text-admin-ink">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-admin-border bg-gradient-to-b from-platinum-100 to-admin-sidebar lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-admin-border px-4">
          <Link to="/admin" className="text-sm font-extrabold italic tracking-tight text-admin-ink">
            ZION
          </Link>
          <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-700">
            Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {visibleGroups.map((g) => (
            <div key={g.title} className="mb-4">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-admin-muted">{g.title}</p>
              <ul className="mt-1 space-y-0.5">
                {g.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-admin-card text-admin-ink shadow-sm ring-1 ring-gold-500/25'
                            : 'text-admin-muted hover:bg-admin-card/80 hover:text-admin-ink'
                        }`
                      }
                    >
                      <span>{item.label}</span>
                      {item.to === '/admin/orders' && unfulfilledCount > 0 ? (
                        <span
                          className="min-w-[1.35rem] rounded-md bg-gold-500/25 px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-gold-800 tabular-nums"
                          aria-label={`${unfulfilledCount} unfulfilled orders`}
                        >
                          {unfulfilledCount > 99 ? '99+' : unfulfilledCount}
                        </span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-admin-border bg-admin-canvas/95 px-4 backdrop-blur-sm lg:px-6">
          <p className="text-sm font-semibold text-admin-muted lg:hidden">ZION Admin</p>
          <div className="ml-auto flex items-center gap-4 text-xs font-medium text-admin-muted">
            <span className="hidden sm:inline">{profile?.display_name ?? profile?.email ?? session?.user.email}</span>
            <Link to="/admin/settings" className="hidden text-admin-link hover:underline sm:inline">
              Settings
            </Link>
            <Link to="/" className="text-admin-link hover:underline">
              View store
            </Link>
            <button type="button" className="text-admin-ink hover:text-gold-700 hover:underline" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </header>

        {!supabaseConfigured ? (
          <div className="border-b border-gold-500/30 bg-gold-400/15 px-4 py-2 text-center text-xs text-gold-900 lg:px-6">
            {STORE_OFFLINE_HINT}
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}

export function AdminPage({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-admin-border/60 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-admin-ink">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  )
}

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-admin-border bg-admin-card shadow-sm shadow-black/[0.03] ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export const adminField =
  'mt-1 w-full rounded-lg border border-admin-input bg-admin-card px-3 py-2 text-sm text-admin-ink focus:border-admin-gold focus:outline-none focus:ring-2 focus:ring-admin-gold/25'

export const adminLabel = 'text-xs font-medium text-admin-muted'