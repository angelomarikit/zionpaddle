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
14. `supabase/migrations/019_store_media_upload_fix.sql` (storage MIME types + owner upload policy)

## Env

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ENABLE_ADMIN=true
```

### Vercel

- `VITE_*` variables are **inlined at build time**, not read at runtime. After changing env in the Vercel dashboard, trigger a **new deployment** (Redeploy).
- Add **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** for Production (and Preview if you test admin there).
- Admin routes mount when `VITE_ENABLE_ADMIN=true`, or when those Supabase vars are set and you have **not** set `VITE_ENABLE_ADMIN=false`.
- If opening `https://yoursite.vercel.app/admin` shows a **404**, the SPA fallback was missing — the repo includes `vercel.json` rewrites to `index.html`; redeploy after pulling that file.
- If `/admin` **redirects to the home page**, the build did not see Supabase/admin env — check names (`VITE_` prefix), redeploy, or set `VITE_ENABLE_ADMIN=true` explicitly.

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