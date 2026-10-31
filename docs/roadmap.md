# Heart of Columbus roadmap: visitor guide and newspaper

One plan that sequences the two research briefs into pull requests, for
Claude Code working in `Legal-Leaf-Market/Heart-Of-Columbus`.

> **Status (October 26, 2026):** this file arrived after most of its PR table
> had already shipped (visit, Social District, landmarks, events, standards,
> stories, CMS, front page, alerts, trips, leads, reader forms, meetings,
> newsletter, games, membership), and trails with browser stamp cards
> (visitor item 8, phase 1) and owner deals and "in their words" through
> the claim form (items 16 and 17) shipped October 27. Listing attributes
> and `/visit/accessibility/` (item 6, PR 13) shipped October 31 from
> OpenStreetMap, which needs no key. It is kept as the record of the plan. The
> owner decisions below are still open. Version 2 of the brief (October 27)
> added `docs/seed/`: what was new in it is noted at the top of
> `docs/seed/README.md`.

## The files

Commit these to `docs/` first, in their own PR, so every later PR can point
at them:

| Save as | What it is |
| --- | --- |
| `docs/visitor-site-research.md` | About 30 visitor-bureau sites reviewed, 18 improvements (from `heart-of-columbus-visitor-research.md`) |
| `docs/newspaper-plan.md` | 14 news organizations reviewed, 12 build items in four phases (from `heart-of-columbus-newspaper-plan.md`) |
| `docs/newsroom-policies.md` | Draft standards pages with `[OWNER: ...]` decisions (from `heart-of-columbus-newsroom-policies.md`) |
| `docs/roadmap.md` | This file |
| `docs/seed/` | Researched, sourced starting data for PRs 1 to 4 and 16 (see `docs/seed/README.md`) |

## Add these to CLAUDE.md

Proposed new standing rules. They extend the existing ones and don't replace
any.

```markdown
## News and visitor content

- **Every new fact gets a source.** Data files for visits, landmarks,
  events, the Social District, meetings and trips carry `source` (a URL or
  record) and `checked` (a date) on every entry. Tests fail without them.
- **Claude never writes news.** No stories, quotes, headlines, obituaries,
  letters or newsletters about real people, businesses or events. Build the
  templates, tools and tests; a named person writes and the editor approves.
- **Sample content must look fake** (a made-up town, "Sample Reporter") and
  carry `sample: true`. The build fails if sample content is in a published
  section.
- **Automation makes leads, not stories.** Directory diffs and public-record
  scans write drafts to `content/drafts/` for a reporter. Nothing from them
  publishes without a person confirming it.
- **Disclose our ties.** Any story tagging a business in `partners.mjs` or
  `sponsors.mjs` shows a disclosure line automatically.
- **Owner decisions stay marked.** Leave `[OWNER: ...]` markers in place;
  the production build fails if any remain in published pages.
```

## Decisions the owner needs to make

Visitor work can start now. These block the newspaper's launch, not the
building of it, since Claude Code can build with the markers in place.

- [ ] The paper's name and motto (or keep "Heart of Columbus")
- [ ] Who the editor is
- [ ] The AI policy (a draft is in `docs/newsroom-policies.md`)
- [ ] The funding model: free with memberships and sponsors is recommended.
      Taking memberships changes the "We never take payment" rule, which
      today is about orders for businesses.
- [ ] Which CMS login to use: Netlify Identity, GitHub OAuth or DecapBridge
- [ ] Which email service sends the newsletter
- [ ] Whether to approach *The Republic*, Visit Columbus Indiana and the
      Documenters Network about partnering (and asking Visit Columbus for an
      events feed)
- [ ] Every other `[OWNER: ...]` line in the policies draft

## Pull requests, in order

Two tracks. The visitor track (V) ships useful pages right away and builds
the data the newspaper needs. The newspaper track (N) can run alongside it.
Item numbers refer to the briefs.

| # | PR | Brief item | Needs | Adds tests for |
| --- | --- | --- | --- | --- |
| 0 | Add the four docs, `docs/seed/`, and the CLAUDE.md rules | | | |
| 1 | `/visit/` page and `src/data/visit.mjs`, from `docs/seed/visit.json` | Visitor 1 | | source and checked on every entry |
| 2 | Social District (DORA) tags, from `docs/seed/dora.json` | Visitor 7 | permittee map check for 3 entries | every tagged slug exists, unmatched ones listed |
| 3 | Landmarks dataset and `/l/<slug>/` pages, linked from the architecture strip, from `docs/seed/landmarks.json` | Visitor 2 | strip keyboard fix, 4 missing coordinates | coordinates present, photo credit present |
| 4 | Events data, "This weekend" rail, `/events.ics`, from `docs/seed/events.json` | Visitor 3 | | source on every event, stale-event warning |
| 5 | Standards pages, `staff.mjs`, automatic disclosures | Newspaper 1 | policies draft | `[OWNER: ...]` blocks production |
| 6 | Story content model, Markdown build, `tests/news.test.mjs` | Newspaper 2 | PR 5 | bylines, labels, alt text, tags, no sample content |
| 7 | Story template, NewsArticle JSON-LD, "In the news" on business pages | Newspaper 5 | PR 6 | JSON-LD parses and matches page data |
| 8 | CMS at `/admin/` with the editorial workflow and branch protection | Newspaper 3 | PR 6, CMS login decision | |
| 9 | `/news/` front page and sections | Newspaper 4 | PRs 4 and 7 | |
| 10 | Weather and river box, breaking-news mode | Newspaper 7 | PR 9 | expired alerts never show |
| 11 | Saved trips: share link, day check, map, print | Visitor 4 | PRs 3 and 4 | |
| 12 | Trips with the open-during-slot test | Visitor 5 | PR 11 | every stop open in its slot |
| 13 | Listing attributes and filters, accessibility page | Visitor 6 | a new data pull | |
| 14 | Directory diff drafts and public-record leads | Newspaper 6 | PR 6 | drafts never land in published content |
| 15 | `/ask/`, `/letters/`, `/tips/` | Newspaper 9 | PR 5 | |
| 16 | `/meetings/`, meeting-notes template, `/data/`, `/notices/`, from `docs/seed/meetings.json` | Newspaper 10 | PR 6 | |
| 17 | Morning newsletter and evening "open tonight" | Newspaper 8 | PR 9, email service decision | |
| 18 | "Where in Columbus?" and the weekly quiz engine | Newspaper 11 | PR 3 | |
| 19 | Membership page and labeled sponsor slots | Newspaper 12 | funding decision | sponsor slots never inside a story |
| 20+ | Visitor P2 and P3: trails, richer map, Spanish, structured data, seasonal and "Give local," free things | Visitor 8 to 18 | | |

## Every PR is done when

- `npm test` passes, with the new tests listed above.
- Layout checked in headless Chromium at 390 and 1280 px, with no sideways
  scroll and no failed local requests. The axe scan is clean on new pages.
- No em dashes in anything a person reads. Pages stay `noindex`.
- The PR description lists every new fact's source, or says there are none.

## Paste this to start

```text
Read docs/roadmap.md, docs/visitor-site-research.md,
docs/newspaper-plan.md, docs/newsroom-policies.md and docs/seed/README.md.
(If they aren't in the repo yet, the files are attached: add them under
docs/ as PR 0, along with the CLAUDE.md rules in the roadmap.)

Then work the roadmap's PR table in order, one PR at a time, starting with
PR 1. Follow CLAUDE.md, including the new rules. Before each PR, recheck any
fact the brief says to recheck, and put the source and checked date in the
data file. Don't write any news content. Leave [OWNER: ...] markers in
place. After each PR, tell me what shipped, what you verified, and any
owner decision that's now blocking.
```
