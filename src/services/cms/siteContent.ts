import type { SiteMediaAsset, SitePage, SiteSection } from '../../types/siteCms'
import { parseHomeHeroExtra } from '../../lib/catalog/homeHero'
import { defaultSitePages, defaultSiteSections } from '../../data/cms/defaults'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import {
  readLocalSitePages,
  readLocalSiteSections,
  saveLocalSitePage,
  saveLocalSiteSection,
  type CmsStore,
} from './localCms'

function mapPage(row: Record<string, unknown>): SitePage {
  return {
    slug: row.slug as SitePage['slug'],
    title: String(row.title),
    body: String(row.body ?? ''),
    published: Boolean(row.published),
    updatedAt: String(row.updated_at ?? ''),
  }
}

function mapSection(row: Record<string, unknown>): SiteSection {
  return {
    sectionKey: row.section_key as SiteSection['sectionKey'],
    label: String(row.label),
    headline: (row.headline as string) ?? undefined,
    subheadline: (row.subheadline as string) ?? undefined,
    body: (row.body as string) ?? undefined,
    posterUrl: (row.poster_url as string) ?? undefined,
    videoUrl: (row.video_url as string) ?? undefined,
    altText: (row.alt_text as string) ?? undefined,
    published: Boolean(row.published),
    sortOrder: Number(row.sort_order ?? 0),
    updatedAt: String(row.updated_at ?? ''),
    extra: parseHomeHeroExtra(row.extra),
  }
}

function mergeSections(remote: SiteSection[] | null): SiteSection[] {
  const base = defaultSiteSections
  if (!remote?.length) return readLocalSiteSections()
  const keys = new Set(remote.map((s) => s.sectionKey))
  const merged = base.map((b) => remote.find((r) => r.sectionKey === b.sectionKey) ?? b)
  for (const r of remote) {
    if (!keys.has(r.sectionKey)) merged.push(r)
  }
  return readLocalSiteSections().map((local) => {
    const fromRemote = merged.find((m) => m.sectionKey === local.sectionKey) ?? local
    return { ...fromRemote, ...local, sectionKey: local.sectionKey }
  })
}

function mergePages(remote: SitePage[] | null): SitePage[] {
  if (!remote?.length) return readLocalSitePages()
  const local = readLocalSitePages()
  return defaultSitePages.map((base) => {
    const r = remote.find((p) => p.slug === base.slug)
    const l = local.find((p) => p.slug === base.slug)
    return { ...base, ...(r ?? {}), ...(l ?? {}) }
  })
}

export async function fetchSiteSections(): Promise<{ sections: SiteSection[]; store: CmsStore }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data, error } = await sb.from('site_sections').select('*').order('sort_order')
    if (!error && data?.length) {
      return { sections: mergeSections((data as Record<string, unknown>[]).map(mapSection)), store: 'supabase' }
    }
  }
  return { sections: readLocalSiteSections(), store: 'local' }
}

export async function fetchSitePages(): Promise<{ pages: SitePage[]; store: CmsStore }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data, error } = await sb.from('site_pages').select('*')
    if (!error && data?.length) {
      return { pages: mergePages((data as Record<string, unknown>[]).map(mapPage)), store: 'supabase' }
    }
  }
  return { pages: readLocalSitePages(), store: 'local' }
}

export async function fetchSitePageBySlug(slug: SitePage['slug']): Promise<SitePage | undefined> {
  const { pages } = await fetchSitePages()
  return pages.find((p) => p.slug === slug && p.published)
}

export async function saveSiteSection(
  section: SiteSection,
): Promise<{ section: SiteSection; store: CmsStore; error?: string }> {
  const sb = getSupabase()
  const row = {
    section_key: section.sectionKey,
    label: section.label,
    headline: section.headline ?? null,
    subheadline: section.subheadline ?? null,
    body: section.body ?? null,
    poster_url: section.posterUrl ?? null,
    video_url: section.videoUrl ?? null,
    alt_text: section.altText ?? null,
    published: section.published,
    sort_order: section.sortOrder,
    extra: section.extra && Object.keys(section.extra).length ? section.extra : {},
    updated_at: new Date().toISOString(),
  }
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('site_sections').upsert(row)
    if (!error) {
      saveLocalSiteSection(section)
      return { section, store: 'supabase' }
    }
    return { error: error.message, section, store: 'local' }
  }
  saveLocalSiteSection(section)
  return { section, store: 'local' }
}

export async function saveSitePage(
  page: SitePage,
): Promise<{ page: SitePage; store: CmsStore; error?: string }> {
  const sb = getSupabase()
  const row = {
    slug: page.slug,
    title: page.title,
    body: page.body,
    published: page.published,
    updated_at: new Date().toISOString(),
  }
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('site_pages').upsert(row)
    if (!error) {
      saveLocalSitePage(page)
      return { page, store: 'supabase' }
    }
    return { error: error.message, page, store: 'local' }
  }
  saveLocalSitePage(page)
  return { page, store: 'local' }
}

export function sectionToSiteMedia(sections: SiteSection[]) {
  const byKey = Object.fromEntries(sections.map((s) => [s.sectionKey, s])) as Record<string, SiteSection>
  return {
    hero: {
      poster: byKey.hero?.posterUrl ?? defaultSiteSections[0].posterUrl!,
      video: byKey.hero?.videoUrl,
      alt: byKey.hero?.altText ?? defaultSiteSections[0].altText ?? 'ZION hero',
    },
    colorwayShowcase: byKey.colorwayShowcase
      ? {
          poster: byKey.colorwayShowcase.posterUrl ?? '',
          video: byKey.colorwayShowcase.videoUrl,
          alt: byKey.colorwayShowcase.altText ?? 'Colorway showcase',
        }
      : undefined,
    macro: byKey.macro
      ? {
          poster: byKey.macro.posterUrl ?? '',
          video: byKey.macro.videoUrl,
          alt: byKey.macro.altText ?? 'Macro detail',
        }
      : undefined,
    editorial: byKey.editorial,
  }
}

export async function fetchStaffMediaAssets(): Promise<{ assets: SiteMediaAsset[]; error?: string }> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return { assets: [] }
  const { data, error } = await sb
    .from('site_media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return { assets: [], error: error.message }
  return {
    assets: (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      storagePath: String(row.storage_path),
      publicUrl: (row.public_url as string) ?? undefined,
      mimeType: String(row.mime_type ?? 'video/mp4'),
      kind: row.kind as SiteMediaAsset['kind'],
      colorwaySlug: (row.colorway_slug as string) ?? undefined,
      sectionKey: (row.section_key as string) ?? undefined,
      active: Boolean(row.active),
      posterPath: (row.poster_path as string) ?? undefined,
      createdAt: String(row.created_at ?? ''),
    })),
  }
}

export async function registerMediaAsset(input: {
  publicUrl: string
  kind: SiteMediaAsset['kind']
  sectionKey?: string
  colorwaySlug?: string
  active?: boolean
}): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) {
    return { error: 'Supabase required for media registry (use section video URL locally)' }
  }
  const { error } = await sb.from('site_media_assets').insert({
    storage_path: input.publicUrl,
    public_url: input.publicUrl,
    kind: input.kind,
    section_key: input.sectionKey ?? null,
    colorway_slug: input.colorwaySlug ?? null,
    active: input.active ?? false,
    mime_type: input.publicUrl.endsWith('.mp4') ? 'video/mp4' : 'image/png',
  })
  return error ? { error: error.message } : {}
}

export async function setMediaAssetActive(id: string, active: boolean): Promise<{ error?: string }> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return { error: 'Supabase required' }
  const { error } = await sb
    .from('site_media_assets')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
  return error ? { error: error.message } : {}
}