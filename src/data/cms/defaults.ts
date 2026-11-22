import type { SitePage, SiteSection } from '../../types/siteCms'
import { DEFAULT_HOME_HERO_SLUG } from '../../lib/catalog/homeHero'
import { dayoSiteMedia } from '../media/dayoMedia'

export const defaultSitePages: SitePage[] = [
  {
    slug: 'about',
    title: 'About ZION Pickleball',
    published: true,
    body:
      'ZION Pickleball — premium pickleball equipment for players across the Philippines. Content managed in admin.',
  },
  {
    slug: 'faq',
    title: 'FAQ',
    published: true,
    body:
      'Grip sizing, shipping via J&T at checkout, and returns are handled manually by our team. Expand answers in /admin/content.',
  },
  {
    slug: 'legal',
    title: 'Legal',
    published: true,
    body: 'Terms, privacy, and return policy to be supplied by admin before launch.',
  },
]

export const defaultSiteSections: SiteSection[] = [
  {
    sectionKey: 'announcement',
    label: 'Top announcement bar',
    headline:
      'Free J&T shipping on orders over ₱8,000 · Five Tempo Pro colorways in stock · Manual GCash & Maya checkout',
    subheadline: 'Shop paddles',
    body: '/collections',
    published: true,
    sortOrder: 5,
  },
  {
    sectionKey: 'hero',
    label: 'Home hero',
    headline: 'Play faster.',
    subheadline: 'Feel lighter.',
    posterUrl: dayoSiteMedia.hero.poster,
    videoUrl: dayoSiteMedia.hero.video,
    altText: dayoSiteMedia.hero.alt,
    published: true,
    sortOrder: 10,
    extra: { homeProductSlug: DEFAULT_HOME_HERO_SLUG },
  },
  {
    sectionKey: 'editorial',
    label: 'Statement',
    headline: 'Play faster.',
    subheadline: 'Feel lighter.',
    body: 'Premium pickleball gear for courts that never sleep.',
    published: true,
    sortOrder: 20,
  },
  {
    sectionKey: 'colorwayShowcase',
    label: 'Colorway showcase',
    headline: 'Pick your court energy.',
    posterUrl: dayoSiteMedia.colorwayShowcase?.poster,
    videoUrl: dayoSiteMedia.colorwayShowcase?.video,
    altText: dayoSiteMedia.colorwayShowcase?.alt,
    published: true,
    sortOrder: 30,
  },
  {
    sectionKey: 'macro',
    label: 'Macro detail',
    headline: 'Built for the next rally.',
    posterUrl: dayoSiteMedia.macro?.poster,
    videoUrl: dayoSiteMedia.macro?.video,
    altText: dayoSiteMedia.macro?.alt,
    published: true,
    sortOrder: 40,
  },
]