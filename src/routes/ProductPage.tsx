import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Star, X, ZoomIn } from 'lucide-react'
import { formatPhp } from '../data/mock/products'
import { findProductBySlug, useCatalog } from '../hooks/useCatalog'
import { getProductReviews } from '../data/mock/reviews'
import { NotFoundPage } from './NotFoundPage'
import { VariantSwatches } from '../components/product/VariantSwatches'
import { VariantLab } from '../components/product/VariantLab'
import { ProductCard } from '../components/product/ProductCard'
import { ProductReviews } from '../components/product/ProductReviews'
import { SectionShell } from '../components/tempo/SectionShell'
import { Button } from '../components/ui/Button'
import { useCart } from '../context/CartContext'
import { dayoColorwayAssets } from '../data/media/dayoMedia'
import { isDemoCatalogProduct, primaryProductImage, productHeroImage } from '../lib/catalog/customProduct'
import { productPageGalleryUrls } from '../lib/catalog/productGallery'
import type { Product } from '../types/commerce'

function productDetailCopy(product: Product): string[] {
  const collection = product.collectionSlugs[0]?.replace('-', ' ') ?? 'court'
  return [
    product.description,
    `${product.name} is tuned for ${collection} sessions — ${product.weightGrams} g in the hand with a polymer core that eats vibration on long kitchen rallies.`,
    'Carbon-derived face texture helps you shape drops and reload pace on counters without chasing a new grip every season.',
  ]
}

export function ProductPage() {
  const { slug } = useParams()
  const { products, isLoading: catalogLoading } = useCatalog()
  const product = slug ? findProductBySlug(products, slug) : undefined
  const { addLine } = useCart()

  const [colorwayId, setColorwayId] = useState('')
  const [gripId, setGripId] = useState('')
  const [unit, setUnit] = useState<'in' | 'cm'>('in')
  const [fit, setFit] = useState<'narrow' | 'true' | 'wide'>('true')
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [fullscreenImage, setFullscreenImage] = useState(false)

  useEffect(() => {
    if (!product) return
    setColorwayId(product.colorways[0]?.id ?? '')
    setGripId(product.gripSizes.find((g) => !g.soldOut)?.id ?? product.gripSizes[0]?.id ?? '')
  }, [product])

  const colorway = useMemo(
    () => product?.colorways.find((c) => c.id === colorwayId) ?? product?.colorways[0],
    [product, colorwayId],
  )
  const grip = useMemo(
    () => product?.gripSizes.find((g) => g.id === gripId),
    [product, gripId],
  )

  const reviewMeta = useMemo(() => (slug ? getProductReviews(slug) : null), [slug])

  const demo = product ? isDemoCatalogProduct(product.slug) : false
  const assets = demo && colorway ? dayoColorwayAssets[colorway.id] : undefined
  const heroSrc =
    product && colorway
      ? demo
        ? (assets?.heroImage ?? assets?.poster ?? colorway.image)
        : productHeroImage(product, colorway) || primaryProductImage(product) || ''
      : ''
  const galleryUrls = useMemo(
    () => (product && heroSrc ? productPageGalleryUrls(product, heroSrc) : []),
    [product, heroSrc],
  )

  useEffect(() => {
    setGalleryIndex(0)
  }, [heroSrc])

  if (catalogLoading) {
    return (
      <SectionShell surface="cream" className="pt-28">
        <p className="text-cream-muted">Loading product…</p>
      </SectionShell>
    )
  }

  if (!product || !colorway || !grip) return <NotFoundPage />

  const mainImageSrc = galleryUrls[galleryIndex] ?? heroSrc

  const related = products
    .filter(
      (p) => p.slug !== product.slug && p.collectionSlugs.some((s) => product.collectionSlugs.includes(s)),
    )
    .slice(0, 4)

  const addToBag = () => {
    if (grip.soldOut) return
    addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      gripSizeId: grip.id,
      gripSizeLabel: grip.label,
      pricePhp: product.pricePhp,
      image: heroSrc,
    })
  }

  const detailParagraphs = productDetailCopy(product)

  return (
    <>
      <SectionShell surface="cream" className="pt-28" wide>
        <Link to="/collections" className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-muted">
          ← All paddles
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <button
              type="button"
              className="group relative flex w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-black/8 bg-gradient-to-b from-[#f8f5ef] via-surface-cream to-[#ebe6de] p-5 sm:min-h-[min(56vh,520px)] sm:p-8"
              onClick={() => setFullscreenImage(true)}
              aria-label="Enlarge product image"
            >
              <img
                src={mainImageSrc}
                alt={`${product.name} — ${colorway.name}`}
                className="max-h-[min(52vh,520px)] w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] sm:max-h-[min(58vh,600px)]"
                fetchPriority="high"
              />
              <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-black/10 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-surface-ink opacity-0 shadow-sm transition group-hover:opacity-100">
                <ZoomIn className="size-3.5" aria-hidden />
                Enlarge
              </span>
            </button>
            {galleryUrls.length > 1 ? (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Product images">
                {galleryUrls.map((url, i) => (
                  <li key={url}>
                    <button
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`overflow-hidden rounded-lg border-2 p-1 transition ${
                        galleryIndex === i ? 'border-accent-coral' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="size-16 object-contain sm:size-20" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream-muted">
              {product.collectionSlugs.join(' · ')}
            </p>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">{product.name}</h1>
            {!demo || colorway.id !== 'default' ? (
              <p className="mt-2 text-lg text-cream-muted">{colorway.name}</p>
            ) : null}
            {colorway.tagline ? <p className="mt-1 text-base italic text-cream-muted">{colorway.tagline}</p> : null}

            {reviewMeta ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <div className="flex gap-0.5" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        reviewMeta.average >= i - 0.25
                          ? 'fill-accent-volt text-accent-volt'
                          : 'fill-black/10 text-black/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{reviewMeta.average.toFixed(1)}</span>
                <span className="text-cream-muted">({reviewMeta.count} reviews)</span>
              </div>
            ) : null}

            <p className="mt-6 text-3xl font-bold">{formatPhp(product.pricePhp)}</p>
            {product.compareAtPhp ? (
              <p className="text-sm text-cream-muted line-through">{formatPhp(product.compareAtPhp)}</p>
            ) : null}

            <div className="mt-8 space-y-8">
              {product.colorways.length > 1 ? (
                <VariantSwatches
                  colorways={product.colorways}
                  value={colorwayId}
                  onChange={setColorwayId}
                />
              ) : demo ? (
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest opacity-60">Colour</p>
                  <p className="mt-2 text-sm font-semibold">{colorway.name}</p>
                </div>
              ) : null}
              <VariantLab
                gripSizes={product.gripSizes}
                selectedGrip={gripId}
                onGripChange={setGripId}
                unit={unit}
                onUnitChange={setUnit}
                fit={fit}
                onFitChange={setFit}
              />
            </div>

            <div className="sticky bottom-4 z-40 mt-8 lg:static">
              <Button
                variant="coral"
                className="w-full lg:w-auto"
                onClick={addToBag}
                disabled={grip.soldOut}
              >
                Add to bag — {formatPhp(product.pricePhp)}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </SectionShell>

      {fullscreenImage && mainImageSrc ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#e8e4dc] p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Product image full screen"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full border border-black/15 bg-white p-2 shadow-md"
            onClick={() => setFullscreenImage(false)}
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <img
            src={mainImageSrc}
            alt={`${product.name} — ${colorway.name}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : null}

      <SectionShell surface="cream" wide>
        <h2 className="text-2xl font-bold md:text-3xl">Description</h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-cream-muted">
          {detailParagraphs.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
      </SectionShell>

      {reviewMeta ? (
        <SectionShell surface="cream" wide>
          <ProductReviews
            average={reviewMeta.average}
            count={reviewMeta.count}
            reviews={reviewMeta.reviews}
          />
        </SectionShell>
      ) : null}

      <SectionShell surface="ink" index="03" label="Tech" wide>
        <h2 className="text-3xl font-bold">Three layers. One rally.</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {product.features.map((f) => (
            <li key={f.index} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-xs text-white/50">({f.index})</p>
              <h3 className="mt-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm text-ink-muted">{f.body}</p>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell surface="cream" wide>
        <h2 className="text-2xl font-bold">Specifications</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {product.specs.map((s) => (
            <div key={s.label} className="border-t border-black/10 pt-4">
              <dt className="text-xs font-semibold uppercase tracking-widest opacity-60">{s.label}</dt>
              <dd className="mt-1 text-lg font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell surface="cream" wide>
          <h2 className="text-2xl font-bold">More in this line</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} showHoverVideo={false} />
            ))}
          </div>
        </SectionShell>
      )}
    </>
  )
}