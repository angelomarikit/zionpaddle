import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../types/commerce'
import { formatPhp } from '../../data/mock/products'
import { dayoColorwayAssets } from '../../data/media/dayoMedia'
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
  const colorways = product.colorways
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

  const assets = colorway ? dayoColorwayAssets[colorway.id] : undefined
  const cutout = assets?.heroImage ?? assets?.poster
  const poster = cutout ?? colorway?.image ?? ''
  const hasCutout = Boolean(cutout)
  const text = surface === 'ink' ? 'text-white' : 'text-surface-ink'
  const muted = surface === 'ink' ? 'text-white/60' : 'text-cream-muted'
  const frameBg = surface === 'ink' ? 'bg-surface-ink' : 'bg-surface-cream'
  const allowHoverVideo = showHoverVideo && !hasCutout
  const fit = hasCutout ? 'contain' : imageFill ? 'cover' : 'contain'

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
          className={`relative aspect-[3/4] w-full overflow-hidden ${imageFill ? frameBg : surface === 'ink' ? 'bg-white/5' : 'bg-surface-cream'}`}
        >
          <ProductVideo
            poster={poster}
            videoSrc={
              allowHoverVideo ? assets?.video ?? dayoColorwayAssets[colorway?.id ?? '']?.video : undefined
            }
            alt={`${product.name} — ${colorway?.name ?? ''}`}
            className={`size-full bg-transparent transition-transform duration-500 group-hover:scale-[1.03] ${
              hasCutout ? 'p-3 md:p-4' : imageFill ? 'scale-[1.08]' : 'p-4'
            } [&_img]:bg-transparent [&_video]:bg-transparent`}
            mediaFit={fit}
            playOnHover={allowHoverVideo}
          />
        </div>
        <div className={`space-y-1.5 pt-4 ${surface === 'ink' ? '' : 'bg-surface-cream'}`}>
          <p className="text-xs uppercase tracking-widest opacity-60">{product.name}</p>
          <h3 className="text-xl font-bold">{colorway?.name ?? product.colorways[0]?.name}</h3>
          <p className={`text-sm ${muted}`}>{product.subtitle ?? colorway?.tagline}</p>
          <p className="text-lg font-semibold">{formatPhp(product.pricePhp)}</p>
        </div>
      </Link>

      {showCommerceActions ? (
        <div className="mt-3 flex items-center gap-3 border-t border-black/10 pt-3">
          {colorways.length > 1 ? (
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
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className="size-8 shrink-0 rounded-full border-2 border-black/15 p-0.5"
                style={{
                  borderColor: colorway?.hex,
                  boxShadow: colorway ? `0 0 0 1px ${colorway.hex}` : undefined,
                }}
              >
                <span
                  className="block size-full rounded-full"
                  style={{
                    background: colorway?.voltHex
                      ? `linear-gradient(135deg, ${colorway.hex} 50%, ${colorway.voltHex} 50%)`
                      : colorway?.hex,
                  }}
                />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide">{colorway?.name}</span>
            </div>
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