# TEMPO Design Reference Audit — DAYO Pickleball Adaptation

**Sources inspected:** [Live preview](https://tempo-sneakers.framer.website/), [Marketplace listing](https://www.framer.com/marketplace/templates/tempo/), Framer remix project `ScGGyz6CaBnG9ZFg8qkb` (node `augiA20Il`).

**Scope:** Structure, spacing rhythm, section order, interaction patterns. **Not copied:** TEMPO branding, sneaker photography, Shopify checkout claims.

## Breakpoints (Framer)

| Token   | Width  |
|---------|--------|
| Desktop | 1200px |
| Tablet  | 810px  |
| Phone   | 390px  |

DAYO implementation: Tailwind `max-w-[1200px]`, tablet stack at `md` (~810), mobile-first at `390`.

## Typography

| Role        | TEMPO              | DAYO                          |
|-------------|--------------------|-------------------------------|
| Display     | Archivo bold       | Archivo 700–800               |
| Indices     | Geist Mono         | Geist Mono `(01)` labels      |
| Body        | Archivo regular    | Archivo 400–500 on cream/ink   |

## Color surfaces (Framer tokens → DAYO)

| TEMPO usage              | Hex (approx) | DAYO token              |
|--------------------------|--------------|-------------------------|
| Dark sections (Hero, Tech)| `#141414`   | `--surface-ink`           |
| Light sections (Size, Colourways) | `#F3F0E8` | `--surface-cream` |
| Accent CTA / wordmark    | Orange       | `--accent-coral` + volt/court accents |

## Site map

| TEMPO path        | DAYO path              | Notes                          |
|-------------------|------------------------|--------------------------------|
| `/`               | `/`                    | Hero + scroll sections         |
| `/shop`           | `/collections`         | Grid of variants/collections   |
| `/shop/:slug`     | `/products/:slug`      | PDP + variant lab              |
| `/about` …        | Same                   | Static shells Phase 2          |

## Home sections (order locked)

1. **Hero** — 100vh, `Colourway Stage`, bottom strip: copy + CTA | swatches | price + index `01/04`
2. **Size** — Inline variant/size lab (DAYO: grip/weight on flagship)
3. **Tech** — Three numbered layers (paddle: face / core / edge guard)
4. **Lifestyle** — 100vh editorial, parallax
5. **Colourways** — Four-up grid, hover lift
6. **Fit guide** — Toggle groups (EU/US/UK → grip size / handle length)
7. **In the box** — Numbered unbox list
8. **FAQ** — Accordion
9. **Buy band** — Final CTA + newsletter

## Hero layer tree (Framer)

```
Hero (stack, 100vh, padding 0 40px 36px)
├── Stage → Colourway Stage (floating product + background wordmark)
└── Strip (grid)
    ├── Copy → H1, subcopy, CTA button
    ├── Swatches → chips + colour name
    └── Price → index component + amount
```

DAYO: wordmark **DAYO**; product asset placeholders labeled in UI.

## Shop page

- H1: collection headline + one-line promise
- 2-column (desktop) product cards: image, subtitle, price
- Fit teaser band + newsletter (footer pattern repeated)

## Product page (`/shop/:slug`)

- Breadcrumb: All colourways
- Variant swatches (radio pattern)
- Size lab: region toggle + grid + fit width + sticky “Choose …” CTA
- Repeated Tech + Colourways modules
- Same footer/newsletter

## Components to build

| Component          | TEMPO reference              |
|--------------------|------------------------------|
| `SiteHeader`       | Center nav + logo + bag       |
| `HeroStage`        | Stage + strip                |
| `SectionShell`     | Ink/cream + mono index       |
| `VariantSwatches`  | Colour buttons + radio       |
| `VariantLab`       | EU/US/UK + fit toggle        |
| `ProductCard`      | Shop grid card               |
| `CartDrawer`       | Bag overlay                  |
| `NewsletterBand`   | Early access + email         |
| `SiteFooter`       | 3-column links + payment note|

## DAYO content mapping (shoe → paddle)

| TEMPO section | DAYO copy axis                          |
|---------------|-----------------------------------------|
| Knit          | Carbon face / textured surface          |
| Foam          | Polymer core / control foam             |
| Sole          | Edge guard / honeycomb structure        |
| Size lab      | Grip circumference / handle length      |
| Fit           | Narrow / standard / cushioned grip      |

## Screenshots

See [`screenshots/`](screenshots/):

- `tempo-hero-viewport.png` — hero composition reference

## Documented differences

- Multi-collection catalog beyond four colourways
- PHP pricing, manual PH payment methods (no Shopify strip)
- Collections in primary nav
- Placeholder product art until admin-approved assets