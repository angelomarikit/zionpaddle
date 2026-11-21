import type { Product, Collection } from '../../types/commerce'
import type { CatalogCollectionPatch, CatalogProductPatch } from '../../types/siteCms'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { fetchCollectionsFromSupabase, fetchProductsFromSupabase } from '../catalog'
import { products as mockProducts } from '../../data/mock/products'
import { collections as mockCollections } from '../../data/mock/collections'
import {
  applyCollectionPatches,
  applyProductPatches,
  readLocalCollectionPatches,
  readLocalProductPatches,
  saveLocalCollectionPatch,
  saveLocalProductPatch,
  type CmsStore,
} from '../cms/localCms'

type DbProduct = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  description: string
  price_php: number
  compare_at_php: number | null
  collection_slugs: string[]
  weight_grams: number
  hero: boolean
  published: boolean
}

function productToRow(patch: CatalogProductPatch, existing?: DbProduct) {
  return {
    slug: patch.slug,
    name: patch.name ?? existing?.name ?? patch.slug,
    subtitle: patch.subtitle ?? existing?.subtitle ?? null,
    description: patch.description ?? existing?.description ?? '',
    price_php: patch.pricePhp ?? existing?.price_php ?? 0,
    compare_at_php: patch.compareAtPhp === null ? null : (patch.compareAtPhp ?? existing?.compare_at_php ?? null),
    weight_grams: patch.weightGrams ?? existing?.weight_grams ?? 220,
    published: patch.published ?? existing?.published ?? true,
    hero: patch.hero ?? existing?.hero ?? false,
    collection_slugs: existing?.collection_slugs ?? [],
    updated_at: new Date().toISOString(),
  }
}

export async function fetchStaffCatalog(): Promise<{
  products: Product[]
  collections: Collection[]
  store: CmsStore
}> {
  const sb = getSupabase()
  let products = applyProductPatches(mockProducts)
  let collections = applyCollectionPatches(mockCollections)
  let store: CmsStore = 'local'

  if (sb && supabaseConfigured) {
    const { count } = await sb.from('products').select('*', { count: 'exact', head: true })
    if (count && count > 0) {
      store = 'supabase'
      products = applyProductPatches((await fetchProductsFromSupabase()) ?? mockProducts)
      collections = applyCollectionPatches((await fetchCollectionsFromSupabase()) ?? mockCollections)
    }
  }

  return { products, collections, store }
}

export async function upsertProductPatch(
  patch: CatalogProductPatch,
): Promise<{ store: CmsStore; error?: string }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: existing } = await sb.from('products').select('*').eq('slug', patch.slug).maybeSingle()
    const row = productToRow(patch, existing as DbProduct | undefined)
    const { error } = existing
      ? await sb.from('products').update(row).eq('slug', patch.slug)
      : await sb.from('products').insert(row)
    if (!error) {
      saveLocalProductPatch(patch)
      return { store: 'supabase' }
    }
    saveLocalProductPatch(patch)
    return { store: 'local', error: error.message }
  }
  saveLocalProductPatch(patch)
  return { store: 'local' }
}

export async function upsertCollectionPatch(
  patch: CatalogCollectionPatch,
): Promise<{ store: CmsStore; error?: string }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: existing } = await sb.from('collections').select('*').eq('slug', patch.slug).maybeSingle()
    const row = {
      slug: patch.slug,
      name: patch.name ?? (existing as { name: string } | null)?.name ?? patch.slug,
      description: patch.description ?? (existing as { description: string } | null)?.description ?? '',
      banner_url: patch.bannerUrl ?? (existing as { banner_url: string | null } | null)?.banner_url ?? null,
      published: patch.published ?? (existing as { published: boolean } | null)?.published ?? true,
      sort_order: patch.sortOrder ?? (existing as { sort_order: number } | null)?.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    }
    const { error } = existing
      ? await sb.from('collections').update(row).eq('slug', patch.slug)
      : await sb.from('collections').insert(row)
    if (!error) {
      saveLocalCollectionPatch(patch)
      return { store: 'supabase' }
    }
    saveLocalCollectionPatch(patch)
    return { store: 'local', error: error.message }
  }
  saveLocalCollectionPatch(patch)
  return { store: 'local' }
}

export function listLocalPatches() {
  return {
    products: readLocalProductPatches(),
    collections: readLocalCollectionPatches(),
  }
}