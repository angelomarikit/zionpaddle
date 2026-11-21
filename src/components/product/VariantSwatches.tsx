import type { Colorway } from '../../types/commerce'

type Props = {
  colorways: Colorway[]
  value: string
  onChange: (id: string) => void
  compact?: boolean
}

export function VariantSwatches({ colorways, value, onChange, compact }: Props) {
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'space-y-3'}>
      {!compact && (
        <p className="font-mono text-xs uppercase tracking-widest opacity-60">Colour</p>
      )}
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {colorways.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={value === c.id}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
              value === c.id ? 'border-accent-coral' : 'border-transparent bg-black/5'
            }`}
            onClick={() => onChange(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}