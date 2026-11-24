# Work log

What is in flight, so nothing is left half finished. Check an item off when
it is merged (not just pushed), and add the PR. Newest work at the top of
each list.

## In progress

### Places of worship and nonprofits (`claude/worship-addresses`)
Visitors ask hotels for a Mass schedule; the site should list every
congregation in town, of every faith, by area and by faith, plus nonprofits.
- [x] Check what exists: no section; only 4 false matches in the directory
- [x] Pull the source data on GitHub ("Pull places of worship" workflow):
  - OpenStreetMap: 73 places, all tagged Christian, 59 named, only 5 with a
    street address, 24 with a denomination (`scripts/data/osm-worship.json`)
  - IRS exempt organizations, Columbus area ZIPs: 505, about 113 religious,
    including the Hindu Society of Southern Indiana, the Islamic Society of
    Columbus and Great Wind Zendo (`scripts/data/irs-eo.json`). Many
    addresses are PO boxes, and some religious rows are trusts or
    associations, not congregations
- [x] Owner decision: Google Maps is the address source
- [x] `scripts/pull-worship-places.mjs`: Google Places API (the official route;
      scraping Google pages breaks its terms), run by the same workflow
- [ ] **Owner: add the `GOOGLE_PLACES_API_KEY` repository secret**, then edit
      `scripts/data/worship-request.txt` on a claude branch to run the pull
- [x] `scripts/import-worship.mjs` merges Google, OSM and IRS into
      `src/data/worship.mjs` (one row per congregation, faith family, sources).
      Today, without Google: 112 rows, 5 with a street address
- [ ] Rerun the import once Google data lands; mark rows Google did not
      confirm as "not yet confirmed" (many OSM-only rows are old rural chapels)
- [ ] `src/data/nonprofits.mjs` from the IRS list (505 rows pulled)
- [x] `/worship/` page: 111 congregations grouped by faith, town, street
      address when known, website ("Service times on ..."), map pin, sources
      and dates, "not yet confirmed on Google Maps" where so, and a correction
      link. Linked from /visit/. No service times typed by us. Tests in
      tests/worship.test.mjs
- [ ] Known gap until Google runs: only St. Bartholomew under Catholic
      (St. Columba and others are not in OSM or the IRS list)
- [ ] Later: one page per congregation, a map layer, search entries
- [ ] `/nonprofits/` by kind

### The desk: morning newsletter writing (`claude/newsroom-desk`, [#129](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/129))
- [x] Owner decision: AI drafts newsletter pieces from the publisher's angle,
      commentary and sources; the publisher approves every piece. Recorded in
      `AI_POLICY`, docs/newsroom-policies.md and CLAUDE.md
- [x] `/newsroom/desk/`: this morning's plan, pieces, idea bank, voice
      profile, preview, make the newsletter draft (never sends)
- [x] Writing help: draft, headlines, openings, tighten, sound more like me,
      check facts. Approval blocked by [CHECK], no source or a dash
- [x] Morning job uses the approved desk edition; "No edition" skips the day
- [x] docs/morning-paper.md: the clock, what to gather, how to stay original
- [x] Tests (7) and a Chromium run at 390 and 1280
- [ ] Owner: set `ANTHROPIC_API_KEY` (and `RESEND_*` or `BUTTONDOWN_API_KEY`)
      in Netlify, then fill in **Your voice** at the desk
- [x] Studied writewithpaige.com (fiction tool, 100,000+ users claimed)
- [ ] Paige ideas to build next: a **beat book** the desk reads before every
      draft (people, places, businesses, running stories, spellings; lockable;
      "desk noticed" suggestions), **banned phrases**, several **voices** to
      switch between, an **edit pass** as tracked changes you accept one by one
      with prose numbers (sentence length, adverbs, passive, reading grade),
      **select a passage to Tighten / Smooth / Fix grammar**, and
      **paste notes to split them into ideas**
- [ ] Later: overnight lead gathering into the idea bank (council agendas,
      directory changes, events), and "publish to the site" for a piece

### Apartments and landlords (`/housing/`, live)
- [x] `/housing/` page: finding a place (county housing list, Indiana Housing
      Now, Landlord Association referrals, Housing Authority, behind on rent;
      all from the help center's sourced entries), 9 apartment and townhome
      communities and 2 mobile home communities from OpenStreetMap, and the
      directory's property managers. No rents or openings typed by us.
      Linked from /help/. Tests in tests/housing.test.mjs
- [x] "Pull housing" workflow (`scripts/pull-housing.mjs`): OpenStreetMap
      now, Google Maps apartment complexes and property managers once
      `GOOGLE_PLACES_API_KEY` is set; `node scripts/import-housing.mjs`
      rebuilds `src/data/housing.mjs`
- [ ] Owner: add the `GOOGLE_PLACES_API_KEY` secret, then edit
      `scripts/data/housing-request.txt` on a claude branch to pull Google
- [ ] The publisher's picks: Columbus Rental Property and Travis Mauser.
      Need a website or phone for each; show as the publisher's own
      recommendation, labeled. Confirm Travis Mauser rents publicly as a
      business and ask him before listing him by name
- [ ] Note: the Landlord Association referral line (812-376-3500, from the
      county housing list) is the same number BBB gives for Grayson Property
      Management; worth a call to understand who answers
- Leads found 2026-11-24 (web search, unverified; confirm each on its own
  page or listing before it goes in):
  - **Best source:** the city's residential rental registration ordinance,
    https://www.columbus.in.gov/community-development/residential-rental-registration-ordinance
    If landlords must register, ask Community Development for the registry
    (public records request if needed): the most complete landlord list
  - Property managers: Grayson Property Management (BBB lists 3129 25th St
    PMB 202, (812) 376-3500); Bullet Property Management (already listed);
    Nicodi Management (3221 17th St, Suite 1)
  - Apartment communities named by listing sites: Columbus Crossing /
    Parkview Townhomes, River Stone, St. Barts, Monarch Crossing,
    Williamsburg Way
  - Directories to cross-check: BBB rental listings and property management
    (bbb.org/us/in/columbus), Zillow property manager pages for 47201, 47202,
    47203 and 47246, BiggerPockets Columbus property managers
  - "Columbus Rental Property" did not turn up under that name; get its
    website or phone from the publisher

### December 2026 print edition (proof live at /print/2026-12/, 11 x 17)
Drafts of every slot are in `content/print/2026-12/` (status: draft, no
byline, `drafted:` and `sources:` on each; CLAUDE.md third exception).
- [ ] Research: when `docs/research/december-print-chrome-brief.md` comes back
      from Claude in Chrome, clear the matching `[CHECK]` marks, citing sources
- [ ] Jake, in person: Jill (last name, history, Sunday hours); Amy (hours,
      Love Chapel, coupon end date); Crossroads coupon terms; phone-confirm
      every Christmas service time
- [ ] Election: fill `votes` in `election.md` once the canvass is certified
- [x] Page 14's Chaos photo saved to `public/print-media/commons.jpg` by the
      new "Fetch print media" workflow (`scripts/fetch-print-media.mjs`; edit
      `scripts/data/print-media-request.txt` to fetch others). 1280 x 1024,
      so about 4.3 inches wide at 300 ppi
- [ ] Photos:      Front aerial prints at 180 ppi: swap in Eli Wire's riverfront photo.
      Kevin's photo for page 8
- [ ] Printing quotes for a true 11 x 17 newsprint run (brief Task 6): target
      under $2 a copy, $5 fine for the first run
- [ ] White space on pages 2 and 13 the fillers don't close: revisit once the
      drafts are at their real lengths

## Bugs found along the way
- [x] `/newsroom/inbox/` sent the admin key as `?k=` in the address, against
      the house rule. Fixed in #129: #k=, session storage, `x-hoc-key` header

## Done
- [x] Nightly cart check, [#127](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/127)
- [x] The desk, [#129](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/129)
- [x] This worklog and the worship source data, [#128](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/128)
- [x] Forge order link kept through re-imports, [#126](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/126)
- [x] Forge order button opens its Square order page, [#125](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/125)

## Later, from docs/commerce-platforms.md
- [ ] "Connect Square" for owners (22 Square Online sites), needs a Square developer app
- [ ] Wix, only for the 4 shops with real stores
