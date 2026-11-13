# Heart of Columbus — section art and backgrounds

Use this package to extend the approved architectural illustration direction throughout the existing site. The owner explicitly wants sophisticated editorial artwork and distinctive backgrounds, beyond the current clip-art treatment. Keep the existing brand and useful interface. This is an asset handoff, not a tested repository patch or deployment.

## Start here
1. Read repo instructions, identify the framework/static root and find the current hero/background/card fallback components. Preserve business records, real photographs, search, maps, saved places, filters, ordering and booking links.
2. Review `preview.html`, `section-art-preview.jpg` and `asset-manifest.json`. The preview uses relative paths and opens offline after unzipping.
3. Copy `public/art/sections-v1/` to the framework's actual static directory so URLs resolve at `/art/sections-v1/`. Do not copy PNG masters into the public build.
4. Adapt the CSS and HTML example in `integration/` to existing components. Use asset paths, not a new external image dependency. Keep the original artworks intact; avoid applying filters, saturation boosts or heavy color overlays.

## Placement map
| Asset key | Intended placement | Notes |
| --- | --- | --- |
| downtown-day | Explore / neighborhood intro / home section | Warm downtown atmosphere; generic editorial streetscape, not a named business. |
| coffee-and-sweets | Coffee & Sweets category hero | Cafe still life; preserve real shop photos in listing cards. |
| parks-and-trails | Outdoors / parks / visit sections | Generic Midwestern greenway, not a verified trail view. Locate the actual route/component first. |
| arts-and-music | Events / live music / DJ editorial sections | Guitar and listening-room scene; no claim to show a specific venue. |
| makers-and-markets | Shopping / makers / local-market sections | Crafts and market still life; use category metadata to prevent unrelated fallbacks. |
| downtown-after-dark | Bars / evening events / date-night section | Dark illustration intended for light text in an opaque dark copy panel. |
| cream-botanical-background | Light intro bands / newsletter / long editorial pages | Calm center; detail at the right edge. Avoid repeating recognizable branches in a tiled pattern. |
| midnight-architectural-background | Footer / featured-event band / dark section | Dark architectural linework; quiet center and left for text. |

Known category routes include `/c/coffee-sweets/`, `/c/bars/`, `/c/shopping/`, `/c/makers/`, `/c/events/` and the Explore area. Match the actual source route configuration before changing files. Outdoor or music content may live on other pages; do not invent routes to fit these assets.

## Visual use
- Six wide section illustrations plus two low-detail background plates. All are original generated raster artwork in pen, gouache and colored-pencil style. Masters are PNG; delivery derivatives are optimized WebP. They are not vector files or documentary business photos.
- Wide scene masters leave quieter space on the left. Use a solid cream copy panel on light scenes, or solid navy on dark scenes, so text contrast is reliable. Do not assume all cream-looking image pixels pass contrast checks.
- On mobile put copy above artwork. Preserve a meaningful right-hand crop, since the subjects sit on that side. Use supplied `-card-640.webp` scene crops for cards rather than shrinking the whole panorama into a small thumbnail.
- Background plates should be used as single `cover` images or constrained nonrepeating right-aligned decoration. They are NOT promised to tile seamlessly. Keep the solid fallback color behind them.
- Use illustration where it serves navigation and atmosphere. Avoid replacing every business photo with the same art or stacking a hero, patterned background and illustrated card in every viewport.
- Keep headings and copy in HTML, never burn them into the artwork. No emoji over the scene. Preserve meaningful utility icons and accessible controls.

## Performance and accessibility
Use the manifest's real width/height values for markup and matching aspect-ratio. Select the 768px or 1440px derivative with `srcset` and actual component sizes. Do not upscale images to artificial higher resolutions. Lazy-load below-fold artwork; eagerly load only the actual above-fold hero, with high priority only when justified. Keep dimensions reserved to prevent layout shift.

Decorative art should have empty alt next to live headings and descriptive copy. If an illustration carries content beyond nearby text, write an accurate alt description without claiming it is a real business or landmark. Do not put aria-hidden on a section that contains text or buttons. Check contrast, keyboard focus, zoom, reduced motion and 390px/768px/1440px layouts. No animation or parallax is required.

## Implement and verify
Replace source references, not generated output. Start with Explore and Coffee & Sweets, then the other relevant sections. Remove redundant clip-art hero decoration on those sections after new artwork is active, retaining utility icons. Confirm unrelated categories keep the right image mapping. Run the existing build/checks, confirm all asset URLs, check responsive crop and contrast, and capture before/after screenshots. Commit on a branch with assets and source changes together. Provide a reviewable PR; do not claim this package itself changes the live site.

The earlier architecture/history package is separate and remains the source for landmark-specific cutouts and researched articles. These new atmospheric scenes are generic editorial illustrations and must not be cited as historical evidence.
