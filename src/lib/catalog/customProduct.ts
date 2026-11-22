import type { Colorway, GripSize, Product } from '../../types/commerce'
import { products as mockProducts } from '../../data/mock/products'

export const DEMO_CATALOG_SLUGS = new Set(mockProducts.map((p) => p.slug))

export function isDemoCatalogProduct(slug: string): boolean {
  return DEMO_CATALOG_SLUGS.has(slug)
}

/** Admin / Supabase products only (no bundled mock paddles). */
export function liveCatalogProducts(products: Product[]): Product[] {
  return products.filter((p) => !isDemoCatalogProduct(p.slug))
}

export function liveProductsInCollection(products: Product[], collectionSlug: string): Product[] {
  return liveCatalogProducts(products).filter((p) => p.collectionSlugs.includes(collectionSlug))
}

/** Storefront card / collection tile art (prefers transparent PNG when available). */
export function catalogProductImage(product: Product): string {
  const cutout = transparentHeroCutout(product, product.colorways[0])
  if (cutout) return cutout
  return primaryProductImage(product) ?? ''
}

export function decodeHtmlEntities(text: string): string {
  if (!text.includes('&')) return text
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function isLikelyPngMatteUrl(url: string): boolean {
  return /\.png(\?|#|$)/i.test(url.trim())
}

export function isBundledDemoAssetUrl(url?: string): boolean {
  if (!url?.trim()) return false
  return url.includes('/assets/dayo/') || url.includes('/media/dayo/')
}

function usableImageUrl(url: string | undefined, demo: boolean): string | undefined {
  if (!url?.trim()) return undefined
  if (!demo && isBundledDemoAssetUrl(url)) return undefined
  return url
}

/** First real upload: colorway image, then gallery, then demo catalog assets. */
export function primaryProductImage(product: Product): string | undefined {
  const demo = isDemoCatalogProduct(product.slug)
  for (const c of product.colorways) {
    const url = usableImageUrl(c.image, demo)
    if (url) return url
  }
  for (const url of product.images) {
    const u = usableImageUrl(url, demo)
    if (u) return u
  }
  if (demo) {
    const c = product.colorways[0]
    if (c?.image?.trim()) return c.image
  }
  return undefined
}

export function productHeroImage(product: Product, colorway?: Colorway): string {
  const demo = isDemoCatalogProduct(product.slug)
  const primary = primaryProductImage(product)
  if (primary) return primary
  const fromCw = usableImageUrl(colorway?.image, demo)
  if (fromCw) return fromCw
  return ''
}

function isTransparentAssetUrl(url: string): boolean {
  return /\.png(\?|#|$)/i.test(url.trim())
}

function pngPreferenceScore(url: string): number {
  const lower = url.toLowerCase()
  let score = 0
  if (/\/gallery\//.test(lower)) score += 2
  if (/(hero|cutout|transparent|nobg|no-bg)/.test(lower)) score += 4
  if (/golden\s*aura|golden-aura/.test(lower)) score += 3
  return score
}

/** Prefer transparent PNG (gallery / colorway) so the cutout sits on the ink hero. */
export function transparentHeroCutout(product: Product, colorway?: Colorway): string {
  const demo = isDemoCatalogProduct(product.slug)
  if (demo) return productHeroImage(product, colorway)

  const pngCandidates: string[] = []
  const pushPng = (url: string | undefined) => {
    const u = usableImageUrl(url, false)
    if (u && isTransparentAssetUrl(u) && !pngCandidates.includes(u)) pngCandidates.push(u)
  }

  for (const url of product.images) pushPng(url)
  for (const c of product.colorways) pushPng(c.image)

  if (pngCandidates.length) {
    pngCandidates.sort((a, b) => pngPreferenceScore(b) - pngPreferenceScore(a))
    return pngCandidates[0]
  }
  return productHeroImage(product, colorway ?? product.colorways[0])
}

export function primaryColorwayFromUploads(
  productName: string,
  colorways: Colorway[],
  galleryUrls: string[],
): Colorway[] {
  if (colorways.length) {
    const galleryFirst = galleryUrls[0]
    return colorways.map((c, i) => ({
      ...c,
      name: c.name === 'Default' || c.name === 'Color 1' ? productName : c.name,
      image: c.image?.trim() || galleryUrls[i] || galleryFirst || '',
    }))
  }
  const image = galleryUrls[0] ?? ''
  if (!image) return []
  return [
    {
      id: 'primary',
      slug: 'primary',
      name: productName,
      tagline: '',
      hex: '#141414',
      image,
    },
  ]
}

export function defaultDbGripSizes(): GripSize[] {
  return [{ id: 'standard', label: 'Standard', circumferenceCm: '10.5 cm' }]
}