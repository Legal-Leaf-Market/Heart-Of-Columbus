# CLAUDE.md: Heart of Columbus

Directory + five storefront demos for independent businesses in Columbus,
Indiana. A pitch, not a live service. See README.md.

## Standing rules

- **No visible dashes anywhere a person reads** (repo owner's directive): no em
  dash, no en dash (write ranges as "9 AM to 5 PM"), no spaced hyphen. Listed
  names with " - " show it as a comma. Hyphens inside words and phone numbers
  are fine. The build fails on any of these in a page's visible text. Imported
  event titles are cleaned the same way (`noDash` in `src/event-feeds.mjs`).
- **Never invent facts about a real business.** Addresses, phones, hours and
  prices come from public listings and are noted at the top of each page file.
  Anything unverified is shown with the `sample` tag. No made-up reviews,
  ratings, awards, owners' names or history.
- **Demos must read as demos.** Every storefront keeps the `demoBanner`, says
  "not affiliated", and never sends an order, booking or text. Badges for
  features we built say "(demo)". Demos stay `noindex` even after launch.
- **One indexing policy: `src/indexing.mjs`.** Nothing is indexed until
  `HOC_INDEX=1` is set AND the build runs on Netlify's production context, so a
  deploy preview stays noindex even with the variable set. build.mjs applies
  the policy to the robots meta (the layout leaves a `<!--robots-->` marker and
  no page can opt itself in), writes `dist/_headers` for X-Robots-Tag, writes
  `robots.txt`, and writes `sitemap.xml` only of indexable pages. Never set
  X-Robots-Tag in netlify.toml again: the header and the meta have to agree,
  and removing one alone does nothing. `NEVER_INDEX` lists what stays out
  after launch (demos, pickup, private inboxes, /saved/, /explore/, the print
  view, /es/ until it is signed off). Before launch robots.txt allows crawling
  on purpose: a crawler must fetch a page to read its noindex.
- **Independence is a claim with evidence: `src/data/ownership.mjs`.** A record
  confirmed to be a national chain or franchise leaves the directory, with the
  evidence URL, date and who checked kept there. Name matching never decides a
  row; an unconfirmed flag is `unknown` and stays listed. Copy never says "zero
  chains" or "every independent": nobody has verified every record. Totals are
  `directory.length`, so they follow the data.
- **Owner picks come only from owners.** With none sent, no picks box shows at
  all (no placeholder rows); the business's own page gets a one-line invitation.
- **Public events only.** `access()` in `src/event-feeds.mjs` reads a listing's
  own words: rentals, team practices and closures ("No Drop-ins") leave the
  public list and come back as `left`, which /events/ counts and shows as venue
  notices. Exports use the same filtered list. Keep the patterns narrow: hiding
  a real public event is the worse mistake.
- **Private keys never ride in a query string.** The owner inbox and obituary
  review read `#k=` from the link, move it to sessionStorage, scrub the address
  bar and send it as an `x-hoc-key` header; those pages set no-referrer. The
  claim form is a real POST to /api/claim even without its script, and the
  function answers a form post with a plain page.
- **Canonicals come from the build.** Every page gets `<link rel="canonical">`
  and `og:url` from `HOC_ORIGIN` plus its own path (the layout leaves a
  `<!--canonical-->` marker); query strings are views of the same page. Share
  images and hreflang links are absolute. Don't hand-write a canonical.
- **Search ranks, it never hides.** `HoCMatch` decides what matches (every
  word somewhere); `HoCScore`/`HoCRank` in `public/js/site.js` order it: name,
  then a specific type, then street or neighborhood, then category. A type
  that is really a category label is marked `g` in the index and ranks low.
  `SYN` maps a search word to real kinds of the same thing (taco to taqueria);
  add to it only with that bar. Explore defaults to Best match, and
  tests/search.test.mjs runs the real site.js against the real data.
- **Homepage rails are a taste, not the list**: 8 places spread through the
  category, with "See all". The open-now rail ships the 48 places open the
  most hours and hides closed cards (never removes them), so they return when
  they open.
- **Art loads as WebP.** Export the PNG as art-source/README.md says, then run
  `python3 scripts/art-webp.py`; pages point at the `.webp`. The Sentinels app
  icons stay PNG. JS and CSS are cached for a year because every reference
  carries `?v=<hash>`; a test fails on one that doesn't.
- **Business photos come only from the business.** `src/data/media.mjs` is
  the manifest; pages read it through `mediaFor()`, which shows nothing for an
  entry missing `permission`, `checked` or `credit`. Files live in
  `public/business-media/<slug>/`, are added with `scripts/add-photo.py`, and
  a file with no entry fails the tests. A photo on a business's own website is
  not permission, and no page may load a business photo from another server.
  Every listing without photos invites the owner (`/owners/?b=<slug>&want=photos#claim`).
  `docs/photo-outreach.md` is who to ask; it holds no image links on purpose.
- **Tailwind v4** (`src/styles.css`, themes as CSS variables per business).
  Class names built in `public/js` must appear literally so Tailwind finds them.
- Vanilla JS, no framework. `public/js/core.js` is the shared cart, time-slot
  and checkout engine; keep business logic in each storefront's own script.

## Directory and ordering

- `src/data/landscape.mjs` holds the wider landscape; `src/data/directory.mjs`
  merges it with the hand-built cards and files everything under the browse
  taxonomy (CATEGORIES, AREAS). Pages: `/c/` categories, `/n/` neighborhoods,
  `/b/<slug>/` one page per business, `/explore/`, `/saved/`, `/order/`,
  `/visit/` (facts in `src/data/visit.mjs`, each with `source` and `checked`), `/free/` (`src/data/free.mjs`, same rule), `/holidays/` (Small Business Saturday,
  gift cards on each business's own page via `gift` in commerce.mjs),
  `/help/` (self-service resource center, `src/data/help.mjs`, every entry with
  `source` and `checked`; `/help/card/` prints ten QR wallet cards; stories in
  `src/data/help-stories.mjs` stay drafts until a person signs off),
  `/film/` (the Columbus (2017) film trail, `src/data/film.mjs`: landmarks a
  cited source places in the film, nothing else),
  `/architecture/`, `/arts/` and `/cummins/` (guides from `src/data/architecture.mjs`,
  `arts.mjs`, `cummins.mjs`; every line sourced, public art only on public ground;
  Cummins is not affiliated),
  `/l/<slug>/` one page per landmark (`src/data/landmarks.mjs`; `PHOTOS` in
  `src/site.mjs` is a view over it). Events are hand-entered in
  `src/data/events.mjs` (signature events only, each with its official page);
  `public/js/events.js` picks what shows at load time, and the build writes
  `/events.ics`. Trip ideas (`/trips/<slug>/`) come from `src/data/trips.mjs`;
  their reasons are computed from data, and a test fails if a stop is not open
  for its whole slot. Local events (`/events/`, `/events/print/`) merge the
  library (Communico JSON) and parks (Tockify iCalendar) feeds live through
  `/api/events` (`netlify/functions/events.mjs`, CDN cached an hour; json,
  ics, csv and AP-style txt) with hand-entered `LISTINGS` for calendars
  with no feed (Arts Council, county fair, The Garage). Live music and
  arts (concerts, open mics, comedy, poetry) is a filter (`live`, `isLive`)
  plus `STAGES`: venues that post lineups only on social media are listed
  without dates until a date is seen on their own page. `SOURCES` in events.mjs lists
  them; parsing and exports live in `src/event-feeds.mjs`. Only title,
  time, place and ages are kept, never descriptions, and every item links
  to its organizer. The explore map has layers (businesses, landmarks with
  `public/art/pin-*.png`, this weekend's events, Social District) and a
  "near me now" mode at `/explore/?view=map&now=1`.
  Directory pages use plain CSS in `public/css/hoc.css`, not Tailwind.
- Spanish: `/es/visit/`, `/es/free/`, `/es/film/`, `/es/holidays/`, `/es/l/<slug>/` and `/es/trips/<slug>/` from
  the same templates, strings and fact translations
  in `src/i18n/es.mjs` (a test fails if any sourced line on them has no Spanish).
  `header(active, { lang, alt })` and `footer({ lang })` switch the chrome;
  every Spanish page shows the "translation under review" note until a
  fluent speaker signs off.
- JSON-LD (`src/jsonld.mjs`) on business, landmark, trip and /visit/ pages,
  and breadcrumbs, built only from what the page shows (tests/jsonld.test.mjs).
  The sitemap comes from the indexing policy above. `HOC_ORIGIN` sets the
  absolute URLs.
- `src/data/web.mjs` (websites, phones, owner-set Google action links) and
  `src/data/commerce.mjs` (cart engine, live feed, first-party order/book links)
  are generated by `scripts/import-web.mjs` and `scripts/import-commerce.mjs`.
- **We never take payment or orders for a business that hasn't signed on.**
  "Order online" and "Book online" link to the business's own provider page
  (Toast, Square, Vagaro...). "Shop online" reads a public Shopify or
  WooCommerce catalog through `/api/shop` and hands the cart to the shop's own
  checkout (`src/commerce-core.mjs`). Marketplaces that take a cut (DoorDash
  marketplace, Grubhub, Uber Eats) are never linked as "direct".
- **Pickup tickets** (`/api/pickup`, `netlify/functions/pickup.mjs`, adapted
  from Herbal Leaf Market's local-order route). A ticket is a record, never a
  payment. Only slugs in `src/data/partners.mjs` (empty until an owner agrees)
  get live tickets and a private board at `/pickup/board/?s=<slug>&k=<key>`
  (keys in the `HOC_BOARD_KEYS` env var, never in git). The five storefront
  demos make demo tickets that no business sees and that keep no phone number.
  Storage is Netlify Blobs via `src/blobs.mjs` (no npm dependency); without it
  the function returns 503 and the storefronts fall back to the local
  confirmation. Commission is `COMMISSION` in partners.mjs, 0 while the site
  says "no commission".
- **Newspaper sections.** `/markets/` shows delayed quotes for the Indiana
  companies in `src/data/markets.mjs` (8 symbols max, one Twelve Data call)
  through `/api/markets`; the key is `HOC_QUOTES_KEY` (env only) and the
  "Data provided by Twelve Data" line stays next to the table. `/obituaries/`
  links the funeral homes' own listings (`src/data/obituaries.mjs`) and takes
  family submissions at `/api/obituary`, reviewed at
  `/obituaries/review/#k=<HOC_ADMIN_KEY>`. We never write, generate or copy
  an obituary; one goes in `PUBLISHED` only with a `confirmed` date. Both
  pages print cleanly (`public/css/paper.css`).
- Landmark photos are Wikimedia Commons, credited on `/credits/`. They show
  Columbus, never a listed business. Art in `public/art/` is ours.

## News and visitor content (docs/roadmap.md)

- **Every new fact gets a source.** Data files for visits, landmarks,
  events, the Social District, meetings and trips carry `source` and
  `checked` on every entry. Tests fail without them.
- **Claude never writes news.** No stories, quotes, headlines, obituaries,
  letters or newsletters about real people, businesses or events. Build the
  templates, tools and tests; a named person writes and the editor approves.
- **Sample content must look fake** (Sampleton, "Sample Reporter") and carry
  `sample: true`; it never appears in a published section.
- **Automation makes leads, not stories.** Directory diffs and public-record
  scans write to `content/drafts/` for a reporter; nothing publishes without
  a person confirming it.
- **Disclose our ties.** A story tagging a business in `partners.mjs` or
  `sponsors.mjs` shows a disclosure line automatically.
- **Owner decisions stay marked.** `[OWNER: ...]` markers in
  `docs/newsroom-policies.md` stay until the owner decides; a test fails if
  one reaches a built page.

## Checking work

- `npm test` must pass.
- Check layout in headless Chromium at 390 and 1280+ with no horizontal scroll,
  and click through every storefront's order flow after touching `core.js`.
