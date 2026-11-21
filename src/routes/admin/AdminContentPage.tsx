import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSitePages, fetchSiteSections, saveSitePage, saveSiteSection } from '../../services/cms/siteContent'
import { listStaffProducts } from '../../services/admin/productsAdmin'
import type { SitePage, SiteSection } from '../../types/siteCms'
import { friendlyAdminError } from '../../lib/admin/messages'
import { AdminPage, adminField, adminLabel } from '../../components/admin/AdminShell'
import { uploadStoreImage } from '../../services/admin/mediaUpload'

const inputClass = adminField
const btnClass = 'rounded-lg bg-admin-gold px-4 py-2 text-sm font-semibold text-white hover:bg-black'

export function AdminContentPage() {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const sectionsQuery = useQuery({ queryKey: ['admin', 'cms', 'sections'], queryFn: fetchSiteSections })
  const pagesQuery = useQuery({ queryKey: ['admin', 'cms', 'pages'], queryFn: fetchSitePages })
  const productsQuery = useQuery({ queryKey: ['admin', 'products'], queryFn: listStaffProducts })

  if (sectionsQuery.isLoading || pagesQuery.isLoading) return <p className="text-sm">Loading content…</p>

  const sections = [...(sectionsQuery.data?.sections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const pages = pagesQuery.data?.pages ?? []
  const liveProducts = (productsQuery.data?.products ?? []).filter((p) => p.published)

  const saveSection = async (section: SiteSection) => {
    setError(undefined)
    const res = await saveSiteSection(section)
    if (res.error) setError(friendlyAdminError(res.error))
    else {
      setMessage('Section saved.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      void queryClient.invalidateQueries({ queryKey: ['cms'] })
    }
  }

  const savePage = async (page: SitePage) => {
    setError(undefined)
    const res = await saveSitePage(page)
    if (res.error) setError(friendlyAdminError(res.error))
    else {
      setMessage('Page saved.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'cms'] })
      void queryClient.invalidateQueries({ queryKey: ['cms'] })
    }
  }

  return (
    <AdminPage title="Website content">
      <p className="mb-6 max-w-2xl text-sm text-admin-muted">
        Edit the announcement bar, homepage messaging, and About / FAQ / Legal pages. Product images are managed under
        Products and Collections.
      </p>
      {message ? <p className="mb-4 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}

      <div className="max-w-3xl space-y-10">

      <section>
        <h2 className="text-lg font-bold">Announcement bar</h2>
        <p className="mt-1 text-xs text-black/50">
          Scrolling message at the top of every storefront page. Uncheck published to hide.
        </p>
        <ul className="mt-4 space-y-6">
          {sections
            .filter((s) => s.sectionKey === 'announcement')
            .map((s) => (
              <SectionEditor
                key={s.sectionKey}
                section={s}
                liveProducts={liveProducts}
                onSave={saveSection}
              />
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold">Home sections</h2>
        <ul className="mt-4 space-y-6">
          {sections
            .filter((s) => s.sectionKey !== 'announcement')
            .map((s) => (
              <SectionEditor
                key={s.sectionKey}
                section={s}
                liveProducts={liveProducts}
                onSave={saveSection}
              />
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold">Static pages</h2>
        <ul className="mt-4 space-y-6">
          {pages.map((p) => (
            <PageEditor key={p.slug} page={p} onSave={savePage} />
          ))}
        </ul>
      </section>
      </div>
    </AdminPage>
  )
}

function SectionEditor({
  section,
  liveProducts,
  onSave,
}: {
  section: SiteSection
  liveProducts: { slug: string; name: string }[]
  onSave: (s: SiteSection) => Promise<void>
}) {
  const [draft, setDraft] = useState(section)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()

  const isAnnouncement = draft.sectionKey === 'announcement'

  const uploadPoster = async (file: File) => {
    setUploadError(undefined)
    setUploading(true)
    const path = `content/sections/${draft.sectionKey}-${Date.now()}.${file.name.split('.').pop() ?? 'jpg'}`
    const result = await uploadStoreImage(file, path)
    setUploading(false)
    if (result.error) {
      setUploadError(friendlyAdminError(result.error))
      return
    }
    if (result.url) setDraft({ ...draft, posterUrl: result.url })
  }

  return (
    <li className="rounded border border-black/10 bg-white p-4 text-sm">
      <p className="font-mono text-xs text-black/50">{section.sectionKey}</p>
      <label className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
        />
        Visible on storefront
      </label>
      <div className="mt-3 grid gap-3">
        {isAnnouncement ? (
          <>
            <label className="block">
              Ticker message
              <textarea
                className={inputClass}
                rows={2}
                value={draft.headline ?? ''}
                onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
              />
            </label>
            <label className="block">
              Link label (optional)
              <input
                className={inputClass}
                value={draft.subheadline ?? ''}
                onChange={(e) => setDraft({ ...draft, subheadline: e.target.value })}
              />
            </label>
            <label className="block">
              Link URL (optional, e.g. /collections)
              <input
                className={inputClass}
                value={draft.body ?? ''}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </label>
          </>
        ) : (
          <label className="block">
            Headline
            <input
              className={inputClass}
              value={draft.headline ?? ''}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
            />
          </label>
        )}
        {draft.sectionKey === 'hero' ? (
          <label className="block">
            <span className={adminLabel}>Featured product (homepage hero)</span>
            <select
              className={adminField}
              value={draft.extra?.homeProductSlug ?? ''}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  extra: { ...draft.extra, homeProductSlug: e.target.value || undefined },
                })
              }
            >
              <option value="">Automatic (product flagged as homepage hero)</option>
              {liveProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-admin-muted">
              Uses that product&apos;s images and price on the home hero.{' '}
              <Link to="/admin/products" className="text-admin-link hover:underline">
                Manage products
              </Link>
            </p>
          </label>
        ) : null}
        {!isAnnouncement && (draft.sectionKey === 'editorial' || draft.subheadline) && (
          <label className="block">
            Subheadline / accent line
            <input
              className={inputClass}
              value={draft.subheadline ?? ''}
              onChange={(e) => setDraft({ ...draft, subheadline: e.target.value })}
            />
          </label>
        )}
        {draft.sectionKey === 'editorial' ? (
          <label className="block">
            Body
            <textarea
              className={inputClass}
              rows={2}
              value={draft.body ?? ''}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>
        ) : null}
        {!isAnnouncement && draft.sectionKey !== 'editorial' ? (
          <>
            <div>
              <span className={adminLabel}>Poster image</span>
              {draft.posterUrl ? (
                <img src={draft.posterUrl} alt="" className="mt-2 max-h-36 rounded-lg border object-cover" />
              ) : null}
              {uploadError ? <p className="mt-2 text-xs text-red-700">{uploadError}</p> : null}
              <label className="mt-2 inline-block cursor-pointer rounded-lg border border-admin-input px-3 py-2 text-sm font-semibold">
                {uploading ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && void uploadPoster(e.target.files[0])}
                />
              </label>
            </div>
            <label className={adminLabel}>
              Background video
              <input
                className={inputClass}
                value={draft.videoUrl ?? ''}
                onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
                placeholder="Optional — hosted video address"
              />
            </label>
            <label className="block">
              Alt text
              <input
                className={inputClass}
                value={draft.altText ?? ''}
                onChange={(e) => setDraft({ ...draft, altText: e.target.value })}
              />
            </label>
          </>
        ) : null}
      </div>
      <button
        type="button"
        className={`${btnClass} mt-4`}
        disabled={saving}
        onClick={async () => {
          setSaving(true)
          await onSave(draft)
          setSaving(false)
        }}
      >
        {saving ? 'Saving…' : 'Save section'}
      </button>
    </li>
  )
}

function PageEditor({ page, onSave }: { page: SitePage; onSave: (p: SitePage) => Promise<void> }) {
  const [draft, setDraft] = useState(page)
  const [saving, setSaving] = useState(false)

  return (
    <li className="rounded border border-black/10 bg-white p-4 text-sm">
      <p className="font-mono text-xs text-black/50">/{draft.slug}</p>
      <label className="mt-2 block">
        Title
        <input className={inputClass} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      </label>
      <label className="mt-2 block">
        Body
        <textarea
          className={inputClass}
          rows={5}
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
        />
      </label>
      <button
        type="button"
        className={`${btnClass} mt-4`}
        disabled={saving}
        onClick={async () => {
          setSaving(true)
          await onSave(draft)
          setSaving(false)
        }}
      >
        {saving ? 'Saving…' : 'Save page'}
      </button>
    </li>
  )
}