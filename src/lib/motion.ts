import { useReducedMotion } from 'motion/react'

export const springTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
}

export const easeOut = [0.22, 1, 0.36, 1] as const

export function useMotionTransition() {
  const reduce = useReducedMotion()
  if (reduce) {
    return { duration: 0 }
  }
  return springTransition
}

export const fadeUp = (reduce: boolean) => ({
  initial: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: reduce ? { duration: 0 } : { duration: 0.45, ease: easeOut },
})