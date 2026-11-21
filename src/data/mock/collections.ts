import type { Collection } from '../../types/commerce'

export const collections: Collection[] = [
  {
    id: 'pro-series',
    slug: 'pro-series',
    name: 'Pro Series',
    description: 'Tour-weight control for competitive players.',
    banner: '/placeholders/collection-pro.svg',
    productSlugs: [
      'zion-tempo-pro',
      'zion-edge-carbon',
      'zion-tempo-elite',
      'zion-court-master',
      'zion-midnight-spin',
    ],
  },
  {
    id: 'beginner-joy',
    slug: 'beginner-joy',
    name: 'Beginner Joy',
    description: 'Forgiving faces and lighter swings for new players.',
    banner: '/placeholders/collection-beginner.svg',
    productSlugs: [
      'zion-starter-play',
      'zion-soft-touch',
      'zion-family-fun',
      'zion-learn-16',
    ],
  },
  {
    id: 'lifestyle',
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'Courtside color and weekend doubles.',
    banner: '/placeholders/collection-lifestyle.svg',
    productSlugs: [
      'zion-sunset-rally',
      'zion-neon-dink',
      'zion-coast-weekend',
      'zion-volt-pop',
      'zion-pickle-party',
    ],
  },
]