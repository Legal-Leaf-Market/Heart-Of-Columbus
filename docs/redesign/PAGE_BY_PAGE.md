# Page-family implementation specification

Use route-inventory.csv as the exhaustive list of reachable routes from this crawl. These instructions apply to each matching route, not one sample only.

| Family | Required redesign | Critical checks |
|---|---|---|
| `/` | Keep the approved field-guide direction, simplify search first, remove image regions from all unphotographed spotlight/rail businesses. Reserve stickers for category/editorial modules. | Every repeated business card and spotlight; homepage count from live data; event dates current. |
| `/b/*` | Apply each dossier and the three media states. Identity, main action and practical information before embellishment; related businesses obey the same no-clip-art rule. | Exact location, website, booking/order/call/save; source notes and outline status survive. |
| `/explore/` | Search/filter controls plus clear active-filter summary; compact text-first result rows when no photos; genuine photos optional. | Query-state persistence, no-results, clear all, map popups, list-map parity and dynamic rendering. |
| `/c/*` including nested subcategories | Small category art only in the page intro, never repeated as every business cover. Keep labels and current counts. | Child categories, pagination and all entries, keyboard filters. |
| `/n/*` | Neighborhood editorial heading and grounded location description; text/photo business list; map only from actual coordinates. | No invented neighborhood imagery or landmarks; every category represented. |
| `/l/*` | Landmark name and location; verified credited photography when available; any illustration explicitly editorial and outside business slots. | Hours/tours/accessibility remain sourced; no invented building appearance. |
| `/trips/*` | Ordered readable stops, real destinations, compact time/distance information only where sourced. | Every embedded business obeys media resolver; route order and links preserved. |
| `/visit/`, `/architecture/`, `/history/`, `/cummins/` | Long-form editorial hierarchy with comfortable reading width, optional contents, real landmark/media credits. | Small-screen reading, internal anchors, historical source links. |
| `/events/`, `/holidays/`, `/markets/` | Date-led layouts, chronological upcoming events, timezone-aware filtering, compact venue links. | ICS feed/download, past-event state, no artwork hiding event facts. |
| `/order/` | Clear order/book/shop groupings; genuine direct destinations; compact business entries. | Real external services versus demos must remain explicit. |
| `/owners/` | Clear claim/add/photo-submission paths; labeled fields, explicit photo rights/credit fields, honest success/error states. | Preserve existing submission backend; do not replace working forms with decorative fake forms. |
| `/saved/` | Same shared card/resolver; strong empty state with Explore link. | Persistence, remove/undo if supported, invalid/deleted records, broken image state. |
| `/plan/` | Readable planning controls and saved stops, predictable actions. | Preserve actual current functionality; no fake itinerary generation. |
| `/free/`, `/sports/`, `/skate/`, `/trails/`, `/arts/`, `/film/`, `/agriculture/`, `/djs/` | Editorial section heading, useful filters/links, restrained thematic accents; embedded businesses remain text/photo only. | Real dates/fees/locations; no invented open/closed labels. |
| `/big-cheese/`, `/gills/`, `/rohdes/`, `/tacolumbus/`, `/tasty-express/` and other special storefronts | Inspect whether each is demo or real. Preserve that identity and all notices. Remove generic business-cover art; retain actual product photography only with provenance. | Cart/checkout/book links, demo notices at entry and action points; never imply an order was sent. |
| `/stickers/` | This is the dedicated home for the illustration collection; group by theme, give whitespace and readable labels. | Art must not leak back into business media through shared fallback defaults. |
| `/founders-club/`, `/help/`, `/credits/`, `/obituaries/`, other routes | Apply typography/spacing/navigation consistently; preserve purpose, facts and attributions. | Do not invent membership/payment/obituary functionality; audit any embedded business cards. |

## Record-level work
The register includes current cover asset references, potential non-art images, currently linked non-directory destinations and a per-record treatment. All photo candidates require human/source review; filenames alone are not visual verification. Multiple business locations stay separate. If the crawl has an error, resolve it from source and recrawl rather than treating it as a clean result.

## Release evidence
Capture mobile and desktop for each distinct template and each distinct media state. Separately scan the full built route set and every source business record. Attach the full inventory comparison (source count, crawl count, redirects, nonpublic/unlinked records, failures), not just a total from the homepage.
