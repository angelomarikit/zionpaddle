import type { OrderStatus } from '../../types/order'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  proof_submitted: 'Proof submitted',
  payment_review: 'Under review',
  paid: 'Paid',
  payment_rejected: 'Payment rejected',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
}

type Transition = {
  from: OrderStatus
  to: OrderStatus
  actor: 'customer' | 'staff' | 'system'
}

const transitions: Transition[] = [
  { from: 'pending_payment', to: 'proof_submitted', actor: 'customer' },
  { from: 'pending_payment', to: 'cancelled', actor: 'staff' },
  { from: 'proof_submitted', to: 'payment_review', actor: 'system' },
  { from: 'proof_submitted', to: 'cancelled', actor: 'staff' },
  { from: 'payment_review', to: 'paid', actor: 'staff' },
  { from: 'payment_review', to: 'payment_rejected', actor: 'staff' },
  { from: 'payment_review', to: 'cancelled', actor: 'staff' },
  { from: 'paid', to: 'fulfilled', actor: 'staff' },
  { from: 'fulfilled', to: 'paid', actor: 'staff' },
  { from: 'paid', to: 'cancelled', actor: 'staff' },
  { from: 'fulfilled', to: 'cancelled', actor: 'staff' },
  { from: 'payment_rejected', to: 'cancelled', actor: 'staff' },
  { from: 'payment_rejected', to: 'pending_payment', actor: 'staff' },
  { from: 'proof_submitted', to: 'payment_review', actor: 'staff' },
  { from: 'proof_submitted', to: 'paid', actor: 'staff' },
]

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  actor: Transition['actor'],
): boolean {
  return transitions.some((t) => t.from === from && t.to === to && t.actor === actor)
}

export function nextStatusAfterProof(current: OrderStatus): OrderStatus {
  if (current === 'pending_payment') return 'proof_submitted'
  return current
}

export function statusAfterProofUploaded(): OrderStatus {
  return 'payment_review'
}

export const STAFF_FSM_ACTIONS: {
  id: string
  label: string
  to: OrderStatus
  from: OrderStatus[]
}[] = [
  { id: 'start_review', label: 'Mark reviewing', to: 'payment_review', from: ['proof_submitted'] },
  { id: 'verify', label: 'Verify payment', to: 'paid', from: ['payment_review', 'proof_submitted'] },
  { id: 'reject', label: 'Reject payment', to: 'payment_rejected', from: ['payment_review', 'proof_submitted'] },
  { id: 'fulfill', label: 'Mark fulfilled', to: 'fulfilled', from: ['paid'] },
  { id: 'unfulfill', label: 'Mark unfulfilled', to: 'paid', from: ['fulfilled'] },
  {
    id: 'cancel',
    label: 'Cancel order',
    to: 'cancelled',
    from: ['pending_payment', 'proof_submitted', 'payment_review', 'paid', 'fulfilled', 'payment_rejected'],
  },
]