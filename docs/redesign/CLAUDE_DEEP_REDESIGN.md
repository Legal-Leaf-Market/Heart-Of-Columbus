# Heart of Columbus — individual pages and zero clip-art business imagery

## Execute this work in the existing repository
This is phase two of the supplied visual redesign. Read the original package, then apply this document as the higher-priority correction. Implement the changes, do not merely return another plan. The crawl inventories are live-site evidence, not editable repository source. Locate the actual data, templates, generators and JS rendering paths before editing. Do not deploy a scraped mirror.

## Non-negotiable correction to the original brief
The original brief permitted category illustrations in missing-photo business cards. That permission is REVOKED. No business hero, listing card, spotlight card, related-business tile, saved-business card, search result or map popup may use clip art, emoji, a category sticker, a generic illustration, generated storefront or stock photograph pretending to depict that business. The new sticker sheet is only for editorial/category/brand decoration outside business-image slots.

Use a genuine approved photo of that exact business/location when available. An official logo belongs in a small identity slot with object-fit:contain, not stretched across a landscape photo cover. If neither exists, use a compact editorial card with name/category/location/actions and NO IMAGE REGION. Do not build 936 fake illustrations or replace old clip art with new clip art. Do not invent initials logos. Absence of a photo is a supported final state, not a launch blocker.

## What the crawl established
Read AUDIT_SUMMARY.md for exact coverage and limitations; business-image-register.csv for every discovered business; route-inventory.csv for all routes; and business-dossiers.md for individual instructions and currently linked official sites. Existing art appears as `art-cover-*`, `art-sticker-*`, `.bz-art`, `.bz-stk`, `.sp-stk`, and `.outline-stk`. Business detail pages include `.biz-cover.biz-outline`; cards use `.bz-*` and spotlight uses `.sp-cover`. These are observed contracts, not an exhaustive list of source component names.

A concrete example: `/b/crossroads-wedding-co/` has a wedding sticker in its detail cover and repeated generic event cover art in related listings. The generic event cover is a balloon/gift/music drawing, not venue imagery. The page also says photos should be submitted by owners and will be credited, rather than copied from their website. Preserve that collection policy and the real booking destination. The same category image can occur in dozens of businesses; one asset deletion is not enough because source templates and JS can reintroduce it.

## Implementation order
1. Reconcile every inventory business slug against the repository dataset. Also enumerate unlinked records from source; the live crawl cannot prove their absence. Record additions, retired redirects and duplicate-location decisions. Never merge two locations just because they share a brand.
2. Introduce one business-media resolver used by all rendering paths. Accepted states: approved-photo, approved-logo-only, no-approved-media. Unknown origin/rights means not approved. Metadata: businessId, locationId, local asset path, type, source URL, credit, permission basis, review status/date, alt, focal point. Never infer approval from a filename or a live image alone.
3. Remove the clip-art fallback from source templates and client-side renderers. Remove image-related CSS backgrounds/pseudo-elements and srcset/source variants too. Preserve category illustrations elsewhere. Do not just hide images with CSS: hidden img tags still download, and dynamic paths may restore them.
4. Ship the no-image design immediately for unresolved businesses. Move the owner's photo-submission invitation into a quiet lower-page block. Keep claim/outline status separate from photo availability; a photo is not proof of ownership or verification.
5. Preserve and assess genuine photographs individually; fix crops and attribution, not blanket-delete them. If rights cannot be established, use the text-first state pending review.
6. Apply all page-family instructions in PAGE_BY_PAGE.md, then validate every record and every generated page with an automated full-build scan and interactive representative checks.

## Business detail composition
No-photo: breadcrumb; category/location eyebrow; full business name (wrap naturally); factual description; main action; secondary website/call/directions; practical details; source/status; related places. No giant empty rectangle. On desktop use a 7/5 content/practical-details split and a 1,160px maximum content width. At 390px use one column with 20px side margins, name 34px/1.05, body 16px/1.6, actions at least 44px tall. The first action must appear before any decorative block.

Photo-present: the same identity layout plus a genuine 3:2 photograph, maximum ~420px tall desktop and ~240px mobile. Do not overprint the business name on photography. Credit outside the crop. A gallery exists only if there are approved images; no empty thumbnails or placeholder carousel. Logo-only: optional 72–96px contained logo next to name, no photo banner.

Practical panel: address with directions using real location, telephone, official website, hours only if supplied with a credible current source. Unknown hours get a neutral check-with-business instruction; never imply open-now. Do not invent prices, ratings, amenities, menus, service areas or business history. Keep existing business-specific actions and notes, demo disclaimers, structured data and source links.

## Listing/card composition
Photo card: 3:2 media, name, category/neighborhood, one-sentence factual description where present, primary listing link and save control. No sticker overlay or category icon masquerading as a logo. Text-only card: narrow pastel top rule, generous type, same facts/actions, no media box, no fake placeholder. In mixed grids use stable card bodies and let photo cards have real media; avoid forcing every text-only card to reserve photo-height whitespace. Mobile discovery works well as a vertical list; do not make rows depend on thumbnails.

Use the original cream/ink/sage/sky palette and restrained borders. Saturated stickers remain editorial accents outside business cards. Do not encode category only with color. Retain semantic links, visible focus, accessible saved-state labels and sufficiently large touch targets.

## Photography workflow
Use the per-business official links only as leads for an owner request or permission review. They are NOT licenses and have not been externally verified by this crawl. Preserve the current owner-submission policy; do not scrape Google Maps, social networks, review platforms or company websites for production images. An owner can submit storefront/interior/service/product imagery they control; record authorization and credit. Confirm exact location and current identity. Reject AI-generated venue photos, unrelated generic photos, low-resolution logos stretched as photography, and images with identifying people absent appropriate permission. Do not send any owner messages as part of this implementation.

For approved imagery, produce responsive 480/768/1200 variants as appropriate, modern formats plus supported fallback, explicit dimensions and focal point. Eager load only the real above-fold LCP image; lazy-load others. Handle 404s by switching to the no-media layout once, not endlessly retrying another placeholder.

## Enforcement and verification
Run `python tools/audit_business_art.py <built-site-directory>` after generating the site. This supplied scanner catches the currently observed image paths/classes inside known business-media wrappers and business-targeting anchors. It is a focused regression check, not proof that all art is gone; inspect CSS backgrounds, JSX/template source and dynamic results too. Extend the scanner to new wrapper names you introduce. Use per-image provenance allowlisting rather than a permissive extension rule.

Test discovery search, each category and subcategory, neighborhood pages, pagination/load-more, map/list switching and popups, saved places after reload, related listings, spotlight, itinerary stops, business details and specialized storefronts. Exercise broken-photo fallback, all-photo/no-photo/mixed results, no results, long business names, missing address/hours and multiple business locations. Check at 360,390,768,1024,1440px. Confirm no horizontal overflow, keyboard operation, focus contrast and reduced motion. Verify all action destinations preserve the exact business/location.

Acceptance: zero generic art in business-image slots across server and client renderers; every source record assigned an explicit media state; no pending business silently omitted; no false claim that photographs were obtained; all original content/functions retained; no new unexplained photo-verification or owner-verification badges. Return changed files, coverage counts, test evidence, any unresolved rights questions and deployment status. Do not mark this complete based on three representative screenshots.
