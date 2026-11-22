import { HeroStage } from '../components/tempo/HeroStage'
import { findGoldenAuraProduct, resolveHomeHeroProduct } from '../lib/catalog/homeHero'
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
    findGoldenAuraProduct(products) ?? resolveHomeHeroProduct(products, heroSection)

  return (
    <>
      <HeroStage product={heroProduct} />
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