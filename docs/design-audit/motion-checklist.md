# Motion Checklist — TEMPO → DAYO (Motion for React)

Shared config: `src/lib/motion.ts` — spring `{ stiffness: 260, damping: 28 }`, duration fallback `0.45s`, easing `[0.22, 1, 0.36, 1]`.

All entries honor `prefers-reduced-motion`: use `useReducedMotion()` → instant opacity or disable parallax.

| ID | UI element | TEMPO behavior | Component | Implementation | Verified |
|----|------------|----------------|-----------|----------------|----------|
| M01 | Hero colour swatch | Shoe + wordmark swap, burst | `HeroStage` | `AnimatePresence` crossfade product; burst SVG opacity | Phase 2 |
| M02 | Hero load | Staged appear | `HeroStage` | `initial={{ opacity: 0, y: 12 }}` → visible | Phase 2 |
| M03 | Section enter | Scroll reveal | `SectionShell` | `useInView` once, fade up 24px | Phase 2 |
| M04 | Tech macro | Zoom on scroll | `TechSection` | `useScroll` scale 1→1.08 on image | Phase 2 |
| M05 | Tech callout | Line draw | `TechSection` | SVG stroke `pathLength` animate | Phase 2 |
| M06 | Lifestyle | Parallax layers | `LifestyleSection` | `translateY` multipliers 0.05 / 0.12 | Phase 2 |
| M07 | Colourway card | Hover lift | `ProductCard` | `whileHover={{ y: -8 }}` + shadow | Phase 2 |
| M08 | Size cell | Tap select | `VariantLab` | scale 0.98 on tap; disabled opacity | Phase 2 |
| M09 | Cart drawer | Slide over | `CartDrawer` | `x: 100%` → `0` spring | Phase 2 |
| M10 | Mobile buy bar | Sticky reveal | `ProductPage` | Intersection sticky strip | Phase 2 |
| M11 | FAQ item | Accordion | `Accordion` | height + rotate chevron | Phase 2 |
| M12 | Nav bag count | Badge pop | `SiteHeader` | scale spring on count change | Phase 2 |

## Timing gaps (not measured from Framer export)

- Exact Framer `appearEffect` durations per section — tune via screen compare before Phase 8 QA.
- Hero burst frame count — approximated with 200ms opacity sweep.

## Reduced motion

```ts
const reduce = useReducedMotion()
const transition = reduce ? { duration: 0 } : springTransition
```

Parallax: set `style={{ transform: 'none' }}` when `reduce` is true.