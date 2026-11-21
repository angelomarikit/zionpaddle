# Asset QA Report

## Approval matrix

| Asset | Identity match | Branding clean | Resolution | Pairing (still ↔ video) | Verdict |
|-------|----------------|----------------|------------|-------------------------|---------|
| Graphite still + loops | High | Mostly clean on studio still | Good | Matched | **Approve with spot-check** |
| Signal Orange | Medium — stripes design ≠ some gen frames | **Fail** — dinkly on still | Good | Review video frames | **Reject still for ads** until master swap |
| Volt Lime | Low — crop from grid panel | Unknown | **Fail** <400px wide | Weak | **Reject** for hero/cards; regen master |
| Cobalt Rush | Medium | **Fail** — VIENTO on still | OK | Check video | **Conditional** |
| Lavender Coral | High art | **Fail** — FRIDAY on still | Good | Check video | **Conditional** |
| colorway-showcase.mp4 | — | Prompt said no text | 1080p | N/A | **QA viewing required** |
| hero-graphite-volt.mp4 | — | — | 1080p | N/A | **QA viewing required** |
| macro-graphite-volt.mp4 | — | — | 1080p | N/A | **QA viewing required** |
| product loops (×5) | Per ref | — | 1080p/1:1 | Per colorway | **QA viewing required** |

## Consistency notes

- Five colorways share **one physical mold** in references; non-flagship products still use **`hero.png`** — visual identity breaks on shop grid.
- Tech section reuses stills (not literal layer cutaways) — acceptable editorial stand-in until cutaway art exists.

## Mobile suitability

| Asset | Issue |
|-------|-------|
| `03_volt_lime.jpg` | Blurry in 5-column grid on 375px |
| Full-bleed videos | OK with `object-cover` + gradients; data use moderate (~2MB hero) |
| Poster fallbacks | Required on metered — implemented in `ProductVideo` |

## Currently unused / underused (pre-rebuild)

- `colorway-showcase` was in a small rounded box — **now full-bleed**
- `macro` was PDP-only — **now home + PDP**
- `grid-ref.jpg` — inventory only