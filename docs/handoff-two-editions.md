# Handoff: morning and evening editions that send on schedule

For the next Claude session picking this up. Repo
`Legal-Leaf-Market/Heart-Of-Columbus`, branch `claude/bold-franklin-leyln4`
(cut from `main` at `4d4af8f`). No pull request is open yet. Read CLAUDE.md
first: merging to `main` publishes nothing, `live` is moved up in batches by
the Publish workflow, and you never push to `main` or `live`. Don't put
`[publish]` in the title.

## Where things stand (paused 2026-11-27)

Done on this branch, not yet tested:

1. `src/data/events.mjs`: Ben Eckert's wheel throwing moved from Nov 28 to
   Dec 5 (5 to 7 PM, `times: [1020, 1140]`) and Dec 12 (2 to 4 PM,
   `[840, 960]`), venue "Studio C, 4760 Ray Boll Blvd", source
   https://www.artsincolumbus.org/studio-c, checked 2026-11-27. Read on the
   page this session: "Saturday, December 5 5:00 to 7:00 pm, Saturday,
   December 12 2:00 to 4:00 pm", "4760 Ray Boll Blvd".
2. `src/news/paper-mail.mjs` (new, nothing imports it yet): the pure core.
   `EDITIONS` (clock and topic env names), `keysFor`, `columbusInstant`,
   `plan(kind, now)` (early / send with `at` / late), the dash and `[CHECK]`
   rule, Up the road (`cleanRoad`, `roadBlockers`, `roadHtml`), Shop Local
   Spotlight (`pickSpotlight`, `spotlightHtml`), Columbus by Design
   (`pickDesign`, `designHtml`), Open, Closed, New Hours (`listingChanges`
   over `diffDirectory`, `changesHtml`), Lookout (`lookout`, `lookoutHtml`),
   and `composeEdition()` plus `subjectFor()`. Read it before changing it.

Everything else below is still to do.

## What Jake asked for (his decisions; they change the house rules)

Editions now SEND on schedule unless he presses Hold. Two editions, every
day: morning and evening. Readers choose morning, evening or both. One
IndyStar shout out per edition. One PR.

Already set up outside the repo by Jake: heartofcolumbus.shop is verified
in Resend; `HOC_NEWSLETTER_FROM` is `Heart of Columbus <news@heartofcolumbus.shop>`;
Resend topics on the "Heart of Columbus" segment (`76b1c769-95c3-48d0-a94b-8fae85eb80c7`):
Morning edition `3eb52dcb-733c-4a1f-a52a-fe4d7e5e0360` and Evening edition
`9af8c22b-43a6-4d8a-b027-374e33ce95de`, both opt in by default, ids set in
Netlify as `RESEND_TOPIC_MORNING` and `RESEND_TOPIC_EVENING`.
`ANTHROPIC_API_KEY` is set (no credits yet). Two temporary Claude scheduled
tasks cover the paper until this ships; **the PR must tell Jake to turn
those two off when this goes live**, or readers get two of each.

1. **Schedule, Columbus time, every day.** Morning: desk deadline 6:10 AM,
   draft and note 6:15, send 6:45. Evening: deadline 5:25 PM, draft and note
   5:30, send 6:00 PM. Same two wake UTC pattern as before (in `EDITIONS`:
   `15 10,11 * * *` and `30 21,22 * * *`), one run per date and edition
   recorded in Blobs.
2. **Sending.** Create the broadcast with the segment and the edition's
   topic, schedule it for the send time. A Hold endpoint guarded like
   `/api/desk` (key after `#` in the link, sent as `x-hoc-key`) cancels the
   scheduled send and keeps the draft. One note per edition to
   `HOC_NEWSLETTER_NOTIFY` with the subject, a preview link and the Hold
   link. Update every "never sends" comment and doc.
3. **Desk.** A Morning / Evening switch, so each date has a plan and pieces
   per edition (`day-<date>` stays the morning, the evening is
   `day-<date>-evening`). An "Up the road" box per edition: IndyStar link,
   headline as typed, optional comment. Render "Up the road", "via IndyStar",
   the link, the comment labeled as the publisher's. Never fetch
   indystar.com. Change the no other newsroom test (end of
   `tests/morning.test.mjs`) to allow only this pasted link. Approved desk
   pieces and Up the road go into their edition; nothing approved means the
   automatic edition goes out.
4. **Evening edition**, about a two minute read, header "The evening
   edition": optional one line open; weather for tonight and tomorrow; 0 to 2
   desk pieces; Open, Closed, New Hours only if something changed; Columbus by
   Design; Lookout for tomorrow and the next few days from `/api/events` and
   the city and county leads; Up the road.
5. **Morning additions:** weather for today and tonight; Shop Local
   Spotlight (one business a day, no repeat within 30 days, Founding Members
   and claimed listings first, start from `src/data/spotlight.mjs`); Open,
   Closed, New Hours from `src/news/leads.mjs`, left out when empty; Lookout
   for today; Up the road.
6. **Columbus by Design:** one building or landmark a night from
   `src/data/architecture.mjs` (`NHL` entries with no `landmark`),
   `landmarks.mjs` and `building-history.mjs` (`HISTORIC`): what it is,
   architect, year, street. Photos only from Wikimedia Commons, credited as
   `/credits/` does ("Photo: X. License: Y. Source"), never a listed business.
7. **Automatic editions** use only published stories, the site's own data
   and first hand public sources, with no writing help unattended. An edition
   needs the weather plus at least one other section, otherwise skip it and
   say why in the note (`composeEdition` returns `substance` for this).
8. **Reader choice:** the `/newsletter/` signup form offers Morning, Evening
   or Both (Both preselected); `/api/subscribe` sets the contact's two topics
   on confirm. Every edition's footer links to Resend's preferences page.
9. Events fix: done (above).
10. **Tests** for both clocks across daylight time, Hold, topic routing,
    signup choices, each new section, Up the road rendering, the dash and
    `[CHECK]` rules. Update `docs/morning-paper.md` (add the two topic
    variables to the settings table), CLAUDE.md (the "Second exception"
    paragraph still says the job "never sends") and `docs/worklog.md`.

Then: open the PR ready for review, list what wasn't tested against the live
services, and once `npm test` passes and the heartofcolumbus Deploy Preview
is green, **Jake has asked for it to be merged** (merge commit is fine); let
the batched publish take it live and tell him when it is live (check that
`origin/live` contains the merge commit).

## Facts checked this session (don't redo)

- **NWS:** `https://api.weather.gov/robots.txt` is `User-agent: * / Disallow: /`
  (read 2026-11-27). Jake said to check the endpoint allows it, otherwise link
  the forecast page, so editions LINK
  `https://forecast.weather.gov/MapClick.php?lat=39.2014&lon=-85.9214` and
  never read the API. This also means the existing `nws` source in
  `src/news/gather.mjs` (alerts) breaks the "robots.txt allows it" rule the
  last PR claimed; decide whether to drop it, and say so in the PR. Be
  honest that the earlier claim was wrong.
- **Resend API** (read from resend.com/docs on 2026-11-27):
  - `POST /broadcasts` takes `segment_id`, `topic_id` (optional; omitted
    means every subscribed contact in the segment, ignoring topics), `from`,
    `subject`, `html`, `text`, `name`, `reply_to`, `send` (boolean) and
    `scheduled_at` (ISO 8601 or natural language; needs `send: true`).
  - `POST /broadcasts/:id/send` with `{ scheduled_at }` sends or schedules
    one created by the API.
  - `PATCH /broadcasts/:id` updates a draft (also takes `topic_id`).
  - `POST /broadcasts/:id/cancel`: a `scheduled` broadcast goes back to
    `draft` (no emails sent); a `queued` one becomes `canceled`. That is
    Hold.
  - `POST /contacts` takes `segments: [{id}]` and `topics: [{id, subscription: 'opt_in'|'opt_out'}]`.
  - `PATCH /contacts/{id or email}/topics` with a JSON array
    `[{id, subscription}]` updates an existing contact's topics.
  - Preferences: `{{{RESEND_UNSUBSCRIBE_URL}}}` opens Resend's unsubscribe
    page, which lists topics so readers can pick. Only **Public** topics show
    to everyone (Private ones only to contacts opted in), so tell Jake to make
    both topics Public if they aren't.
- **Network:** this session moved to a new personal environment, "Legal-Leaf
  Market sites newsletter checks", which adds api.weather.gov,
  forecast.weather.gov, resend.com and artsincolumbus.org. Node needs
  `NODE_USE_ENV_PROXY=1`. indystar.com is deliberately not allowed.
- Resend currently has **no broadcasts** (the stale Nov 24 and 25 drafts were
  deleted at Jake's request).

## Design decided so far (change it if you find a better one)

- **Where the edition is built:** at run time in the function, because the
  leads, the listing changes and the spotlight history live in Blobs. The
  build (`build.mjs`, `src/news/editions.mjs`) should keep writing
  `/newsletter/editions/<date>.json` for 14 days, but with data (published
  stories from the last 36 hours, open early, the business story, sponsors)
  rather than finished HTML, plus one `/newsletter/daily.json` with the
  spotlight candidates (`tier` from `tierOf` in `src/data/claims.mjs`,
  `SPOTLIGHT` slugs as `featured`, a family tie line from
  `src/data/family.mjs`, hours rows), the design list, and a directory
  snapshot (`snapshotOf` from `src/news/leads.mjs`). The function fetches
  both from the site's own origin. `/newsletter/next/`
  (`src/pages/habit-pages.mjs`) reads `upcomingEditions` and needs updating
  to match.
- **Listing changes:** the function diffs the build's snapshot against the
  last one it stored (Blobs key such as `dirsnap`), then stores the new one.
  First run: store, show nothing.
- **Spotlight and design history:** Blobs keys (for example
  `spotlight-history`, `design-history`) of `{slug: date}`; the picks in
  `paper-mail.mjs` take that history.
- **Functions:** `netlify/functions/newsletter.mjs` (morning, its schedule
  from `EDITIONS.morning.wake`) and a new `newsletter-evening.mjs`, sharing
  one `editionRun({ kind })`. The desk's "make draft" should keep working as
  a preview draft that the job then updates in place (`PATCH`) and schedules.
  Keep the Buttondown path draft only. If `RESEND_TOPIC_EVENING` is unset,
  skip the evening (it would otherwise go to every reader) and say so in the
  note; morning without a topic goes to the whole segment as before.
- **Timing:** `plan()` schedules at the send time, or two minutes from now if
  the wake is between the send time and an hour after it; later than that it
  makes a draft only and the note says it was not sent.
- **Hold:** `/api/hold`, POST only, `x-hoc-key` header. Accept the desk key
  (`HOC_ADMIN_KEY`, compared with `sameKey` from `src/pixel-key.mjs`) or a
  random per edition hold token whose hash is stored with the draft record,
  so the note email never carries the admin key. The Hold link opens a page
  (`/newsroom/hold/#t=...&date=...&edition=...`, noindex, no-referrer) with
  one button that POSTs, because mail scanners open every link (the same
  lesson as the signup confirm link). Holding calls
  `POST /broadcasts/:id/cancel` and records `held` on the draft record.
  Also put a Hold button on the desk for today's scheduled edition. Say in
  the PR that the token approach deviates slightly from "the desk key in the
  link", and why.
- **Note:** the per edition note email includes the subject, send time, the
  Hold link, the Resend broadcast link (`https://resend.com/broadcasts/<id>`)
  as the preview link, and the edition HTML below it.
- **Signup:** a `choice` radio (morning, evening, both) only on
  `/newsletter/` (`signupBox` in `src/news/share.mjs`, `newsletterPage` in
  `src/pages/habit-pages.mjs`); other signup boxes default to Both. Store the
  choice with the pending signup; on confirm, `POST /contacts` with
  `topics`, and the fallback path also `PATCH`es `/contacts/{email}/topics`.
  Update the copy that says "weekday mornings" and "an editor reads it
  before it goes out" (signup box, `/newsletter/`, confirmation email,
  `IN` text in subscribe.mjs, print boxes in `src/pages/print-pages.mjs`).
- **Desk UI:** `public/js/desk.js` and the desk page in
  `src/pages/reader-pages.mjs`: an edition switch next to the date, the Up
  the road fields saved in the plan (`plan.road`), `planBlockers` extended
  with `roadBlockers`, the run line rewritten for the new reasons and
  times, and a Hold button. `netlify/functions/desk.mjs` takes `edition` on
  every call and uses `keysFor`.

## Rules that matter here

- No dashes in anything a reader sees (no em dash, en dash or spaced
  hyphen). Write time ranges as "5 to 7 PM".
- Claude never writes news; automation makes leads, not stories. The
  automatic sections only list what a source or our data already says.
- Never fetch indystar.com; the pasted link is all we keep.
- Founding Member and the publisher's own businesses are disclosed wherever
  they appear (the spotlight box does this).
- `npm ci` then `npm test`; check changed pages in headless Chromium at 390
  and 1280 with no horizontal scroll.
