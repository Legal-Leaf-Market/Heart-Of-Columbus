# Handoff for the next Claude session (2026-11-13)

Read this first, then `CLAUDE.md`. Jacob Kennedy (Jake) is Co-Founder and Chief
Editor of Heart of Columbus; Terry Winchester II is the other Co-Founder and an editor (`terry-winchester-ii`,
`editor: true`); he signs Jake's own pieces under the two-person rule.

## What shipped today (all live, all on `main`)

Heart of Columbus (`heartofcolumbus.netlify.app`, Netlify deploys `main`):

- **TJ's ChopShop:** listing at `/b/tjs-chopshop/`, draft site and ambassador pitch at
  `/preview/tjs-chopshop/` and `/preview/tjs-chopshop/pitch.html` (built from
  `sites/tjs-chopshop/`, including his brand library and another session's motion layer).
- **Founding Member badge** (`src/data/members.mjs`, empty until an owner pays) and the
  **Founders Club** at `/founders-club/`: $20 a month, cancel any time, sites portable to any
  host, every new tool included, one Ambassador per section, works alongside the Chamber.
- **Chamber pilot brief** for Jon Myers at `/preview/chamber-pilot/` (Jake has a coffee
  planned with him).
- **Legal Leaf Market Cafe** listed as coming soon, with the owner tie disclosed.
- **History sign-off:** 117 articles approved (`src/data/history/signoff.mjs`, two-person rule
  enforced by `tests/signoff.test.mjs`).
- **Barbershop views and map art v2**, with close-zoom cutouts for all nine landmarks.
- **"Columbus, building by building"** at `/history/buildings/`: eleven field guides,
  approved by Jake (editor `jacob-kennedy`).

Crossroads Wedding and Event Co. (`crossroadsweddingco.shop`, repo
Legal-Leaf-Market/CrossroadsWeddingCo, Netlify deploys `main`):

- **Back YOUR Blue** at `/back-your-blue` (PR #118): Jake's tribute to his father, Kevin Lee
  Kennedy, turning 60 on November 16, with a moderated notes board for family, coworkers and
  church family. Notes are approved at `/admin/<key>/reviews` and show on that page only.

## Next, in order

1. **Section art: DONE** (second session, 2026-11-13). `SECTION_ART` in
   `src/editorial-art.mjs` gives `/c/coffee-sweets/`, `/c/bars/` (navy panel),
   `/c/shopping/`, `/c/events/` and `/c/things-to-do/` a painted header, also used on
   their type pages that have no painting of their own (barbers keeps its own). Explore
   shows `downtown-day` as a strip in list view, hidden on the map. `srcset` 768/1440,
   every use tagged "Category illustration", never a card fallback. The two background
   textures (`cream-botanical`, `midnight-architectural`) are unused so far.
2. **Field guides: APPROVED** by Jake, 2026-11-13 (all eleven in `signoff.mjs`).
3. **Passport v1: DONE** (second session). `/passport/` collects every trail's stamps
   (`public/js/passport.js`, tests in `tests/passport.test.mjs`): digital discoveries on
   the honor system, labeled "not a verified visit" and "can't be redeemed". Versioned
   save/load file (`heart-of-columbus-passport`, v1); loading only adds, refuses bad,
   foreign, newer or oversized files, and keeps stamps for stops that left a trail
   without counting them. Shows a plain warning when the browser blocks storage. Still
   to come from the plan: verified visits and redemption (need a server), a printed
   passport, and the Landmark Trail as its own verified collection.
4. **Place contract v1: DONE** (second session). `src/data/places.mjs` gives all 931
   businesses and 10 landmarks one validated record (see CLAUDE.md). Pin sources today:
   499 from Google listings, 356 from public listings, 10 approximate (the hand-built
   featured cards: ask their owners or geocode them to retire `approx`), 66 with no pin.
   Not yet moved onto it: the map, list and trail code still read directory rows
   directly; switch them over one at a time, then build the downtown 3D pilot on it.
5. **Backlog:** `planning/EXECUTION_BACKLOG.md` (shared place contract, downtown spatial
   pilot, passport and Landmark Trail, merchant pilot). `planning/TRAILS_PASSPORTS_AND_MERCHANTS.md`
   has the detail. Jake holds the full master handoff zip, including the internal product and
   partnership documents deliberately kept out of this public repo.

## Open decisions for Jake

- Rename North Christian to The LEX in the directory?
- Three barbers whose Booksy names or addresses differ from the directory (see PR #57).
- TJ's terms (three free months, rewards at 1, 3 and 5 referrals) were proposed by Claude; confirm.
- Brian Blair byline confirmations on the faith retellings.

## Working notes

- The environment allows the sources and hosts used today; ask before adding more.
- Merge by PR with `expectedHeadSha`; another session merged #58 in parallel today.
- Both repos are public: keep strategy about real institutions and private details out.
