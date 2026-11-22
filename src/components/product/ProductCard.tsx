import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../types/commerce'
import { formatPhp } from '../../data/mock/products'
import { dayoColorwayAssets } from '../../data/media/dayoMedia'
import {
  catalogProductImage,
  decodeHtmlEntities,
  isDemoCatalogProduct,
  isLikelyPngMatteUrl,
  primaryProductImage,
  productHeroImage,
} from '../../lib/catalog/customProduct'
import { ProductVideo } from '../media/ProductVideo'
import { Button } from '../ui/Button'
import { useCart } from '../../context/CartContext'

type Props = {
  product: Product
  surface?: 'ink' | 'cream'
  showHoverVideo?: boolean
  /** Edge-to-edge media in the card frame */
  imageFill?: boolean
  /** Collections: swatches + add to bag below price */
  showCommerceActions?: boolean
}

export function ProductCard({
  product,
  surface = 'cream',
  showHoverVideo = true,
  imageFill = true,
  showCommerceActions = false,
}: Props) {
  const colorways = product.colorways.filter((c) => c.id !== 'default' || product.colorways.length === 1)
  const showSwatches = isDemoCatalogProduct(product.slug) && colorways.length > 1
  const [colorwayId, setColorwayId] = useState(product.colorways[0]?.id ?? '')

  useEffect(() => {
    setColorwayId(product.colorways[0]?.id ?? '')
  }, [product.id, product.colorways])
  const colorway = useMemo(
    () => colorways.find((c) => c.id === colorwayId) ?? colorways[0],
    [colorways, colorwayId],
  )
  const reduce = useReducedMotion()
  const { addLine } = useCart()

  const demo = isDemoCatalogProduct(product.slug)
  const assets = demo && colorway ? dayoColorwayAssets[colorway.id] : undefined
  const cutout = demo ? (assets?.heroImage ?? assets?.poster) : undefined
  const catalogArt = !demo
  const poster = demo
    ? cutout ?? productHeroImage(product, colorway) ?? ''
    : catalogProductImage(product) || productHeroImage(product, colorway) || ''
  const displayName = decodeHtmlEntities(product.name)
  const displaySubtitle = decodeHtmlEntities(product.subtitle ?? colorway?.tagline ?? '')
  const hasCutout = Boolean(demo && cutout)
  const hasUpload = Boolean(primaryProductImage(product))
  const matteKnockout = catalogArt && Boolean(poster) && isLikelyPngMatteUrl(poster)
  const text = surface === 'ink' ? 'text-white' : 'text-surface-ink'
  const muted = surface === 'ink' ? 'text-white/60' : 'text-cream-muted'
  const frameBg = surface === 'ink' ? 'bg-surface-ink' : 'bg-surface-cream'
  /** Same studio tile on shop + home (ink or cream sections). */
  const studioFrame = 'bg-[#dedbd6] ring-1 ring-inset ring-black/[0.06]'
  const allowHoverVideo = showHoverVideo && !hasCutout
  const fit = hasCutout || hasUpload || catalogArt || !demo ? 'contain' : imageFill ? 'cover' : 'contain'

  const addToBag = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!colorway) return
    const grip = product.gripSizes.find((g) => !g.soldOut) ?? product.gripSizes[0]
    if (!grip || grip.soldOut) return
    addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      gripSizeId: grip.id,
      gripSizeLabel: grip.label,
      pricePhp: product.pricePhp,
      image: poster,
      quantity: 1,
    })
  }

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6 }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
      className="group flex h-full flex-col"
    >
      <Link
        to={`/products/${product.slug}`}
        className={`flex flex-1 flex-col ${text}`}
      >
        <div
          className={`relative aspect-[3/4] w-full overflow-hidden ${
            catalogArt ? studioFrame : imageFill ? frameBg : surface === 'ink' ? 'bg-white/5' : 'bg-surface-cream'
          }`}
        >
          {poster ? (
            <div
              className={`flex size-full items-center justify-center ${
                catalogArt ? 'p-5 md:p-6' : hasCutout || hasUpload ? 'p-3 md:p-4' : imageFill ? '' : 'p-4'
              }`}
            >
              <div
                className={
                  catalogArt
                    ? 'relative aspect-[4/5] h-[min(78%,280px)] w-[min(88%,100%)] max-w-[220px] sm:max-w-[240px]'
                    : 'size-full'
                }
              >
                <ProductVideo
                  poster={poster}
                  videoSrc={
                    allowHoverVideo && demo
                      ? assets?.video ?? dayoColorwayAssets[colorway?.id ?? '']?.video
                      : undefined
                  }
                  alt={displayName}
                  className={`bg-transparent transition-transform duration-500 group-hover:scale-[1.03] ${
                    catalogArt ? 'absolute inset-0 size-full' : 'size-full'
                  } ${imageFill && demo && !hasCutout ? 'scale-[1.08]' : ''} ${
                    matteKnockout ? '[&_img]:mix-blend-lighten [&_video]:mix-blend-lighten' : ''
                  } [&_img]:size-full [&_img]:object-contain [&_video]:size-full [&_video]:object-contain [&_img]:bg-transparent [&_video]:bg-transparent`}
                  mediaFit={fit}
                  playOnHover={allowHoverVideo}
                />
              </div>
            </div>
          ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-xs uppercase tracking-widest text-cream-muted">
              Add a product image in admin
            </div>
          )}
        </div>
        <div className={`space-y-1.5 pt-4 ${surface === 'ink' ? '' : 'bg-surface-cream'}`}>
          <p className="text-xs uppercase tracking-widest opacity-60">{displayName}</p>
          <h3 className="text-xl font-bold">
            {demo ? decodeHtmlEntities(colorway?.name ?? product.name) : displayName}
          </h3>
          <p className={`text-sm ${muted}`}>{displaySubtitle}</p>
          <p className="text-lg font-semibold">{formatPhp(product.pricePhp)}</p>
        </div>
      </Link>

      {showCommerceActions ? (
        <div className="mt-3 flex items-center gap-3 border-t border-black/10 pt-3">
          {showSwatches && colorways.length > 1 ? (
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5" role="radiogroup" aria-label="Colour">
              {colorways.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={colorwayId === c.id}
                  aria-label={c.name}
                  className="size-9 shrink-0 rounded-full border-2 border-black/15 p-0.5 transition-transform hover:scale-105"
                  style={{
                    borderColor: colorwayId === c.id ? c.hex : undefined,
                    boxShadow: colorwayId === c.id ? `0 0 0 1px ${c.hex}` : undefined,
                  }}
                  onClick={() => setColorwayId(c.id)}
                >
                  <span
                    className="block size-full rounded-full"
                    style={{
                      background: c.voltHex
                        ? `linear-gradient(135deg, ${c.hex} 50%, ${c.voltHex} 50%)`
                        : c.hex,
                    }}
                  />
                </button>
              ))}
            </div>
          ) : demo && colorway ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className="size-8 shrink-0 rounded-full border-2 border-black/15 p-0.5"
                style={{
                  borderColor: colorway.hex,
                  boxShadow: `0 0 0 1px ${colorway.hex}`,
                }}
              >
                <span
                  className="block size-full rounded-full"
                  style={{
                    background: colorway.voltHex
                      ? `linear-gradient(135deg, ${colorway.hex} 50%, ${colorway.voltHex} 50%)`
                      : colorway.hex,
                  }}
                />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide">{colorway.name}</span>
            </div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}
          <Button
            type="button"
            variant="coral"
            className="shrink-0 px-3 py-2 text-[10px] leading-tight sm:text-xs"
            onClick={addToBag}
          >
            Add to bag
          </Button>
        </div>
      ) : null}
    </motion.article>
  )
}