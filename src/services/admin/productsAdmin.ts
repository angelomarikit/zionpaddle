import type { GripSize } from '../../types/commerce'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { friendlyAdminError } from '../../lib/admin/messages'
import { products as mockProducts } from '../../data/mock/products'
import { filterDeletedCatalogProducts, markProductDeleted, removeLocalProductPatch, saveLocalProductPatch } from '../cms/localCms'
import { ensureCatalogInDatabase } from './catalogSeed'
import { writeStockMap, readStockMap } from '../../data/mock/inventory'

export type ColorwayDraft = {
  external_key: string
  slug: string
  name: string
  tagline: string
  hex: string
  volt_hex?: string
  image_url?: string
  sort_order: number
}

export type ProductDraft = {
  slug: string
  name: string
  subtitle?: string
  description: string
  price_php: number
  compare_at_php?: number | null
  weight_grams: number
  published: boolean
  hero: boolean
  collection_slugs: string[]
  grip_sizes: GripSize[]
  specs: { label: string; value: string }[]
  colorways: ColorwayDraft[]
  quantity_on_hand: number
}

function mapRowToDraft(row: Record<string, unknown>, colorways: ColorwayDraft[], qty: number): ProductDraft {
  return {
    slug: row.slug as string,
    name: row.name as string,
    subtitle: (row.subtitle as string) ?? undefined,
    description: row.description as string,
    price_php: row.price_php as number,
    compare_at_php: row.compare_at_php as number | null,
    weight_grams: row.weight_grams as number,
    published: row.published as boolean,
    hero: row.hero as boolean,
    collection_slugs: row.collection_slugs as string[],
    grip_sizes: (row.grip_sizes as GripSize[]) ?? [],
    specs: (row.specs as { label: string; value: string }[]) ?? [],
    colorways,
    quantity_on_hand: qty,
  }
}

export async function listStaffProducts(): Promise<{ products: ProductDraft[]; online: boolean }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    await ensureCatalogInDatabase()
    const { data, error } = await sb
      .from('products')
      .select('*, product_colorways(*)')
      .order('name')
    if (!error) {
      const rows = data ?? []
      const slugs = rows.map((r) => r.slug as string)
      const { data: stock } = slugs.length
        ? await sb.from('product_stock').select('product_slug, quantity_on_hand').in('product_slug', slugs)
        : { data: [] as { product_slug: string; quantity_on_hand: number }[] }
      const qtyMap = Object.fromEntries((stock ?? []).map((s) => [s.product_slug, s.quantity_on_hand]))
      return {
        online: true,
        products: rows.map((row) => {
          const cws = ((row.product_colorways as Record<string, unknown>[]) ?? [])
            .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
            .map((c) => ({
              external_key: c.external_key as string,
              slug: c.slug as string,
              name: c.name as string,
              tagline: c.tagline as string,
              hex: c.hex as string,
              volt_hex: (c.volt_hex as string) ?? undefined,
              image_url: (c.image_url as string) ?? undefined,
              sort_order: c.sort_order as number,
            }))
          return mapRowToDraft(row as Record<string, unknown>, cws, qtyMap[row.slug as string] ?? 0)
        }),
      }
    }
  }

  const stock = readStockMap()
  return {
    online: false,
    products: filterDeletedCatalogProducts(mockProducts).map((p) => ({
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      price_php: p.pricePhp,
      compare_at_php: p.compareAtPhp ?? null,
      weight_grams: p.weightGrams,
      published: true,
      hero: Boolean(p.hero),
      collection_slugs: p.collectionSlugs,
      grip_sizes: p.gripSizes,
      specs: p.specs,
      colorways: p.colorways.map((c, i) => ({
        external_key: c.id,
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        hex: c.hex,
        volt_hex: c.voltHex,
        image_url: c.image,
        sort_order: i,
      })),
      quantity_on_hand: stock[p.slug] ?? 0,
    })),
  }
}

export async function getStaffProduct(slug: string): Promise<ProductDraft | undefined> {
  const { products } = await listStaffProducts()
  return products.find((p) => p.slug === slug)
}

export async function saveStaffProduct(draft: ProductDraft): Promise<{ ok: boolean; error?: string; online: boolean }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: existing } = await sb.from('products').select('id').eq('slug', draft.slug).maybeSingle()
    const row = {
      slug: draft.slug,
      name: draft.name,
      subtitle: draft.subtitle ?? null,
      description: draft.description,
      price_php: draft.price_php,
      compare_at_php: draft.compare_at_php ?? null,
      weight_grams: draft.weight_grams,
      published: draft.published,
      hero: draft.hero,
      collection_slugs: draft.collection_slugs,
      grip_sizes: draft.grip_sizes,
      specs: draft.specs,
      features: [],
      updated_at: new Date().toISOString(),
    }
    let productId = (existing as { id: string } | null)?.id
    if (existing) {
      const { error } = await sb.from('products').update(row).eq('slug', draft.slug)
      if (error) return { ok: false, error: friendlyAdminError(error.message), online: true }
    } else {
      const { data, error } = await sb.from('products').insert(row).select('id').single()
      if (error) return { ok: false, error: friendlyAdminError(error.message), online: true }
      productId = (data as { id: string }).id
    }

    if (productId) {
      await sb.from('product_colorways').delete().eq('product_id', productId)
      if (draft.colorways.length) {
        await sb.from('product_colorways').insert(
          draft.colorways.map((c, i) => ({
            product_id: productId,
            external_key: c.external_key,
            slug: c.slug,
            name: c.name,
            tagline: c.tagline,
            hex: c.hex,
            volt_hex: c.volt_hex ?? null,
            image_url: c.image_url ?? null,
            sort_order: c.sort_order ?? i,
          })),
        )
      }
    }

    await sb.from('product_stock').upsert({
      product_slug: draft.slug,
      quantity_on_hand: draft.quantity_on_hand,
      updated_at: new Date().toISOString(),
    })

    saveLocalProductPatch({
      slug: draft.slug,
      name: draft.name,
      subtitle: draft.subtitle,
      description: draft.description,
      pricePhp: draft.price_php,
      compareAtPhp: draft.compare_at_php,
      weightGrams: draft.weight_grams,
      published: draft.published,
      hero: draft.hero,
    })
    return { ok: true, online: true }
  }

  const map = readStockMap()
  map[draft.slug] = draft.quantity_on_hand
  writeStockMap(map)
  saveLocalProductPatch({
    slug: draft.slug,
    name: draft.name,
    subtitle: draft.subtitle,
    description: draft.description,
    pricePhp: draft.price_php,
    compareAtPhp: draft.compare_at_php,
    weightGrams: draft.weight_grams,
    published: draft.published,
    hero: draft.hero,
  })
  return { ok: true, online: false }
}

export async function deleteStaffProduct(slug: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data: existing } = await sb.from('products').select('id').eq('slug', slug).maybeSingle()
    if (!existing) return { ok: false, error: 'This product could not be found.' }
    await sb.from('product_stock').delete().eq('product_slug', slug)
    const { error } = await sb.from('products').delete().eq('slug', slug)
    if (error) return { ok: false, error: friendlyAdminError(error.message) }
    removeLocalProductPatch(slug)
    markProductDeleted(slug)
    const map = readStockMap()
    delete map[slug]
    writeStockMap(map)
    return { ok: true }
  }

  markProductDeleted(slug)
  removeLocalProductPatch(slug)
  const map = readStockMap()
  delete map[slug]
  writeStockMap(map)
  return { ok: true }
}

export function emptyProductDraft(): ProductDraft {
  return {
    slug: '',
    name: '',
    description: '',
    price_php: 0,
    weight_grams: 220,
    published: false,
    hero: false,
    collection_slugs: [],
    grip_sizes: [
      { id: 'standard', label: 'Standard', circumferenceCm: '10.5' },
      { id: 'cushioned', label: 'Cushioned', circumferenceCm: '10.8' },
    ],
    specs: [],
    colorways: [
      {
        external_key: 'color-1',
        slug: 'color-1',
        name: 'Color 1',
        tagline: '',
        hex: '#141414',
        sort_order: 0,
      },
    ],
    quantity_on_hand: 0,
  }
}