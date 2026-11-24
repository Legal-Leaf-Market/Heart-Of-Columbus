# Work log

What is in flight, so nothing is left half finished. Check an item off when
it is merged (not just pushed), and add the PR. Newest work at the top of
each list.

## In progress

### Places of worship and nonprofits (`claude/worship-and-nonprofits`)
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
- [ ] Owner question open: how to fill in addresses (Google Places key, publish
      what we have and invite corrections, or a person checks the list)
- [ ] A third source with street addresses and websites: the Google Maps
      lookup that made `maps-lookup.json` was run outside this repo, so the
      same pass is needed for congregations (or a person checks the list)
- [ ] Merge the two by name and address into `src/data/worship.mjs` and
      `src/data/nonprofits.mjs`, each row with `source` and `checked`
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
- [ ] Study writewithpaige.ai: the host is now allowed, but the name has no
      public DNS record from here. Need the exact link or screenshots
- [ ] Later: overnight lead gathering into the idea bank (council agendas,
      directory changes, events), and "publish to the site" for a piece

## Bugs found along the way
- [x] `/newsroom/inbox/` sent the admin key as `?k=` in the address, against
      the house rule. Fixed in #129: #k=, session storage, `x-hoc-key` header

## Waiting on a merge
- [ ] Nightly cart check, [#127](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/127)
- [ ] The desk, [#129](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/129)
- [ ] This worklog and the worship source data, [#128](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/128)

## Done
- [x] Forge order link kept through re-imports, [#126](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/126)
- [x] Forge order button opens its Square order page, [#125](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/125)

## Later, from docs/commerce-platforms.md
- [ ] "Connect Square" for owners (22 Square Online sites), needs a Square developer app
- [ ] Wix, only for the 4 shops with real stores
