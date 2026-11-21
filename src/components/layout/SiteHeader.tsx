import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ContentRail } from './ContentRail'
import { motion, useReducedMotion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { ZionLogo } from '../brand/ZionLogo'

const links = [
  { to: '/collections', label: 'Shop' },
  { to: '/#tech', label: 'Tech' },
  { to: '/#fit', label: 'Fit' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
]

export function SiteHeader() {
  const { itemCount, openDrawer } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const reduce = useReducedMotion()

  const onHome = location.pathname === '/'

  return (
    <header
      className={`transition-colors ${
        onHome
          ? 'border-b border-white/10 bg-surface-ink/40 backdrop-blur-md'
          : 'border-b border-white/10 bg-surface-ink/90 backdrop-blur-md'
      }`}
    >
      <ContentRail className="flex min-h-20 items-center justify-between py-1">
        <ZionLogo to="/" surface="dark" variant="nav" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:text-accent-volt ${
                  isActive && !l.to.includes('#') ? 'text-accent-volt' : 'text-white/80'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-sm border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
            onClick={openDrawer}
            aria-label={`Bag, ${itemCount} items`}
          >
            Bag
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={reduce ? false : { scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-accent-coral text-[10px] font-bold text-surface-ink"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
          <button
            type="button"
            className="md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </ContentRail>

      {menuOpen && (
        <nav
          className="border-t border-white/10 bg-surface-ink md:hidden"
          aria-label="Mobile"
        >
          <ContentRail className="py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="block py-3 text-xs font-semibold uppercase tracking-[0.18em]"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          {location.pathname !== '/cart' && (
            <Link
              to="/cart"
              className="block py-3 text-xs font-semibold uppercase tracking-[0.18em]"
              onClick={() => setMenuOpen(false)}
            >
              View cart
            </Link>
            )}
          </ContentRail>
        </nav>
      )}
    </header>
  )
}