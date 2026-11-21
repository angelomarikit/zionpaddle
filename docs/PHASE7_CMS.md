# Phase 7 — Admin CMS editor

## Migrations (manual, in order)

1. `004_site_cms_staff.sql` — `site_pages`, `site_sections`, staff write RLS on catalog
2. `010_site_media_modules.sql` — `site_media_assets` registry (+ RLS)

Requires Phase 5 auth + `profiles` with `admin` or `staff` role.

## Admin routes (`VITE_ENABLE_ADMIN=true`)

| Route | Purpose |
|-------|---------|
| `/admin/catalog` | Edit product price/copy + collection banners |
| `/admin/content` | **Announcement bar** (top ticker), homepage sections + About/FAQ/Legal body copy |
| `/admin/media` | Register Higgsfield/CDN URLs; optional activate → section |

## Persistence modes

| Mode | Behavior |
|------|----------|
| **Supabase** | Upserts to Postgres when tables exist and staff is signed in |
| **Local overlay** | `localStorage` keys `dayo-cms-*-v1` merge on top of mock defaults — works without DB |

Storefront hooks: `useCatalog()` (product patches), `useSiteContent()` (sections → hero/showcase/editorial).

## Higgsfield workflow

1. Generate per `docs/higgsfield-media-playbook.md`
2. Export MP4 to `public/media/dayo/` or CDN
3. **Either** paste URL in `/admin/content` (section video/poster) **or** register in `/admin/media` when Supabase is live

## Static pages

`/about`, `/faq`, `/legal` render from CMS (`CmsStaticPage`); home FAQ accordion remains in code until wired to CMS JSON (future).