import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../hooks/useCatalog'
import { ProductCard } from '../components/product/ProductCard'
import { SectionShell } from '../components/tempo/SectionShell'
import { ContentRail } from '../components/layout/ContentRail'
import { dayoSiteMedia } from '../data/media/dayoMedia'
import { useSiteContent } from '../hooks/useSiteContent'
import { ProductVideo } from '../components/media/ProductVideo'
import { useReducedMotion } from 'motion/react'

type Sort = 'price-asc' | 'price-desc' | 'name'

export function CollectionsPage() {
  const { products, collections } = useCatalog()
  const [sort, setSort] = useState<Sort>('name')
  const reduce = useReducedMotion()
  const { siteMedia } = useSiteContent()
  const hero = siteMedia.hero ?? dayoSiteMedia.hero

  const list = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sort === 'price-asc') return a.pricePhp - b.pricePhp
      if (sort === 'price-desc') return b.pricePhp - a.pricePhp
      return a.name.localeCompare(b.name)
    })
  }, [sort, products])

  return (
    <>
      <section className="full-bleed relative min-h-[42vh] bg-surface-ink pt-24">
        {hero.video ? (
          <ProductVideo
            poster={hero.poster}
            videoSrc={hero.video}
            alt=""
            className="absolute inset-0 opacity-25 [&_video]:object-cover"
            autoPlayLoop={!reduce}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-ink via-surface-ink/85 to-surface-ink/50" />
        <ContentRail wide className="relative flex min-h-[36vh] flex-col justify-center py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">(Shop)</p>
          <h1 className="mt-2 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-tight">
            Paddles for every line.
          </h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            Every live paddle in the catalog — new admin products appear here automatically.
          </p>
        </ContentRail>
      </section>

      <SectionShell surface="cream" compact className="!pt-8">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <p className="text-sm text-cream-muted">
            <span className="font-semibold text-surface-ink">{list.length}</span> products in the shop
          </p>
          <label className="text-sm font-medium">
            Sort
            <select
              className="ml-2 rounded border border-black/20 bg-white px-2 py-1"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="name">Name</option>
              <option value="price-asc">Price low</option>
              <option value="price-desc">Price high</option>
            </select>
          </label>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} showHoverVideo={false} showCommerceActions />
          ))}
        </div>
      </SectionShell>

      <SectionShell surface="ink" compact>
        <h2 className="text-2xl font-bold">Collections</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                to={`/collections/${c.slug}`}
                className="block rounded-sm border border-white/10 p-5 transition hover:border-accent-volt"
              >
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{c.description}</p>
                <p className="mt-3 text-xs uppercase text-white/50">View collection →</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-ink-muted">
          Not sure about grip?{' '}
          <Link to="/products/zion-tempo-pro" className="underline">
            Open the grip guide
          </Link>
        </p>
      </SectionShell>
    </>
  )
}