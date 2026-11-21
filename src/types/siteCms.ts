export type SitePageSlug = 'about' | 'faq' | 'legal'

export type SitePage = {
  slug: SitePageSlug
  title: string
  body: string
  published: boolean
  updatedAt?: string
}

export type SiteSectionKey = 'announcement' | 'hero' | 'editorial' | 'colorwayShowcase' | 'macro'

export type SiteSection = {
  sectionKey: SiteSectionKey
  label: string
  headline?: string
  subheadline?: string
  body?: string
  posterUrl?: string
  videoUrl?: string
  altText?: string
  published: boolean
  sortOrder: number
  updatedAt?: string
}

export type SiteMediaKind = 'hero' | 'product_loop' | 'colorway_showcase' | 'macro' | 'poster'

export type SiteMediaAsset = {
  id: string
  storagePath: string
  publicUrl?: string
  mimeType: string
  kind: SiteMediaKind
  colorwaySlug?: string
  sectionKey?: string
  active: boolean
  posterPath?: string
  createdAt?: string
}

export type CatalogProductPatch = {
  slug: string
  name?: string
  subtitle?: string
  description?: string
  pricePhp?: number
  compareAtPhp?: number | null
  weightGrams?: number
  published?: boolean
  hero?: boolean
}

export type CatalogCollectionPatch = {
  slug: string
  name?: string
  description?: string
  bannerUrl?: string
  published?: boolean
  sortOrder?: number
}