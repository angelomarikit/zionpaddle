-- Manual execution only — website section video/CDN metadata (Phase 7 CMS)
-- Run after core site_sections migrations exist.

CREATE TABLE IF NOT EXISTS site_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  public_url text,
  mime_type text NOT NULL DEFAULT 'video/mp4',
  kind text NOT NULL CHECK (kind IN ('hero', 'product_loop', 'colorway_showcase', 'macro', 'poster')),
  colorway_slug text,
  section_key text,
  active boolean NOT NULL DEFAULT false,
  poster_path text,
  duration_seconds numeric(4,1),
  width int,
  height int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_media_assets_section ON site_media_assets (section_key, active);

COMMENT ON TABLE site_media_assets IS 'Admin-managed hero/product videos; active flag gates storefront use.';

ALTER TABLE site_media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_media_select_public ON site_media_assets FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY site_media_staff_all ON site_media_assets FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );