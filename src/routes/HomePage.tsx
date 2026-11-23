import { HeroStage } from '../components/tempo/HeroStage'
import { HOME_PAGE_HERO_VIDEO } from '../data/media/homeHeroMedia'
import { resolvePinnedHomeHeroProduct } from '../lib/catalog/homeHero'
import { useCatalog } from '../hooks/useCatalog'
import { useMemo } from 'react'
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
  const heroProduct = useMemo(() => resolvePinnedHomeHeroProduct(products), [products])

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