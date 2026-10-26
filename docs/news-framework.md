# The newspaper framework: how to plug in

The plan is `docs/newspaper-plan.md`. This page is the short version for
anyone adding a section, a story or a feature page.

## The rules that come with it

- People write the news. Code builds the press. Never put a news story,
  quote, obituary, letter, review or headline about a real person, business
  or event in the repo unless a named staff member wrote it and an editor
  approved it.
- Sports is human written. Obituaries come only by submission from the
  family or funeral home (label `Obituary`). Opinion is always labeled.
- Templates and tests use the made-up town of Sampleton with `sample: true`.
- No visible dashes. Pages stay `noindex`.

## Add a section

One entry in `src/news/sections.mjs`:

```js
{ slug: 'faith', name: 'Faith', blurb: 'One sentence on what it covers.' }
```

That builds `/news/faith/`, lists its stories newest first, and puts it in
the paper's bar. Set `bar: false` to leave it out of the bar.

A section with its own page (a dashboard, a guide, a directory) adds
`href: '/faith/'` and builds that page itself. Use the shared frame so it
looks like the paper:

```js
import { newsPage } from '../news/frame.mjs';
import { storiesIn } from '../news/content.mjs';
import { storyList } from '../news/render.mjs';

newsPage({ assets, path: '/faith/', title: 'Faith', description: '...',
  crumbs: [['/news/', 'News'], ['', 'Faith']],
  body: `<section class="wrap np-section">...${storyList(storiesIn('faith'))}</section>` });
```

Add the page to `build.mjs` the way the other page files are added.

Topics a story can tag live in `TOPICS` in the same file. Add yours.

## Add a story

`content/stories/YYYY/MM/<slug>.md`, built at `/news/YYYY/MM/<slug>/`.
The front matter fields and an example are at the top of
`src/news/content.mjs`; `content/samples/` has two complete examples.

Required: `headline`, `label` (see `src/news/labels.mjs`), `section`,
`bylines` (slugs in `src/data/staff.mjs`), `editor` (a staff member with
`editor: true` who is not a byline), `published` with the Columbus offset
(`-04:00` in daylight time, `-05:00` otherwise). Every tag must be a business,
landmark or neighborhood slug, or a topic. Every image needs alt text, a
credit and a license.

`draft: true` builds the page with a Draft banner and lists it nowhere, for
stories still waiting on an editor.

A story that breaks a rule stops the build and says which file and why.

## Helpers

| Import | From | What |
| --- | --- | --- |
| `stories`, `storiesIn(section)`, `storiesTagged(slug)`, `storiesBy(staff)` | `src/news/content.mjs` | published stories, newest first |
| `storyCard(s)`, `storyList(items)` | `src/news/render.mjs` | cards for lists |
| `newsPage({...})` | `src/news/frame.mjs` | the page frame |
| `disclosures(tags)` | `src/news/disclosure.mjs` | partner and sponsor disclosure lines |
| `STAFF`, `person(slug)` | `src/data/staff.mjs` | the newsroom |
| `PAPER`, `NEWS_LIVE` | `src/data/paper.mjs` | the paper's name and launch switch |

## The newsroom editor at /admin/ (owner setup)

Reporters and editors write in Decap CMS at `/admin/`, no git needed. The
configuration is generated from `src/news/cms.mjs`, so its dropdowns always
match the labels, sections and staff the build accepts. Each story moves
through Draft, In review and Ready, and each one is a pull request.

To turn it on (TODO(owner), these are settings, not code):

1. Pick the sign-in. The config uses Netlify Identity (`git-gateway`): in
   Netlify, enable Identity, set registration to invite only, enable Git
   Gateway, and invite each staff member. GitHub OAuth or DecapBridge also
   work; change `backend` in `src/news/cms.mjs`.
2. The two-person rule: in GitHub, protect `main` with "Require a pull
   request before merging" and "Require approvals: 1", so a story's author
   can't publish it alone. The build also refuses a story whose editor is
   one of its authors.
3. Add each new staff member to `src/data/staff.mjs` first; the CMS only
   offers people who are there.

## The business beat's lead lists

After each listings refresh, run `node scripts/diff-directory.mjs`. It
compares the directory with `content/drafts/directory-snapshot.json` and
writes `content/drafts/business-changes-<date>.md`: closings, temporary
closings, reopenings, new listings, big hours changes and new ordering or
booking links, plus the public-record calendars to check by hand. It is a
checklist for a reporter, never a story, and `content/drafts/` is never
built into the site. `--holiday 2026-11-26` writes the list of places to
call about holiday hours, because our listings carry regular hours only.

## Newsletter, games, membership, sponsors

- `node scripts/morning-edition.mjs [date]` writes
  `content/drafts/morning-<date>.html` from published stories, events,
  early hours and one business change. An editor reviews it and sends it
  through the newsletter service. TODO(owner): pick the service and set
  `NEWSLETTER` in `src/data/paper.mjs`; the signup form appears then.
- Games: `/games/where/` (daily landmark close-up, from
  `src/data/landmarks.mjs`) and `/games/quiz/` (the editor adds
  `content/quizzes/<date>.json`; format at the top of
  `src/pages/habit-pages.mjs`). A crossword waits for a local constructor.
- `/members/` explains the plan and asks for nothing until
  `MEMBERSHIP.open` is set. TODO(owner): taking member payments is your call.
- Sponsors go in `src/data/sponsors.mjs` and appear only through
  `sponsorSlot()`, labeled, inside their dates, never in a story.
