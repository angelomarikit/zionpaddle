import type { Product } from '../../types/commerce'
import type { SiteSection } from '../../types/siteCms'
import { flagshipProduct } from '../../data/mock/flagship'
import { isDemoCatalogProduct, liveCatalogProducts } from './customProduct'

/** Home hero / featured product (Shop now target). */
export const DEFAULT_HOME_HERO_SLUG = 'zion-titan'

/** Home “From our catalog” grid — max product cards. */
export const HOME_CATALOG_PREVIEW_LIMIT = 6

export type HomeHeroSectionExtra = {
  homeProductSlug?: string
}

export function findZionTitanProduct(products: Product[]): Product | undefined {
  const bySlug = products.find((p) => p.slug === DEFAULT_HOME_HERO_SLUG)
  if (bySlug) return bySlug
  return products.find((p) => /^zion\s*titan/i.test(p.name.trim()) || /zion-titan/i.test(p.slug))
}

/**
 * Homepage hero + video banner — always Zion Titan when live.
 * Ignores CMS `homeProductSlug` (often still Golden Aura) to prevent refresh flicker.
 */
export function resolvePinnedHomeHeroProduct(products: Product[]): Product {
  const pinned = findZionTitanProduct(products)
  if (pinned) return pinned
  const live = liveCatalogProducts(products)
  if (live.length) return live[0]
  const flagship = products.find((p) => p.slug === flagshipProduct.slug && isDemoCatalogProduct(p.slug))
  return flagship ?? flagshipProduct
}

/** @deprecated Use findZionTitanProduct — kept for legacy slug lookups. */
export function findGoldenAuraProduct(products: Product[]): Product | undefined {
  return products.find(
    (p) => /golden\s*aura/i.test(p.name) || /golden-aura|golden_aura/i.test(p.slug),
  )
}

export function parseHomeHeroExtra(raw: unknown): HomeHeroSectionExtra {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const slug = o.homeProductSlug ?? o.productSlug
  return typeof slug === 'string' && slug.trim() ? { homeProductSlug: slug.trim() } : {}
}

export function resolveHomeHeroProduct(products: Product[], heroSection?: SiteSection): Product {
  const pinned = findZionTitanProduct(products)
  if (pinned) return pinned

  const cmsSlug = heroSection?.extra?.homeProductSlug
  if (cmsSlug && cmsSlug !== DEFAULT_HOME_HERO_SLUG) {
    const cmsPick = products.find((p) => p.slug === cmsSlug)
    if (cmsPick) return cmsPick
  }
  const slug = DEFAULT_HOME_HERO_SLUG
  if (slug) {
    const picked = products.find((p) => p.slug === slug)
    if (picked) return picked
  }
  const flagged = products.find((p) => p.hero && !/golden\s*aura/i.test(p.name))
  if (flagged) return flagged
  const flagship = products.find((p) => p.slug === flagshipProduct.slug)
  return flagship ?? products[0] ?? flagshipProduct
}

export async function syncHomeHeroProductSlug(
  slug: string,
  fetchSections: () => Promise<{ sections: SiteSection[] }>,
  saveSection: (s: SiteSection) => Promise<unknown>,
): Promise<void> {
  const { sections } = await fetchSections()
  const hero = sections.find((s) => s.sectionKey === 'hero')
  if (!hero) return
  await saveSection({
    ...hero,
    extra: { ...hero.extra, homeProductSlug: slug },
  })
}