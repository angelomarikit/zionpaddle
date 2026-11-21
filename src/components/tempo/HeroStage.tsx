import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Colorway, Product } from '../../types/commerce'
import { formatPhp } from '../../data/mock/products'
import { Button } from '../ui/Button'
import { springTransition } from '../../lib/motion'
import { dayoColorwayAssets } from '../../data/media/dayoMedia'
import { isDemoCatalogProduct, productHeroImage } from '../../lib/catalog/customProduct'
import { ContentRail } from '../layout/ContentRail'

type Props = {
  product: Product
  onColourChange?: (colorway: Colorway) => void
  onCta?: () => void
}

const floatCycle = {
  duration: 4.8,
  repeat: Infinity,
  ease: 'easeInOut' as const,
}

export function HeroStage({ product, onColourChange, onCta }: Props) {
  const [active, setActive] = useState(product.colorways[0])
  const reduce = useReducedMotion()
  const demo = isDemoCatalogProduct(product.slug)

  useEffect(() => {
    setActive(product.colorways[0])
  }, [product.id, product.colorways])

  const activeIndex = product.colorways.findIndex((c) => c.id === active.id)
  const assets = demo ? dayoColorwayAssets[active.id] : undefined

  const pick = (c: Colorway) => {
    setActive(c)
    onColourChange?.(c)
  }

  /** Transparent cutouts only — no hero MP4 (videos carry a gray studio matte). */
  const heroSrc = demo
    ? (assets?.heroImage ?? assets?.poster ?? active.image)
    : productHeroImage(product, active)

  return (
    <section className="full-bleed relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-surface-ink pt-[calc(var(--dayo-announcement-h,0px)+5rem)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-ink/30 via-surface-ink/80 to-surface-ink" />
        <div className="absolute inset-x-0 top-[4%] h-[45vh] bg-[radial-gradient(ellipse_at_center,rgba(200,241,53,0.12),transparent_72%)]" />
      </div>

      <ContentRail className="relative z-10 flex flex-1 flex-col pb-8 pt-6 md:pb-12 md:pt-10">
        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_minmax(0,0.5fr)] lg:gap-6">
          <div className="order-2 space-y-4 lg:order-1 lg:max-w-sm lg:self-end lg:pb-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Launch / 01</p>
            <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight">
              {product.name}.
              <span className="block text-white/80">{product.subtitle}</span>
            </h1>
            <p className="text-sm leading-relaxed text-ink-muted">{product.description.slice(0, 120)}…</p>
            <Button variant="coral" to={`/products/${product.slug}`} className="w-fit" onClick={onCta}>
              Shop {product.name}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>

          <div className="order-1 flex flex-col items-center justify-center gap-2 lg:order-2 lg:gap-3">
            {heroSrc ? (
              <motion.p
                aria-hidden
                className="pointer-events-none w-full select-none text-center font-display text-[clamp(3.25rem,18vw,11rem)] font-extrabold italic leading-[0.92] tracking-tight"
                animate={{ color: active.hex }}
                transition={reduce ? { duration: 0 } : { duration: 0.35 }}
              >
                ZION
              </motion.p>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="relative flex h-[min(54vh,620px)] w-full max-w-[min(94vw,520px)] items-center justify-center lg:max-w-[min(46vw,560px)]"
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={
                  reduce
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 1, scale: 1, y: [0, -12, 0] }
                }
                exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        opacity: springTransition,
                        scale: springTransition,
                        y: floatCycle,
                      }
                }
              >
                <img
                  src={heroSrc}
                  alt={`${product.name} — ${active.name}`}
                  className="size-full max-h-full object-contain bg-transparent drop-shadow-[0_28px_56px_rgba(0,0,0,0.55)]"
                  decoding="async"
                  fetchPriority="high"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-3 space-y-6 lg:self-end lg:pb-10 lg:text-right">
            <div>
              <p className="font-mono text-xs uppercase text-white/50">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(product.colorways.length).padStart(2, '0')}
              </p>
              {demo && product.colorways.length > 1 ? (
                <p className="text-xs uppercase tracking-widest text-white/50">Colourways</p>
              ) : null}
              <p className="mt-1 text-3xl font-bold">{formatPhp(product.pricePhp)}</p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              {demo && product.colorways.length > 1 ? (
                <>
                  <div className="flex flex-wrap gap-2 lg:justify-end" role="radiogroup" aria-label="Colourways">
                    {product.colorways.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={active.id === c.id}
                        className="size-11 rounded-full border-2 border-white/25 p-0.5 transition-transform hover:scale-105"
                        style={{
                          borderColor: active.id === c.id ? c.hex : undefined,
                          boxShadow: active.id === c.id ? `0 0 0 1px ${c.hex}` : undefined,
                        }}
                        onClick={() => pick(c)}
                      >
                        <span
                          className="block size-full rounded-full"
                          style={{
                            background: c.voltHex
                              ? `linear-gradient(135deg, ${c.hex} 50%, ${c.voltHex} 50%)`
                              : c.hex,
                          }}
                        />
                        <span className="sr-only">{c.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-xs uppercase tracking-widest text-white/70">{active.name}</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </ContentRail>

      <div className="relative z-10 border-t border-white/10">
        <ContentRail className="py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            Carbon face · 16mm core · USA Pickleball build
          </p>
        </ContentRail>
      </div>
    </section>
  )
}