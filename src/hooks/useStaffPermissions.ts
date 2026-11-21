import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { canAccess, resolvePermissions } from '../lib/staff/permissions'
import type { StaffPermissionKey } from '../types/staff'

export function useStaffPermissions() {
  const { profile } = useAuth()
  const permissions = useMemo(() => resolvePermissions(profile), [profile])

  return {
    profile,
    permissions,
    isAdmin: profile?.role === 'admin',
    can: (key: StaffPermissionKey) => canAccess(profile, key),
    canManageStaff: canAccess(profile, 'settings:manage_staff'),
  }
}