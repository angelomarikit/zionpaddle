import type { Product } from '../../types/commerce'
import type { SiteSection } from '../../types/siteCms'
import { flagshipProduct } from '../../data/mock/flagship'

/** Live catalog hero — transparent PNG cutout (Sypik Triton 5 Golden Aura). */
export const DEFAULT_HOME_HERO_SLUG = 'sypik-triton-5-golden-aura'

/** Home “From our catalog” grid — max product cards. */
export const HOME_CATALOG_PREVIEW_LIMIT = 6

export type HomeHeroSectionExtra = {
  homeProductSlug?: string
}

export function findGoldenAuraProduct(products: Product[]): Product | undefined {
  const bySlug = products.find((p) => p.slug === DEFAULT_HOME_HERO_SLUG)
  if (bySlug) return bySlug
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
  const slug = heroSection?.extra?.homeProductSlug ?? DEFAULT_HOME_HERO_SLUG
  if (slug) {
    const picked = products.find((p) => p.slug === slug)
    if (picked) return picked
  }
  const goldenAura = findGoldenAuraProduct(products)
  if (goldenAura) return goldenAura
  const flagged = products.find((p) => p.hero)
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