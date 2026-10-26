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
