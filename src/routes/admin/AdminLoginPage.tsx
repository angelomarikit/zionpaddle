import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabaseConfigured } from '../../lib/supabase/client'
import { Button } from '../../components/ui/Button'
import { ZionLogo } from '../../components/brand/ZionLogo'
import { ZION_ADMIN_OWNER_EMAIL } from '../../lib/admin/owner'

const fieldClass =
  'mt-1.5 w-full rounded-sm border border-platinum-300 bg-platinum-50 px-4 py-2.5 text-sm text-surface-ink placeholder:text-cream-muted focus:border-accent-coral focus:outline-none focus:ring-1 focus:ring-accent-volt/50'

function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-surface-cream text-surface-ink lg:flex-row">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-surface-ink via-[#2a261f] to-surface-ink px-8 py-10 text-white lg:w-[min(44vw,520px)] lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-accent-coral/20 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-accent-volt/15 blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="size-4" aria-hidden />
            Storefront
          </Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-accent-volt">Staff portal</p>
          <div className="mt-6">
            <ZionLogo surface="dark" variant="lockup" />
          </div>
          <p className="mt-8 max-w-xs text-sm leading-relaxed text-ink-muted">
            Manage orders, catalog, site content, and media for the ZION Pickleball storefront.
          </p>
        </div>
        <div className="relative mt-12 hidden text-xs text-white/40 lg:block">
          ZION Pickleball
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}

export function AdminLoginPage() {
  const { signIn, session, isStaff } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(ZION_ADMIN_OWNER_EMAIL)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  if (session && isStaff) return <Navigate to="/admin" replace />

  if (!supabaseConfigured) {
    return (
      <LoginShell>
        <div className="rounded-sm border border-black/8 bg-white/80 p-8 shadow-[0_24px_48px_rgba(20,20,20,0.06)] backdrop-blur-sm">
          <CardHeader />
          <CollapsibleKicker title="Store connection needed" />
          <p className="mt-4 text-sm leading-relaxed text-cream-muted">
            The admin panel is not linked to your live store database yet. Ask your web partner to finish the store
            connection so you can sign in here.
          </p>
        </div>
      </LoginShell>
    )
  }

  return (
    <LoginShell>
      <div className="rounded-sm border border-black/8 bg-white/80 p-8 shadow-[0_24px_48px_rgba(20,20,20,0.06)] backdrop-blur-sm">
        <CardHeader />
        <form
          className="mt-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault()
          setSubmitting(true)
          setError(undefined)
          const result = await signIn(email, password)
          setSubmitting(false)
          if (result.error) setError(result.error)
          else navigate('/admin')
        }}
      >
        <label className="block">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-cream-muted">Email</span>
          <input
            className={fieldClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder={ZION_ADMIN_OWNER_EMAIL}
            required
          />
        </label>
        <label className="block">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-cream-muted">Password</span>
          <input
            className={fieldClass}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error ? (
          <p className="rounded-sm border border-accent-coral/30 bg-accent-coral/10 px-3 py-2 text-sm text-accent-coral">
            {error}
          </p>
        ) : null}
          <Button type="submit" variant="coral" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-8 text-center text-xs text-cream-muted">
          Account owner: <span className="font-medium text-surface-ink">{ZION_ADMIN_OWNER_EMAIL}</span> · Other staff use
          credentials from Settings.
        </p>
      </div>
    </LoginShell>
  )
}

function CardHeader() {
  return (
    <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-sm bg-surface-ink text-accent-volt">
          <Lock className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Sign in</h2>
          <p className="text-xs text-cream-muted">Orders · Catalog · CMS</p>
        </div>
      </div>
  )
}

function CollapsibleKicker({ title }: { title: string }) {
  return <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent-coral">{title}</p>
}