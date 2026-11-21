ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_tracking text;

COMMENT ON COLUMN orders.shipment_tracking IS 'J&T tracking — set on fulfill, cleared on unfulfill';