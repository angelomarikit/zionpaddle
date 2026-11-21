-- Fix PostgREST 500s: migration 016 let profiles SELECT recurse through profiles.
-- Run in Supabase SQL editor. Safe to re-run (drops/recreates policies).

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS profiles_select_self ON profiles;
CREATE POLICY profiles_select_self ON profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_insert_admin ON profiles;
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR NOT EXISTS (SELECT 1 FROM public.profiles));

DROP POLICY IF EXISTS profiles_update_admin ON profiles;
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE TO authenticated
  USING (public.is_admin() OR user_id = auth.uid())
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- Staff gates (avoid inline profiles subqueries)
DROP POLICY IF EXISTS orders_select_staff ON orders;
CREATE POLICY orders_select_staff ON orders FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS orders_update_staff ON orders;
CREATE POLICY orders_update_staff ON orders FOR UPDATE TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS orders_insert_staff ON orders;
CREATE POLICY orders_insert_staff ON orders FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS orders_delete_staff ON orders;
CREATE POLICY orders_delete_staff ON orders FOR DELETE TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS contact_select_staff ON contact_inquiries;
CREATE POLICY contact_select_staff ON contact_inquiries FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS contact_update_staff ON contact_inquiries;
CREATE POLICY contact_update_staff ON contact_inquiries FOR UPDATE TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS collections_staff_write ON collections;
CREATE POLICY collections_staff_write ON collections FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS products_staff_write ON products;
CREATE POLICY products_staff_write ON products FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS colorways_staff_write ON product_colorways;
CREATE POLICY colorways_staff_write ON product_colorways FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS site_pages_staff_all ON site_pages;
CREATE POLICY site_pages_staff_all ON site_pages FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS site_sections_staff_all ON site_sections;
CREATE POLICY site_sections_staff_all ON site_sections FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS site_media_staff_all ON site_media_assets;
CREATE POLICY site_media_staff_all ON site_media_assets FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS stock_select_staff ON product_stock;
CREATE POLICY stock_select_staff ON product_stock FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS stock_write_staff ON product_stock;
CREATE POLICY stock_write_staff ON product_stock FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS inventory_select_staff ON inventory_transactions;
CREATE POLICY inventory_select_staff ON inventory_transactions FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS inventory_insert_staff ON inventory_transactions;
CREATE POLICY inventory_insert_staff ON inventory_transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- Storage (re-apply 019 logic + is_staff)
DROP POLICY IF EXISTS store_media_staff_insert ON storage.objects;
CREATE POLICY store_media_staff_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'store-media'
    AND (
      public.is_staff()
      OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@zion.com'
    )
  );

DROP POLICY IF EXISTS store_media_staff_update ON storage.objects;
CREATE POLICY store_media_staff_update ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'store-media'
    AND (
      public.is_staff()
      OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@zion.com'
    )
  );

DROP POLICY IF EXISTS store_media_staff_delete ON storage.objects;
CREATE POLICY store_media_staff_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'store-media'
    AND (
      public.is_staff()
      OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@zion.com'
    )
  );