import type { Collection, Colorway, Product } from '../types/commerce'
import { parseGalleryImagesJson } from '../lib/catalog/productGallery'
import { getSupabase, supabaseConfigured } from '../lib/supabase/client'
import { products as mockProducts } from '../data/mock/products'

type DbProduct = {
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
      image: c.image_url ?? '/assets/dayo/01_graphite_volt.jpg',
    }))

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle ?? undefined,
    description: row.description,
    pricePhp: row.price_php,
    compareAtPhp: row.compare_at_php ?? undefined,
    collectionSlugs: row.collection_slugs,
    weightGrams: row.weight_grams,
    hero: row.hero,
    colorways: colorways.length ? colorways : mockProducts[0].colorways,
    gripSizes: row.grip_sizes.length ? row.grip_sizes : mockProducts[0].gripSizes,
    specs: row.specs,
    features: row.features.length ? row.features : mockProducts[0].features,
    images: parseGalleryImagesJson(row.gallery_images),
  }
}

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return null

  const { data, error } = await sb
    .from('products')
    .select('*, product_colorways(*)')
    .eq('published', true)
    .order('name')

  if (error || !data?.length) return null
  return (data as DbProduct[]).map(mapProduct)
}

export async function fetchCollectionsFromSupabase(): Promise<Collection[] | null> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return null

  const { data, error } = await sb
    .from('collections')
    .select('*')
    .eq('published', true)
    .order('sort_order')

  if (error || !data?.length) return null

  const allProducts = (await fetchProductsFromSupabase()) ?? mockProducts

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