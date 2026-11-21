import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { StaffPermissionKey } from '../../types/staff'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { AdminCard, AdminPage } from './AdminShell'

export function RequireStaffPermission({ perm, children }: { perm: StaffPermissionKey; children: ReactNode }) {
  const { can } = useStaffPermissions()
  if (can(perm)) return children

  return (
    <AdminPage title="Access restricted">
      <AdminCard className="p-6 text-sm text-admin-muted">
        <p className="font-medium text-admin-ink">Your account does not have permission for this area.</p>
        <p className="mt-2">Ask an account owner to update your access in Settings → Staff.</p>
        <Link to="/admin" className="mt-4 inline-block text-admin-link hover:underline">
          Back to admin
        </Link>
      </AdminCard>
    </AdminPage>
  )
}