import type { Product } from '../../types/commerce'
import { dayoColorwayAssets, heroGraphiteProduct } from '../media/dayoMedia'

const img = (key: string) =>
  dayoColorwayAssets[key]?.heroImage ??
  dayoColorwayAssets[key]?.poster ??
  dayoColorwayAssets[key]?.image ??
  '/assets/dayo/01_graphite_volt.jpg'

export const flagshipProduct: Product = {
  id: 'zion-tempo-pro',
  slug: 'zion-tempo-pro',
  name: 'Zion Tempo Pro',
  subtitle: 'Built for the next rally.',
  description:
    'Carbon face, control core, and an edge guard you can feel on every dink. The flagship paddle for players who live on the kitchen line.',
  pricePhp: 8990,
  compareAtPhp: 10490,
  collectionSlugs: ['pro-series'],
  hero: true,
  weightGrams: 230,
  images: [img('signal-coral'), heroGraphiteProduct.onBlack],
  colorways: [
    {
      id: 'coral-volt',
      slug: 'graphite-volt',
      name: 'Graphite / Volt',
      tagline: 'Bright on dawn courts',
      hex: '#c8f135',
      voltHex: '#141414',
      image: img('coral-volt'),
    },
    {
      id: 'signal-coral',
      slug: 'signal-orange',
      name: 'Signal Orange',
      tagline: 'All in, all energy',
      hex: '#ff5a2a',
      image: img('signal-coral'),
    },
    {
      id: 'volt-graphite',
      slug: 'volt-lime',
      name: 'Volt Lime',
      tagline: 'Tournament pace, every day',
      hex: '#d4ff00',
      voltHex: '#1f6b4e',
      image: img('volt-graphite'),
    },
    {
      id: 'cobalt-rush',
      slug: 'cobalt-rush',
      name: 'Cobalt Rush',
      tagline: 'Quiet until you accelerate',
      hex: '#1e4fd9',
      voltHex: '#ff5a2a',
      image: img('cobalt-rush'),
    },
    {
      id: 'lavender-coral',
      slug: 'lavender-coral',
      name: 'Lavender Coral',
      tagline: 'Sunset court energy',
      hex: '#b794f6',
      voltHex: '#ff7f6a',
      image: img('lavender-coral'),
    },
  ],
  gripSizes: [
    { id: 'g4', label: '4¼ in', circumferenceCm: '10.8 cm' },
    { id: 'g4-1-8', label: '4⅛ in', circumferenceCm: '10.5 cm' },
    { id: 'g4-3-8', label: '4⅜ in', circumferenceCm: '11.1 cm', soldOut: true },
    { id: 'g4-1-2', label: '4½ in', circumferenceCm: '11.4 cm' },
  ],
  specs: [
    { label: 'Face', value: 'Textured carbon T700' },
    { label: 'Core', value: '16mm polymer honeycomb' },
    { label: 'Edge', value: 'Protective TPU guard' },
    { label: 'Weight', value: '230 g ± 5' },
  ],
  features: [
    {
      index: '01',
      title: 'Engineered carbon face',
      body: 'Textured surface for spin on drops and resets.',
      image: '/assets/dayo/feature-tech-01.png',
    },
    {
      index: '02',
      title: 'Wave-cut control core',
      body: 'Soft touch, quick pop. The chamber saves swing weight.',
      image: '/assets/dayo/feature-tech-02.png',
    },
    {
      index: '03',
      title: 'Translucent edge guard',
      body: 'Chevron-pattern guard you can see wearing in.',
      image: '/assets/dayo/feature-tech-03.png',
    },
  ],
}