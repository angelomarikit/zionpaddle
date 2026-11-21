import { useQuery } from '@tanstack/react-query'
import { fetchStaffContactInquiries } from '../../services/admin/contactAdmin'
import { AdminCard, AdminPage } from '../../components/admin/AdminShell'

export function AdminContactPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contact'],
    queryFn: fetchStaffContactInquiries,
  })

  if (isLoading) return <p className="text-sm text-admin-muted">Loading inbox…</p>

  const items = data?.items ?? []

  return (
    <AdminPage title="Inbox">
      <p className="mb-6 text-sm text-admin-muted">Messages sent from the contact form on your storefront.</p>
      {items.length === 0 ? (
        <p className="text-sm text-admin-muted">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <AdminCard className="p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-bold">{item.name}</p>
                <span className="font-mono text-xs uppercase text-black/50">{item.topic}</span>
              </div>
              <p className="text-black/60">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p>
              <p className="mt-2 leading-relaxed">{item.message}</p>
              {item.createdAt ? (
                <p className="mt-2 text-xs text-black/40">{item.createdAt}</p>
              ) : null}
              </AdminCard>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  )
}