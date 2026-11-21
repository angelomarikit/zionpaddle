import { Link } from 'react-router-dom'
import { SectionShell } from '../components/tempo/SectionShell'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <SectionShell surface="ink" className="min-h-[60vh] pt-28 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-white/50">404</p>
      <h1 className="mt-4 text-4xl font-bold">Lost the rally.</h1>
      <p className="mt-2 text-ink-muted">This page moved or never existed.</p>
      <div className="mt-8 flex justify-center gap-4">
        <Button to="/" variant="coral">
          Back home
        </Button>
        <Link to="/collections" className="self-center text-sm underline">
          Shop
        </Link>
      </div>
    </SectionShell>
  )
}