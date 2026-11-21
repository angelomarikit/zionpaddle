-- Phase 6: order FSM, frozen J&T snapshot, inventory ledger

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending_payment',
    'proof_submitted',
    'payment_review',
    'paid',
    'payment_rejected',
    'fulfilled',
    'cancelled'
  )
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_snapshot jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS proof_submitted_at timestamptz;

UPDATE orders SET shipping_snapshot = shipping WHERE shipping_snapshot IS NULL AND shipping IS NOT NULL;

CREATE TABLE IF NOT EXISTS product_stock (
  product_slug text PRIMARY KEY,
  quantity_on_hand int NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  order_id text REFERENCES orders (id) ON DELETE SET NULL,
  delta int NOT NULL,
  reason text NOT NULL CHECK (reason IN ('sale', 'restock', 'release', 'adjustment')),
  balance_after int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tx_order ON inventory_transactions (order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_slug ON inventory_transactions (product_slug, created_at DESC);

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY stock_select_staff ON product_stock FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')));

CREATE POLICY inventory_select_staff ON inventory_transactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')));

CREATE POLICY inventory_insert_staff ON inventory_transactions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')));

-- Allow staff to update orders through app (tighten in production)
CREATE POLICY orders_update_staff ON orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')))
  WITH CHECK (true);

COMMENT ON COLUMN orders.shipping_snapshot IS 'Immutable J&T quote at checkout time';