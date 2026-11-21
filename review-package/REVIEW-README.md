# DAYO Pickleball — Media Review Package

Generated: 2026-11-20  
Source: Higgsfield MCP (`seedance_2_0`, 5s, 1080p / 1:1)

## Contents

### `media/` — Generated MP4s (~13.9 MB total)

| File | Purpose |
|------|---------|
| `hero-graphite-volt.mp4` | Homepage hero loop |
| `colorway-showcase.mp4` | 5-colorway wipe (multi-reference) |
| `product-graphite-volt.mp4` | Product / card hover |
| `product-signal-orange.mp4` | Product / card hover |
| `product-volt-lime.mp4` | Product / card hover |
| `product-cobalt-rush.mp4` | Product / card hover |
| `product-lavender-coral.mp4` | Product / card hover |
| `macro-graphite-volt.mp4` | PDP macro detail |

### `assets/` — Reference stills + job manifest

- `01_graphite_volt.jpg` … `05_lavender_coral.jpg`
- `MANIFEST.json` — Higgsfield job IDs
- `grid-ref.jpg` — optional 5-up reference

## QA checklist

For each video, confirm:

1. Paddle shape, edge guard, grip, and face graphics match the reference still.
2. No unintended text/logos added by generation.
3. Loop feels smooth (hero, product loops).
4. Colorway showcase transitions read clearly between all five variants.

**Note:** Some reference stills contain third-party branding on the paddle art; reject for marketing until replaced with clean DAYO masters.

## Preview on the full site

From the project root (not included in this zip):

```bash
npm install
npm run dev
```

Open `/` (hero + colorway band), `/collections`, `/products/dayo-tempo-pro`.

## Re-generation

Each 5s 1080p clip ≈ 60 Higgsfield credits. Re-gen only after marking which files failed QA.