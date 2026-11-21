import { type ReactNode, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatPhp } from '../../data/mock/products'
import { fetchStaffCatalog, upsertCollectionPatch, upsertProductPatch } from '../../services/admin/catalogAdmin'
import type { Product } from '../../types/commerce'

export function AdminCatalogPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Product | null>(null)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'catalog'],
    queryFn: fetchStaffCatalog,
  })

  if (isLoading) return <p className="text-sm">Loading catalog…</p>

  const products = data?.products ?? []
  const collections = data?.collections ?? []
  const store = data?.store ?? 'local'

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Catalog editor</h1>
      <p className="mt-1 text-sm text-black/60">
        Phase 7 — edit pricing and copy. Persists to Supabase when populated; otherwise{' '}
        <code className="text-xs">localStorage</code> patches merge on the storefront. Source: <strong>{store}</strong>
      </p>
      {message ? <p className="mt-4 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <h2 className="mt-8 text-lg font-bold">Collections</h2>
      <ul className="mt-3 space-y-3 text-sm">
        {collections.map((c) => (
          <li key={c.id} className="rounded border border-black/10 bg-white p-3">
            <CollectionEditor
              collection={c}
              onSave={async (patch) => {
                setError(undefined)
                const res = await upsertCollectionPatch(patch)
                if (res.error) setError(res.error)
                else {
                  setMessage(`Saved collection (${res.store})`)
                  void queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] })
                  void queryClient.invalidateQueries({ queryKey: ['catalog'] })
                }
              }}
            />
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-bold">Products</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {products.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-black/10 bg-white px-3 py-2">
            <button type="button" className="text-left hover:underline" onClick={() => setEditing(p)}>
              <span className="font-semibold">{p.name}</span>{' '}
              <span className="text-black/50">/{p.slug}</span>
            </button>
            <span className="font-semibold">{formatPhp(p.pricePhp)}</span>
          </li>
        ))}
      </ul>

      {editing ? (
        <ProductEditorModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            setError(undefined)
            const res = await upsertProductPatch(patch)
            if (res.error) setError(res.error)
            else {
              setMessage(`Saved ${patch.slug} (${res.store})`)
              setEditing(null)
              void queryClient.invalidateQueries({ queryKey: ['admin', 'catalog'] })
              void queryClient.invalidateQueries({ queryKey: ['catalog'] })
            }
          }}
        />
      ) : null}
    </div>
  )
}

function CollectionEditor({
  collection,
  onSave,
}: {
  collection: { slug: string; name: string; description: string; banner: string }
  onSave: (patch: { slug: string; name: string; description: string; bannerUrl: string }) => Promise<void>
}) {
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description)
  const [bannerUrl, setBannerUrl] = useState(collection.banner)
  const [saving, setSaving] = useState(false)

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        await onSave({ slug: collection.slug, name, description, bannerUrl })
        setSaving(false)
      }}
    >
      <p className="font-mono text-xs text-black/50">{collection.slug}</p>
      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
      <textarea
        className={inputClass}
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="Description"
      />
      <input
        className={inputClass}
        value={bannerUrl}
        onChange={(e) => setBannerUrl(e.target.value)}
        placeholder="Banner URL"
        aria-label="Banner URL"
      />
      <button type="submit" className={btnClass} disabled={saving}>
        {saving ? 'Saving…' : 'Save collection'}
      </button>
    </form>
  )
}

function ProductEditorModal({
  product,
  onClose,
  onSave,
}: {
  product: Product
  onClose: () => void
  onSave: (patch: {
    slug: string
    name: string
    subtitle?: string
    description: string
    pricePhp: number
    compareAtPhp?: number | null
    weightGrams: number
  }) => Promise<void>
}) {
  const [name, setName] = useState(product.name)
  const [subtitle, setSubtitle] = useState(product.subtitle ?? '')
  const [description, setDescription] = useState(product.description)
  const [pricePhp, setPricePhp] = useState(String(product.pricePhp))
  const [compareAt, setCompareAt] = useState(product.compareAtPhp ? String(product.compareAtPhp) : '')
  const [weightGrams, setWeightGrams] = useState(String(product.weightGrams))
  const [saving, setSaving] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Panel className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold">Edit {product.slug}</h3>
        <form
          className="mt-4 space-y-3 text-sm"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            await onSave({
              slug: product.slug,
              name,
              subtitle: subtitle || undefined,
              description,
              pricePhp: Number(pricePhp),
              compareAtPhp: compareAt ? Number(compareAt) : null,
              weightGrams: Number(weightGrams),
            })
            setSaving(false)
          }}
        >
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
          <Field label="Description" value={description} onChange={setDescription} multiline />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₱)" value={pricePhp} onChange={setPricePhp} />
            <Field label="Compare at (₱)" value={compareAt} onChange={setCompareAt} />
          </div>
          <Field label="Weight (g)" value={weightGrams} onChange={setWeightGrams} />
          <div className="flex gap-2 pt-2">
            <button type="submit" className={btnClass} disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </button>
            <button type="button" className={btnSecondaryClass} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </Panel>
    </div>
  )
}

function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-black/50">{label}</span>
      {multiline ? (
        <textarea className={`${inputClass} mt-1`} rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={`${inputClass} mt-1`} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

const inputClass = 'w-full rounded border border-black/15 px-3 py-2'
const btnClass = 'rounded bg-surface-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-white'
const btnSecondaryClass = 'rounded border border-black/20 px-4 py-2 text-xs font-bold uppercase tracking-wide'