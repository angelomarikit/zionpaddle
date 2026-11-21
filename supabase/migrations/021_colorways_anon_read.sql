-- Ensure storefront can load colorways for published products (batch fetch in catalog.ts).

DROP POLICY IF EXISTS colorways_select_public ON product_colorways;
CREATE POLICY colorways_select_public ON product_colorways FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_colorways.product_id AND p.published = true
    )
  );