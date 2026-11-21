import type { PaymentMethod } from '../../types/order'
import { displayOrderNumber } from '../orders/orderNumbers'

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method.toUpperCase()
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: 'gcash', label: 'GCash', hint: 'Send to our verified GCash business wallet' },
  { id: 'maya', label: 'Maya', hint: 'Maya business account — same-day posting when tagged' },
  { id: 'qrph', label: 'QR Ph', hint: 'Scan instaPay QR — include order ID in notes' },
]

export function paymentInstructions(method: PaymentMethod, orderId: string, totalPhp: number) {
  const amount = `₱${totalPhp.toLocaleString('en-PH')}`
  const orderRef = displayOrderNumber(orderId)
  const common = `Use ${orderRef} as payment reference / notes.`

  switch (method) {
    case 'gcash':
      return {
        accountName: 'ZION Pickleball',
        accountDetail: 'GCash · 09XX XXX 2847 (placeholder until finance publishes live)',
        steps: [
          `Open GCash → Send Money → enter number above.`,
          `Amount: ${amount}. Reference: ${orderRef}.`,
          common,
          'Upload screenshot on the proof step within 24 hours.',
        ],
      }
    case 'maya':
      return {
        accountName: 'ZION Pickleball',
        accountDetail: 'Maya · @ZIONPICKLEBALL (placeholder)',
        steps: [
          `Pay exactly ${amount} via Maya Pay.`,
          `Add note: ${orderRef}.`,
          common,
        ],
      }
    case 'qrph':
      return {
        accountName: 'QR Ph — InstaPay',
        accountDetail: 'Static QR issued per order (placeholder graphic below).',
        steps: [
          `Scan QR with your bank app.`,
          `Pay ${amount}.`,
          `Reference: ${orderId}.`,
          common,
        ],
      }
  }
}