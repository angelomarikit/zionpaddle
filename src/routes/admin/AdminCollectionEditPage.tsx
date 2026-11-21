import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  emptyCollectionDraft,
  getStaffCollection,
  saveStaffCollection,
  type CollectionDraft,
} from '../../services/admin/collectionsAdmin'
import { uploadStoreImage } from '../../services/admin/mediaUpload'
import { STORE_ONLINE_HINT } from '../../lib/admin/messages'
import { AdminCard, AdminPage, adminField, adminLabel } from '../../components/admin/AdminShell'

export function AdminCollectionEditPage() {
  const { slug } = useParams()
  const isNew = slug === 'new'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<CollectionDraft>(emptyCollectionDraft())
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (isNew) return
    void getStaffCollection(slug!).then((c) => {
      if (c) setDraft(c)
    })
  }, [slug, isNew])

  const save = async () => {
    if (!draft.slug || !draft.name) {
      setError('Please enter a collection name and web address.')
      return
    }
    setSaving(true)
    const result = await saveStaffCollection(draft)
    setSaving(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMessage(result.online ? STORE_ONLINE_HINT : 'Saved on this device.')
    void queryClient.invalidateQueries({ queryKey: ['admin'] })
    void queryClient.invalidateQueries({ queryKey: ['catalog'] })
    if (isNew) navigate(`/admin/collections/${draft.slug}`, { replace: true })
  }

  const onBanner = async (file: File) => {
    setUploading(true)
    const path = `collections/${draft.slug || 'new'}/banner-${Date.now()}.jpg`
    const result = await uploadStoreImage(file, path)
    setUploading(false)
    if (result.error) setError(result.error)
    else if (result.url) setDraft({ ...draft, banner_url: result.url })
  }

  return (
    <AdminPage
      title={isNew ? 'Add collection' : draft.name || 'Edit collection'}
      actions={
        <Link to="/admin/collections" className="text-sm text-admin-link hover:underline">
          ← All collections
        </Link>
      }
    >
      {message ? <p className="mb-4 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}

      <AdminCard className="mx-auto max-w-2xl p-6">
        <label className="block">
          <span className={adminLabel}>Collection name</span>
          <input className={adminField} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label className="mt-4 block">
          <span className={adminLabel}>Web address (slug)</span>
          <input
            className={adminField}
            disabled={!isNew}
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
          />
        </label>
        <label className="mt-4 block">
          <span className={adminLabel}>Description</span>
          <textarea
            className={adminField}
            rows={4}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </label>
        <div className="mt-6">
          <span className={adminLabel}>Banner image</span>
          {draft.banner_url ? (
            <img src={draft.banner_url} alt="" className="mt-2 max-h-40 rounded-lg border object-cover" />
          ) : null}
          <label className="mt-2 inline-block cursor-pointer rounded-lg border border-admin-input px-3 py-2 text-sm font-semibold">
            {uploading ? 'Uploading…' : 'Upload banner'}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && void onBanner(e.target.files[0])} />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
          />
          Active on store
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="mt-6 w-full rounded-lg bg-admin-gold py-2.5 text-sm font-semibold text-white hover:bg-black"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </AdminCard>
    </AdminPage>
  )
}
