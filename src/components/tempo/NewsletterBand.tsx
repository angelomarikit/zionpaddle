import { SectionShell } from './SectionShell'

export function NewsletterBand() {
  return (
    <SectionShell surface="ink" className="border-t border-white/10">
      <div className="grid gap-8 md:grid-cols-2 md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">Early access</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">New drops land here first.</h2>
        </div>
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <label className="sr-only" htmlFor="newsletter-email">
            Your email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="Your email"
            className="min-w-0 flex-1 rounded-sm border border-white/20 bg-transparent px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="rounded-sm bg-accent-coral px-6 py-3 text-sm font-semibold uppercase text-surface-ink"
          >
            Sign up
          </button>
        </form>
      </div>
    </SectionShell>
  )
}