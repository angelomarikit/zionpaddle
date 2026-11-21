import type { Collection, Colorway, Product } from '../types/commerce'
import { defaultDbGripSizes, primaryColorwayFromUploads } from '../lib/catalog/customProduct'
import { parseGalleryImagesJson } from '../lib/catalog/productGallery'
import { saleCountdownFromRow } from '../lib/catalog/saleCountdown'
import { getSupabase, supabaseConfigured } from '../lib/supabase/client'
import { products as mockProducts } from '../data/mock/products'

type DbProduct = {
  id?: string
  slug: string
  name: string
  subtitle: string | null
  description: string
  price_php: number
  compare_at_php: number | null
  collection_slugs: string[]
  weight_grams: number
  hero: boolean
  gallery_images?: unknown
  specs: { label: string; value: string }[]
  features: { index: string; title: string; body: string; image?: string }[]
  grip_sizes: { id: string; label: string; circumferenceCm: string; soldOut?: boolean }[]
  sale_countdown_enabled?: boolean
  sale_countdown_mode?: string | null
  sale_countdown_ends_at?: string | null
  sale_countdown_rolling_minutes?: number | null
  sale_countdown_headline?: string | null
  product_colorways?: {
    external_key: string
    slug: string
    name: string
    tagline: string
    hex: string
    volt_hex: string | null
    image_url: string | null
    sort_order: number
  }[]
}

function mapProduct(row: DbProduct): Product {
  const colorways: Colorway[] = (row.product_colorways ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({
      id: c.external_key,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      hex: c.hex,
      voltHex: c.volt_hex ?? undefined,
      image: c.image_url?.trim() || '',
    }))

  const gallery = parseGalleryImagesJson(row.gallery_images)
  const mappedColorways = primaryColorwayFromUploads(row.name, colorways, gallery)
  const resolvedColorways =
    mappedColorways.length > 0
      ? mappedColorways
      : [
          {
            id: 'primary',
            slug: 'primary',
            name: row.name,
            tagline: '',
            hex: '#141414',
            image: '',
          },
        ]

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle ?? undefined,
    description: row.description,
    pricePhp: row.price_php,
    compareAtPhp: row.compare_at_php ?? undefined,
    collectionSlugs: row.collection_slugs ?? [],
    weightGrams: row.weight_grams,
    hero: row.hero,
    colorways: resolvedColorways,
    gripSizes: row.grip_sizes?.length ? row.grip_sizes : defaultDbGripSizes(),
    specs: row.specs ?? [],
    features: row.features?.length ? row.features : [],
    images: gallery,
    saleCountdown: saleCountdownFromRow(row),
  }
}

const PRODUCT_BASE_COLS =
  'id, slug, name, subtitle, description, price_php, compare_at_php, collection_slugs, weight_grams, hero, specs, features, grip_sizes, sale_countdown_enabled, sale_countdown_mode, sale_countdown_ends_at, sale_countdown_rolling_minutes, sale_countdown_headline'

async function attachColorways(
  sb: NonNullable<ReturnType<typeof getSupabase>>,
  rows: DbProduct[],
): Promise<DbProduct[]> {
  const ids = rows.map((r) => r.id).filter(Boolean) as string[]
  if (!ids.length) return rows.map((r) => ({ ...r, product_colorways: r.product_colorways ?? [] }))
  const { data: colorways } = await sb.from('product_colorways').select('*').in('product_id', ids)
  const byProduct = new Map<string, DbProduct['product_colorways']>()
  for (const c of colorways ?? []) {
    const pid = (c as { product_id: string }).product_id
    const list = byProduct.get(pid) ?? []
    list.push(c as NonNullable<DbProduct['product_colorways']>[number])
    byProduct.set(pid, list)
  }
  return rows.map((r) => ({
    ...r,
    product_colorways: r.product_colorways ?? (r.id ? byProduct.get(r.id) : undefined) ?? [],
  }))
}

async function loadPublishedProducts(sb: NonNullable<ReturnType<typeof getSupabase>>): Promise<Product[] | null> {
  const attempts = [
    `${PRODUCT_BASE_COLS}, gallery_images`,
    PRODUCT_BASE_COLS,
    'id, slug, name, description, price_php, collection_slugs, weight_grams, hero, specs, features, grip_sizes',
  ]

  let rows: DbProduct[] | null = null
  let lastError: string | null = null

  for (const cols of attempts) {
    const { data, error } = await sb.from('products').select(cols).eq('published', true).order('name')
    if (!error && data) {
      rows = data as unknown as DbProduct[]
      lastError = null
      break
    }
    lastError = error?.message ?? null
  }

  if (!rows) return lastError ? null : []
  if (!rows.length) return []

  const withColorways = await attachColorways(sb, rows)
  return withColorways.map(mapProduct)
}

/** Supabase rows override mock rows with the same slug; DB-only slugs are included. */
export function mergeStorefrontProducts(dbProducts: Product[] | null, mockCatalog: Product[]): Product[] {
  if (dbProducts === null) return mockCatalog
  const bySlug = new Map(mockCatalog.map((p) => [p.slug, p]))
  for (const p of dbProducts) bySlug.set(p.slug, p)
  return [...bySlug.values()]
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return null
  return loadPublishedProducts(sb)
}

export function mergeStorefrontCollections(dbCollections: Collection[] | null, mockCatalog: Collection[]): Collection[] {
  if (dbCollections === null) return mockCatalog
  const bySlug = new Map(mockCatalog.map((c) => [c.slug, c]))
  for (const c of dbCollections) bySlug.set(c.slug, c)
  return [...bySlug.values()]
}

export function collectionsWithProductSlugs(collections: Collection[], products: Product[]): Collection[] {
  return collections.map((c) => ({
    ...c,
    productSlugs: products.filter((p) => p.collectionSlugs.includes(c.slug)).map((p) => p.slug),
  }))
}

export async function fetchCollectionsFromSupabase(): Promise<Collection[] | null> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return null

  const { data, error } = await sb
    .from('collections')
    .select('*')
    .eq('published', true)
    .order('sort_order')

  if (error) return null
  if (!data?.length) return []

  const allProducts = mergeStorefrontProducts(await fetchProductsFromSupabase(), mockProducts)

  return data.map((row: { slug: string; name: string; description: string; banner_url: string | null }) => ({
    id: row.slug,
    slug: row.slug,
    name: row.name,
    description: row.description,
    banner: row.banner_url ?? `/placeholders/collection-${row.slug.split('-')[0]}.svg`,
    productSlugs: allProducts.filter((p) => p.collectionSlugs.includes(row.slug)).map((p) => p.slug),
  }))
}

export function getCatalogSource(): 'supabase' | 'mock' {
  return supabaseConfigured ? 'supabase' : 'mock'
}