# Exact client-side paths found in the live scripts

Inspected all 27 distinct same-host JavaScript files referenced by crawled pages. These are published files; locate corresponding source files before changes. Public script comments mention `src/site.mjs`, `src/editorial-art.mjs` and `src/hours.mjs`; verify them in the checkout.

| Observed file | Current behavior | Required change |
|---|---|---|
| `/js/site.js`, around line 10 | `HoCDir()` fetches `/data/directory.json`. | Reconcile all 936 records and use the same media contract in static and dynamic rendering. |
| `/js/site.js`, around line 22 | `HoCSticker()` returns `/art/sticker-<category>.webp`. | Keep only if still useful for editorial/category decoration; remove every business-card call. |
| `/js/explore.js`, around lines 25–38 | `card(b)` chooses `b.i`, then painted `b.w` scene, then `/art/cover-<subcategory>.webp` plus `HoCSticker`. | Approve real `b.i` provenance explicitly; remove BOTH painted-scene and category-art business fallbacks. Render no cover otherwise. Keep save/name/type/address/tags. |
| `/js/hub.js`, around line 27 | Random-business picker always uses `HoCSticker` in its cover. | Use shared media resolver; no media state becomes compact text-only result. Test every picker lane and save. |
| `/js/views.js`, around lines 325–331 | Reads first `.bz-cover img` from existing card into view data; also carries `.ed-tag` state. | Carry approved media metadata from the source instead; never infer that the first rendered image is a business photo. Inspect every consumer of `img` in map/table rendering. |
| `/js/site.js`, around line 124 | Inserts open-now badge into `.bz-cover` if missing. | Move verified opening status to a persistent body/metadata slot. Removing a cover must not silently remove the status. Preserve existing hours calculation. |

## Important scanner limitation corrected
`.bz-art` is ALSO used for real photographs in dynamic cards. Do not blacklist that class alone or delete all elements with it. The included scanner flags observed generic art paths and explicit sticker/editorial-art classes instead. Review image provenance rather than assuming every WebP or every `.bz-art` is fake.

## The nine main-cover exceptions
Eight pages have oversized `.brand-mono` initials instead of image covers: Amy’s Closet, Cookie Paradise LLC, Jill’s Diner, Rabbit’s Balloons, Salon Aura / Hair Color Studio, TJ’s ChopShop, Tribal Blend Cat Cafe and Turtle’s Flowers. Collapse those decorative initials banners into the text-first design. Keep membership information distinct; these initials are not evidence of official business logos.

Bip’s Bites has an actual food/video-still image in `.biz-photo`; it was visually inspected. Its public credit says “Photo: Bip's Bites, shown with permission.” Preserve the existing image/credit while verifying the retained authorization record in the repository. Do not replace it with clip art. The public credit is evidence of the site's stated permission, not an independent rights audit. Its existing crop includes video title graphics; request a clean owner-supplied still later if desired, without holding up the rest of the cleanup.

The published directory contains 936 unique slugs; all 936 were fetched as `/b/<slug>/` routes. This reconciles the public dataset, not any unpublished/private source records.
