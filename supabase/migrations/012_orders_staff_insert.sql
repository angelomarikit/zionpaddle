-- Staff can insert orders (sample rows, manual orders) while signed in — customer checkout still uses anon insert.

CREATE POLICY orders_insert_staff ON orders FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
    )
  );