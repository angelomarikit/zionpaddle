export type DayoMediaKey =
  | 'hero'
  | 'colorwayShowcase'
  | 'macro'
  | 'product-graphite-volt'
  | 'product-signal-orange'
  | 'product-volt-lime'
  | 'product-cobalt-rush'
  | 'product-lavender-coral'

export type DayoMediaEntry = {
  poster: string
  video?: string
  alt: string
  hoverVideo?: string
}

const base = '/assets/dayo'
const mediaBase = '/media/dayo'

/** Higgsfield gpt_image_2 + bg removal — seamless #141414 hero (2026-11-20) */
export const heroGraphiteProduct = {
  transparent: `${base}/hero-graphite-volt-hero.png`,
  onBlack: `${base}/hero-graphite-volt-dark-b.png`,
  alt: 'Zion Tempo Pro Graphite Volt — hero cutout',
}

/** `heroImage` = transparent PNG for hero (no matte). `video` = cards/PDP only. */
export const dayoColorwayAssets: Record<
  string,
  { image: string; poster: string; video?: string; heroImage?: string }
> = {
  'coral-volt': {
    image: heroGraphiteProduct.onBlack,
    poster: heroGraphiteProduct.transparent,
    heroImage: heroGraphiteProduct.transparent,
    video: `${mediaBase}/product-graphite-volt.mp4`,
  },
  'signal-coral': {
    image: `${base}/hero-signal-orange-dark.png`,
    poster: `${base}/hero-signal-orange-hero.png`,
    heroImage: `${base}/hero-signal-orange-hero.png`,
    video: `${mediaBase}/product-signal-orange.mp4`,
  },
  'volt-graphite': {
    image: `${base}/hero-volt-lime-dark.png`,
    poster: `${base}/hero-volt-lime-hero.png`,
    heroImage: `${base}/hero-volt-lime-hero.png`,
    video: `${mediaBase}/product-volt-lime.mp4`,
  },
  'cobalt-rush': {
    image: `${base}/hero-cobalt-rush-dark.png`,
    poster: `${base}/hero-cobalt-rush-hero.png`,
    heroImage: `${base}/hero-cobalt-rush-hero.png`,
    video: `${mediaBase}/product-cobalt-rush.mp4`,
  },
  'lavender-coral': {
    image: `${base}/hero-lavender-coral-dark.png`,
    poster: `${base}/hero-lavender-coral-hero.png`,
    heroImage: `${base}/hero-lavender-coral-hero.png`,
    video: `${mediaBase}/product-lavender-coral.mp4`,
  },
}

export const dayoSiteMedia: {
  hero: DayoMediaEntry
  macro?: DayoMediaEntry
  colorwayShowcase?: DayoMediaEntry
} = {
  hero: {
    poster: heroGraphiteProduct.transparent,
    video: undefined,
    alt: heroGraphiteProduct.alt,
  },
  colorwayShowcase: {
    poster: heroGraphiteProduct.onBlack,
    video: `${mediaBase}/colorway-showcase.mp4`,
    alt: 'ZION paddle colorway showcase',
  },
  macro: {
    poster: heroGraphiteProduct.onBlack,
    video: `${mediaBase}/macro-graphite-volt.mp4`,
    alt: 'Macro detail of graphite volt paddle face',
  },
}

export function mediaUrlForColorway(slugOrId: string): string | undefined {
  return dayoColorwayAssets[slugOrId]?.video
}