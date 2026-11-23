import { HeroStage } from '../components/tempo/HeroStage'
import { HOME_PAGE_HERO_VIDEO } from '../data/media/homeHeroMedia'
import { findZionTitanProduct, resolveHomeHeroProduct } from '../lib/catalog/homeHero'
import { useCatalog } from '../hooks/useCatalog'
import { useSiteContent } from '../hooks/useSiteContent'
import {
  BestSellersSection,
  BlogEditorialSection,
  CampaignShowcaseSection,
  CollectionsTeaser,
  ColourwaysSection,
  EditorialStatementSection,
  FaqSection,
  LifestyleSection,
  TechSection,
  VariantLabSection,
} from '../components/home/HomeSections'

export function HomePage() {
  const { products } = useCatalog()
  const { sections } = useSiteContent()
  const heroSection = sections.find((s) => s.sectionKey === 'hero')
  const heroProduct =
    findZionTitanProduct(products) ?? resolveHomeHeroProduct(products, heroSection)

  return (
    <>
      <HeroStage product={heroProduct} homeVideoSrc={HOME_PAGE_HERO_VIDEO} />
      <EditorialStatementSection />
      <VariantLabSection />
      <TechSection />
      <ColourwaysSection />
      <CampaignShowcaseSection />
      <LifestyleSection />
      <CollectionsTeaser />
      <BestSellersSection />
      <BlogEditorialSection />
      <FaqSection />
    </>
  )
}