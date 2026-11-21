# Phase 6 — Order FSM + inventory

## Migration

Run after Phase 4–5:

- `supabase/migrations/003_order_fsm_inventory.sql`

Adds `shipping_snapshot`, `status_history`, `rejection_reason`, `product_stock`, `inventory_transactions`, and extra order statuses (`proof_submitted`, `payment_rejected`).

## Customer flow

1. **Checkout** — J&T fee frozen in `shippingSnapshot` at place-order time. Stock checked via `canFulfillLines` (local map or Supabase when seeded).
2. **With proof at checkout** — order starts in `payment_review` with history `pending_payment` → `proof_submitted` → `payment_review`.
3. **Without proof** — `pending_payment`; customer can upload on `/orders/:id` → `submitPaymentProof` → `payment_review`.

## Staff flow (`/admin/orders`)

FSM actions replace free-form status dropdown:

| Action | To status | Side effect |
|--------|-----------|-------------|
| Mark reviewing | `payment_review` | — |
| Verify payment | `paid` | `applySaleForOrder` decrements stock |
| Reject payment | `payment_rejected` | requires reason |
| Mark fulfilled | `fulfilled` | — |
| Cancel order | `cancelled` | — |

## Local dev (no Supabase)

- Orders: `localStorage` key `dayo-orders-v1`
- Stock: `dayo-inventory-v1` (seeded in `src/data/mock/inventory.ts`)
- Inventory txs: `dayo-inventory-tx-v1`

Admin transitions work locally via `transitionOrder` without Supabase.

## Code map

- `src/lib/orders/orderFsm.ts` — allowed transitions + staff actions
- `src/services/orders.ts` — `submitOrder`, `transitionOrder`, `submitPaymentProof`
- `src/services/inventory.ts` — stock check + sale on paid