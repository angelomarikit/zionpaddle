import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { SectionShell } from '../tempo/SectionShell'
import { VariantLab } from '../product/VariantLab'
import { ProductCard } from '../product/ProductCard'
import { Accordion } from '../ui/Accordion'
import { Button } from '../ui/Button'
import { flagshipProduct } from '../../data/mock/flagship'
import { collections } from '../../data/mock/collections'
import { getProductsByCollection, products, formatPhp } from '../../data/mock/products'
import { dayoColorwayAssets, dayoSiteMedia } from '../../data/media/dayoMedia'
import {
  findGoldenAuraProduct,
  HOME_CATALOG_PREVIEW_LIMIT,
  resolveHomeHeroProduct,
} from '../../lib/catalog/homeHero'
import type { Collection } from '../../types/commerce'
import {
  catalogProductImage,
  isDemoCatalogProduct,
  liveCatalogProducts,
  liveProductsInCollection,
  transparentHeroCutout,
} from '../../lib/catalog/customProduct'
import { useCatalog } from '../../hooks/useCatalog'
import { useSiteContent } from '../../hooks/useSiteContent'
import { ProductVideo } from '../media/ProductVideo'
import { ContentRail } from '../layout/ContentRail'
import { useState } from 'react'

const faqItems = [
  {
    id: 'fit',
    title: 'How does the Tempo Pro grip fit?',
    content:
      'Standard grip suits most players. Choose cushioned if you prefer extra tape, or narrow if you like a slimmer handle.',
  },
  {
    id: 'level',
    title: 'Is it for beginners or tour players?',
    content: 'The Pro is tuned for competitive play; see Beginner Joy for lighter, more forgiving options.',
  },
  {
    id: 'ship',
    title: 'How long does shipping take?',
    content:
      'J&T rates are quoted at checkout once configured. Tracking is added manually after staff books your parcel.',
  },
  {
    id: 'return',
    title: 'Can I return my paddle?',
    content: 'Return policy will be published in Legal. Contact support for RMA once orders are live.',
  },
]

export function EditorialStatementSection() {
  const { editorial } = useSiteContent()
  const headline = editorial?.headline ?? 'Play faster.'
  const accent = editorial?.subheadline ?? 'Feel lighter.'
  const body = editorial?.body ?? 'Premium pickleball gear for courts that never sleep.'

  return (
    <section className="full-bleed border-y border-black/10 bg-surface-cream text-surface-ink">
      <ContentRail wide className="grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream-muted md:col-span-2">(02) Statement</p>
        <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight md:col-span-10">
          {headline}
          <span className="block text-accent-coral">{accent}</span>
          <span className="mt-2 block text-2xl font-semibold text-cream-muted md:text-3xl">{body}</span>
        </h2>
      </ContentRail>
    </section>
  )
}

export function VariantLabSection() {
  const { products } = useCatalog()
  const { sections } = useSiteContent()
  const heroSection = sections.find((s) => s.sectionKey === 'hero')
  const heroProduct =
    findGoldenAuraProduct(products) ?? resolveHomeHeroProduct(products, heroSection) ?? flagshipProduct
  const demo = isDemoCatalogProduct(heroProduct.slug)
  const gripProduct = demo ? flagshipProduct : heroProduct
  const cutout = transparentHeroCutout(heroProduct, heroProduct.colorways[0])

  const [grip, setGrip] = useState(gripProduct.gripSizes[0]?.id ?? 'standard')
  const [unit, setUnit] = useState<'in' | 'cm'>('in')
  const [fit, setFit] = useState<'narrow' | 'true' | 'wide'>('true')
  const reduce = useReducedMotion()

  return (
    <SectionShell index="03" label="Grip" surface="cream" id="size" wide>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">Your grip, sorted.</h2>
          <div className="mt-10">
            <VariantLab
              gripSizes={gripProduct.gripSizes}
              selectedGrip={grip}
              onGripChange={setGrip}
              unit={unit}
              onUnitChange={setUnit}
              fit={fit}
              onFitChange={setFit}
            />
          </div>
        </div>
        <div className="relative flex min-h-[min(60vh,520px)] items-center justify-center overflow-hidden bg-surface-ink p-6 md:p-10">
          {cutout && !demo ? (
            <img
              src={cutout}
              alt={`${heroProduct.name} — grip reference`}
              className="max-h-[min(52vh,460px)] w-full max-w-[min(92%,400px)] object-contain mix-blend-lighten drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ProductVideo
              poster={dayoColorwayAssets['coral-volt']?.poster ?? '/assets/dayo/01_graphite_volt.jpg'}
              videoSrc={dayoColorwayAssets['coral-volt']?.video}
              alt="Zion Tempo Pro — grip reference"
              className="absolute inset-0 size-full [&_img]:object-contain [&_video]:object-contain"
              mediaFit="contain"
              autoPlayLoop={!reduce}
            />
          )}
        </div>
      </div>
    </SectionShell>
  )
}

function TechFeatureFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/[0.08] bg-surface-ink p-2.5 shadow-[0_24px_48px_rgba(0,0,0,0.35)] sm:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#efeae2] ring-1 ring-inset ring-white/[0.14]">
        <img src={src} alt={alt} className="size-full object-cover object-center" loading="lazy" />
      </div>
    </div>
  )
}

export function TechSection() {
  return (
    <SectionShell index="04" label="Tech" surface="ink" id="tech" wide>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold md:text-5xl">Three layers. One rally.</h2>
          <p className="mt-2 max-w-md text-ink-muted">Every part does one job, and does it light.</p>
        </div>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-10">
        {flagshipProduct.features.map((f) => (
          <article key={f.index} className="flex flex-col gap-4">
            <p className="font-mono text-xs text-white/50">({f.index})</p>
            <TechFeatureFrame src={f.image ?? ''} alt={f.title} />
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-ink-muted">{f.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}

export function ColourwaysSection() {
  const { products } = useCatalog()
  const lineup = liveCatalogProducts(products).slice(0, HOME_CATALOG_PREVIEW_LIMIT)

  return (
    <SectionShell index="05" label="Colourways" surface="cream" wide>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">
            {lineup.length ? 'From our catalog.' : 'Five colours. Same fast feel.'}
          </h2>
          <p className="mt-2 max-w-lg text-cream-muted">
            {lineup.length
              ? 'Live paddles from your shop — tap a card to open the product page.'
              : 'Flagship Tempo Pro colorways — tap a card to open the PDP.'}
          </p>
        </div>
        <Link to="/collections" className="text-sm font-semibold uppercase tracking-wide">
          Shop all
        </Link>
      </div>
      <div
        className={`mt-10 grid gap-6 sm:grid-cols-2 ${
          lineup.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-5'
        }`}
      >
        {lineup.length > 0
          ? lineup.map((p) => (
              <ProductCard key={p.id} product={p} showHoverVideo={false} imageFill={false} />
            ))
          : flagshipProduct.colorways.map((c) => (
              <ProductCard
                key={c.id}
                showHoverVideo={false}
                product={{
                  ...flagshipProduct,
                  subtitle: c.tagline,
                  colorways: [{ ...c }],
                }}
              />
            ))}
      </div>
    </SectionShell>
  )
}

export function CampaignShowcaseSection() {
  const reduce = useReducedMotion()
  const { siteMedia } = useSiteContent()
  const showcase = siteMedia.colorwayShowcase ?? dayoSiteMedia.colorwayShowcase
  if (!showcase?.video) return null

  return (
    <section id="showcase" className="full-bleed relative isolate overflow-hidden bg-surface-ink">
      <div className="relative min-h-[min(78vh,880px)] w-full bg-surface-ink sm:min-h-[min(82vh,920px)]">
        <ProductVideo
          poster={showcase.poster}
          videoSrc={showcase.video}
          alt={showcase.alt}
          className="absolute inset-0 size-full bg-surface-ink [&_img]:object-center [&_video]:object-center"
          mediaFit="contain"
          autoPlayLoop={!reduce}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-ink/95 via-surface-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <ContentRail className="pb-10 pt-16 md:pb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">(06) Showcase</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold md:text-5xl">Every colorway, one tempo.</h2>
            <p className="mt-2 max-w-lg text-sm text-white/75 md:text-base">
              Speed-line transitions between Graphite Volt, Signal Orange, Volt Lime, Cobalt Rush, and Lavender Coral.
            </p>
            <Button to="/products/zion-tempo-pro" variant="coral" className="mt-5 w-fit">
              Build your paddle
              <ArrowRight className="size-4" />
            </Button>
          </ContentRail>
        </div>
      </div>
    </section>
  )
}

export function LifestyleSection() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -48])

  return (
    <section
      id="lifestyle"
      ref={ref}
      className="full-bleed relative min-h-[85vh] overflow-hidden bg-accent-court"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={dayoColorwayAssets['signal-coral']?.poster ?? '/assets/dayo/02_signal_orange.png'}
          alt="Signal Orange paddle on court tones"
          className="size-full scale-110 object-cover opacity-30 mix-blend-luminosity"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-br from-surface-ink/80 via-accent-court/90 to-surface-ink/70" />
      <ContentRail className="relative flex min-h-[85vh] flex-col justify-end pb-20 pt-32">
        <p className="font-mono text-xs uppercase tracking-widest text-white/50">(07) Lifestyle</p>
        <h2 className="mt-4 max-w-3xl text-[clamp(2.25rem,6vw,4rem)] font-bold leading-tight">
          Made for early courts.
        </h2>
        <p className="mt-4 max-w-lg text-lg text-ink-muted">
          Dawn doubles, league nights, and everything between — designed for the Philippines club circuit.
        </p>
      </ContentRail>
    </section>
  )
}

const colorwayAssetKeys = [
  'coral-volt',
  'signal-coral',
  'volt-graphite',
  'cobalt-rush',
  'lavender-coral',
] as const

function productWithColorwayArt(product: (typeof products)[0], index: number) {
  if (product.hero) return product
  const key = colorwayAssetKeys[index % colorwayAssetKeys.length]
  const asset = dayoColorwayAssets[key]
  if (!asset) return product
  const c = product.colorways[0]
  return {
    ...product,
    colorways: [{ ...c, image: asset.heroImage ?? asset.poster, id: key }],
  }
}

function collectionTileFromLive(col: Collection, products: Product[]) {
  const inCollection = liveProductsInCollection(products, col.slug)
  const lead = inCollection[0]
  const heroImg = lead ? catalogProductImage(lead) : col.banner
  const fromPrice = inCollection.length
    ? Math.min(...inCollection.map((p) => p.pricePhp))
    : undefined
  return { col, heroImg, fromPrice, catalogArt: Boolean(lead) }
}

export function CollectionsTeaser() {
  const { products, collections: catalogCollections } = useCatalog()
  const live = liveCatalogProducts(products)
  const liveCollectionTiles = catalogCollections
    .map((col) => collectionTileFromLive(col, products))
    .filter((t) => t.fromPrice !== undefined)

  const hasLiveCollections = liveCollectionTiles.length > 0
  const productTiles = live.slice(0, 3).map((p) => ({
    key: p.id,
    to: `/products/${p.slug}`,
    title: p.name,
    description: p.subtitle ?? p.description.slice(0, 72),
    heroImg: catalogProductImage(p),
    fromPrice: p.pricePhp,
    label: 'Product',
  }))

  const mockTiles = collections.map((col, i) => {
    const preview = getProductsByCollection(col.slug).slice(0, 1)[0]
    const asset = [dayoColorwayAssets['cobalt-rush'], dayoColorwayAssets['lavender-coral'], dayoColorwayAssets['volt-graphite']][i]
    return {
      key: col.id,
      to: `/collections/${col.slug}`,
      title: col.name,
      description: col.description,
      heroImg: asset?.heroImage ?? asset?.poster ?? col.banner,
      fromPrice: preview?.pricePhp,
      label: 'Collection',
      catalogArt: false,
    }
  })

  const tiles = hasLiveCollections
    ? liveCollectionTiles.map(({ col, heroImg, fromPrice, catalogArt }) => ({
        key: col.id,
        to: `/collections/${col.slug}`,
        title: col.name,
        description: col.description,
        heroImg,
        fromPrice,
        label: 'Collection' as const,
        catalogArt,
      }))
    : live.length > 0
      ? productTiles.map((t) => ({ ...t, catalogArt: true }))
      : mockTiles

  return (
    <SectionShell surface="cream" label="Collections" index="08" wide>
      <h2 className="text-3xl font-bold md:text-4xl">Shop by line</h2>
      <p className="mt-2 max-w-lg text-cream-muted">
        {live.length
          ? 'Your live collections and paddles from the shop catalog.'
          : 'Three collections — one tempo. Dive into the full catalog.'}
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            to={tile.to}
            className="group flex flex-col overflow-hidden bg-surface-ink text-white shadow-md transition hover:shadow-2xl"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-ink">
              {tile.heroImg ? (
                <img
                  src={tile.heroImg}
                  alt={tile.title}
                  className={`size-full object-contain p-5 transition-transform duration-700 group-hover:scale-[1.04] ${
                    tile.catalogArt ? 'mix-blend-lighten' : ''
                  }`}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-ink to-transparent" />
            </div>
            <div className="relative border-t border-white/10 p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{tile.label}</p>
              <h3 className="mt-1 text-2xl font-bold">{tile.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-white/70">{tile.description}</p>
              {tile.fromPrice !== undefined && (
                <p className="mt-4 font-mono text-xs uppercase text-accent-volt">
                  From {formatPhp(tile.fromPrice)} →
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </SectionShell>
  )
}

export function BestSellersSection() {
  const { products } = useCatalog()
  const live = liveCatalogProducts(products)
  const featured =
    live.length > 0
      ? live.slice(0, HOME_CATALOG_PREVIEW_LIMIT)
      : getProductsByCollection('pro-series')
          .slice(0, HOME_CATALOG_PREVIEW_LIMIT)
          .map((p, i) => productWithColorwayArt(p, i))

  return (
    <SectionShell surface="ink" label="Featured" index="09" wide>
      <h2 className="text-3xl font-bold md:text-4xl">Courtside favorites</h2>
      <p className="mt-2 max-w-lg text-ink-muted">
        {live.length
          ? 'Live paddles from your catalog.'
          : 'Pro Series lineup — every card uses real ZION colorway art.'}
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {featured.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            surface="ink"
            showHoverVideo={false}
            imageFill={false}
          />
        ))}
      </div>
    </SectionShell>
  )
}

const blogPosts = [
  {
    title: 'Built with players who show up at 6am',
    excerpt: 'Community drops, league meetups, and grip-fit events across the Philippines.',
    to: '/about',
    image: '/assets/dayo/editorial-community.jpg',
    imagePosition: 'object-center',
    tag: 'Community',
  },
  {
    title: 'Find your fit in two taps',
    excerpt: 'Grip circumference, feel, and overgrip habits — how we size Tempo Pro.',
    to: '/products/zion-tempo-pro',
    image: '/assets/dayo/editorial-fit-guide.jpg',
    imagePosition: 'object-center',
    tag: 'Fit guide',
  },
  {
    title: 'Three layers, one rally',
    excerpt: 'Carbon face, honeycomb core, and edge guard — what each layer does.',
    to: '/#tech',
    image: '/assets/dayo/editorial-tech-layers.jpg',
    imagePosition: 'object-center',
    tag: 'Tech',
  },
] as const

export function BlogEditorialSection() {
  return (
    <SectionShell surface="cream" label="Journal" index="10" wide>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="text-3xl font-bold md:text-4xl">From the court</h2>
        <Link to="/about" className="text-sm font-semibold uppercase tracking-wide">
          Read more
        </Link>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.title}
            to={post.to}
            className="group flex flex-col overflow-hidden bg-surface-ink text-white"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1a]">
              {post.image ? (
                <img
                  src={post.image}
                  alt=""
                  className={`size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${post.imagePosition ?? 'object-center'}`}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-ink/40 via-transparent to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">{post.tag}</p>
              <h3 className="mt-2 text-xl font-bold leading-snug">{post.title}</h3>
              <p className="mt-2 flex-1 text-sm text-white/70">{post.excerpt}</p>
              <span className="mt-4 text-xs font-semibold uppercase text-accent-volt">Read story →</span>
            </div>
          </Link>
        ))}
      </div>
    </SectionShell>
  )
}

export function FitSection() {
  return (
    <SectionShell index="—" label="Fit" surface="ink" id="fit" compact>
      <h2 className="text-3xl font-bold">Find your fit in two taps.</h2>
      <p className="mt-2 text-ink-muted">Pick your usual grip, then tell us how handles feel in your hand.</p>
      <div className="mt-8">
        <Button to="/products/zion-tempo-pro" variant="coral">
          Open the grip guide
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </SectionShell>
  )
}

export function InTheBoxSection() {
  const items = [
    { n: '01', title: 'Zion Tempo Pro, one paddle' },
    { n: '02', title: 'Overgrip in chalk' },
    { n: '03', title: 'Reusable box and sleeve' },
  ]
  return (
    <SectionShell index="—" label="In the box" surface="box" compact>
      <h2 className="text-3xl font-bold">Everything for the first rally.</h2>
      <ul className="mt-10 space-y-6">
        {items.map((i) => (
          <li key={i.n} className="flex gap-6 border-t border-black/10 pt-6">
            <span className="font-mono text-sm">{i.n}</span>
            <h3 className="text-xl font-semibold">{i.title}</h3>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function FaqSection() {
  return (
    <SectionShell index="11" label="FAQ" surface="cream" id="fit" compact>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold">Questions, answered.</h2>
        <Link to="/faq" className="text-sm font-semibold uppercase">
          All questions
        </Link>
      </div>
      <div className="mt-8">
        <Accordion items={faqItems} />
      </div>
    </SectionShell>
  )
}

export function BuyBandSection() {
  return (
    <SectionShell surface="ink" index="—" label="Your paddle" compact>
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Five colours. Four grips. Play-ready.</h2>
          <p className="mt-2 text-ink-muted">{formatPhp(flagshipProduct.pricePhp)}</p>
        </div>
        <Button to="/products/zion-tempo-pro" variant="coral">
          Choose your grip
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </SectionShell>
  )
}