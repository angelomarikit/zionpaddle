import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase, supabaseConfigured } from '../lib/supabase/client'
import type { StaffProfile } from '../types/cms'
import {
  isZionAdminOwnerEmail,
  syntheticOwnerProfile,
  ZION_ADMIN_OWNER_EMAIL,
} from '../lib/admin/owner'
import { DEFAULT_ADMIN_PERMISSIONS } from '../lib/staff/permissions'

type AuthContextValue = {
  session: Session | null
  profile: StaffProfile | null
  loading: boolean
  isStaff: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string, sessionEmail?: string | null): Promise<StaffProfile | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from('profiles')
    .select('user_id, email, role, display_name, permissions')
    .eq('user_id', userId)
    .maybeSingle()
  const email = sessionEmail?.trim().toLowerCase()
  const ownerSession = isZionAdminOwnerEmail(email)

  if (!error && data) {
    const row = data as StaffProfile
    if (ownerSession || isZionAdminOwnerEmail(row.email)) {
      return { ...row, email: ZION_ADMIN_OWNER_EMAIL, role: 'admin', permissions: DEFAULT_ADMIN_PERMISSIONS }
    }
    return row
  }

  if (!ownerSession) return null

  const row = {
    user_id: userId,
    email: ZION_ADMIN_OWNER_EMAIL,
    role: 'admin' as const,
    display_name: 'ZION Admin',
    permissions: DEFAULT_ADMIN_PERMISSIONS,
  }
  const { data: inserted, error: insertError } = await sb.from('profiles').insert(row).select().maybeSingle()
  if (!insertError && inserted) return inserted as StaffProfile

  const { data: updated, error: updateError } = await sb
    .from('profiles')
    .update({ role: 'admin', email: ZION_ADMIN_OWNER_EMAIL, display_name: 'ZION Admin' })
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  if (!updateError && updated) return updated as StaffProfile

  return syntheticOwnerProfile(userId)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) {
      setLoading(false)
      return
    }

    void sb.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        setProfile(await loadProfile(data.session.user.id, data.session.user.email))
      }
      setLoading(false)
    })

    const { data: sub } = sb.auth.onAuthStateChange(async (_event, next) => {
      setSession(next)
      if (next?.user) setProfile(await loadProfile(next.user.id, next.user.email))
      else setProfile(null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase()
    if (!sb) return { error: 'Supabase is not configured' }
    const { error } = await sb.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }, [])

  const signOut = useCallback(async () => {
    const sb = getSupabase()
    await sb?.auth.signOut()
    setProfile(null)
  }, [])

  const effectiveProfile = useMemo(() => {
    if (profile) return profile
    if (session?.user && isZionAdminOwnerEmail(session.user.email)) {
      return syntheticOwnerProfile(session.user.id)
    }
    return null
  }, [profile, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile: effectiveProfile,
      loading,
      isStaff: Boolean(
        effectiveProfile &&
          (effectiveProfile.role === 'admin' || effectiveProfile.role === 'staff' || isZionAdminOwnerEmail(session?.user?.email)),
      ),
      signIn,
      signOut,
    }),
    [session, effectiveProfile, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}