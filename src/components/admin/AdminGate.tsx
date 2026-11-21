import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminGate() {
  const { session, isStaff, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="text-sm text-admin-muted">Loading your account…</p>
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isStaff) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Your account is signed in, but it is not set up for store administration yet. Ask your account owner to
        grant you access, then sign in again.
      </p>
    )
  }

  return <Outlet />
}