# Heart of Columbus

A directory of every independent business we could find in Columbus, Indiana
(929 and counting), built to browse like Yelp and DoorDash, plus five storefront
demos showing direct ordering without delivery-app commissions. Where a
business already sells online, Heart of Columbus sends customers straight to
its own ordering, booking or store, and takes nothing.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home: search, categories, "Open right now", order-direct band, curated rails, Athens of the Prairie photos, neighborhoods, Spin, Keep it in Columbus, owners |
| `/c/<category>/` `/c/<category>/<type>/` | Category and type lists with a neighborhood refine bar |
| `/n/<neighborhood>/` | A neighborhood, one rail per category |
| `/b/<business>/` | One page per business: hours and open-now, Order / Book / Shop online, call, directions, map, close-by |
| `/explore/` | Every business with filters (category, type, area, open now, online, phone, demo), sort (A to Z, area, nearest to me) and a map |
| `/order/` | Everyone you can order from, book or shop online directly, with live products from local shops and one cart across them |
| `/saved/` | Places saved with the heart button (kept in the browser) |
| `/owners/` | For owners: claim a listing, link your own ordering, take pickup orders |
| `/pickup/?t=` `/pickup/counter/?t=` `/pickup/board/?s=&k=` | Pickup ticket, the shop's view of it, and a partner's live board |
| `/gills/` `/tacolumbus/` `/big-cheese/` `/tasty-express/` `/rohdes/` | Storefront demos (Tailwind, `public/js/core.js`) |

## How the data is made

Everything comes from public listings: the Columbus Area Chamber of Commerce
directory, Visit Columbus Indiana, and each business's own Google Maps listing.
The raw pulls are kept in `scripts/data/` and each step regenerates a file in
`src/data/`:

| Step | Writes | What it holds |
| --- | --- | --- |
| hand-checked | `businesses.mjs` | the featured businesses and the five demos |
| research pass | `landscape.mjs` | the wider landscape (name, type, address, area, phone) |
| `scripts/import-web.mjs scripts/data/maps-lookup.json` | `web.mjs` | website, phone, owner-set Google action links |
| `scripts/import-hours.mjs scripts/data/maps-hours.json` | `hours.mjs` | weekly opening hours (and recovers missed lookups) |
| `scripts/import-geo.mjs scripts/data/maps-geo.json` | `geo.mjs` | map pins and missing street addresses |
| `/api/probe` on a deploy, then `scripts/import-commerce.mjs scripts/data/probe-results.json` | `commerce.mjs` | each website's cart engine, live product feed, its own ordering/booking links, and its gift-card page |

`src/data/directory.mjs` merges all of it, files each business under the
browse taxonomy (15 categories, about 60 types, 10 neighborhoods), drops
places Google marks permanently closed, and fills a missing neighborhood from
the nearest tagged neighbors.

## Ordering, booking and shopping, honestly

- **Order online / Book online** open the business's own Toast, Square,
  Clover, DoorDash Storefront, Vagaro, Booksy, GlossGenius, Mindbody,
  Calendly, OpenTable... page (36 providers in `src/commerce-core.mjs`).
  Marketplaces that take a cut (DoorDash marketplace, Grubhub, Uber Eats) are
  never linked as direct.
- **Shop online** reads a shop's public Shopify or WooCommerce catalog through
  `/api/shop`, lets people fill one cart across several Columbus shops, and
  hands each cart to that shop's own checkout with the items already in it.
  The pattern comes from KawaiiKatz and Herbal Leaf Market.
- **Pickup tickets** (`/api/pickup`) are for businesses that sign on and have
  no ordering system: the customer gets a code, the shop gets a counter board
  that chimes, the customer pays at the counter. Only slugs listed in
  `src/data/partners.mjs` can receive orders; that list is empty until an owner
  agrees. The storefront demos make demo tickets that no business sees.
- **We never take payment.**

## The storefront demos

The five demos are a pitch. Each says it is a concept preview, is not
affiliated with the business, and sends nothing to it. Facts on them (names,
addresses, hours, listed prices) come from public listings, noted at the top of
each `src/pages/*.mjs`; anything unverified carries a "sample" tag. Every page
on the site is `noindex` until businesses are on board.

## Setting it up on Netlify

Netlify builds from this repo (`netlify.toml`). Netlify Blobs needs no setup.
Two environment variables, set in Netlify, never in git:

- `HOC_ADMIN_KEY`: a long random string. The owner-lead inbox is
  `/owners/inbox/?k=<that key>`.
- `HOC_BOARD_KEYS`: JSON like `{"some-slug": "<long random key>"}`, one key per
  partner. Their board is `/pickup/board/?s=<slug>&k=<key>`.

Functions read these at deploy time, so after adding or changing one, trigger
a new deploy (Deploys, Trigger deploy) or push to `main`. As of October 2026
`HOC_ADMIN_KEY` is set and `HOC_BOARD_KEYS` is not, since no business has
signed on yet.

## Running it

```bash
npm install
npm run dev     # build and serve at http://localhost:4321
npm test        # build, then the data, commerce, hours, pickup and claim tests
```

The build fails if an em dash shows up anywhere a person reads.

## Signing on a business

1. They fill in `/owners/` (or you talk to them). The lead lands in the inbox.
2. Confirm they speak for the business.
3. Fix their listing data, or add their ordering link to the commerce data.
4. For pickup orders: add their slug to `src/data/partners.mjs`, add a board
   key to `HOC_BOARD_KEYS`, and send them their board link.
5. For a full storefront: reuse Jill's Diner (`Legal-Leaf-Market/jills-diner`),
   which takes real orders through a Netlify Function, Supabase and a staff
   tablet.
