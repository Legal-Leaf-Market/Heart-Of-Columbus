# Work log

What is in flight, so nothing is left half finished. Check an item off when
it is merged (not just pushed), and add the PR. Newest work at the top of
each list.

## In progress

### Places of worship and nonprofits (`claude/worship-and-nonprofits`)
Visitors ask hotels for a Mass schedule; the site should list every
congregation in town, of every faith, by area and by faith, plus nonprofits.
- [x] Check what exists: no section; only 4 false matches in the directory
- [ ] Pull the source data on GitHub (this sandbox can't reach it):
  - OpenStreetMap `amenity=place_of_worship`, with `religion` and `denomination`
  - IRS Exempt Organizations list for Indiana, filtered to Columbus ZIPs
    (nonprofits, plus congregations that registered)
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

## Waiting on a merge
- [ ] Nightly cart check, [#127](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/127)

## Done
- [x] Forge order link kept through re-imports, [#126](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/126)
- [x] Forge order button opens its Square order page, [#125](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/125)

## Later, from docs/commerce-platforms.md
- [ ] "Connect Square" for owners (22 Square Online sites), needs a Square developer app
- [ ] Wix, only for the 4 shops with real stores
