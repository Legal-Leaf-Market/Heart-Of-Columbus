# Building Heart of Columbus into a newspaper

A brief for Claude Code working in `Legal-Leaf-Market/Heart-Of-Columbus`.
Suggested home in the repo: `docs/newspaper-plan.md`.

Research date: October 25, 2026. I looked at the newspapers that defined the
business (the penny press, Pulitzer's *World*, Ochs's *New York Times*,
*Yomiuri Shimbun*, *USA Today*, *The Wall Street Journal*), the ones winning
today (*The New York Times*' bundle, *The Guardian*'s open model), and local
newsrooms that work at Columbus's scale (*The Storm Lake Times*, Lookout
Santa Cruz, Axios Local, Mirror Indy and Documenters, WBEZ's Curious City).
I also looked at Columbus's own news landscape. Sources are at the end.

## Read this first: the one rule that matters most

**Claude Code builds the press. People do the reporting.**

A newspaper is only as good as its reporting, and reporting means people
calling, showing up, checking, and putting their names on it. The repo's
standing rule ("never invent facts about a real business") becomes stricter
for news:

- Never write a news story, quote, obituary, letter, review, or headline
  about a real person, business, or event. Build the templates, tools,
  checks, and data pages. A named human writes and an editor approves.
- Template and test content must be obviously fake (a made-up town, "Sample
  Reporter") and flagged `sample: true`. The build fails if sample content
  ends up in a published section, the same way demos must read as demos.
- Data-driven items (openings, closings, holiday hours) are **drafts for a
  reporter to verify**, never auto-published. Item 6 explains why.
- The cautionary tale: in August 2023 Gannett paused AI-written high school
  sports recaps after one in the *Columbus Dispatch* (Ohio) went viral for
  opening "The Worthington Christian [[WINNING_TEAM_MASCOT]] defeated the
  Westerville North [[LOSING_TEAM_MASCOT]]." A newspaper that publishes one
  of those loses trust it doesn't get back.

All the rules in `CLAUDE.md` still apply: no em dashes in anything a person
reads, pages stay `noindex` until the owner decides to launch, plain CSS for
directory-style pages, vanilla JS, and `npm test` must pass.

## What the most successful newspapers did

| Paper | What it did | What it means here |
| --- | --- | --- |
| *New York Sun*, 1833 | Benjamin Day sold it for a penny on the street through newsboys, when rival dailies cost $6 to $10 a year in advance. He covered local life and human interest, and ran heavy "help wanted" ads. Rivals averaged about 1,700 copies; the *Sun* hit about 30,000 a day by 1836. | Free to read. Local life first. Useful listings are part of the paper. |
| Pulitzer's *New York World*, 1885 | Raised over $100,000 from more than 120,000 people for the Statue of Liberty's pedestal, and printed nearly every donor's name on the front page, however small the gift. | Readers support what they see themselves in. Community campaigns, with credit. |
| *The New York Times* under Adolph Ochs, from 1896 | Bought for $75,000 with about 9,000 readers; reached about 780,000 by the 1920s. Bet on objective reporting when most papers were partisan, under the motto "All the News That's Fit to Print." | Trust is the product. Publish the standards and live by them. |
| *Yomiuri Shimbun* | Topped 10 million daily copies by 1994 and holds the Guinness record for daily circulation, with morning and evening editions. Still about 6 million in the mid-2020s. | Habit beats reach. Show up at the same times every day. |
| *USA Today*, 1982 | Color, a big weather page, a national sports page, a Money section, and short, tight writing. Critics mocked it; competitors copied it. | Make it easy to scan on a phone. Weather and sports are anchors, not filler. |
| *The Wall Street Journal* | Went online in April 1996 and started charging that August; about 828,000 digital subscribers by 2015. | People pay for what they can't get anywhere else. Here, that's local data and local reporting. |
| *The New York Times* today | 12.33 million subscribers at the end of Q3 2025, 51% of them on the bundle or multiple products (news, Games, Cooking, The Athletic). Wordle brought "tens of millions" of new users. Its 2014 Innovation Report found only about a third of readers visited the homepage, comments came from about 1% of readers, and structured tagging alone raised recipe search traffic 52%. | A bundle: news, the directory, guides and games each give a reason to come back. Tag everything. |
| *The Guardian* | No paywall. Digital reader revenue reached £125m in the year to March 2026, up 17%, with payment framed as a choice. | Open journalism plus a sincere ask can pay. |
| *The Storm Lake Times* | A family-owned, twice-weekly paper in a small Iowa town won the 2017 Pulitzer for editorial writing, for editorials that took on agricultural interests over water pollution. | Small papers can hold power to account. Size is no excuse. |
| Lookout Santa Cruz | Launched November 2020; won the 2024 Pulitzer for Breaking News for its coverage of the January 2023 floods. Profitable on earned revenue, about 60% advertising and 40% memberships (Nieman Lab, September 2026). | Be ready for the bad day. Ads plus members can work locally. |
| Axios Local | 35 cities as of April 2026, more than 2 million free subscribers, typically two full-time reporters per city, daily newsletters with three to five original items. | A small staff can own a city's morning through email. |
| Mirror Indy (Indianapolis) | Nonprofit and free to read; about 30,000 daily newsletter readers; nearly 300 residents trained as Indy Documenters; text-message groups; shares stories with WISH-TV. | A model one hour up I-65. Partners widen reach. |
| WBEZ Curious City | Readers submit and vote on questions, and reporters answer the winners. KUOW in Seattle said six of its top 10 stories of 2014 came from audience ideas. | Let Columbus set part of the agenda. |
| *Texas Tribune* | Its Government Salaries Explorer turns public records into a searchable tool. In Indiana, employee pay is the most-viewed data on the state's Indiana Gateway. | Data apps built from public records are evergreen traffic. |

## Columbus's news landscape (check before acting on any of it)

- ***The Republic*** has served Columbus since 1872 (it started as the
  *Columbus Republican*). IBJ reported its print edition went to
  Wednesdays and Saturdays on September 2, 2023, with daily web updates.
  HD Media of West Virginia took it over from AIM Media on September 1,
  2026. Its 1971 building, designed by Myron Goldsmith of SOM with glass
  walls that showed the presses to the street, is a National Historic
  Landmark (2012) and now houses IU's J. Irwin Miller Architecture Program.
- **Position:** complement *The Republic* and other local outlets, don't
  attack them. Link generously to their reporting, never copy it, and stay
  open to partnering (Mirror Indy shares stories with a TV station).
- **Public notices:** *The Republic* reported that HEA 1210 passed both
  chambers on February 27, 2026. If it became law, governments can post
  notices on their own websites starting July 1, 2027, so notices are not a
  business to build on. A free page that links to official notices is still
  a public service (item 10).
- **Funding:** Press Forward Indiana is a statewide funder group (Indiana
  Philanthropy Alliance, Lumina Foundation, Glick Philanthropies) within the
  national Press Forward movement.

## The advantage nobody else has

Heart of Columbus already holds the most complete map of the town's
independent economy: 929 businesses with hours, locations, neighborhoods,
and what each one sells online. No local paper has that. Build the
newspaper so the two feed each other:

- Every story is tagged to the businesses, landmarks, and neighborhoods it
  mentions, and every business page shows "In the news" (the *Times* bundle
  lesson, and its tagging lesson).
- The business beat (openings, closings, new owners, expansions) is
  powered by data the site already refreshes (item 6).
- The visitor and events work in the earlier brief
  (`docs/visitor-site-research.md`, if it's in the repo) becomes the Things
  to Do section.

---

## Phase 1: foundations (nothing publishes until these exist)

### 1. Standards pages and a staff file

The Trust Project's eight trust indicators are the checklist: best
practices, journalist expertise, labels, references, methods, locally
sourced, diverse voices, actionable feedback. The SPJ Code of Ethics (seek
truth and report it, minimize harm, act independently, be accountable and
transparent) is the policy base.

**Build:**
- `/about/` (mission, owner, who funds us), `/about/standards/` (ethics
  policy, AI use policy, sourcing, anonymous sources, conflicts),
  `/about/corrections/` (policy plus a running log), and `/staff/<slug>/`
  bios with beat, background, and contact.
- `src/data/staff.mjs`: each person's name, role, beat, bio, email.
- Owner decisions needed first (leave clear `TODO(owner)` markers, don't
  guess): the paper's name and motto, the editor, the AI policy, and the
  funding model.
- **Conflict disclosures are automatic.** If a story tags a business in
  `src/data/partners.mjs` (pickup partners) or a sponsor, the story shows a
  disclosure line. The site has business relationships; the paper must say
  so every time.

### 2. A content model for stories

**Build:**
- Stories as Markdown in `content/stories/YYYY/MM/<slug>.md`, with front
  matter:
  - `headline`, `dek`, `bylines` (staff slugs), `editor` (staff slug)
  - `label`: one of News, Analysis, Opinion, Explainer, Data, Community,
    Meeting notes, Sponsored
  - `section`, `tags` (business slugs, landmark slugs, neighborhood slugs,
    topics)
  - `published`, `updated` (ISO 8601 with the America/Indiana/Indianapolis
    offset)
  - `sources` (name, URL or "interview, date"), `methods` (how we reported
    this), `corrections` (date and text, append-only)
  - `images` (file, alt text, caption, credit, license)
  - `sponsor` (required when the label is Sponsored)
- `build.mjs` reads `content/`, and `src/pages/news-pages.mjs` renders it.
  Markdown needs a parser: add a small dependency (for example `marked`) or
  write a minimal one. That's an owner call, since the repo keeps
  dependencies light.
- **Tests** (new `tests/news.test.mjs`): every byline and editor exists in
  `staff.mjs`; a label is set; Sponsored has a sponsor; every image has alt
  text and a credit; every tag resolves to a real slug; no `sample: true` in
  published content; corrections are append-only (compare against git
  history in CI if practical); no em dashes.

### 3. An editing workflow for people who don't use git

Reporters and editors shouldn't need git. A git-based CMS keeps the static
build and the repo as the record.

**Build:**
- Decap CMS or Sveltia CMS (a drop-in alternative) at `/admin/`,
  configured for the front matter above, with the editorial workflow on so
  every story is a pull request: draft, in review, ready.
- **Two-person rule:** nothing reaches `main` without the editor's
  approval. Use branch protection plus the CMS workflow.
- Auth: Decap's maintainers said in August 2026 that Netlify Identity is
  supported again after its 2025 deprecation scare. GitHub OAuth or
  DecapBridge are the alternatives. Pick one with the owner.
- Keep `noindex` on until the owner launches. Add a `NEWS_LIVE` flag so the
  section can be previewed without being announced.

---

## Phase 2: the paper itself

### 4. The front page and sections

**Seen at:** *USA Today* (scannable, color, weather and sports as anchors),
the *Times* (only a third of readers use the homepage, so every story page
must stand alone), Axios Local (three to five items a day is enough).

**Build:**
- A front page at `/news/` (keep `/` as the directory home until the owner
  decides to swap): lead story, three to five more, weather and river box,
  "Open right now," This weekend, latest openings and closings, one photo of
  Columbus.
- Sections, each a page with its own list:
  - **Local** (city, county, schools)
  - **Business** (openings, closings, new owners; the natural beat)
  - **Food & drink**
  - **Architecture & design** (the beat only Columbus has)
  - **Neighborhoods** (reuse the 10 areas and their pages)
  - **Sports** (Columbus North, Columbus East and other area schools; local
    papers live on high school sports, and it must be human-written)
  - **Things to do** (from the visitor brief's events data)
  - **Opinion** (editorials, columns, letters, always labeled)
- Add "News" to the header nav. Use Fraunces (already in `public/fonts/`)
  for headlines so it reads like a paper without new font files.

### 5. The story page

**Build** a template with:
- The label badge (News, Opinion and so on) above the headline, always.
- Byline linking to the staff bio, editor credit, published and updated
  times.
- For developing stories, a "What we know / what we don't know yet" box.
- Cards for every tagged business (reuse `card()` from `src/site.mjs`), a
  small map, and the landmark link if one is tagged.
- "References" (sources list) and "How we reported this" (methods), per the
  Trust Project.
- Corrections shown at the top when they change the meaning, at the bottom
  otherwise, each with a date.
- "Spot an error? Have a tip?" link to item 9's forms.
- JSON-LD `NewsArticle`: one `author` entry per person with `name` and
  `url`, `datePublished` and `dateModified` with a time zone, `headline`,
  and images in 16x9, 4x3 and 1x1 (Google's guidance). Opinion pieces use
  `OpinionNewsArticle`.
- On each business page (`bizPage` in `src/pages/directory-pages.mjs`), an
  "In the news" rail of stories tagged with that business.

### 6. The business beat, powered by the directory (drafts only)

This is where the directory makes the paper better than anyone else's.

**Build:**
- `scripts/diff-directory.mjs`: compares the directory before and after a
  data refresh and writes `content/drafts/business-changes-<date>.md` with
  new listings, places Google now marks permanently or temporarily closed,
  big hours changes, and new online ordering or booking links.
- The draft is a **lead list for a reporter**, not a story. Google listings
  are sometimes wrong about closings, so each item needs a call or a visit.
  The published version says how each item was confirmed ("confirmed with
  the owner by phone, October 24" or "per their Google listing; we couldn't
  reach them").
- More leads from public records, also drafts only: the Indiana Alcohol and
  Tobacco Commission's public meeting calendar and local board agendas
  (new permit applications often mean a restaurant is coming), and Columbus
  city agendas (posted as PDFs on columbus.in.gov), including plan
  commission items.
- A holiday hours roundup page built from listings, labeled with its source
  and date, and the usual "call ahead."

### 7. Weather, river level, and a breaking-news mode

**Seen at:** Lookout Santa Cruz (its Pulitzer was for flood coverage),
*USA Today* (weather as an anchor).

**Build:**
- Front-page box from the National Weather Service API (`api.weather.gov`,
  free and public domain; send a User-Agent) for Columbus, and the USGS
  gauge for the East Fork White River at Columbus (site 03364000). Fetch in
  the browser with a cached fallback, and always show "Updated <time>, from
  NWS / USGS."
- Link the USGS flood-inundation maps for the East Fork White River at
  Columbus from the river box.
- **Breaking mode:** one data file (`content/alert.json`) turns on a
  site-wide banner and an emergency page template: what we know, closures,
  where to go, how to help, last updated. An editor can flip it from the CMS
  in under a minute. Test that the banner never shows an expired alert.

---

## Phase 3: habit and community

### 8. A morning newsletter and an evening "open tonight"

**Seen at:** Axios Local (daily, three to five original items), Mirror
Indy (about 30,000 daily newsletter readers), *Yomiuri* (morning and
evening editions), and the weekend emails in the visitor brief.

**Build:**
- The morning edition generated from published content: weather, three to
  five stories, what's open early, today's events, one business change.
  The editor reviews it before sending.
- Send through an email service (Buttondown, beehiiv, Ghost or similar) by
  API. Don't build email delivery. Double opt-in, plain unsubscribe, a
  privacy page.
- An evening "open tonight" block on `/news/` from hours data, with no
  email needed.
- Text alerts for breaking news only, later (Mirror Indy runs text groups).

### 9. Reader questions, letters, and tips

**Seen at:** WBEZ Curious City and Hearken (ask and vote), the Trust
Project's "actionable feedback," and the *Times* report's finding that only
about 1% of readers comment.

**Build:**
- `/ask/`: "What do you want to know about Columbus?" Store submissions with
  a Netlify function in Blobs, reusing the owner-leads inbox pattern
  (`netlify/functions/claim.mjs`, guarded by `HOC_ADMIN_KEY`). Public voting
  can come later.
- `/letters/`: letters to the editor with name and town required, editor
  approval, published under Opinion.
- `/tips/`: a short form, minimal data kept, no IP logging, plus a note on
  safer ways to reach the editor for sensitive tips.
- No comment section. Letters and questions get more signal with less
  moderation.

### 10. Civic coverage: Documenters, meetings, and public data

**Seen at:** City Bureau's Documenters Network (residents trained and paid
to take templated notes at public meetings, fact-checked by staff before
publication), Indy Documenters (nearly 300 trained), the *Texas Tribune*'s
salaries explorer.

**Build:**
- `/meetings/`: upcoming public meetings (city council, county
  commissioners, school board, plan commission) with links to official
  agendas. Times come from the official source, with a checked date.
- A "Meeting notes" template matching the Documenters format: who was
  there, what was decided, votes, follow-up questions. Human-written, editor
  reviewed, labeled "Meeting notes." Ask the Documenters Network about
  partnering before calling it Documenters.
- `/data/` pages from Indiana Gateway: city, county and school budgets
  first. Employee pay is the most popular Gateway data, but start with
  department totals; naming individuals needs an editor's judgment under
  "minimize harm."
- `/notices/`: links to official public notices, especially after July 1,
  2027, when governments may post them on their own sites.

### 11. Games and recurring features

**Seen at:** the *Times*, where Wordle brought "tens of millions" of new
users and Games is part of the bundle that more than half of subscribers
now take.

**Build the engines; people make the content:**
- **"Where in Columbus?"**: a daily photo of a building detail, guess the
  landmark. Uses the credited Commons photos and the landmarks data from the
  visitor brief. Share results without spoilers, like Wordle.
- **Weekly news quiz**: the editor writes questions from that week's
  published stories; the page handles scoring and sharing.
- **Crossword**: only if a local constructor makes it. Support a standard
  puzzle file format rather than inventing one.
- Store streaks and scores in `localStorage` with try/catch, like Saved.

---

## Phase 4: paying for it

### 12. Free to read, members, and labeled sponsors

**Seen at:** *The Guardian* (no paywall, £125m in digital reader revenue),
Mirror Indy (free, nonprofit, more than 1,000 members, mostly foundation
funded), Lookout Santa Cruz (about 60% ads, 40% members, profitable), Axios
Local (mostly ads and sponsorships, 15,000 paying members), the *WSJ*
(paywall works when content is unique and valuable to business readers).

**Recommendation:** free to read at launch, to build reach and the daily
habit, with a membership ask and labeled local sponsorships. Revisit a
paywall only if the reporting becomes something people can't get anywhere
else.

**Build:**
- A membership page and an ask at the end of stories (not a pop-up wall).
  Payments go through Stripe or the newsletter platform's paid tier. Note
  that "We never take payment" in `CLAUDE.md` is about orders for
  businesses; taking memberships is a new decision for the owner. Leave a
  `TODO(owner)`.
- Sponsorships in `src/data/sponsors.mjs`, shown only in marked slots,
  always labeled "Sponsored," never inside a story. Sponsors get no say in
  coverage. Stories about a sponsor get the automatic disclosure from
  item 1.
- Events and grants (Press Forward Indiana, local foundations) are people
  work, not code. The site just needs an "About our funding" list that stays
  current.

---

## Not recommended

- **AI-written stories, recaps, or "automated local news."** See Gannett's
  2023 LedeAI pause. Automation makes leads, not articles.
- **Auto-publishing closings from Google data.** Listings are wrong often
  enough to hurt a real business. Verify every one.
- **Mugshot galleries or a police blotter without editorial judgment.**
  "Minimize harm" applies. Arrests are not convictions, and the pages live
  forever.
- **Copying or rewriting other outlets' stories.** Link to them and credit
  them.
- **A comment section.** Letters and questions do the job better (item 9).
- **A paywall at launch.** It blocks the habit-building the paper needs
  first.

## Suggested PR order

1. Standards pages, staff file, conflict disclosures (item 1)
2. Content model, build step, news tests (item 2)
3. CMS with the editorial workflow and two-person rule (item 3)
4. Story template with JSON-LD and "In the news" on business pages (item 5)
5. Front page and sections (item 4)
6. Weather, river, breaking mode (item 7)
7. Directory diff drafts and public-record leads (item 6)
8. Reader questions, letters, tips (item 9)
9. Meetings, notes template, data pages, notices (item 10)
10. Newsletter (item 8), games (item 11), membership and sponsors (item 12)

## Done means

- `npm test` passes, including `tests/news.test.mjs`.
- Layout checked in headless Chromium at 390 and 1280 px, with no sideways
  scroll and no failed local requests. Rerun the axe scan on every new
  template.
- No em dashes in anything a person reads. Pages stay `noindex` until the
  owner launches.
- No real-world news content written by Claude Code anywhere in the repo.
  Templates and tests use obviously fake sample content.

---

## Sources

**History**
- EBSCO, [Birth of the Penny Press](https://ebsco.com/research-starters/history/birth-penny-press) (the *New York Sun*, 1833)
- National Park Service, [Pulitzer's campaign for the pedestal](https://home.nps.gov/stli/learn/historyculture/pulitzer-in-depth.htm)
- Wikipedia, [Adolph Ochs](https://en.wikipedia.org/wiki/Adolph_Ochs)
- Wikipedia, [The Yomiuri Shimbun](https://en.wikipedia.org/wiki/The_Yomiuri_Shimbun); Press Gazette, [Biggest newspapers in the world by circulation](https://pressgazette.co.uk/media-audience-and-business-data/media_metrics/biggest-newspapers-world-circulation/) (August 2025)
- Library of Congress, [USA Today at 40](https://blogs.loc.gov/manuscripts/2022/09/usa-today-at-40/)
- Nieman Lab, [WSJ.com, paywalled from the very beginning, turns 20](https://www.niemanlab.org/2016/04/the-wall-street-journal-website-paywalled-from-the-very-beginning-turns-20-years-old-today/)

**National models today**
- Nasdaq, [How the New York Times' digital bundle strategy is winning subscribers](https://www.nasdaq.com/articles/how-new-york-times-digital-bundle-strategy-winning-subscribers) (Q3 2025)
- Axios, [NYT says Wordle added "tens of millions of new users"](https://www.axios.com/new-york-times-earnings-wordle-acquisition-users-0cb11458-5b27-493b-a14b-d0d96eb82f7a.html)
- Nieman Lab, [The leaked New York Times innovation report](https://www.niemanlab.org/2014/05/the-leaked-new-york-times-innovation-report-is-one-of-the-key-documents-of-this-media-age/) (2014)
- Press Gazette, [Viner says Guardian has seen a decade of booming foreign and reader revenue](https://pressgazette.co.uk/publishers/viner-says-guardian-has-seen-decade-of-booming-foreign-and-reader-revenue/) (June 2026)

**Local models**
- Columbia Journalism Review, [2017 Pulitzer Prizes](https://www.cjr.org/analysis/2017-pulitzer-prizes.php) (*The Storm Lake Times*)
- Nieman Lab, [Lookout Santa Cruz is profitable thanks to ads and memberships](https://www.niemanlab.org/2026/09/many-have-said-it-couldnt-be-done-local-news-site-lookout-santa-cruz-is-profitable-thanks-to-ads-and-memberships/) (September 2026); Local Media Association, [Lookout Local marks five years](https://localmedia.org/2025/12/lookout-local-marks-five-years-with-pulitzer-winning-journalism-and-national-expansion-plans/)
- Press Gazette, [Axios Local newsletters, scale and profit](https://pressgazette.co.uk/newsletters/axios-local-newsletters-scale-cities-profit/) (2026)
- American Journalism Project, [Free Press Indiana case study](https://theajp.org/free-press-indiana/) (Mirror Indy, Indy Documenters)
- Documenters Network, [FAQ](https://akron.documenters.org/faq/)
- Knight Foundation, [Curious City inspires a scalable model for engagement journalism](https://knightfoundation.org/articles/curious-city-inspires-scalable-model-engagement-journalism-answers-peoples-questions)
- Texas Tribune, [Government Salaries Explorer](https://salaries.texastribune.org/); IU Indiana Business Research Center, [Gateway's most popular local government data](https://www.incontext.indiana.edu/2019/may-jun/article3.asp)
- CNN, [Gannett pauses AI experiment after botched high school sports articles](https://edition.cnn.com/2023/08/30/tech/gannett-ai-experiment-paused) (2023)

**Columbus and Indiana**
- Wikipedia, [The Republic (Columbus, Indiana)](https://en.wikipedia.org/wiki/The_Republic_(Columbus,_Indiana)) and [The Republic Newspaper Office](https://en.wikipedia.org/wiki/The_Republic_Newspaper_Office)
- IBJ, [Newspapers in Columbus and 3 other cities to reduce print publication days](https://www.ibj.com/articles/newspapers-in-columbus-and-3-other-cities-to-reduce-print-publication-days) (2023)
- InkFreeNews, [West Virginia company acquires 6 Indiana newspapers](https://www.inkfreenews.com/2026/08/22/west-virginia-company-acquires-6-indiana-newspapers/) (August 2026)
- *The Republic*, [Public notice changes making newspaper publication optional](https://www.therepublic.com/?p=891566) (HEA 1210)
- Indiana Philanthropy Alliance, [Press Forward Indiana](https://inphilanthropy.org/news/press-forward-indiana-invites-funders-join-movement)
- Indiana ATC, [public meetings calendar](https://www.in.gov/atc/public-meetings/calendar); City of Columbus, [council agendas and minutes](https://www.columbus.in.gov/document/city-council-minutes-06-03-25/)
- USGS, [East Fork White River at Columbus (03364000)](https://waterdata.usgs.gov/monitoring-location/USGS-03364000/statistics/) and [flood-inundation maps](https://www.usgs.gov/maps/flood-inundation-maps-east-fork-white-river-columbus-indiana)

**Standards and tools**
- The Trust Project, [Trust Indicators](https://thetrustproject.org/trust-indicators/)
- SPJ, [Code of Ethics](https://spj.org/ethicscode.asp)
- Google Search Central, [Article structured data](https://developers.google.com/search/docs/data-types/article)
- Decap CMS discussion, [Netlify Identity and Git Gateway](https://github.com/decaporg/decap-cms/discussions/7419)
