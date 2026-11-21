import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPhp } from '../data/mock/products'
import { SectionShell } from '../components/tempo/SectionShell'
import { Button } from '../components/ui/Button'

export function CartPage() {
  const { lines, subtotalPhp, updateQuantity, removeLine, lineKey } = useCart()

  return (
    <SectionShell surface="cream" className="min-h-[60vh] pt-28">
      <h1 className="text-4xl font-bold">Your bag</h1>
      {lines.length === 0 ? (
        <p className="mt-8 text-cream-muted">
          Nothing here yet.{' '}
          <Link to="/collections" className="font-semibold underline">
            Shop paddles
          </Link>
        </p>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-black/10">
            {lines.map((line) => {
              const key = lineKey(line)
              return (
                <li key={key} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
                  <img
                    src={line.image}
                    alt=""
                    className="size-24 rounded-sm bg-white object-contain p-2"
                  />
                  <div className="flex-1">
                    <p className="font-bold">{line.productName}</p>
                    <p className="text-sm text-cream-muted">
                      {line.colorwayName} · {line.gripSizeLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="size-9 border border-black/20"
                      onClick={() => updateQuantity(key, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      className="size-9 border border-black/20"
                      onClick={() => updateQuantity(key, line.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold">{formatPhp(line.pricePhp * line.quantity)}</p>
                  <button type="button" className="text-sm underline" onClick={() => removeLine(key)}>
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>

          <label className="mt-8 block max-w-sm">
            <span className="text-sm font-medium">Voucher code (UI only)</span>
            <input
              className="mt-2 w-full rounded border border-black/20 px-3 py-2"
              placeholder="Not validated until checkout is wired"
            />
          </label>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-black/10 pt-8 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-cream-muted">Subtotal</p>
              <p className="text-2xl font-bold">{formatPhp(subtotalPhp)}</p>
            </div>
            <Button to="/checkout" variant="coral">
              Checkout
            </Button>
          </div>
        </>
      )}
    </SectionShell>
  )
}