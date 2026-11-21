# Phase 5 — Supabase wire-up

## Migrations (run in order)

1. `supabase/migrations/001_orders_core.sql`
2. `supabase/migrations/002_catalog_cms_auth.sql`
3. `supabase/migrations/003_order_fsm_inventory.sql` (Phase 6 — order FSM + stock)
4. `supabase/migrations/004_site_cms_staff.sql` (Phase 7 — site CMS + catalog writes)
5. `supabase/migrations/010_site_media_modules.sql` (Phase 7 — media asset registry)
6. `supabase/migrations/011_store_media_storage.sql` (admin image uploads — `store-media` bucket)
7. `supabase/migrations/012_orders_staff_insert.sql` (staff can insert sample/manual orders while signed in)
8. `supabase/migrations/013_orders_staff_delete.sql` (staff can remove preview orders)
9. `supabase/migrations/014_orders_high_risk.sql` (`high_risk` + `high_risk_note` on orders)
10. `supabase/migrations/015_orders_shipment_tracking.sql` (`shipment_tracking` — cleared when unfulfilled)
11. `supabase/migrations/016_staff_permissions.sql` (`permissions`, `display_name`, admin profile policies)
12. `supabase/migrations/017_admin_owner_profile.sql` (`admin@zion.com` owner bootstrap policy)
13. `supabase/migrations/018_product_gallery_images.sql` (`products.gallery_images` JSON array for PDP gallery)

## Env

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ENABLE_ADMIN=true
```

## First staff user (account owner)

**Owner email:** `admin@zion.com` — full admin access, staff management, all permissions.

1. Supabase Dashboard → **Authentication → Users → Add user**  
   - Email: `admin@zion.com`  
   - Password: your choice (share only with owners)  
   - Confirm email if your project requires it
2. Run migrations through `018_product_gallery_images.sql`.
3. Sign in at `/admin/login` with `admin@zion.com`.  
   The app creates or upgrades the `profiles` row to **admin** on first sign-in.

Manual SQL (only if the profile row is missing after step 1):

```sql
INSERT INTO profiles (user_id, email, role, display_name, permissions)
SELECT u.id, 'admin@zion.com', 'admin', 'ZION Admin', '{}'::jsonb
FROM auth.users u
WHERE lower(u.email) = 'admin@zion.com'
ON CONFLICT (user_id) DO UPDATE
  SET role = 'admin', email = 'admin@zion.com', display_name = 'ZION Admin';
```

## Storefront behavior

- **Products / collections:** When the store is connected, the first signed-in visit to **Products** or **Collections** in admin copies the starter catalog into the database if those tables are empty. Edits (including collection checkboxes on products) save to `products`, `collections`, `product_colorways`, and `product_stock`.
- **Orders:** Order numbers start at **#1001** (`ZION-1001`, …). Preview rows **#1001** (paid, Makati) and **#1002** (pending, Cebu) are refreshed on admin load. Older test IDs are hidden from the admin list. Checkout takes the next number.
- **Contact:** `/contact` → `contact_inquiries` (or local fallback).
- **Orders:** checkout still uses Phase 3–4 flow; staff list at `/admin/orders`.

## Storage buckets (manual)

- `media-private` — payment proofs (signed URLs via `getSignedMediaUrl`)
- `media-public` — published product art (optional)