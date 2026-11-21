-- Phase 7: site content CMS + staff write access on catalog (run after 002)

CREATE TABLE IF NOT EXISTS site_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_sections (
  section_key text PRIMARY KEY,
  label text NOT NULL,
  headline text,
  subheadline text,
  body text,
  poster_url text,
  video_url text,
  alt_text text,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  extra jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_pages_select_public ON site_pages FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY site_sections_select_public ON site_sections FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY site_pages_staff_all ON site_pages FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY site_sections_staff_all ON site_sections FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

-- Catalog staff writes
CREATE POLICY collections_staff_write ON collections FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY products_staff_write ON products FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY colorways_staff_write ON product_colorways FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

CREATE POLICY contact_update_staff ON contact_inquiries FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff'))
  );

-- Seed default pages (idempotent)
INSERT INTO site_pages (slug, title, body) VALUES
  ('about', 'About ZION Pickleball', 'ZION Pickleball — premium pickleball equipment for players across the Philippines.'),
  ('faq', 'FAQ', 'Answers to common questions about gear, shipping, and returns.'),
  ('legal', 'Legal', 'Terms, privacy, and return policy — update before public launch.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_sections (section_key, label, headline, subheadline, body, sort_order, published) VALUES
  (
    'announcement',
    'Top announcement bar',
    'Free J&T shipping on orders over ₱8,000 · Five Tempo Pro colorways in stock',
    'Shop paddles',
    '/collections',
    5,
    true
  ),
  ('hero', 'Home hero', 'Play faster.', 'Feel lighter.', NULL, 10, true),
  ('editorial', 'Statement', 'Play faster.', 'Feel lighter.', NULL, 20, true),
  ('colorwayShowcase', 'Colorway showcase', 'Pick your court energy.', NULL, NULL, 30, true),
  ('macro', 'Macro detail', 'Built for the next rally.', NULL, NULL, 40, true)
ON CONFLICT (section_key) DO NOTHING;

COMMENT ON TABLE site_sections IS 'Homepage section copy and media URLs; storefront merges with defaults in dayoMedia.ts.';