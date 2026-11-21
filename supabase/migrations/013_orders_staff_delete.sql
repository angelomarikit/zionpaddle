-- Staff can remove mistaken / preview orders while signed in.

CREATE POLICY orders_delete_staff ON orders FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
    )
  );