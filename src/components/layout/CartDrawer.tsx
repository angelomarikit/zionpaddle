import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPhp } from '../../data/mock/products'
import { springTransition } from '../../lib/motion'

export function CartDrawer() {
  const {
    lines,
    drawerOpen,
    closeDrawer,
    itemCount,
    subtotalPhp,
    updateQuantity,
    removeLine,
    lineKey,
  } = useCart()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close bag overlay"
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping bag"
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-surface-cream text-surface-ink shadow-2xl"
            initial={reduce ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: '100%' }}
            transition={reduce ? { duration: 0 } : springTransition}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <h2 className="text-lg font-bold">Bag ({itemCount})</h2>
              <button type="button" onClick={closeDrawer} aria-label="Close">
                <X />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <li className="py-8 text-center text-sm text-cream-muted">Your bag is empty.</li>
              ) : (
                lines.map((line) => {
                  const key = lineKey(line)
                  return (
                    <li key={key} className="flex gap-4 border-b border-black/10 py-4">
                      <img
                        src={line.image}
                        alt=""
                        className="size-20 rounded-sm bg-white object-contain p-2"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{line.productName}</p>
                        <p className="text-xs text-cream-muted">
                          {line.colorwayName} · {line.gripSizeLabel}
                        </p>
                        <p className="mt-1 text-sm">{formatPhp(line.pricePhp)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="size-8 rounded border border-black/20"
                            onClick={() => updateQuantity(key, line.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            className="size-8 rounded border border-black/20"
                            onClick={() => updateQuantity(key, line.quantity + 1)}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-auto text-xs underline"
                            onClick={() => removeLine(key)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>

            <div className="border-t border-black/10 px-5 py-4">
              <div className="flex justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>{formatPhp(subtotalPhp)}</span>
              </div>
              <p className="mt-1 text-xs text-cream-muted">Shipping calculated at checkout.</p>
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="mt-4 block w-full rounded-sm bg-surface-ink py-3 text-center text-sm font-semibold uppercase text-white"
              >
                View cart
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}