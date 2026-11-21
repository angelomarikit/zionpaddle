import { Star } from 'lucide-react'
import type { ProductReview } from '../../data/mock/reviews'

type Props = {
  average: number
  count: number
  reviews: ProductReview[]
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-4 ${
            value >= i - 0.25 ? 'fill-gold-600 text-gold-500' : 'fill-black/10 text-black/20'
          }`}
        />
      ))}
    </div>
  )
}

export function ProductReviews({ average, count, reviews }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-cream-muted">Reviews</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-4xl font-bold">{average.toFixed(1)}</span>
            <Stars value={average} />
          </div>
          <p className="mt-1 text-sm text-cream-muted">Based on {count} player ratings</p>
        </div>
      </div>
      <ul className="grid gap-6 md:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-sm border border-black/8 bg-white/60 p-5">
            <div className="flex items-center justify-between gap-2">
              <Stars value={r.rating} />
              <span className="font-mono text-xs text-cream-muted">{r.rating.toFixed(1)}</span>
            </div>
            <p className="mt-3 font-bold">{r.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-cream-muted">{r.body}</p>
            <p className="mt-4 text-xs font-medium">
              {r.author}
              <span className="font-normal text-cream-muted"> · {r.date}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}