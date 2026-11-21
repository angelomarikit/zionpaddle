import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchStaffMediaAssets,
  registerMediaAsset,
  saveSiteSection,
  setMediaAssetActive,
} from '../../services/cms/siteContent'
import { fetchSiteSections } from '../../services/cms/siteContent'
import type { SiteMediaKind, SiteSectionKey } from '../../types/siteCms'

const inputClass = 'mt-1 w-full rounded border border-black/15 px-3 py-2 text-sm'
const btnClass = 'rounded bg-surface-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-white'

export function AdminMediaPage() {
  const queryClient = useQueryClient()
  const [publicUrl, setPublicUrl] = useState('')
  const [kind, setKind] = useState<SiteMediaKind>('colorway_showcase')
  const [sectionKey, setSectionKey] = useState('colorwayShowcase')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const assetsQuery = useQuery({ queryKey: ['admin', 'media'], queryFn: fetchStaffMediaAssets })

  const register = async (activate: boolean) => {
    setError(undefined)
    if (!publicUrl.trim()) {
      setError('Paste a public URL (e.g. /media/dayo/colorway-showcase.mp4)')
      return
    }
    const reg = await registerMediaAsset({ publicUrl: publicUrl.trim(), kind, sectionKey, active: activate })
    if (reg.error) {
      setError(reg.error)
      return
    }
    if (activate && sectionKey) {
      const { sections } = await fetchSiteSections()
      const section = sections.find((s) => s.sectionKey === (sectionKey as SiteSectionKey))
      if (section) {
        const isVideo = publicUrl.endsWith('.mp4')
        await saveSiteSection({
          ...section,
          videoUrl: isVideo ? publicUrl.trim() : section.videoUrl,
          posterUrl: !isVideo ? publicUrl.trim() : section.posterUrl,
        })
        void queryClient.invalidateQueries({ queryKey: ['cms'] })
      }
    }
    setMessage(activate ? 'Registered and applied to section' : 'Registered as draft')
    setPublicUrl('')
    void queryClient.invalidateQueries({ queryKey: ['admin', 'media'] })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Media registry</h1>
      <p className="mt-1 text-sm text-black/60">
        Register Higgsfield or CDN URLs after export. Requires Supabase migration{' '}
        <code>010_site_media_modules.sql</code>. For local-only, set video URLs in{' '}
        <a href="/admin/content" className="text-accent-coral underline">
          Website content
        </a>
        .
      </p>

      <div className="mt-8 rounded border border-black/10 bg-white p-4 text-sm">
        <h2 className="font-bold">Register asset</h2>
        <label className="mt-3 block">
          Public URL
          <input className={inputClass} value={publicUrl} onChange={(e) => setPublicUrl(e.target.value)} />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            Kind
            <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as SiteMediaKind)}>
              <option value="hero">hero</option>
              <option value="colorway_showcase">colorway_showcase</option>
              <option value="macro">macro</option>
              <option value="product_loop">product_loop</option>
              <option value="poster">poster</option>
            </select>
          </label>
          <label className="block">
            Section key
            <input className={inputClass} value={sectionKey} onChange={(e) => setSectionKey(e.target.value)} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={btnClass} onClick={() => void register(false)}>
            Save draft
          </button>
          <button
            type="button"
            className="rounded border border-black/20 px-4 py-2 text-xs font-bold uppercase tracking-wide"
            onClick={() => void register(true)}
          >
            Activate + apply
          </button>
        </div>
        {message ? <p className="mt-3 text-green-800">{message}</p> : null}
        {error ? <p className="mt-3 text-red-700">{error}</p> : null}
      </div>

      <h2 className="mt-10 text-lg font-bold">Registry</h2>
      {assetsQuery.isLoading ? (
        <p className="mt-2 text-sm">Loading…</p>
      ) : assetsQuery.data?.assets.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {assetsQuery.data.assets.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-black/10 bg-white p-3">
              <h3 className="font-semibold">
                {a.kind} · {a.active ? 'active' : 'draft'}
              </h3>
              <p className="w-full truncate text-black/60">{a.publicUrl}</p>
              {!a.active ? (
                <button
                  type="button"
                  className="text-xs font-bold uppercase text-accent-coral"
                  onClick={async () => {
                    await setMediaAssetActive(a.id, true)
                    void queryClient.invalidateQueries({ queryKey: ['admin', 'media'] })
                  }}
                >
                  Mark active
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-black/60">No registry entries (Supabase offline or empty).</p>
      )}
    </div>
  )
}