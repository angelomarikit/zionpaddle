import { HeroStage } from '../components/tempo/HeroStage'
import { flagshipProduct } from '../data/mock/flagship'
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
  return (
    <>
      <HeroStage
        product={flagshipProduct}
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