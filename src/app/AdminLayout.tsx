import { Outlet, useLocation } from 'react-router-dom'
import { AdminShell } from '../components/admin/AdminShell'

export function AdminLayout() {
  const location = useLocation()
  const isLogin = location.pathname === '/admin/login'

  if (isLogin) return <Outlet />

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}