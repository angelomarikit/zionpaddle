import type { CartLine } from './commerce'

export type PaymentMethod = 'gcash' | 'maya' | 'qrph'

export type ShippingAddress = {
  fullName: string
  email: string
  phone: string
  line1: string
  line2?: string
  barangay: string
  city: string
  province: string
  postalCode: string
}

export type ShippingQuote = {
  carrier: 'J&T Express'
  service: 'Standard' | 'Economy'
  etaDays: string
  feePhp: number
}

/** Frozen at checkout — fee must not change after quote. */
export type ShippingSnapshot = ShippingQuote & {
  quotedAt: string
  totalWeightGrams: number
  itemCount: number
  province: string
}

export type OrderStatus =
  | 'pending_payment'
  | 'proof_submitted'
  | 'payment_review'
  | 'paid'
  | 'payment_rejected'
  | 'fulfilled'
  | 'cancelled'

export type OrderStatusEvent = {
  status: OrderStatus
  at: string
  by?: 'customer' | 'staff' | 'system'
  note?: string
}

export type OrderLine = CartLine

export type OrderRecord = {
  id: string
  createdAt: string
  status: OrderStatus
  lines: OrderLine[]
  subtotalPhp: number
  shippingPhp: number
  totalPhp: number
  address: ShippingAddress
  /** @deprecated use shippingSnapshot — kept for older rows */
  shipping: ShippingQuote
  shippingSnapshot: ShippingSnapshot
  paymentMethod: PaymentMethod
  paymentReference?: string
  proofFileName?: string
  proofDataUrl?: string
  proofSubmittedAt?: string
  notes?: string
  statusHistory: OrderStatusEvent[]
  rejectionReason?: string
  /** Staff flag — suspicious payment or shipping mismatch */
  highRisk?: boolean
  highRiskNote?: string
  /** Set when marked fulfilled; cleared on unfulfill */
  shipmentTracking?: string
}

export type CheckoutDraft = {
  address: ShippingAddress
  shipping: ShippingQuote
  paymentMethod: PaymentMethod
  paymentReference?: string
  proofFileName?: string
  proofDataUrl?: string
  notes?: string
}