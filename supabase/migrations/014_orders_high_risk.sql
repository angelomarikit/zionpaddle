-- Staff can flag suspicious orders without changing payment status.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS high_risk boolean NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS high_risk_note text;

COMMENT ON COLUMN orders.high_risk IS 'Staff flag — manual GCash/Maya review, address mismatch, etc.';
COMMENT ON COLUMN orders.high_risk_note IS 'Why the order was tagged high risk';