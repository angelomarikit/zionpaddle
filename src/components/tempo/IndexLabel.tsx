type Props = { index: string; label: string; tone?: 'ink' | 'cream' }

export function IndexLabel({ index, label, tone = 'ink' }: Props) {
  const muted = tone === 'ink' ? 'text-white/50' : 'text-cream-muted'
  const main = tone === 'ink' ? 'text-white' : 'text-surface-ink'

  return (
    <p className={`font-mono text-xs uppercase tracking-[0.2em] ${muted}`}>
      <span className={main}>({index})</span> {label}
    </p>
  )
}