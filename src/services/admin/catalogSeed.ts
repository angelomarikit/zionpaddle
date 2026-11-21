import { collections as mockCollections } from '../../data/mock/collections'
import { products as mockProducts } from '../../data/mock/products'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { filterDeletedCatalogProducts } from '../cms/localCms'
import { readStockMap } from '../../data/mock/inventory'

let catalogSeedPromise: Promise<void> | null = null

/** Seeds collections and products into the database when tables are empty (staff / connected store). */
export function ensureCatalogInDatabase(): Promise<void> {
  if (!catalogSeedPromise) catalogSeedPromise = seedCatalogIfEmpty()
  return catalogSeedPromise
}

async function seedCatalogIfEmpty(): Promise<void> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return

  const { count: productCount, error: productCountError } = await sb
    .from('products')
    .select('id', { count: 'exact', head: true })
  if (productCountError) return
  if (productCount && productCount > 0) return

  const { count: collectionCount } = await sb.from('collections').select('id', { count: 'exact', head: true })
  if (!collectionCount) {
    for (let i = 0; i < mockCollections.length; i++) {
      const c = mockCollections[i]!
      await sb.from('collections').upsert(
        {
          slug: c.slug,
          name: c.name,
          description: c.description,
          banner_url: c.banner ?? null,
          published: true,
          sort_order: i,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' },
      )
    }
  }

  const stock = readStockMap()
  const catalog = filterDeletedCatalogProducts(mockProducts)

  for (const p of catalog) {
    const { data: existing } = await sb.from('products').select('id').eq('slug', p.slug).maybeSingle()
    const row = {
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle ?? null,
      description: p.description,
      price_php: p.pricePhp,
      compare_at_php: p.compareAtPhp ?? null,
      collection_slugs: p.collectionSlugs,
      weight_grams: p.weightGrams,
      hero: Boolean(p.hero),
      published: true,
      specs: p.specs,
      features: p.features,
      grip_sizes: p.gripSizes,
      gallery_images: p.images ?? [],
      updated_at: new Date().toISOString(),
    }

    let productId = (existing as { id: string } | null)?.id
    if (existing) {
      await sb.from('products').update(row).eq('slug', p.slug)
    } else {
      const { data, error } = await sb.from('products').insert(row).select('id').single()
      if (error) continue
      productId = (data as { id: string }).id
    }

    if (productId) {
      await sb.from('product_colorways').delete().eq('product_id', productId)
      if (p.colorways.length) {
        await sb.from('product_colorways').insert(
          p.colorways.map((c, sort_order) => ({
            product_id: productId,
            external_key: c.id,
            slug: c.slug,
            name: c.name,
            tagline: c.tagline,
            hex: c.hex,
            volt_hex: c.voltHex ?? null,
            image_url: c.image ?? null,
            sort_order,
          })),
        )
      }
    }

    await sb.from('product_stock').upsert({
      product_slug: p.slug,
      quantity_on_hand: stock[p.slug] ?? 24,
      updated_at: new Date().toISOString(),
    })
  }
}
