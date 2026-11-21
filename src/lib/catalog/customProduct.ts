import type { Colorway, GripSize, Product } from '../../types/commerce'
import { products as mockProducts } from '../../data/mock/products'

export const DEMO_CATALOG_SLUGS = new Set(mockProducts.map((p) => p.slug))

export function isDemoCatalogProduct(slug: string): boolean {
  return DEMO_CATALOG_SLUGS.has(slug)
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