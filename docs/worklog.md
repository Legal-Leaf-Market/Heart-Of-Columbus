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
- [ ] Pages: `/worship/` by faith and by area, one page per congregation;
      `/nonprofits/` by kind. Service times only as a link to the
      congregation's own schedule page, never typed by us (house rule: never
      invent facts about a real place)
- [ ] Map layer, search and visit-page links
- [ ] Tests, then PR

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
