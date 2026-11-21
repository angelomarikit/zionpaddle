import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listStaffCollections } from '../../services/admin/collectionsAdmin'
import { AdminCard, AdminPage } from '../../components/admin/AdminShell'

export function AdminCollectionsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'collections'], queryFn: listStaffCollections })

  if (isLoading) return <p className="text-sm text-admin-muted">Loading collections…</p>

  return (
    <AdminPage
      title="Collections"
      actions={
        <Link
          to="/admin/collections/new"
          className="rounded-lg bg-admin-gold px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Add collection
        </Link>
      }
    >
      <AdminCard className="divide-y divide-admin-border">
        {(data?.collections ?? []).map((c) => (
          <div key={c.slug} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              {c.banner_url ? (
                <img src={c.banner_url} alt="" className="size-14 rounded-lg border object-cover" />
              ) : (
                <div className="size-14 rounded-lg border bg-admin-subtle" />
              )}
              <div>
                <Link to={`/admin/collections/${c.slug}`} className="font-medium text-admin-link hover:underline">
                  {c.name}
                </Link>
                <p className="text-xs text-admin-muted">{c.slug}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                c.published ? 'bg-green-100 text-green-800' : 'bg-gold-400/35 text-admin-muted'
              }`}
            >
              {c.published ? 'Active' : 'Draft'}
            </span>
          </div>
        ))}
      </AdminCard>
    </AdminPage>
  )
}