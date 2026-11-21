import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  as?: 'div' | 'header' | 'footer'
  wide?: boolean
}

/** Readable inner column on a full-width canvas (TEMPO-style rail, fluid on ultra-wide). */
export function ContentRail({ children, className = '', as: Tag = 'div', wide }: Props) {
  return (
    <Tag
      className={`content-rail w-full ${wide ? 'content-rail--wide' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}