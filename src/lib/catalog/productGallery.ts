import type { Product } from '../../types/commerce'

/** Hero + additional gallery URLs for the product page (deduped, stable order). */
export function productPageGalleryUrls(product: Product, heroUrl: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const add = (url?: string) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    out.push(url)
  }
  add(heroUrl)
  for (const url of product.images) add(url)
  return out
}

export function parseGalleryImagesJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
}