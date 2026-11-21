import type { ProductSaleCountdown } from '../lib/catalog/saleCountdown'

export type Colorway = {
  id: string
  slug: string
  name: string
  tagline: string
  hex: string
  voltHex?: string
  image: string
  soldOut?: boolean
}

export type GripSize = {
  id: string
  label: string
  circumferenceCm: string
  soldOut?: boolean
}

export type Product = {
  id: string
  slug: string
  name: string
  subtitle?: string
  description: string
  pricePhp: number
  compareAtPhp?: number
  collectionSlugs: string[]
  colorways: Colorway[]
  gripSizes: GripSize[]
  specs: { label: string; value: string }[]
  features: { index: string; title: string; body: string; image?: string }[]
  weightGrams: number
  hero?: boolean
  images: string[]
  saleCountdown?: ProductSaleCountdown
}

export type Collection = {
  id: string
  slug: string
  name: string
  description: string
  banner: string
  mobileBanner?: string
  productSlugs: string[]
}

export type CartLine = {
  productId: string
  productSlug: string
  productName: string
  colorwayId: string
  colorwayName: string
  gripSizeId: string
  gripSizeLabel: string
  pricePhp: number
  quantity: number
  image: string
}