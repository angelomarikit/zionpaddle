import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartLine } from '../types/commerce'
import { getMigratedStorageItem } from '../lib/storage/migrateKey'

const STORAGE_KEY = 'zion-cart-v1'
const LEGACY_STORAGE_KEY = 'dayo-cart-v1'

type CartContextValue = {
  lines: CartLine[]
  drawerOpen: boolean
  itemCount: number
  subtotalPhp: number
  openDrawer: () => void
  closeDrawer: () => void
  addLine: (line: Omit<CartLine, 'quantity'> & { quantity?: number }) => void
  updateQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  clearCart: () => void
  lineKey: (line: Pick<CartLine, 'productSlug' | 'colorwayId' | 'gripSizeId'>) => string
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = getMigratedStorageItem(STORAGE_KEY, LEGACY_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CartLine[]
      const migrated = parsed.map((line) => ({
        ...line,
        productSlug: line.productSlug.replace(/^dayo-/, 'zion-'),
        productId: line.productId.replace(/^dayo-/, 'zion-'),
      }))
      setLines(migrated)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const lineKey = useCallback(
    (line: Pick<CartLine, 'productSlug' | 'colorwayId' | 'gripSizeId'>) =>
      `${line.productSlug}:${line.colorwayId}:${line.gripSizeId}`,
    [],
  )

  const addLine = useCallback(
    (line: Omit<CartLine, 'quantity'> & { quantity?: number }) => {
      const key = lineKey(line)
      const qty = line.quantity ?? 1
      setLines((prev) => {
        const idx = prev.findIndex((l) => lineKey(l) === key)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty }
          return next
        }
        return [...prev, { ...line, quantity: qty }]
      })
      setDrawerOpen(true)
    },
    [lineKey],
  )

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (lineKey(l) === key ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    )
  }, [lineKey])

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key))
  }, [lineKey])

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  )

  const subtotalPhp = useMemo(
    () => lines.reduce((sum, l) => sum + l.pricePhp * l.quantity, 0),
    [lines],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      drawerOpen,
      itemCount,
      subtotalPhp,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addLine,
      updateQuantity,
      removeLine,
      clearCart: () => setLines([]),
      lineKey,
    }),
    [lines, drawerOpen, itemCount, subtotalPhp, addLine, updateQuantity, removeLine, lineKey],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart requires CartProvider')
  return ctx
}