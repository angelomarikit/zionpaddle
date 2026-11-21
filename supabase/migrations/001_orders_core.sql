-- Phase 4: checkout orders (manual payment workflow)
-- Run in Supabase SQL editor when project is ready. Adjust RLS before production.

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'payment_review', 'paid', 'fulfilled', 'cancelled')),
  lines jsonb NOT NULL,
  subtotal_php int NOT NULL,
  shipping_php int NOT NULL,
  total_php int NOT NULL,
  address jsonb NOT NULL,
  shipping jsonb NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('gcash', 'maya', 'qrph')),
  payment_reference text,
  proof_file_name text,
  proof_data_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- DEV ONLY: allow anonymous insert for SPA checkout tests. Remove or restrict in production.
CREATE POLICY "anon_insert_orders_dev"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

COMMENT ON TABLE orders IS 'Customer orders — manual GCash/Maya/QR proof review. No live payment gateway.';