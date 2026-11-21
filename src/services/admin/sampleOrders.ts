import { products } from '../../data/mock/products'
import {
  ensureSequenceFloor,
  formatOrderId,
  isStandardOrderId,
  ORDER_NUMBER_START,
  parseOrderNumber,
  sortByOrderNumber,
} from '../../lib/orders/orderNumbers'
import type { OrderRecord, ShippingAddress } from '../../types/order'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import {
  mapDbOrder,
  mergeOrderLists,
  purgeLocalLegacyOrders,
  readLocalOrders,
  removeLocalOrderById,
  upsertOrderRecord,
} from '../orders'

export const SAMPLE_ORDER_NUMBERS = [ORDER_NUMBER_START, ORDER_NUMBER_START + 1] as const
export const SAMPLE_ORDER_IDS = SAMPLE_ORDER_NUMBERS.map((n) => formatOrderId(n))

const MIKA: ShippingAddress = {
  fullName: 'Mika Santos',
  email: 'mika.santos@email.com',
  phone: '+63 917 482 1102',
  line1: '45 P. Burgos Street',
  line2: 'Unit 12B',
  barangay: 'Poblacion',
  city: 'Makati City',
  province: 'Metro Manila',
  postalCode: '1210',
}

/** Demo GCash receipt for admin payment-proof preview (sample #1001). */
const SAMPLE_MAYA_PROOF_DATA_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">
      <rect fill="#00b464" width="360" height="640"/>
      <text x="180" y="80" fill="white" font-size="28" font-family="system-ui,sans-serif" text-anchor="middle">Maya</text>
      <text x="180" y="160" fill="white" font-size="18" font-family="system-ui,sans-serif" text-anchor="middle">You sent money</text>
      <rect x="40" y="220" width="280" height="200" rx="12" fill="white" opacity="0.95"/>
      <text x="180" y="310" fill="#00b464" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle">Ref: #1002 · Sample screenshot</text>
    </svg>`,
  )

const SAMPLE_GCASH_PROOF_DATA_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">
      <rect fill="#007dfe" width="360" height="640"/>
      <text x="180" y="80" fill="white" font-size="28" font-family="system-ui,sans-serif" text-anchor="middle">GCash</text>
      <text x="180" y="160" fill="white" font-size="18" font-family="system-ui,sans-serif" text-anchor="middle">Payment successful</text>
      <rect x="40" y="220" width="280" height="200" rx="12" fill="white" opacity="0.95"/>
      <text x="180" y="270" fill="#303030" font-size="14" font-family="system-ui,sans-serif" text-anchor="middle">Amount sent</text>
      <text x="180" y="310" fill="#007dfe" font-size="22" font-family="system-ui,sans-serif" text-anchor="middle">₱—</text>
      <text x="180" y="370" fill="#616161" font-size="12" font-family="system-ui,sans-serif" text-anchor="middle">Ref: #1001 · Sample screenshot</text>
    </svg>`,
  )

const JORDAN: ShippingAddress = {
  fullName: 'Jordan Reyes',
  email: 'jordan.reyes@email.com',
  phone: '+63 932 881 3340',
  line1: '88 Osmeña Boulevard',
  barangay: 'Capitol Site',
  city: 'Cebu City',
  province: 'Cebu',
  postalCode: '6000',
}

function buildSampleOrders(): OrderRecord[] {
  const product = products[0]
  if (!product) return []

  const colorway = product.colorways[0]!
  const grip = product.gripSizes[0]!
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 86_400_000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 86_400_000)

  const line = (qty: number) => [
    {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      gripSizeId: grip.id,
      gripSizeLabel: grip.label,
      pricePhp: product.pricePhp,
      quantity: qty,
      image: colorway.image,
    },
  ]

  const shippingPhp = 120
  const shipping = {
    carrier: 'J&T Express' as const,
    service: 'Standard' as const,
    etaDays: '3–5 business days',
    feePhp: shippingPhp,
  }

  const subtotalOne = product.pricePhp
  const totalOne = subtotalOne + shippingPhp

  return [
    {
      id: formatOrderId(SAMPLE_ORDER_NUMBERS[0]),
      createdAt: twoDaysAgo.toISOString(),
      status: 'paid',
      lines: line(1),
      subtotalPhp: subtotalOne,
      shippingPhp,
      totalPhp: totalOne,
      address: MIKA,
      shipping,
      shippingSnapshot: {
        ...shipping,
        quotedAt: twoDaysAgo.toISOString(),
        totalWeightGrams: product.weightGrams,
        itemCount: 1,
        province: MIKA.province,
      },
      paymentMethod: 'gcash',
      notes: 'Sample order for store preview',
      proofFileName: 'gcash-proof-sample.jpg',
      proofDataUrl: SAMPLE_GCASH_PROOF_DATA_URL,
      proofSubmittedAt: dayAgo.toISOString(),
      paymentReference: '#1001',
      statusHistory: [
        { status: 'pending_payment', at: twoDaysAgo.toISOString(), by: 'system' },
        { status: 'proof_submitted', at: dayAgo.toISOString(), by: 'customer' },
        { status: 'payment_review', at: dayAgo.toISOString(), by: 'system' },
        { status: 'paid', at: now.toISOString(), by: 'staff' },
      ],
    },
    {
      id: formatOrderId(SAMPLE_ORDER_NUMBERS[1]),
      createdAt: now.toISOString(),
      status: 'payment_review',
      lines: line(1),
      subtotalPhp: subtotalOne,
      shippingPhp,
      totalPhp: totalOne,
      address: JORDAN,
      shipping,
      shippingSnapshot: {
        ...shipping,
        quotedAt: now.toISOString(),
        totalWeightGrams: product.weightGrams,
        itemCount: 1,
        province: JORDAN.province,
      },
      paymentMethod: 'maya',
      notes: 'Sample order for store preview',
      proofFileName: 'maya-proof-sample.jpg',
      proofDataUrl: SAMPLE_MAYA_PROOF_DATA_URL,
      proofSubmittedAt: now.toISOString(),
      paymentReference: 'Jordan Reyes',
      statusHistory: [
        { status: 'pending_payment', at: twoDaysAgo.toISOString(), by: 'system' },
        { status: 'proof_submitted', at: now.toISOString(), by: 'customer' },
        { status: 'payment_review', at: now.toISOString(), by: 'system' },
      ],
    },
  ]
}

let sampleSeedPromise: Promise<void> | null = null

export async function ensureSampleOrdersIfEmpty(): Promise<void> {
  sampleSeedPromise ??= seedSampleOrders()
  try {
    await sampleSeedPromise
  } catch {
    sampleSeedPromise = null
  }
}

const PREVIEW_ORDER_IDS = new Set(SAMPLE_ORDER_IDS)

function isPreviewOnlyOrder(order: OrderRecord) {
  return PREVIEW_ORDER_IDS.has(order.id as (typeof SAMPLE_ORDER_IDS)[number])
}

async function removeStrayPreviewOrders() {
  const strayId = formatOrderId(ORDER_NUMBER_START + 2)

  const local = readLocalOrders().find((o) => o.id === strayId)
  if (local?.notes?.toLowerCase().includes('sample')) {
    removeLocalOrderById(strayId)
  }

  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return
  const { data } = await sb.from('orders').select('id, notes').eq('id', strayId).maybeSingle()
  if (data && String(data.notes ?? '').toLowerCase().includes('sample')) {
    await sb.from('orders').delete().eq('id', strayId)
  }
}

function staffVisibleOrders(orders: OrderRecord[]) {
  return orders.filter((o) => isStandardOrderId(o.id) && !isStraySampleRow(o))
}

function isStraySampleRow(order: OrderRecord) {
  const n = parseOrderNumber(order.id)
  if (n <= SAMPLE_ORDER_NUMBERS[1]) return false
  if (isPreviewOnlyOrder(order)) return false
  return order.notes?.toLowerCase().includes('sample') ?? false
}

async function seedSampleOrders(): Promise<void> {
  purgeLocalLegacyOrders()
  await removeStrayPreviewOrders()
  const samples = buildSampleOrders()
  for (const order of samples) {
    const local = readLocalOrders().find((o) => o.id === order.id)
    if (local) continue

    const sb = getSupabase()
    if (sb && supabaseConfigured) {
      const { data: existing } = await sb.from('orders').select('id').eq('id', order.id).maybeSingle()
      if (existing) continue
    }

    await upsertOrderRecord(order)
  }
  ensureSequenceFloor(SAMPLE_ORDER_NUMBERS[1])
}

export async function loadStaffOrders(): Promise<OrderRecord[]> {
  await ensureSampleOrdersIfEmpty()

  const local = staffVisibleOrders(readLocalOrders())

  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data, error } = await sb.from('orders').select('*').limit(100)

    if (!error && data) {
      const remote = staffVisibleOrders((data as Record<string, unknown>[]).map(mapDbOrder))
      return sortByOrderNumber(mergeOrderLists(remote, local), 'asc')
    }
  }

  return sortByOrderNumber(local, 'asc')
}