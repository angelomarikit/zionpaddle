# Desktop / Mobile QA Findings

**Environment:** `npm run dev` → http://localhost:5174/  
**Pass 1:** Structure, full-bleed, asset placement  
**Pass 2:** Typography, hero product matting (in progress)

## Automated / browser checks

| Check | 390 | 1440 | Notes |
|-------|-----|------|-------|
| Horizontal overflow | Not detected in snapshot | Not detected | `overflow-x: clip` on `html` |
| Hero readable | OK | OK | 3-column collapses to product-first |
| Full-bleed campaign video | OK | OK | `CampaignShowcaseSection` |
| Shop banner video | OK | OK | Collections hero |
| Cart / checkout logic | Not regression-tested visually | — | No cart UI changes |
| Placeholder SKUs in grid | Visible | Visible | Expected until CMS |

## Visual issues logged

1. **Hero product matting** — Studio gray in stills reads as a “card” on dark hero; mitigated with `bg-transparent` + aspect box — **may still need clean PNG masters**.
2. **Volt Lime thumb** — Soft at 5-column grid on wide screens.
3. **Non-flagship cards** — Identical `hero.png` breaks shop grid parity.
4. **Framer motion parity** — Not pixel-matched to TEMPO; directionally aligned.

## Screenshots

- `docs/design-audit/screenshots/qa-after/home-1440.png` (full page)
- Copy additional captures from Cursor screenshot temp folder if needed after local review.

## Before state

Pre-rebuild behavior documented in `DESIGN_AUDIT.md` (code review + prior `tempo-reference.md`). No before PNG archive in repo.