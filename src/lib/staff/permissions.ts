import type { StaffPermissions, StaffPermissionKey } from '../../types/staff'
import type { StaffProfile } from '../../types/cms'
import { isZionAdminOwnerEmail } from '../admin/owner'

export const ALL_PERMISSION_KEYS: StaffPermissionKey[] = [
  'dashboard:view',
  'orders:view',
  'orders:payment',
  'orders:fulfill',
  'orders:cancel',
  'orders:risk',
  'products:edit',
  'collections:edit',
  'inbox:view',
  'content:edit',
  'settings:manage_staff',
]

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  'dashboard:view': true,
  'orders:view': true,
  'orders:fulfill': true,
  'orders:payment': false,
  'orders:cancel': false,
  'orders:risk': false,
  'products:edit': false,
  'collections:edit': false,
  'inbox:view': true,
  'content:edit': false,
  'settings:manage_staff': false,
}

export const DEFAULT_ADMIN_PERMISSIONS: StaffPermissions = Object.fromEntries(
  ALL_PERMISSION_KEYS.map((k) => [k, true]),
) as StaffPermissions

export function resolvePermissions(profile: StaffProfile | null): StaffPermissions {
  if (!profile) return {}
  if (profile.role === 'admin') return { ...DEFAULT_ADMIN_PERMISSIONS, ...profile.permissions }
  return { ...DEFAULT_STAFF_PERMISSIONS, ...profile.permissions }
}

export function canAccess(profile: StaffProfile | null, key: StaffPermissionKey): boolean {
  if (!profile) return false
  if (profile.role === 'admin' || isZionAdminOwnerEmail(profile.email)) return true
  return resolvePermissions(profile)[key] === true
}

export function permissionsForRole(role: 'admin' | 'staff', overrides?: StaffPermissions): StaffPermissions {
  const base = role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS
  return { ...base, ...overrides }
}

/** First admin route this profile may open (for redirects). */
export function defaultAdminPath(profile: StaffProfile | null): string {
  if (!profile) return '/admin/login'
  if (canAccess(profile, 'dashboard:view')) return '/admin'
  if (canAccess(profile, 'orders:view')) return '/admin/orders'
  if (canAccess(profile, 'products:edit')) return '/admin/products'
  if (canAccess(profile, 'collections:edit')) return '/admin/collections'
  if (canAccess(profile, 'inbox:view')) return '/admin/contact'
  if (canAccess(profile, 'content:edit')) return '/admin/content'
  if (canAccess(profile, 'settings:manage_staff')) return '/admin/settings'
  return '/admin'
}