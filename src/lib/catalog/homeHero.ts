import type { Product } from '../../types/commerce'
import type { SiteSection } from '../../types/siteCms'
import { flagshipProduct } from '../../data/mock/flagship'

export type HomeHeroSectionExtra = {
  homeProductSlug?: string
}

export function parseHomeHeroExtra(raw: unknown): HomeHeroSectionExtra {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const slug = o.homeProductSlug ?? o.productSlug
  return typeof slug === 'string' && slug.trim() ? { homeProductSlug: slug.trim() } : {}
}

export function resolveHomeHeroProduct(products: Product[], heroSection?: SiteSection): Product {
  const slug = heroSection?.extra?.homeProductSlug
  if (slug) {
    const picked = products.find((p) => p.slug === slug)
    if (picked) return picked
  }
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