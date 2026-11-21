-- Per-staff permissions + admin management of profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.permissions IS 'Granular admin flags — owners (role=admin) ignore this in the app';

DROP POLICY IF EXISTS profiles_select_self ON profiles;

CREATE POLICY profiles_select_self ON profiles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role = 'admin'
    )
  );

CREATE POLICY profiles_insert_admin ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM profiles)
  );

CREATE POLICY profiles_update_admin ON profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role = 'admin'
    )
    OR (
      user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.user_id = auth.uid() AND pr.role = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role = 'admin'
    )
    OR user_id = auth.uid()
  );