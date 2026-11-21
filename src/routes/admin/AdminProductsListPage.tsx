import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatPhp } from '../../data/mock/products'
import { listStaffProducts } from '../../services/admin/productsAdmin'
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal'
import { AdminCard, AdminPage } from '../../components/admin/AdminShell'

export function AdminProductsListPage() {
  const navigate = useNavigate()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'products'], queryFn: listStaffProducts })

  if (isLoading) return <p className="text-sm text-admin-muted">Loading products…</p>

  const products = data?.products ?? []

  return (
    <AdminPage
      title="Products"
      actions={
        <button
          type="button"
          className="rounded-lg bg-admin-gold px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          onClick={() => setAddModalOpen(true)}
        >
          Add product
        </button>
      }
    >
      <AdminCard className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-admin-canvas text-xs text-admin-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug} className="border-t border-admin-border hover:bg-admin-subtle">
                <td className="px-4 py-3">
                  <Link to={`/admin/products/${p.slug}`} className="font-medium text-admin-link hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-admin-muted">{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.published ? 'bg-green-100 text-green-800' : 'bg-gold-400/35 text-admin-muted'
                    }`}
                  >
                    {p.published ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-admin-muted">{p.quantity_on_hand} in stock</td>
                <td className="px-4 py-3 text-right font-medium">{formatPhp(p.price_php)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      <AdminConfirmModal
        open={addModalOpen}
        title="Add a new product"
        description="You’ll set the name, photos, price, and whether it’s live on the shop or saved as a draft."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        onCancel={() => setAddModalOpen(false)}
        onConfirm={() => {
          setAddModalOpen(false)
          navigate('/admin/products/new')
        }}
      />
    </AdminPage>
  )
}