import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { friendlyAdminError } from '../../lib/admin/messages'
import { collections as mockCollections } from '../../data/mock/collections'
import { saveLocalCollectionPatch } from '../cms/localCms'
import { ensureCatalogInDatabase } from './catalogSeed'

export type CollectionDraft = {
  slug: string
  name: string
  description: string
  banner_url?: string
  published: boolean
  sort_order: number
}

export async function listStaffCollections(): Promise<{ collections: CollectionDraft[]; online: boolean }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    await ensureCatalogInDatabase()
    const { data, error } = await sb.from('collections').select('*').order('sort_order')
    if (!error) {
      return {
        online: true,
        collections: (data ?? []).map((r) => ({
          slug: r.slug as string,
          name: r.name as string,
          description: r.description as string,
          banner_url: (r.banner_url as string) ?? undefined,
          published: r.published as boolean,
          sort_order: r.sort_order as number,
        })),
      }
    }
  }
  return {
    online: false,
    collections: mockCollections.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      banner_url: c.banner,
      published: true,
      sort_order: i,
    })),
  }
}

export async function getStaffCollection(slug: string): Promise<CollectionDraft | undefined> {
  const { collections } = await listStaffCollections()
  return collections.find((c) => c.slug === slug)
}

export async function saveStaffCollection(draft: CollectionDraft): Promise<{ ok: boolean; error?: string; online: boolean }> {
  const sb = getSupabase()
  const row = {
    slug: draft.slug,
    name: draft.name,
    description: draft.description,
    banner_url: draft.banner_url ?? null,
    published: draft.published,
    sort_order: draft.sort_order,
    updated_at: new Date().toISOString(),
  }
  if (sb && supabaseConfigured) {
    const { data: existing } = await sb.from('collections').select('slug').eq('slug', draft.slug).maybeSingle()
    const { error } = existing
      ? await sb.from('collections').update(row).eq('slug', draft.slug)
      : await sb.from('collections').insert(row)
    if (error) return { ok: false, error: friendlyAdminError(error.message), online: true }
    saveLocalCollectionPatch({
      slug: draft.slug,
      name: draft.name,
      description: draft.description,
      bannerUrl: draft.banner_url,
      published: draft.published,
      sortOrder: draft.sort_order,
    })
    return { ok: true, online: true }
  }
  saveLocalCollectionPatch({
    slug: draft.slug,
    name: draft.name,
    description: draft.description,
    bannerUrl: draft.banner_url,
    published: draft.published,
    sortOrder: draft.sort_order,
  })
  return { ok: true, online: false }
}

export function emptyCollectionDraft(): CollectionDraft {
  return { slug: '', name: '', description: '', published: false, sort_order: 0 }
}

export async function deleteStaffCollection(slug: string): Promise<{ ok: boolean; error?: string; online: boolean }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: products } = await sb.from('products').select('slug, collection_slugs').contains('collection_slugs', [slug])
    for (const row of products ?? []) {
      const next = ((row.collection_slugs as string[]) ?? []).filter((s) => s !== slug)
      await sb.from('products').update({ collection_slugs: next, updated_at: new Date().toISOString() }).eq('slug', row.slug)
    }
    const { error } = await sb.from('collections').delete().eq('slug', slug)
    if (error) return { ok: false, error: friendlyAdminError(error.message), online: true }
    return { ok: true, online: true }
  }
  return { ok: true, online: false }
}