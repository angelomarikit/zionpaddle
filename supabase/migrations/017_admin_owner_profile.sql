-- Bootstrap profile for admin@zion.com (create matching user in Supabase Auth first).

DROP POLICY IF EXISTS profiles_insert_zion_owner ON profiles;

CREATE POLICY profiles_insert_zion_owner ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND lower(email) = 'admin@zion.com'
    AND role = 'admin'
  );

CREATE POLICY profiles_upsert_zion_owner ON profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND lower(email) = 'admin@zion.com')
  WITH CHECK (user_id = auth.uid() AND role = 'admin' AND lower(email) = 'admin@zion.com');

-- Ensure existing auth user gets owner role (run after Auth user exists):
-- INSERT INTO profiles (user_id, email, role, display_name, permissions)
-- SELECT u.id, lower(u.email), 'admin', 'ZION Admin', '{}'::jsonb
-- FROM auth.users u
-- WHERE lower(u.email) = 'admin@zion.com'
-- ON CONFLICT (user_id) DO UPDATE
--   SET role = 'admin', email = EXCLUDED.email, display_name = COALESCE(profiles.display_name, 'ZION Admin');