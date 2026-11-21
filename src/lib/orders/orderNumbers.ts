import { getSupabase, supabaseConfigured } from '../supabase/client'

export const ORDER_NUMBER_START = 1001
const SEQ_KEY = 'zion-order-seq'
const LOCAL_ORDERS_KEY = 'zion-orders-v1'
const LEGACY_ORDERS_KEY = 'dayo-orders-v1'

export function formatOrderId(n: number) {
  return `ZION-${n}`
}

export function parseOrderNumber(id: string): number {
  const match = id.match(/^ZION-(\d+)$/i)
  return match ? Number(match[1]) : 0
}

export function isStandardOrderId(id: string) {
  return parseOrderNumber(id) >= ORDER_NUMBER_START
}

export function sortByOrderNumber<T extends { id: string }>(items: T[], direction: 'asc' | 'desc' = 'asc') {
  return [...items].sort((a, b) => {
    const na = parseOrderNumber(a.id)
    const nb = parseOrderNumber(b.id)
    return direction === 'asc' ? na - nb : nb - na
  })
}

export function displayOrderNumber(id: string) {
  const n = parseOrderNumber(id)
  if (n >= ORDER_NUMBER_START) return `#${n}`
  const tail = id.replace(/^ZION-/i, '').slice(-6).toUpperCase()
  return `#${tail}`
}

function readLocalOrderIds(): string[] {
  try {
    let raw = localStorage.getItem(LOCAL_ORDERS_KEY)
    if (!raw) raw = localStorage.getItem(LEGACY_ORDERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { id: string }[]
    return parsed.map((o) => o.id)
  } catch {
    return []
  }
}

function maxFromOrders(ids: string[]) {
  let max = ORDER_NUMBER_START - 1
  for (const id of ids) {
    const n = parseOrderNumber(id)
    if (n > max) max = n
  }
  return max
}

export function ensureSequenceFloor(floor: number) {
  const stored = Number(localStorage.getItem(SEQ_KEY) ?? ORDER_NUMBER_START - 1)
  if (stored < floor) localStorage.setItem(SEQ_KEY, String(floor))
}

export async function allocateNextOrderId(): Promise<string> {
  let max = ORDER_NUMBER_START - 1

  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data } = await sb.from('orders').select('id').limit(500)
    max = Math.max(max, maxFromOrders((data ?? []).map((r) => String(r.id))))
  }

  max = Math.max(max, maxFromOrders(readLocalOrderIds()))

  const stored = Number(localStorage.getItem(SEQ_KEY) ?? ORDER_NUMBER_START - 1)
  const next = Math.max(max, stored) + 1
  localStorage.setItem(SEQ_KEY, String(next))
  return formatOrderId(next)
}