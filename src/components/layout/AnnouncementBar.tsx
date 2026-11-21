import { Link } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import type { SiteSection } from '../../types/siteCms'

type Props = {
  section?: SiteSection
}

export function AnnouncementBar({ section }: Props) {
  const reduce = useReducedMotion()
  if (!section?.published || !section.headline?.trim()) return null

  const text = section.headline.trim()
  const href = section.body?.trim()
  const linkLabel = section.subheadline?.trim()
  const isInternal = href?.startsWith('/')

  const chunk = (
    <span className="inline-flex shrink-0 items-center gap-8 px-8">
      <span>{text}</span>
      {href && linkLabel ? (
        isInternal ? (
          <Link to={href} className="underline underline-offset-2">
            {linkLabel}
          </Link>
        ) : (
          <a href={href} className="underline underline-offset-2" rel="noopener noreferrer">
            {linkLabel}
          </a>
        )
      ) : null}
    </span>
  )

  return (
    <div
      role="region"
      aria-label="Store announcement"
      className="h-8 w-full overflow-hidden border-b border-black/10 bg-accent-volt text-surface-ink"
    >
      {reduce ? (
        <div className="flex h-full items-center justify-center gap-3 px-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em]">
          <span className="truncate">{text}</span>
          {href && linkLabel ? (
            isInternal ? (
              <Link to={href} className="shrink-0 underline">
                {linkLabel}
              </Link>
            ) : (
              <a href={href} className="shrink-0 underline" rel="noopener noreferrer">
                {linkLabel}
              </a>
            )
          ) : null}
        </div>
      ) : (
        <div className="announcement-marquee flex h-full items-center">
          <div className="announcement-marquee-track flex">
            {chunk}
            {chunk}
            {chunk}
            {chunk}
          </div>
        </div>
      )}
    </div>
  )
}