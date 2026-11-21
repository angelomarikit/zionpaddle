import { motion, useReducedMotion } from 'motion/react'
import type { GripSize } from '../../types/commerce'

type Fit = 'narrow' | 'true' | 'wide'

type Props = {
  gripSizes: GripSize[]
  selectedGrip: string
  onGripChange: (id: string) => void
  unit: 'in' | 'cm'
  onUnitChange: (unit: 'in' | 'cm') => void
  fit: Fit
  onFitChange: (fit: Fit) => void
}

export function VariantLab({
  gripSizes,
  selectedGrip,
  onGripChange,
  unit,
  onUnitChange,
  fit,
  onFitChange,
}: Props) {
  const reduce = useReducedMotion()

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {(['in', 'cm'] as const).map((u) => (
          <button
            key={u}
            type="button"
            className={`rounded-sm px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
              unit === u ? 'bg-surface-ink text-white' : 'bg-black/10'
            }`}
            onClick={() => onUnitChange(u)}
          >
            {u === 'in' ? 'Inches' : 'cm'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {gripSizes.map((g) => {
          const selected = selectedGrip === g.id
          const disabled = g.soldOut
          return (
            <motion.button
              key={g.id}
              type="button"
              disabled={disabled}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className={`rounded-sm border px-2 py-2 text-left font-mono text-xs ${
                disabled ? 'cursor-not-allowed opacity-40' : ''
              } ${selected ? 'border-accent-coral bg-white' : 'border-black/15 bg-white/50'}`}
              onClick={() => onGripChange(g.id)}
            >
              <span className="block text-xs font-semibold">{g.label}</span>
              <span className="text-[10px] opacity-60">
                {unit === 'cm' ? g.circumferenceCm : g.label}
              </span>
              {disabled ? <span className="text-[10px]">Sold out</span> : null}
            </motion.button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {(
          [
            ['narrow', 'Narrow grip', 'Half down'],
            ['true', 'Standard', 'Your size'],
            ['wide', 'Cushioned', 'Half up'],
          ] as const
        ).map(([id, title, hint]) => (
          <button
            key={id}
            type="button"
            className={`rounded-sm border px-2 py-2 text-left ${
              fit === id ? 'border-accent-court bg-accent-court/10' : 'border-black/10 bg-white/40'
            }`}
            onClick={() => onFitChange(id)}
          >
            <span className="block text-xs font-semibold leading-tight">{title}</span>
            <span className="text-[10px] opacity-60">{hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}