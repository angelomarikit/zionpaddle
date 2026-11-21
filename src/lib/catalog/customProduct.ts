import type { Colorway, GripSize, Product } from '../../types/commerce'
import { products as mockProducts } from '../../data/mock/products'

export const DEMO_CATALOG_SLUGS = new Set(mockProducts.map((p) => p.slug))

export function isDemoCatalogProduct(slug: string): boolean {
  return DEMO_CATALOG_SLUGS.has(slug)
}

const PLACEHOLDER_IMAGE = '/placeholders/collection-pro.svg'

export function isBundledDemoAssetUrl(url?: string): boolean {
  if (!url?.trim()) return false
  return url.includes('/assets/dayo/') || url.includes('/media/dayo/')
}

export function productHeroImage(product: Product, colorway?: Colorway): string {
  if (!colorway?.image?.trim()) return PLACEHOLDER_IMAGE
  if (isDemoCatalogProduct(product.slug)) {
    return colorway.image
  }
  if (isBundledDemoAssetUrl(colorway.image)) return PLACEHOLDER_IMAGE
  return colorway.image
}

export function defaultDbColorways(): Colorway[] {
  return [
    {
      id: 'default',
      slug: 'default',
      name: 'Default',
      tagline: '',
      hex: '#141414',
      image: PLACEHOLDER_IMAGE,
    },
  ]
}

export function defaultDbGripSizes(): GripSize[] {
  return [{ id: 'standard', label: 'Standard', circumferenceCm: '10.5 cm' }]
}