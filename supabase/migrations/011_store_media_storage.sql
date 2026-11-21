-- Store media uploads + inventory writes for staff (run after 002, 003)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-media',
  'store-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY store_media_public_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'store-media');

CREATE POLICY store_media_staff_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'store-media'
    AND EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY store_media_staff_update ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'store-media'
    AND EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY store_media_staff_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'store-media'
    AND EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY stock_write_staff ON product_stock FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')));