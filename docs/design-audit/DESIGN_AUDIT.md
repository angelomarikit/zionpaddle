# DAYO Visual Design Audit — TEMPO Alignment

**Date:** 2026-11-20  
**References:** [TEMPO marketplace](https://www.framer.com/marketplace/templates/tempo/), [Live preview](https://tempo-sneakers.framer.website/), Framer remix `ScGGyz6CaBnG9ZFg8qkb` (session opened; home tree not re-exported this pass — prior `tempo-reference.md` + live site used).

## Executive summary

| Area | Pre-audit state | Post-rebuild (this pass) |
|------|-----------------|--------------------------|
| Global width | `max-w-[1200px]` on hero, header, sections → wasted ultra-wide canvas | Full-bleed sections + fluid `ContentRail` (`--dayo-content-max` / `--dayo-content-wide`) |
| Hero | Stacked stage; background video only on colorway 1; copy in bottom strip only; DAYO wordmark collision risk | 3-column hero grid; integrated transparent header; gradient scrim; product scale via `clamp` |
| Higgsfield usage | Hero bg at 40% opacity; colorway video in a short box; macro hidden in PDP `<details>` | Full-bleed campaign showcase; macro home section; hero + collection banner video |
| Catalog visuals | Non-flagship SKUs shared `hero.png` placeholder | Hover video only on flagship; static posters elsewhere |
| Section completeness | Missing editorial statement, macro story, campaign band | 12-section home narrative aligned to brief |
| Copy accuracy | “Four colours” vs 5 colorways | Corrected to five |

## TEMPO section map vs DAYO (home)

| # | TEMPO (Framer) | DAYO (current) | Status |
|---|----------------|----------------|--------|
| 1 | Hero 100vh + colourway stage | `HeroStage` full-viewport | **Improved** — closer to asymmetric strip |
| 2 | Size / variant lab | `VariantLabSection` | OK |
| 3 | Tech (3 columns) | `TechSection` with real stills | **Improved** |
| — | — | `EditorialStatementSection` | **Added** (editorial type) |
| 4 | Lifestyle 100vh | `LifestyleSection` full-bleed | **Improved** — no generic `hero.png` |
| 5 | Colourways grid | `ColourwaysSection` 5-up | **Improved** |
| — | — | `CampaignShowcaseSection` (video) | **Added** |
| — | — | `MacroFeatureSection` | **Added** |
| 6 | Shop teasers | `CollectionsTeaser` | **Improved** assets |
| 7 | Featured / shop | `BestSellersSection` | OK |
| 8 | Fit + FAQ + buy | Fit, In box, FAQ, Buy band | OK (condensed indices) |
| — | — | `CommunitySection` | **Added** |
| 9 | Newsletter + footer | `NewsletterBand` + `SiteFooter` | OK |

## Layout defects addressed

### Desktop (1440–2560)

- **Fixed 1200px rail** on hero stage and lifestyle inner copy — replaced with fluid rail up to 1320px / 1560px wide variant.
- **Unused horizontal margins** on ink/cream bands — backgrounds now `full-bleed`; padding only on inner rail.
- **Hero product** capped at `max-w-xl` (~576px) — now `--dayo-hero-product: clamp(280px, 38vw, 520px)` with grid placement.

### Mobile (375–390)

- Hero strip was 3-row stack with late copy — copy now flows after product on small screens (`order-*` grid).
- Sticky PDP CTA preserved; header overlap reduced via `pt-16` on hero.

### Overlap / z-index (known fixes)

| Issue | Cause | Fix |
|-------|-------|-----|
| Video vs CTA | Hero bg video in same stack as controls | Ambient layer `absolute` + `pointer-events-none`; content `z-10` |
| DAYO wordmark vs paddle | Absolute center, single column | Wordmark behind product column; gradient scrim |
| Fixed header vs hero | `pt-24` only on some pages | Hero `pt-16` + transparent header on `/` |

### Not verified via Framer MCP this pass

- Per-component Framer appear effects, exact spring values, and scroll parallax on TEMPO lifestyle — **inferred** from live preview and existing `tempo-reference.md`.
- Sneaker-specific asset aspect ratios — adapted to portrait paddle art.

## Typography & motion

| Token | Issue | Action |
|-------|-------|--------|
| Display scale | Hero H1 smaller than TEMPO | Editorial `clamp()` headlines in statement + lifestyle |
| Motion | Parallax on tech scale caused layout shift | Removed scale-on-scroll in tech; kept lifestyle parallax only |
| Reduced motion | Already in `ProductVideo` | Unchanged — posters only when `prefers-reduced-motion` |

## Remaining visual gaps (no new Higgsfield until approved)

1. **Lifestyle** — still illustrative (paddle still + color grade), not true full-width photography.
2. **Non-flagship catalog** — shared placeholder paddle art.
3. **Tech layer 2** — macro poster used as stand-in for “core” cutaway (no X-ray asset).
4. **Source still QA** — third-party marks on refs (dinkly, VIENTO, FRIDAY) — see `ASSET_QA_REPORT.md`.
5. **`03_volt_lime.jpg`** — 341×468 crop; weak for large cards.

## QA viewports checklist

| Width | Homepage | Collections | PDP | Cart |
|-------|----------|-------------|-----|------|
| 375 | Screenshot `qa-after/home-375.png` | `qa-after/collections-375.png` | `qa-after/pdp-375.png` | pending |
| 1440 | `qa-after/home-1440.png` | `qa-after/collections-1440.png` | `qa-after/pdp-1440.png` | pending |
| 1920 | `qa-after/home-1920.png` | — | — | — |

See `docs/design-audit/screenshots/qa-after/`.

## Changed files (layout / visual)

- `src/styles/globals.css` — rail tokens, `overflow-x: clip`
- `src/components/layout/ContentRail.tsx` — **new**
- `src/components/tempo/HeroStage.tsx`, `SectionShell.tsx`
- `src/components/home/HomeSections.tsx`, `HomePage.tsx`
- `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`
- `src/routes/CollectionsPage.tsx`, `ProductPage.tsx`
- `src/components/product/ProductCard.tsx`