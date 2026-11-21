export type ProductReview = {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
}

const reviewPool: Omit<ProductReview, 'id'>[] = [
  {
    author: 'Marco R.',
    rating: 5,
    title: 'Kitchen line confidence',
    body: 'Third game in and my drops finally sit where I want them. Grip feels true to size.',
    date: 'Oct 12, 2025',
  },
  {
    author: 'Jamie T.',
    rating: 4.8,
    title: 'Pop without the arm ache',
    body: 'Lighter than my old paddle but still plenty of punch on counters. Colourway is even better in person.',
    date: 'Sep 28, 2025',
  },
  {
    author: 'Sofia D.',
    rating: 4.9,
    title: 'Worth the upgrade',
    body: 'Edge guard has already taken a few court scrapes and still looks sharp. Fast shipping to Cebu.',
    date: 'Nov 3, 2025',
  },
  {
    author: 'Andre V.',
    rating: 4.7,
    title: 'Dialled for doubles',
    body: 'Partner noticed the difference on resets first session. I run a half-size up on overgrip — still balanced.',
    date: 'Aug 19, 2025',
  },
  {
    author: 'Priya M.',
    rating: 5,
    title: 'Morning league staple',
    body: 'Quiet at the kitchen, loud when I need to speed up. Tempo Pro set the bar; this one keeps up.',
    date: 'Oct 30, 2025',
  },
  {
    author: 'Luis K.',
    rating: 4.8,
    title: 'Clean spin on dinks',
    body: 'Face texture grabs just enough for shape without feeling gritty. Build quality feels tour-level.',
    date: 'Sep 5, 2025',
  },
]

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h
}

export function getProductReviews(slug: string): {
  average: number
  count: number
  reviews: ProductReview[]
} {
  const h = hashSlug(slug)
  const count = 24 + (h % 40)
  const pick = (offset: number) => reviewPool[(h + offset) % reviewPool.length]
  const reviews: ProductReview[] = [0, 1, 2, 3].map((i) => ({
    id: `${slug}-${i}`,
    ...pick(i),
    rating: i === 0 ? 5 : i === 1 ? 4.9 : i === 2 ? 4.8 : 4.7,
  }))
  const average =
    Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
  return { average, count, reviews }
}