import type { StaffProfile } from '../../types/cms'
import type { StaffPermissions } from '../../types/staff'
import { permissionsForRole } from '../../lib/staff/permissions'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'

export async function listStaffProfiles(): Promise<{ staff: StaffProfile[]; error?: string }> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) {
    return { staff: [], error: 'Connect your store database to manage staff.' }
  }
  const { data, error } = await sb
    .from('profiles')
    .select('user_id, email, role, display_name, permissions, created_at')
    .order('created_at', { ascending: true })
  if (error) return { staff: [], error: error.message }
  return { staff: (data ?? []).map(mapProfileRow) }
}

function mapProfileRow(row: Record<string, unknown>): StaffProfile {
  return {
    user_id: String(row.user_id),
    email: String(row.email),
    role: row.role as StaffProfile['role'],
    display_name: (row.display_name as string) ?? undefined,
    permissions: (row.permissions as StaffPermissions) ?? {},
    created_at: row.created_at ? String(row.created_at) : undefined,
  }
}

export async function inviteStaffMember(input: {
  email: string
  password: string
  role: 'admin' | 'staff'
  permissions?: StaffPermissions
  displayName?: string
}): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return { error: 'Store database is not connected.' }

  const { data, error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
  })
  if (error) return { error: error.message }
  if (!data.user) return { error: 'Could not create account. Check if email confirmation is required in Supabase.' }

  const permissions = permissionsForRole(input.role, input.permissions)
  const { error: profileError } = await sb.from('profiles').insert({
    user_id: data.user.id,
    email: input.email.trim(),
    role: input.role,
    display_name: input.displayName?.trim() || null,
    permissions,
  })
  if (profileError) return { error: profileError.message }
  return {}
}

export async function updateStaffProfile(
  userId: string,
  patch: {
    role?: 'admin' | 'staff'
    permissions?: StaffPermissions
    displayName?: string
  },
): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return { error: 'Store database is not connected.' }

  const payload: Record<string, unknown> = {}
  if (patch.role) payload.role = patch.role
  if (patch.permissions) payload.permissions = patch.permissions
  if (patch.displayName !== undefined) payload.display_name = patch.displayName.trim() || null

  const { error } = await sb.from('profiles').update(payload).eq('user_id', userId)
  if (error) return { error: error.message }
  return {}
}