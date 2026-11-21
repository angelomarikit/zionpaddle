import type { Colorway, Product } from '../../types/commerce'
import { dayoColorwayAssets } from '../media/dayoMedia'
import { flagshipProduct } from './flagship'

export type ColorwayAssetKey = keyof typeof dayoColorwayAssets

const colorwayArt = (key: ColorwayAssetKey, tagline: string): Colorway => {
  const asset = dayoColorwayAssets[key]
  const image =
    asset?.heroImage ?? asset?.poster ?? asset?.image ?? '/assets/dayo/01_graphite_volt.jpg'
  const presets: Record<ColorwayAssetKey, Omit<Colorway, 'image' | 'tagline'>> = {
    'coral-volt': {
      id: 'coral-volt',
      slug: 'graphite-volt',
      name: 'Graphite / Volt',
      hex: '#c8f135',
      voltHex: '#141414',
    },
    'signal-coral': {
      id: 'signal-coral',
      slug: 'signal-orange',
      name: 'Signal Orange',
      hex: '#ff5a2a',
    },
    'volt-graphite': {
      id: 'volt-graphite',
      slug: 'volt-lime',
      name: 'Volt Lime',
      hex: '#d4ff00',
      voltHex: '#1f6b4e',
    },
    'cobalt-rush': {
      id: 'cobalt-rush',
      slug: 'cobalt-rush',
      name: 'Cobalt Rush',
      hex: '#1e4fd9',
      voltHex: '#ff5a2a',
    },
    'lavender-coral': {
      id: 'lavender-coral',
      slug: 'lavender-coral',
      name: 'Lavender Coral',
      hex: '#b794f6',
      voltHex: '#ff7f6a',
    },
  }
  return { ...presets[key], tagline, image }
}

function mk(
  slug: string,
  name: string,
  tagline: string,
  price: number,
  collection: string,
  weight: number,
  artKey: ColorwayAssetKey,
  extras?: Partial<Pick<Product, 'compareAtPhp' | 'description'>>,
): Product {
  const cw = colorwayArt(artKey, tagline)
  return {
    id: slug,
    slug,
    name,
    subtitle: tagline,
    description:
      extras?.description ??
      `${name} pairs a ${cw.name} face with a ${weight} g build tuned for ${collection.replace('-', ' ')} play.`,
    pricePhp: price,
    compareAtPhp: extras?.compareAtPhp,
    collectionSlugs: [collection],
    weightGrams: weight,
    images: [cw.image],
    colorways: [cw],
    gripSizes: [
      { id: 'g4', label: '4¼ in', circumferenceCm: '10.8 cm' },
      { id: 'g4-1-8', label: '4⅛ in', circumferenceCm: '10.5 cm' },
    ],
    specs: [
      { label: 'Core', value: 'Polymer honeycomb' },
      { label: 'Weight', value: `${weight} g` },
      { label: 'Colourway', value: cw.name },
    ],
    features: flagshipProduct.features,
  }
}

const catalog: Product[] = [
  flagshipProduct,
  mk(
    'zion-edge-carbon',
    'Zion Edge Carbon',
    'Precision at the kitchen',
    7990,
    'pro-series',
    225,
    'cobalt-rush',
    { compareAtPhp: 8990 },
  ),
  mk('zion-tempo-elite', 'Zion Tempo Elite', 'Extra pop on drives', 9490, 'pro-series', 235, 'signal-coral'),
  mk('zion-court-master', 'Zion Court Master', 'Balanced all-court', 6990, 'pro-series', 228, 'volt-graphite'),
  mk(
    'zion-starter-play',
    'Zion Starter Play',
    'First paddle confidence',
    3490,
    'beginner-joy',
    210,
    'lavender-coral',
  ),
  mk('zion-soft-touch', 'Zion Soft Touch', 'Gentle on the arm', 2990, 'beginner-joy', 205, 'coral-volt'),
  mk('zion-family-fun', 'Zion Family Fun', 'Weekend doubles ready', 2790, 'beginner-joy', 200, 'signal-coral'),
  mk('zion-learn-16', 'Zion Learn 16', 'Lightweight learning', 2590, 'beginner-joy', 198, 'volt-graphite'),
  mk('zion-sunset-rally', 'Zion Sunset Rally', 'Golden hour courts', 4590, 'lifestyle', 220, 'lavender-coral'),
  mk('zion-neon-dink', 'Zion Neon Dink', 'Night league energy', 4890, 'lifestyle', 222, 'coral-volt'),
  mk('zion-coast-weekend', 'Zion Coast Weekend', 'Beach club casual', 4290, 'lifestyle', 218, 'cobalt-rush'),
  mk('zion-volt-pop', 'Zion Volt Pop', 'Bold volt accents', 5190, 'lifestyle', 224, 'volt-graphite'),
  mk(
    'zion-midnight-spin',
    'Zion Midnight Spin',
    'Spin-first control core',
    5990,
    'pro-series',
    232,
    'coral-volt',
  ),
  mk(
    'zion-pickle-party',
    'Zion Pickle Party',
    'Color for club nights',
    3890,
    'lifestyle',
    215,
    'signal-coral',
  ),
]

export const products = catalog

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCollection(slug: string): Product[] {
  return products.filter((p) => p.collectionSlugs.includes(slug))
}

export function formatPhp(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
}