-- Fix common product image upload failures (MIME + owner without profiles row yet).

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/x-png',
    'image/webp',
    'image/gif',
    'video/mp4'
  ]::text[],
  file_size_limit = 5242880,
  public = true
WHERE id = 'store-media';

DROP POLICY IF EXISTS store_media_staff_insert ON storage.objects;
CREATE POLICY store_media_staff_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'store-media'
    AND (
      EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
      )
      OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@zion.com'
    )
  );

DROP POLICY IF EXISTS store_media_staff_update ON storage.objects;
CREATE POLICY store_media_staff_update ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'store-media'
    AND (
      EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
      )
      OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@zion.com'
    )
  );

DROP POLICY IF EXISTS store_media_staff_delete ON storage.objects;
CREATE POLICY store_media_staff_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'store-media'
    AND (
      EXISTS (
        SELECT 1 FROM profiles pr
        WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
      )
      OR lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@zion.com'
    )
  );