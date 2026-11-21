# ZION Pickleball Store

TEMPO-inspired customer storefront for ZION Pickleball. Phase 1–2: design audit docs, mock catalog, motion, cart drawer.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment

Copy [`.env.example`](.env.example) when connecting Supabase in Phase 5. Do not commit secrets.

## Git & GitHub

- [`docs/GITHUB_MANUAL.md`](docs/GITHUB_MANUAL.md) — commands for commits, branches, push, and pull requests

## Design audit

- [`docs/design-audit/tempo-reference.md`](docs/design-audit/tempo-reference.md)
- [`docs/design-audit/motion-checklist.md`](docs/design-audit/motion-checklist.md)
- [`docs/higgsfield-media-playbook.md`](docs/higgsfield-media-playbook.md)

## Phase status

| Phase | Status |
|-------|--------|
| 1–2 Customer UI (mock) | Implemented |
| 3 Checkout UI | `/checkout` — address, J&T quote, GCash/Maya/QR Ph + proof upload |
| 4 Orders persistence | `orders` migration + `submitOrder` (Supabase or `localStorage` fallback) |
| 5 Supabase wire | Auth, catalog reads, contact, `/admin` staff shell |
| 6 Orders FSM + inventory | Implemented — see `docs/PHASE6_ORDERS.md` |
| 7 Admin CMS editor | Implemented — see `docs/PHASE7_CMS.md` |

Assets marked **PLACEHOLDER** in alt text until admin-approved media.