# Heart of Columbus — complete visual overhaul

## Your assignment
You are Claude working in the existing Heart of Columbus repository. Completely refresh the visual experience of https://heartofcolumbus.netlify.app/ using this package. Implement the design, do not stop at suggestions. First read repository instructions and inspect the real templates, styles, routing, data and scripts. Preserve working business logic. This package is an art direction and asset handoff, not a replacement production application.

## Direction: a local field guide worth collecting
A warm, confident, editorial guide to Columbus, INDIANA. Combine modernist geometry, neighborhood shop windows, tactile illustrated stickers and generous whitespace. Make it feel specific to a town built around architecture and independent businesses. Avoid generic travel gradients, emoji illustration, glass panels, stock dashboards, excessive pills, or decoration competing with search.

The supplied 36-sticker atlas is the new illustration family. Use it sparingly in the actual interface, abundantly on a dedicated optional brand/sticker gallery. The giant sheet is a graphics library, not a homepage background. Never replace real business photography or official logos with an illustration presented as a real venue image.

## What was inspected
Homepage HTML and `/css/hoc.css` fetched November 16, 2026. The site has Fraunces and Inter font declarations, red/cream/charcoal styling, thick borders, offset shadows, emoji-led category and business placeholders, search, category links, business cards, event listings, direct ordering links, neighborhoods, landmarks, itineraries and saved places. This is a source/style inspection, not an exhaustive browser or repository audit. Verify every route and interactive state in the actual checkout.

Observed homepage counts are dynamic and may change. Do not hardcode the observed 936 businesses, 15 categories or 10 neighborhoods into new components. Derive counts from current data. Do not infer verified hours, reviews, popularity or partnership from appearance in this directory. The current homepage mixes event dates under a weekend label; filter against the actual current date and America/Indiana/Indianapolis timezone, rather than preserving stale dates.

## Design tokens
| Token | Value | Use |
|---|---|---|
| paper | #FFF9EF | Page canvas |
| surface | #FFFFFF | Forms, cards |
| ink | #252722 | Primary text, outlines |
| muted | #60645B | Secondary text |
| red | #B92E2B | Primary buttons, active states; white text |
| illustration-red | #C73532 | Decorative artwork |
| sage | #B9C9AD | Category and neighborhood fields |
| sky | #BED8E5 | Visit/map fields |
| blush | #EBC9BF | Community and event fields |
| gold | #E9B949 | Small highlights; ink text |
| line | #D8D8CC | Dividers |

Retain self-hosted Fraunces for headings and Inter for UI where available. Display headings: 56–80px desktop, 38–46px mobile, 0.98–1.06 line-height, maximum 14 characters per line for the hero only. Body 16–18px/1.55; metadata at least 13px. Use 4/8/12/16/24/32/48/64/96 spacing. Content width 1240px. Cards radius 16px; inputs/buttons 10–12px; reserve pill shapes for real filters. Use 1px quiet card borders and almost no shadow. Reserve 2px ink outlines and 3px hard shadows for one or two signature moments per viewport. Cream space should dominate; saturation belongs primarily to stickers and actions.

## Homepage composition
1. **Header:** compact heart/storefront brand mark + live text wordmark. Desktop links Explore, Visit, Events, Order & book, Saved. Keep all existing destinations discoverable, including map and neighborhoods. Search accessible from every page. Mobile header 64px with brand, saved and labeled menu; menu is keyboard accessible and closes on Escape.
2. **Hero:** two-column editorial layout, 55% text / 45% illustration. Small location line; retain the existing short hero headline if approved. Support with concise copy explaining local discovery. Large search field with visible label, real submit button, and three or four popular shortcuts. Right: controlled collage of 4–6 supplied stickers on a pastel sky field, with a flat geometric frame, not a giant raster of the website. On mobile put search before illustration; shorten collage height to 180–220px.
3. **Category finder:** all 15 categories, one custom illustration each, clear category label and live count. Desktop five columns, tablet three, mobile two. Keep category search/navigation quick; never hide all categories inside a carousel.
4. **Spotlight:** three editorial business cards. Use approved photos where available; otherwise subtle category illustration with explicit illustrative treatment. Clear business name, category, neighborhood and one main listing link; secondary call/book action only when supported by data. Retain existing spotlight selection without inventing endorsements.
5. **Direct from the source:** calm sage band explaining order/book/shop. Three distinct links using current destinations and live counts. Demo storefronts must retain obvious demo labels and the explanation that orders are not sent to businesses.
6. **Weekend / events:** date-led cards with verified dates and venue; correct date filtering. Avoid embedding event dates in artwork. Show empty/upcoming alternatives honestly.
7. **Neighborhood explorer:** map-inspired decorative framing with actual neighborhood links in an accessible grid/list. Decorative maps are not navigation maps. Actual interactive maps retain real coordinates and a list alternative.
8. **Local trails:** compact editorial rows for food, coffee, architecture, shopping and other existing collections. Reduce repeated horizontal rails. Keep See all links.
9. **Owners / footer:** clear owner claim/add-business routes and credits. Strong ink footer, cream typography, restrained heart illustration. Preserve legal, source and attribution links.

## Page-family requirements
- `/explore/` and `/c/*`: prominent search; labeled filter controls; active filters and Clear all; result count; consistent business cards; useful no-results state. Preserve query-string state and list/map switching.
- `/b/*`: business identity and category, address, genuine hours/source, primary direct action, phone/directions, saved toggle. Facts stay live HTML. Retain appropriate source/verification notes. Do not fake booking functionality.
- `/n/*`: neighborhood intro, real listings, nearby discovery and links. Use the map/park/architecture sticker family as decoration, not invented neighborhood logos.
- `/visit/`, `/l/*`, `/trips/*`: editorial photo/illustration hierarchy and readable itineraries. Landmark stickers are stylized, not precise records of buildings. Verify landmark photography and attribution before use.
- `/events/`: readable date blocks, current/upcoming filters, calendar links and honest empty state.
- `/order/` and demo storefronts: distinguish real external order links from demos at every entry point. Preserve each business's identity and existing flow.
- `/saved/`: real saved-state persistence, remove/undo, useful empty state and links back to explore.
- `/owners/` and related owner flows: readable forms, visible labels, error/success states; retain existing submission behavior.
- Other existing special-interest pages inherit the new system; inventory them rather than dropping them.

## Asset rules
Read `ASSET_MAP.md`. `graphics/sticker-atlas.png` is an original generated illustration sheet in a 6×6 grid. Use the supplied CSS atlas helpers for decorative use. Inspect each cell's edges at target size before shipping; generation can introduce small alignment differences. If cropping individual exports during implementation, preserve alpha and cream sticker border, add 8% safe padding, and never crop adjacent artwork. Keep the master unchanged. No transparent padding removal across the whole atlas: it would break the cell coordinates.

Use 64–96px category stickers; 160–320px hero stickers; 24px UI icons must be simple SVGs, not miniature stickers. Decorative image has empty alt/aria-hidden; meaningful illustration gets a concise alt. Accessible category names remain visible text. Do not place text within the images or use a raster image as a control. Do not treat the drawings as official business or city logos.

## Interaction and responsive behavior
Use existing scripts and DOM contracts unless a migration is necessary. Inspect `/js/core.js`, `/js/site.js`, `/js/hub.js` and actual referenced scripts. CSS observed at `/assets/app.css` and `/css/hoc.css` may be build output: find source files before editing. Do not assume a framework or introduce one just for the redesign.

Mobile-first layout with checks at 360, 390, 768, 1024 and 1440px. No document-level horizontal overflow. Interactive targets at least 44×44px. Search suggestions, filters, menus, save controls, carousels and dialogs must work with keyboard and touch. Visible focus rings. WCAG AA contrast: 4.5:1 normal text, 3:1 large text and UI boundaries; test actual combinations. Respect reduced motion. Optional sticker hover lift is 2px/140ms; no perpetual bobbing/parallax. No hover-only information. Preserve back navigation and URL search state.

## Implementation sequence
1. Inventory routes, templates, components, content sources, tests and existing behavior; capture current screenshots.
2. Add scoped tokens and typography, then shared header/footer and reusable controls. Remove obsolete competing CSS after confirming cascade.
3. Implement homepage hierarchy and atlas integration. Keep real copy/data and functional routing.
4. Apply system across page families and all loading, empty, error, selected, hover and focus states.
5. Optimize artwork: retain master, produce appropriately sized web assets if needed, lazy-load below fold, specify dimensions. Do not preload all 36 sticker files. Avoid adding a heavy animation library.
6. Run repository checks and test representative routes manually. Compare screenshots at mobile and desktop. Fix regressions.
7. Deliver changed-file summary, tested flows, screenshots, remaining limitations and deployment steps. Follow the repo's deployment instructions; do not invent credentials.

## Acceptance checklist
- Full visual refresh is coherent across home, discovery, details, events, neighborhoods, saved and owner pages.
- No emoji remains as the primary category illustration; labels still exist as HTML.
- All 15 category links map to their original data and routes.
- Search, filters, direct links, map/list, save persistence and mobile navigation retain behavior.
- No invented business facts, reviews, live status, availability, badges, dates or customer quotes.
- Demo ordering remains visibly demo-only.
- Keyboard/focus/contrast/reduced-motion and five viewport checks pass.
- Asset paths resolve, no console errors, no layout shift from missing image dimensions.
- Dynamic totals and event selection come from data.
- Existing content and source credits remain available.

## Prompt to begin
“Read CLAUDE_REDESIGN.md and ASSET_MAP.md, inspect this repository, then implement the complete Heart of Columbus visual overhaul. Use the supplied artwork and tokens. Preserve the real directory data and all working features. Work through every applicable page family, verify mobile and desktop behavior, and report what you changed and tested.”
