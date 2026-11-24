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

### Newsletter admin page (not started)
- [ ] Read what exists: the morning job (`netlify/functions/newsletter.mjs`)
      makes a draft from published stories; Decap CMS at `/admin/`; the editor
      inbox at `/newsroom/inbox/`
- [ ] Admin page: see today's edition, choose and order its stories, preview,
      make the draft, see past drafts. Never sends (house rule)
- [ ] Owner decision needed: CLAUDE.md says "Claude never writes news" and
      "automation makes leads, not stories". A generator that WRITES stories
      would break that rule; one that gathers leads and fills the edition from
      stories people wrote fits it

## Bugs found along the way
- [ ] `/newsroom/inbox/` sends the admin key as `?k=` in the address
      (`public/js/newsroom.js`), against the house rule that private keys never
      ride in a query string. `public/js/owners.js` `adminKey()` is the right
      pattern (#k=, session storage, `x-hoc-key` header)

## Waiting on a merge
- [ ] Nightly cart check, [#127](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/127)

## Done
- [x] Forge order link kept through re-imports, [#126](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/126)
- [x] Forge order button opens its Square order page, [#125](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/125)

## Later, from docs/commerce-platforms.md
- [ ] "Connect Square" for owners (22 Square Online sites), needs a Square developer app
- [ ] Wix, only for the 4 shops with real stores
