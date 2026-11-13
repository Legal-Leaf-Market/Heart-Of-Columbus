# Editorial category illustrations

Painted scenes of imaginary places, one set per browse type, used only where a
listing has no photo from its owner (`src/editorial-art.mjs`). They never show
a listed business, and every page that shows one tags it "Category
illustration".

| File in `public/art/` | Size | Use | object-position |
| --- | --- | --- | --- |
| `editorial-barbers-interior.webp` | 1280 x 853 | barbershop card and page fallback | 60% 50% |
| `editorial-barbers-tools.webp` | 1280 x 853 | barbershop card and page fallback | 50% 56% |
| `editorial-barbers-storefront.webp` | 1920 x 640 | /c/beauty/barbers/ header; card fallback | 68% 50% |

These are raster paintings, not vectors, so there is no SVG here. The WebPs
are the optimized exports from the "Heart of Columbus Barbers Art" package
(November 2026); its full PNG masters (1536 x 1024 and 2172 x 724, about
11 MB together) stay with that package rather than in git. To replace a
scene, export a new WebP at the same size and ratio, keep the subject inside
the center 70% so card crops hold it, and update the size and position in
`src/editorial-art.mjs` (tests/editorial-art.test.mjs checks both).
`PROMPTS.md` is how they were made.
