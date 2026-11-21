import type { CatalogCollectionPatch, CatalogProductPatch, SitePage, SiteSection } from '../../types/siteCms'
import type { Collection, Product } from '../../types/commerce'
import { defaultSitePages, defaultSiteSections } from '../../data/cms/defaults'

import { getMigratedStorageItem } from '../../lib/storage/migrateKey'

const PAGES_KEY = 'zion-cms-pages-v1'
const LEGACY_PAGES_KEY = 'dayo-cms-pages-v1'
const SECTIONS_KEY = 'zion-cms-sections-v1'
const LEGACY_SECTIONS_KEY = 'dayo-cms-sections-v1'
const PRODUCTS_KEY = 'zion-cms-products-v1'
const LEGACY_PRODUCTS_KEY = 'dayo-cms-products-v1'
const COLLECTIONS_KEY = 'zion-cms-collections-v1'
const LEGACY_COLLECTIONS_KEY = 'dayo-cms-collections-v1'
const DELETED_PRODUCTS_KEY = 'zion-cms-products-deleted-v1'
const LEGACY_DELETED_PRODUCTS_KEY = 'dayo-cms-products-deleted-v1'

function readJson<T>(key: string, legacyKey: string, fallback: T): T {
  try {
    const raw = getMigratedStorageItem(key, legacyKey)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export type CmsStore = 'supabase' | 'local'

export function readLocalSitePages(): SitePage[] {
  const patches = readJson<Partial<SitePage>[]>(PAGES_KEY, LEGACY_PAGES_KEY, [])
  return defaultSitePages.map((base) => {
    const patch = patches.find((p) => p.slug === base.slug)
    return patch ? { ...base, ...patch } : base
  })
}

export function saveLocalSitePage(page: SitePage) {
  const patches = readJson<SitePage[]>(PAGES_KEY, LEGACY_PAGES_KEY, [])
  const next = [...patches.filter((p) => p.slug !== page.slug), { ...page, updatedAt: new Date().toISOString() }]
  writeJson(PAGES_KEY, next)
}

export function readLocalSiteSections(): SiteSection[] {
  const patches = readJson<Partial<SiteSection>[]>(SECTIONS_KEY, LEGACY_SECTIONS_KEY, [])
  return defaultSiteSections.map((base) => {
    const patch = patches.find((p) => p.sectionKey === base.sectionKey)
    return patch ? { ...base, ...patch } : base
  })
}

export function saveLocalSiteSection(section: SiteSection) {
  const patches = readJson<SiteSection[]>(SECTIONS_KEY, LEGACY_SECTIONS_KEY, [])
  const next = [
    ...patches.filter((p) => p.sectionKey !== section.sectionKey),
    { ...section, updatedAt: new Date().toISOString() },
  ]
  writeJson(SECTIONS_KEY, next)
}

export function readLocalProductPatches(): CatalogProductPatch[] {
  return readJson<CatalogProductPatch[]>(PRODUCTS_KEY, LEGACY_PRODUCTS_KEY, []).map((p) => ({
    ...p,
    slug: p.slug.replace(/^dayo-/, 'zion-'),
  }))
}

export function saveLocalProductPatch(patch: CatalogProductPatch) {
  const patches = readLocalProductPatches()
  writeJson(PRODUCTS_KEY, [...patches.filter((p) => p.slug !== patch.slug), patch])
}

export function removeLocalProductPatch(slug: string) {
  const patches = readLocalProductPatches().filter((p) => p.slug !== slug)
  writeJson(PRODUCTS_KEY, patches)
}

export function readDeletedProductSlugs(): Set<string> {
  const list = readJson<string[]>(DELETED_PRODUCTS_KEY, LEGACY_DELETED_PRODUCTS_KEY, [])
  return new Set(list.map((s) => s.replace(/^dayo-/, 'zion-')))
}

export function markProductDeleted(slug: string) {
  const set = readDeletedProductSlugs()
  set.add(slug)
  writeJson(DELETED_PRODUCTS_KEY, [...set])
}

export function filterDeletedCatalogProducts<T extends { slug: string }>(products: T[]): T[] {
  const deleted = readDeletedProductSlugs()
  if (!deleted.size) return products
  return products.filter((p) => !deleted.has(p.slug))
}

export function readLocalCollectionPatches(): CatalogCollectionPatch[] {
  return readJson<CatalogCollectionPatch[]>(COLLECTIONS_KEY, LEGACY_COLLECTIONS_KEY, []).map((p) => ({
    ...p,
    slug: p.slug.replace(/^dayo-/, 'zion-'),
  }))
}

export function saveLocalCollectionPatch(patch: CatalogCollectionPatch) {
  const patches = readLocalCollectionPatches()
  writeJson(COLLECTIONS_KEY, [...patches.filter((p) => p.slug !== patch.slug), patch])
}

export function applyProductPatches(products: Product[]): Product[] {
  const patches = readLocalProductPatches()
  if (!patches.length) return products
  return products.map((p) => {
    const patch = patches.find((x) => x.slug === p.slug)
    if (!patch) return p
    return {
      ...p,
      name: patch.name ?? p.name,
      subtitle: patch.subtitle ?? p.subtitle,
      description: patch.description ?? p.description,
      pricePhp: patch.pricePhp ?? p.pricePhp,
      compareAtPhp: patch.compareAtPhp === null ? undefined : (patch.compareAtPhp ?? p.compareAtPhp),
      weightGrams: patch.weightGrams ?? p.weightGrams,
      hero: patch.hero ?? p.hero,
      images: patch.galleryImages ?? p.images,
    }
  })
}

export function applyCollectionPatches(collections: Collection[]): Collection[] {
  const patches = readLocalCollectionPatches()
  if (!patches.length) return collections
  return collections.map((c) => {
    const patch = patches.find((x) => x.slug === c.slug)
    if (!patch) return c
    return {
      ...c,
      name: patch.name ?? c.name,
      description: patch.description ?? c.description,
      banner: patch.bannerUrl ?? c.banner,
    }
  })
}