# Higgsfield Media Playbook — ZION Admin (Phase 7)

**Integration:** Cursor plugin `plugin-higgsfield-higgsfield`. **Workflow:** `product-photoshoot` (load via `get_workflow_instructions({ workflow: "product-photoshoot" })`).

**Rule:** Generated assets stay **draft** until admin approval. Do not replace genuine SKU reference photos deceptively. Use `image_references` when a confirmed product photo exists.

## Aspect ratios by section

| Section type        | Ratio   | Resolution | Workflow mode        |
|---------------------|---------|------------|----------------------|
| Homepage hero       | 21:9    | 2k         | `hero-banner`        |
| Collection banner   | 3:1     | 2k         | `hero-banner`        |
| Product editorial   | 4:5     | 2k         | `lifestyle-scene`    |
| Packshot / catalog  | 1:1     | 2k         | `product-shot`       |
| Campaign float hero | 16:9    | 2k         | `conceptual-product` |

Default model for reference-led shots: `nano_banana_pro`, `resolution: "2k"`, prompt ends with `resolution: 2k`.

## Prompt templates (English; no photographer names in prompts)

### Hero banner

```
Premium pickleball paddle e-commerce hero, [COLORWAY_NAME] colorway, floating paddle at dramatic angle,
dark charcoal background, oversized bold ZION wordmark partially behind product, energetic sports lifestyle,
studio lighting with coral and volt accent rim light, high-end commercial photography, no third-party logos,
resolution: 2k
```

### Lifestyle

```
Athletic Filipino pickleball player mid-volley on outdoor court, holding [PRODUCT_NAME] paddle,
golden hour, editorial sports photography, shallow depth of field, brand colors coral and court green accents,
no watermarks, resolution: 2k
```

### Collection banner

```
Wide cinematic banner, collection theme [COLLECTION_NAME], multiple pickleball paddles arranged editorially,
cream and ink color blocking, premium whitespace, Philippines sports retail aesthetic, resolution: 2k
```

## Admin UI flow (planned)

1. Staff picks section in Website Editor → **Generate with Higgsfield**
2. System pre-fills prompt + ratio from table above
3. Optional `media_upload_widget` for SKU reference → `generate_image_batch`
4. Job IDs stored as `media_assets` with `status: pending_review`
5. Approve → attach to `site_sections.desktop_media_id`; publish version snapshot

## Account probe

```json
{ "info": "free_trial" }
```

Call `get_account_overview` when wiring billing UI.

## Placeholder policy (Phase 2)

Use `public/placeholders/*` with visible “PLACEHOLDER ASSET” in alt text until approved media exists.

## 2026-11-20 — Seedance 2.0 product videos (MCP)

| Asset | Model | Credits (est.) | Job ID |
|-------|-------|----------------|--------|
| `public/media/dayo/hero-graphite-volt.mp4` | seedance_2_0 16:9 1080p 5s | ~60 | `0b7739b5-ff71-44fa-ad99-49f6b7589c6c` |
| `colorway-showcase.mp4` | multi `image_references` ×5 | ~60 | `05c4e829-f41c-45bb-81bf-65316dd96d64` |
| `product-*.mp4` (5) | start_image per reference | ~60 each | see `public/assets/dayo/MANIFEST.json` |
| `macro-graphite-volt.mp4` | start_image | ~60 | `38919689-3219-4d70-b929-7b7f07f74c07` |

**Total submitted:** 8 jobs (~480 credits at 60/job preflight). Review clips in-browser before marketing use; reject if paddle graphics drift.