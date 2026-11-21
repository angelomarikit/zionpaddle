import { HeroStage } from '../components/tempo/HeroStage'
import { resolveHomeHeroProduct } from '../lib/catalog/homeHero'
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
  const heroProduct = resolveHomeHeroProduct(products, heroSection)

  return (
    <>
      <HeroStage
        product={heroProduct}
        onCta={() => {
          const el = document.getElementById('size')
          el?.scrollIntoView({ behavior: 'smooth' })
        }}
      />
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