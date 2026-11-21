import type { StaffProfile } from '../../types/cms'
import { DEFAULT_ADMIN_PERMISSIONS } from '../staff/permissions'

/** Primary store owner — full admin access in app + may auto-provision profile on first sign-in. */
export const ZION_ADMIN_OWNER_EMAIL = 'admin@zion.com'

export function isZionAdminOwnerEmail(email: string | undefined | null) {
  return email?.trim().toLowerCase() === ZION_ADMIN_OWNER_EMAIL
}

/** In-app owner when Supabase `profiles` row is missing or RLS blocks read (still signed in as owner). */
export function syntheticOwnerProfile(userId: string): StaffProfile {
  return {
    user_id: userId,
    email: ZION_ADMIN_OWNER_EMAIL,
    role: 'admin',
    display_name: 'ZION Admin',
    permissions: DEFAULT_ADMIN_PERMISSIONS,
  }
}