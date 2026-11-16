# Deep crawl audit — Heart of Columbus

Inspected: 2026-11-16. Starting URL: https://heartofcolumbus.netlify.app/

- Unique reachable path fetch attempts: 1264.
- Successfully fetched pages: 1264.
- Fetch errors: 0.
- Discovered `/b/` business detail routes: 936.
- Businesses with observed generic art in their main detail cover: 927.
- Businesses with non-art main cover candidates needing review: 1.
- Pages with known generic artwork in business-media contexts: 1035.
- Known generic-art occurrences in business contexts across these pages: 53164. This includes repeated cards and is not a unique-image count.

## Coverage and evidence
Followed same-host HTML links recursively from the homepage, deduplicated by path. Saved fetched HTML locally for parsing, extracted image/srcset/class evidence, and checked known business media wrappers. The homepage advertised 936 businesses at crawl start; reconcile that claim against this register and the canonical repository dataset. The sitemap endpoint returned a page-not-found document, so discovery used links instead. Route inventory contains successes and failures.

This is a static-HTML/source audit, not a pixel-by-pixel visual review of every page. One generic events cover was opened and visually confirmed as balloon/gift/music clip art. Other art classifications rely on observed art filenames and shared classes. Non-art filenames are candidates, NOT proof of genuine photography. CSS backgrounds, client-rendered query variations, external websites, inaccessible pages and unlinked records are not comprehensively covered. Query strings were collapsed for route enumeration; test filter/pagination states in the app. External links in dossiers were extracted from listing content and are unverified.

No live-site changes have been deployed. This package is an implementation handoff for Claude in the actual repository, with the previous graphics package included. No business photography has been fabricated, licensed, downloaded from third-party platforms or approved by this audit.

## Route families

| Family | Paths |
|---|---:|
| about | 3 |
| agriculture | 1 |
| api | 1 |
| architecture | 1 |
| arts | 1 |
| ask | 1 |
| b | 936 |
| big-cheese | 1 |
| c | 60 |
| credits | 1 |
| cummins | 1 |
| data | 1 |
| djs | 1 |
| es | 18 |
| events | 2 |
| explore | 1 |
| film | 1 |
| founders-club | 1 |
| free | 1 |
| games | 3 |
| gills | 1 |
| help | 5 |
| history | 153 |
| holidays | 1 |
| home | 2 |
| l | 10 |
| letters | 1 |
| markets | 1 |
| meetings | 1 |
| n | 10 |
| news | 10 |
| newsletter | 1 |
| notices | 1 |
| obituaries | 1 |
| order | 1 |
| owners | 1 |
| passport | 1 |
| plan | 4 |
| preview | 1 |
| rohdes | 1 |
| saved | 1 |
| skate | 1 |
| sports | 2 |
| staff | 3 |
| stickers | 1 |
| tacolumbus | 1 |
| tasty-express | 1 |
| tips | 1 |
| trails | 5 |
| trips | 3 |
| visit | 2 |

## Fetch errors

None.
## Public data reconciliation and exceptions

Fetched `/data/directory.json` and matched all 936 unique slugs to the 936 crawled detail pages: zero missing and zero duplicate slugs. Eight no-image exceptions use oversized initials banners; one (Bip’s Bites) has a visually inspected food/video-still photo with an explicit on-page permission credit. See CLIENT_RENDERING_FIXES.md for individual names and dynamic insertion paths. All 27 same-host scripts referenced by the crawl were fetched and searched for business-art generation. Five focused scanner fixtures passed, including a genuine-photo case that must not be flagged simply for using `.bz-art`.
