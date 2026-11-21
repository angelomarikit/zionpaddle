import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  emptyProductDraft,
  deleteStaffProduct,
  getStaffProduct,
  saveStaffProduct,
  type ColorwayDraft,
  type ProductDraft,
} from '../../services/admin/productsAdmin'
import { listStaffCollections } from '../../services/admin/collectionsAdmin'
import { uploadStoreImage } from '../../services/admin/mediaUpload'
import { friendlyAdminError } from '../../lib/admin/messages'
import { AdminConfirmModal } from '../../components/admin/AdminConfirmModal'
import { AdminCard, AdminPage, adminField, adminLabel } from '../../components/admin/AdminShell'

export function AdminProductEditPage() {
  const { slug } = useParams()
  const isNew = slug === 'new'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft())
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string>()
  const [deleting, setDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { data: collections } = useQuery({ queryKey: ['admin', 'collections'], queryFn: listStaffCollections })

  const { isLoading } = useQuery({
    queryKey: ['admin', 'product', slug],
    enabled: Boolean(slug && !isNew),
    queryFn: async () => {
      const p = await getStaffProduct(slug!)
      if (p) setDraft(p)
      return p
    },
  })

  useEffect(() => {
    if (isNew) setDraft(emptyProductDraft())
  }, [isNew])

  const save = async (skipCreateConfirm = false) => {
    if (!draft.name.trim()) {
      setError('Please enter a product name.')
      return
    }
    if (isNew && !skipCreateConfirm) {
      setCreateModalOpen(true)
      return
    }
    const resolvedSlug = (isNew ? slugify(draft.name) : draft.slug.trim() || slugify(draft.name)) || slugify(draft.name)
    if (!resolvedSlug) {
      setError('Please enter a product name.')
      return
    }
    const payload: ProductDraft = {
      ...draft,
      slug: resolvedSlug,
      subtitle: undefined,
    }
    if (payload.published && payload.collection_slugs.length === 0) {
      const fallback = collectionOptions.find((c) => c.published)?.slug ?? collectionOptions[0]?.slug
      if (fallback) payload.collection_slugs = [fallback]
    }
    setSaving(true)
    setError(undefined)
    const result = await saveStaffProduct(payload)
    setSaving(false)
    if (!result.ok) {
      setError(friendlyAdminError(result.error))
      return
    }
    setMessage(
      result.online
        ? payload.published
          ? 'Saved and live on your store. Check Collections (All) or assign a collection so shoppers can filter it.'
          : 'Saved as draft — switch status to Live on store when you are ready.'
        : 'Saved on this device.',
    )
    void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'product', resolvedSlug] })
    void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
    void queryClient.invalidateQueries({ queryKey: ['catalog', 'collections'] })
    void queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] })
    if (isNew) navigate(`/admin/products/${resolvedSlug}`, { replace: true })
    else setDraft(payload)
  }

  const removeProduct = async () => {
    if (isNew || !draft.slug) return
    setDeleting(true)
    setDeleteModalOpen(false)
    setError(undefined)
    const result = await deleteStaffProduct(draft.slug)
    setDeleting(false)
    if (!result.ok) {
      setError(friendlyAdminError(result.error))
      return
    }
    void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    void queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
    void queryClient.invalidateQueries({ queryKey: ['catalog', 'collections'] })
    void queryClient.invalidateQueries({ queryKey: ['cms', 'sections'] })
    navigate('/admin/products', { replace: true })
  }

  const toggleCollection = (collectionSlug: string, checked: boolean) => {
    const set = new Set(draft.collection_slugs)
    if (checked) set.add(collectionSlug)
    else set.delete(collectionSlug)
    setDraft({ ...draft, collection_slugs: [...set] })
  }

  const collectionOptions = collections?.collections ?? []

  const productUploadPrefix = () => {
    const slug = draft.slug.trim() || slugify(draft.name.trim())
    if (!slug) return null
    return `products/${slug}`
  }

  const uploadGalleryImage = async (file: File) => {
    const prefix = productUploadPrefix()
    if (!prefix) {
      setError('Enter a product name before uploading images.')
      return
    }
    const token = `gallery-${Date.now()}`
    setUploading(token)
    const path = `${prefix}/gallery/${token}.${ext(file)}`
    const result = await uploadStoreImage(file, path)
    setUploading(undefined)
    if (result.error || !result.url) {
      setError(friendlyAdminError(result.error ?? 'Upload failed.'))
      return
    }
    setDraft({ ...draft, gallery_images: [...draft.gallery_images, result.url] })
  }

  const uploadColorwayImage = async (index: number, file: File) => {
    const prefix = productUploadPrefix()
    if (!prefix) {
      setError('Enter a product name before uploading images.')
      return
    }
    const key = draft.colorways[index]?.external_key ?? `color-${index}`
    setUploading(key)
    const path = `${prefix}/colorways/${key}-${Date.now()}.${ext(file)}`
    const result = await uploadStoreImage(file, path)
    setUploading(undefined)
    if (result.error) {
      setError(friendlyAdminError(result.error))
      return
    }
    const next = [...draft.colorways]
    next[index] = { ...next[index], image_url: result.url }
    setDraft({ ...draft, colorways: next })
  }

  if (!isNew && isLoading) return <p className="text-sm text-admin-muted">Loading product…</p>

  return (
    <AdminPage
      title={isNew ? 'Add product' : draft.name || 'Edit product'}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium text-admin-ink">Status</span>
            <select
              className="rounded-lg border border-admin-input bg-white px-2 py-1.5 text-sm"
              value={draft.published ? 'live' : 'draft'}
              disabled={saving || deleting}
              onChange={(e) => setDraft({ ...draft, published: e.target.value === 'live' })}
            >
              <option value="draft">Draft</option>
              <option value="live">Live on store</option>
            </select>
          </label>
          {!isNew ? (
            <button
              type="button"
              disabled={deleting || saving}
              onClick={() => setDeleteModalOpen(true)}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete product'}
            </button>
          ) : null}
          <Link to="/admin/products" className="text-sm text-admin-link hover:underline">
            ← All products
          </Link>
        </div>
      }
    >
      {message ? <p className="mb-4 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AdminCard className="p-5">
            <h2 className="font-semibold">Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={adminLabel}>Product name</span>
                <input
                  className={adminField}
                  value={draft.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setDraft({
                      ...draft,
                      name,
                      ...(isNew ? { slug: slugify(name) } : {}),
                    })
                  }}
                />
              </label>
              <label className="sm:col-span-2">
                <span className={adminLabel}>Description</span>
                <textarea
                  className={adminField}
                  rows={5}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Colors &amp; images</h2>
              <button
                type="button"
                className="text-sm text-admin-link"
                onClick={() =>
                  setDraft({
                    ...draft,
                    colorways: [
                      ...draft.colorways,
                      {
                        external_key: `color-${draft.colorways.length + 1}`,
                        slug: `color-${draft.colorways.length + 1}`,
                        name: `Color ${draft.colorways.length + 1}`,
                        tagline: '',
                        hex: '#141414',
                        sort_order: draft.colorways.length,
                      },
                    ],
                  })
                }
              >
                Add color
              </button>
            </div>
            <ul className="mt-4 space-y-6">
              {draft.colorways.map((c, i) => (
                <ColorwayEditor
                  key={c.external_key}
                  colorway={c}
                  uploading={uploading === c.external_key}
                  onChange={(cw) => {
                    const next = [...draft.colorways]
                    next[i] = cw
                    setDraft({ ...draft, colorways: next })
                  }}
                  onRemove={() =>
                    setDraft({ ...draft, colorways: draft.colorways.filter((_, j) => j !== i) })
                  }
                  onUpload={(file) => void uploadColorwayImage(i, file)}
                />
              ))}
            </ul>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">More product images</p>
              <label className="cursor-pointer rounded-lg border border-admin-input px-3 py-1.5 text-xs font-semibold">
                {uploading?.startsWith('gallery-') ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={Boolean(uploading)}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void uploadGalleryImage(f)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-admin-muted">
              Extra shots for the product page gallery. Color swatches above still control the main hero per color.
            </p>
            {draft.gallery_images.length === 0 ? (
              <p className="mt-4 text-sm text-admin-muted">No extra images yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {draft.gallery_images.map((url, i) => (
                  <li key={url} className="flex items-center gap-3 rounded-lg border border-admin-border p-3">
                    <img src={url} alt="" className="size-16 rounded-md border object-contain" />
                    <span className="flex-1 truncate text-xs text-admin-muted">{url}</span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="rounded border border-admin-border px-2 py-1 text-xs disabled:opacity-40"
                        disabled={i === 0}
                        onClick={() => {
                          const next = [...draft.gallery_images]
                          ;[next[i - 1], next[i]] = [next[i]!, next[i - 1]!]
                          setDraft({ ...draft, gallery_images: next })
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="rounded border border-admin-border px-2 py-1 text-xs disabled:opacity-40"
                        disabled={i === draft.gallery_images.length - 1}
                        onClick={() => {
                          const next = [...draft.gallery_images]
                          ;[next[i], next[i + 1]] = [next[i + 1]!, next[i]!]
                          setDraft({ ...draft, gallery_images: next })
                        }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-xs text-red-700"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            gallery_images: draft.gallery_images.filter((_, j) => j !== i),
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Grip sizes</h2>
              <button
                type="button"
                className="text-sm text-admin-link"
                onClick={() =>
                  setDraft({
                    ...draft,
                    grip_sizes: [
                      ...draft.grip_sizes,
                      {
                        id: `grip-${draft.grip_sizes.length + 1}`,
                        label: `Size ${draft.grip_sizes.length + 1}`,
                        circumferenceCm: '10.5',
                      },
                    ],
                  })
                }
              >
                Add grip size
              </button>
            </div>
            <ul className="mt-4 space-y-4">
              {draft.grip_sizes.map((g, i) => (
                <li key={g.id} className="rounded-lg border border-admin-border p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="sm:col-span-2">
                      <span className={adminLabel}>Label (shown on product page)</span>
                      <input
                        className={adminField}
                        value={g.label}
                        onChange={(e) => {
                          const next = [...draft.grip_sizes]
                          next[i] = { ...g, label: e.target.value }
                          setDraft({ ...draft, grip_sizes: next })
                        }}
                      />
                    </label>
                    <label>
                      <span className={adminLabel}>Circumference (cm)</span>
                      <input
                        className={adminField}
                        value={g.circumferenceCm}
                        onChange={(e) => {
                          const next = [...draft.grip_sizes]
                          next[i] = { ...g, circumferenceCm: e.target.value }
                          setDraft({ ...draft, grip_sizes: next })
                        }}
                      />
                    </label>
                    <label className="flex items-end gap-2 pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(g.soldOut)}
                        onChange={(e) => {
                          const next = [...draft.grip_sizes]
                          next[i] = { ...g, soldOut: e.target.checked || undefined }
                          setDraft({ ...draft, grip_sizes: next })
                        }}
                      />
                      Mark as sold out
                    </label>
                  </div>
                  {draft.grip_sizes.length > 1 ? (
                    <button
                      type="button"
                      className="mt-3 text-xs text-red-700 hover:underline"
                      onClick={() =>
                        setDraft({ ...draft, grip_sizes: draft.grip_sizes.filter((_, j) => j !== i) })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Specifications</h2>
              <button
                type="button"
                className="text-sm text-admin-link"
                onClick={() =>
                  setDraft({
                    ...draft,
                    specs: [...draft.specs, { label: 'Spec', value: '' }],
                  })
                }
              >
                Add row
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {draft.specs.length === 0 ? (
                <p className="text-sm text-admin-muted">Add rows like weight, core material, or edge guard.</p>
              ) : null}
              {draft.specs.map((s, i) => (
                <li key={i} className="flex flex-wrap items-end gap-2">
                  <label className="min-w-[120px] flex-1">
                    <span className={adminLabel}>Label</span>
                    <input
                      className={adminField}
                      value={s.label}
                      onChange={(e) => {
                        const next = [...draft.specs]
                        next[i] = { ...s, label: e.target.value }
                        setDraft({ ...draft, specs: next })
                      }}
                    />
                  </label>
                  <label className="min-w-[120px] flex-[2]">
                    <span className={adminLabel}>Value</span>
                    <input
                      className={adminField}
                      value={s.value}
                      onChange={(e) => {
                        const next = [...draft.specs]
                        next[i] = { ...s, value: e.target.value }
                        setDraft({ ...draft, specs: next })
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="mb-1 text-xs text-red-700 hover:underline"
                    onClick={() => setDraft({ ...draft, specs: draft.specs.filter((_, j) => j !== i) })}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <h2 className="font-semibold">Pricing &amp; inventory</h2>
            <label className="mt-4 block">
              <span className={adminLabel}>Price (₱)</span>
              <input
                type="number"
                className={adminField}
                value={draft.price_php}
                onChange={(e) => setDraft({ ...draft, price_php: Number(e.target.value) })}
              />
            </label>
            <label className="mt-3 block">
              <span className={adminLabel}>Compare at price (₱)</span>
              <input
                type="number"
                className={adminField}
                value={draft.compare_at_php ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    compare_at_php: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </label>
            <label className="mt-3 block">
              <span className={adminLabel}>Quantity in stock</span>
              <input
                type="number"
                className={adminField}
                value={draft.quantity_on_hand}
                onChange={(e) => setDraft({ ...draft, quantity_on_hand: Number(e.target.value) })}
              />
            </label>
            <label className="mt-3 block">
              <span className={adminLabel}>Weight (grams)</span>
              <input
                type="number"
                className={adminField}
                value={draft.weight_grams}
                onChange={(e) => setDraft({ ...draft, weight_grams: Number(e.target.value) })}
              />
            </label>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Collections</h2>
              <Link to="/admin/collections" className="text-xs text-admin-link hover:underline">
                Manage
              </Link>
            </div>
            <p className="mt-1 text-xs text-admin-muted">
              Choose which collection pages show this product.
            </p>
            {collectionOptions.length === 0 ? (
              <p className="mt-3 text-sm text-admin-muted">
                No collections yet.{' '}
                <Link to="/admin/collections" className="text-admin-link hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-lg border border-admin-border p-2">
                {collectionOptions.map((c) => (
                  <li key={c.slug}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-admin-canvas">
                      <input
                        type="checkbox"
                        checked={draft.collection_slugs.includes(c.slug)}
                        onChange={(e) => toggleCollection(c.slug, e.target.checked)}
                      />
                      <span className="flex-1 font-medium">{c.name}</span>
                      {!c.published ? (
                        <span className="text-xs text-admin-muted">Draft</span>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {draft.collection_slugs.length > 0 ? (
              <p className="mt-2 text-xs text-admin-muted">
                In {draft.collection_slugs.length} collection{draft.collection_slugs.length === 1 ? '' : 's'}
              </p>
            ) : null}
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="font-semibold">Organization</h2>
            <p className="mt-1 text-xs text-admin-muted">
              Use the status menu (top right) for Draft vs Live. Live products show under Collections → All and on their product page.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.hero} onChange={(e) => setDraft({ ...draft, hero: e.target.checked })} />
              Homepage hero (main paddle on the home page)
            </label>
            <p className="mt-1 text-xs text-admin-muted">
              Only one product at a time. Saving turns off hero on other products. Or pick a product under Website content → Home hero.
            </p>
          </AdminCard>

          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="w-full rounded-lg bg-admin-gold py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <AdminConfirmModal
        open={deleteModalOpen}
        title={`Delete “${draft.name || 'this product'}”?`}
        description="This removes the product from your store and shop. Orders that already included it are kept for your records."
        confirmLabel="Delete product"
        cancelLabel="Keep product"
        variant="danger"
        busy={deleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={() => void removeProduct()}
      />

      <AdminConfirmModal
        open={createModalOpen}
        title="Add this product to your store?"
        description={
          draft.published
            ? `“${draft.name.trim()}” will be saved and shown live on the shop. You can switch to Draft later from the status menu.`
            : `“${draft.name.trim()}” will be saved as a draft and hidden from the shop until you set it to Live on store.`
        }
        confirmLabel={draft.published ? 'Save & go live' : 'Save as draft'}
        cancelLabel="Go back"
        busy={saving}
        onCancel={() => setCreateModalOpen(false)}
        onConfirm={() => {
          setCreateModalOpen(false)
          void save(true)
        }}
      />
    </AdminPage>
  )
}

function ColorwayEditor({
  colorway,
  uploading,
  onChange,
  onRemove,
  onUpload,
}: {
  colorway: ColorwayDraft
  uploading?: boolean
  onChange: (c: ColorwayDraft) => void
  onRemove: () => void
  onUpload: (f: File) => void
}) {
  return (
    <li className="rounded-lg border border-admin-border p-4">
      <div className="flex gap-4">
        {colorway.image_url ? (
          <img src={colorway.image_url} alt="" className="size-20 rounded-lg border object-contain" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-lg border border-dashed bg-admin-subtle text-xs text-admin-muted">
            No image
          </div>
        )}
        <div className="flex-1 grid gap-2 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={adminLabel}>Color name</span>
            <input className={adminField} value={colorway.name} onChange={(e) => onChange({ ...colorway, name: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Color hex</span>
            <input className={adminField} value={colorway.hex} onChange={(e) => onChange({ ...colorway, hex: e.target.value })} />
          </label>
          <label>
            <span className={adminLabel}>Accent hex</span>
            <input
              className={adminField}
              value={colorway.volt_hex ?? ''}
              onChange={(e) => onChange({ ...colorway, volt_hex: e.target.value || undefined })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={adminLabel}>Short line</span>
            <input
              className={adminField}
              value={colorway.tagline}
              onChange={(e) => onChange({ ...colorway, tagline: e.target.value })}
            />
          </label>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-lg border border-admin-input px-3 py-1.5 text-xs font-semibold">
          {uploading ? 'Uploading…' : 'Upload image'}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={Boolean(uploading)}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(f)
            }}
          />
        </label>
        <button type="button" className="text-xs text-red-700" onClick={onRemove}>
          Remove color
        </button>
      </div>
    </li>
  )
}

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ext(file: File) {
  const n = file.name.split('.').pop()?.toLowerCase()
  return n && n.length < 5 ? n : 'jpg'
}
