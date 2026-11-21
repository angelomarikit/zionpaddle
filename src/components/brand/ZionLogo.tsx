import { Link } from 'react-router-dom'

const LOGO_SRC = '/assets/zion/logo.png'

export type ZionLogoSurface = 'dark' | 'light'
export type ZionLogoVariant = 'nav' | 'lockup'

const variantClass: Record<ZionLogoVariant, string> = {
  /** Full lockup in nav — Z, wordmark, Top Tier Brand, stars (no crop) */
  nav: 'h-[4.25rem] w-auto max-w-[5.5rem] object-contain object-center',
  /** Login / marketing */
  lockup: 'h-36 w-auto max-w-[240px] object-contain object-center',
}

const surfaceClass: Record<ZionLogoSurface, string> = {
  /**
   * Gold art on ink/charcoal — lighten removes black matte; soft gold glow.
   */
  dark: 'mix-blend-lighten brightness-[1.08] contrast-[1.06] drop-shadow-[0_4px_24px_rgba(255,190,60,0.45)]',
  /**
   * Cream/white admin panels — deepen shadow so metallics read clearly.
   */
  light:
    'mix-blend-multiply brightness-[0.98] contrast-[1.12] saturate-[1.08] drop-shadow-[0_6px_18px_rgba(20,20,20,0.18)]',
}

type Props = {
  surface?: ZionLogoSurface
  variant?: ZionLogoVariant
  className?: string
  /** Screen-reader label; decorative hero marks use empty alt when aria-hidden on wrapper */
  alt?: string
  to?: string
  decorative?: boolean
}

export function ZionLogo({
  surface = 'dark',
  variant = 'nav',
  className = '',
  alt = 'ZION',
  to,
  decorative = false,
}: Props) {
  const img = (
    <img
      src={LOGO_SRC}
      alt={decorative ? '' : alt}
      width={variant === 'nav' ? 88 : 320}
      height={variant === 'nav' ? 68 : 300}
      className={`block select-none ${variantClass[variant]} ${surfaceClass[surface]} ${className}`.trim()}
      decoding="async"
    />
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex shrink-0 items-center focus-visible:outline-offset-4" aria-label={alt}>
        {img}
      </Link>
    )
  }

  return img
}