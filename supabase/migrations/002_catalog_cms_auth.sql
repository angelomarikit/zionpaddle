-- Phase 5: catalog reads, contact, admin profiles (run after auth is enabled in Supabase)

CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  banner_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  subtitle text,
  description text NOT NULL DEFAULT '',
  price_php int NOT NULL,
  compare_at_php int,
  collection_slugs text[] NOT NULL DEFAULT '{}',
  weight_grams int NOT NULL DEFAULT 220,
  hero boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  specs jsonb NOT NULL DEFAULT '[]',
  features jsonb NOT NULL DEFAULT '[]',
  grip_sizes jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_colorways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  external_key text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  hex text NOT NULL DEFAULT '#141414',
  volt_hex text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (product_id, external_key)
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  topic text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied'))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_published ON products (published, slug);
CREATE INDEX IF NOT EXISTS idx_product_colorways_product ON product_colorways (product_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colorways ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public catalog reads
CREATE POLICY collections_select_public ON collections FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY products_select_public ON products FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY colorways_select_public ON product_colorways FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_colorways.product_id AND p.published = true
    )
  );

-- Contact form
CREATE POLICY contact_insert_public ON contact_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY contact_select_staff ON contact_inquiries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
    )
  );

-- Profiles: users read self; admins manage via service role in dashboard
CREATE POLICY profiles_select_self ON profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Staff read all orders (tighten anon insert from 001 in production)
CREATE POLICY orders_select_staff ON orders FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles pr
      WHERE pr.user_id = auth.uid() AND pr.role IN ('admin', 'staff')
    )
  );

-- Storage bucket (create in dashboard): media-private, proofs
COMMENT ON TABLE products IS 'Published catalog; storefront falls back to mock when empty.';