import type { OrderLine } from '../types/order'
import { readStockMap, writeStockMap } from '../data/mock/inventory'
import { getMigratedStorageItem } from '../lib/storage/migrateKey'
import { getSupabase, supabaseConfigured } from '../lib/supabase/client'

export type InventoryTx = {
  id: string
  productSlug: string
  orderId?: string
  delta: number
  reason: 'sale' | 'restock' | 'release' | 'adjustment'
  balanceAfter: number
  createdAt: string
}

const LOCAL_TX_KEY = 'zion-inventory-tx-v1'
const LEGACY_TX_KEY = 'dayo-inventory-tx-v1'

function readLocalTx(): InventoryTx[] {
  try {
    return JSON.parse(getMigratedStorageItem(LOCAL_TX_KEY, LEGACY_TX_KEY) ?? '[]')
  } catch {
    return []
  }
}

function pushLocalTx(tx: InventoryTx) {
  localStorage.setItem(LOCAL_TX_KEY, JSON.stringify([tx, ...readLocalTx()].slice(0, 500)))
}

export function getStockForSlug(slug: string): number {
  const map = readStockMap()
  return map[slug] ?? 0
}

export function canFulfillLines(lines: OrderLine[]): { ok: boolean; shortages: string[] } {
  const map = readStockMap()
  const shortages: string[] = []
  for (const line of lines) {
    const need = line.quantity
    const have = map[line.productSlug] ?? 0
    if (have < need) shortages.push(`${line.productName} (need ${need}, have ${have})`)
  }
  return { ok: shortages.length === 0, shortages }
}

/** Reserve stock when an order is marked paid. */
export async function applySaleForOrder(orderId: string, lines: OrderLine[]): Promise<{ error?: string }> {
  const check = canFulfillLines(lines)
  if (!check.ok) {
    return { error: `Insufficient stock: ${check.shortages.join('; ')}` }
  }

  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    for (const line of lines) {
      const { data: row } = await sb.from('product_stock').select('quantity_on_hand').eq('product_slug', line.productSlug).maybeSingle()
      const current = (row as { quantity_on_hand: number } | null)?.quantity_on_hand ?? 0
      const next = current - line.quantity
      if (next < 0) return { error: `Insufficient stock for ${line.productSlug}` }
      await sb.from('product_stock').upsert({
        product_slug: line.productSlug,
        quantity_on_hand: next,
        updated_at: new Date().toISOString(),
      })
      await sb.from('inventory_transactions').insert({
        product_slug: line.productSlug,
        order_id: orderId,
        delta: -line.quantity,
        reason: 'sale',
        balance_after: next,
      })
    }
    return {}
  }

  const map = readStockMap()
  for (const line of lines) {
    const next = (map[line.productSlug] ?? 0) - line.quantity
    if (next < 0) return { error: `Insufficient stock for ${line.productName}` }
    map[line.productSlug] = next
    pushLocalTx({
      id: crypto.randomUUID(),
      productSlug: line.productSlug,
      orderId,
      delta: -line.quantity,
      reason: 'sale',
      balanceAfter: next,
      createdAt: new Date().toISOString(),
    })
  }
  writeStockMap(map)
  return {}
}