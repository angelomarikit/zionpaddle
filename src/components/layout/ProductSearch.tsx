import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { formatPhp } from '../../data/mock/products'
import { useCatalog } from '../../hooks/useCatalog'

export function ProductSearchButton() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { products } = useCatalog()

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(t)
    }
    setQ('')
    return undefined
  }, [open])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return []
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term),
      )
      .slice(0, 8)
  }, [q, products])

  return (
    <>
      <button
        type="button"
        className="rounded-sm border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
        onClick={() => setOpen(true)}
        aria-label="Search products"
      >
        <span className="flex items-center gap-2">
          <Search className="size-3.5" aria-hidden />
          Search
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 p-4 pt-24 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-white/10 bg-surface-ink shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Search className="size-4 text-white/50" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search paddles…"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false)
                  if (e.key === 'Enter' && results[0]) {
                    navigate(`/products/${results[0].slug}`)
                    setOpen(false)
                  }
                }}
              />
              <button
                type="button"
                className="rounded-md p-1 text-white/70 hover:text-white"
                aria-label="Close search"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              {q.trim().length < 2 ? (
                <li className="px-3 py-6 text-center text-sm text-white/50">Type at least 2 characters</li>
              ) : results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-white/50">No paddles match “{q.trim()}”</li>
              ) : (
                results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/products/${p.slug}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5"
                      onClick={() => setOpen(false)}
                    >
                      <img
                        src={p.colorways[0]?.image ?? p.images[0]}
                        alt=""
                        className="size-12 rounded-md border border-white/10 object-contain bg-white/5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                        <span className="text-xs text-white/50">{formatPhp(p.pricePhp)}</span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}