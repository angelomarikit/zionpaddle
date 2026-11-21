import { Link } from 'react-router-dom'
import { NewsletterBand } from '../tempo/NewsletterBand'
import { ContentRail } from './ContentRail'

export function SiteFooter() {
  return (
    <footer>
      <NewsletterBand />
      <div className="border-t border-white/10 bg-surface-ink">
        <ContentRail wide className="grid gap-10 py-16 md:grid-cols-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/50">Shop</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/collections" className="hover:text-accent-volt">
                  Shop all
                </Link>
              </li>
              <li>
                <Link to="/products/zion-tempo-pro" className="hover:text-accent-volt">
                  Zion Tempo Pro
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/50">Brand</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-accent-volt">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent-volt">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-accent-volt">
                  Legal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-white/50">Follow</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="https://instagram.com" className="hover:text-accent-volt">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" className="hover:text-accent-volt">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm text-white/60">
              Payments supported at checkout: GCash · Maya · QR Ph (manual verification — not a live
              gateway yet).
            </p>
          </div>
        </ContentRail>
        <p className="border-t border-white/10 py-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} ZION Pickleball. All rights reserved.
        </p>
      </div>
    </footer>
  )
}