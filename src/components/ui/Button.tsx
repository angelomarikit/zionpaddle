import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors'

const variants = {
  coral: 'bg-accent-coral text-surface-ink hover:brightness-110',
  ink: 'bg-surface-ink text-white border border-white/20 hover:border-white/50',
  ghost: 'bg-transparent text-inherit hover:bg-white/10',
} as const

type ButtonProps = {
  variant?: keyof typeof variants
  children: ReactNode
  to?: string
  href?: string
} & ComponentProps<'button'>

export function Button({
  variant = 'coral',
  children,
  className = '',
  to,
  href,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}