import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { IndexLabel } from './IndexLabel'
import { fadeUp } from '../../lib/motion'
import { ContentRail } from '../layout/ContentRail'

type Props = {
  index?: string
  label?: string
  surface?: 'ink' | 'cream' | 'box'
  children: ReactNode
  id?: string
  className?: string
  /** Wider readable column for editorial grids */
  wide?: boolean
  /** Section padding only — no inner motion wrapper */
  compact?: boolean
}

const surfaces = {
  ink: 'bg-surface-ink text-white',
  cream: 'bg-surface-cream text-surface-ink',
  box: 'bg-surface-box text-surface-ink',
}

export function SectionShell({
  index,
  label,
  surface = 'ink',
  children,
  id,
  className = '',
  wide,
  compact,
}: Props) {
  const reduce = useReducedMotion()
  const motionProps = fadeUp(!!reduce)

  return (
    <section id={id} className={`full-bleed ${surfaces[surface]} ${className}`}>
      {compact ? (
        <ContentRail wide={wide} className="py-12 md:py-16">
          {index && label ? (
            <div className="mb-8">
              <IndexLabel index={index} label={label} tone={surface === 'ink' ? 'ink' : 'cream'} />
            </div>
          ) : null}
          {children}
        </ContentRail>
      ) : (
        <ContentRail wide={wide} className="py-16 md:py-24">
          <motion.div {...motionProps}>
            {index && label ? (
              <div className="mb-8">
                <IndexLabel index={index} label={label} tone={surface === 'ink' ? 'ink' : 'cream'} />
              </div>
            ) : null}
            {children}
          </motion.div>
        </ContentRail>
      )}
    </section>
  )
}