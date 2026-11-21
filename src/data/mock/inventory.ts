import { products } from './products'

import { getMigratedStorageItem } from '../../lib/storage/migrateKey'

const KEY = 'zion-inventory-v1'
const LEGACY_KEY = 'dayo-inventory-v1'

export function defaultStockMap(): Record<string, number> {
  const map: Record<string, number> = {}
  for (const p of products) map[p.slug] = 24
  return map
}

export function readStockMap(): Record<string, number> {
  try {
    const raw = getMigratedStorageItem(KEY, LEGACY_KEY)
    if (!raw) {
      const seed = defaultStockMap()
      localStorage.setItem(KEY, JSON.stringify(seed))
      return seed
    }
    const map = JSON.parse(raw) as Record<string, number>
    const migrated = Object.fromEntries(
      Object.entries(map).map(([slug, qty]) => [slug.replace(/^dayo-/, 'zion-'), qty]),
    )
    return migrated
  } catch {
    return defaultStockMap()
  }
}

export function writeStockMap(map: Record<string, number>) {
  localStorage.setItem(KEY, JSON.stringify(map))
}