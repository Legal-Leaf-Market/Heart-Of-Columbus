# How the morning and evening editions get made

The publisher's routine for the newsletter, and the rules that keep it
original. There are two editions, every day of the week, and each one SENDS
on its own at its time unless the publisher presses Hold (Jake's decision,
2026-11-27). Readers choose the morning, the evening or both. The tool is the writing desk at `/newsroom/desk/#k=<HOC_ADMIN_KEY>`
(open it from the private link; the key never goes in the address bar).

## The clock (Columbus time, every day)

| When | What happens | Who |
| --- | --- | --- |
| All day before | Ideas go in the desk's **Idea bank** as they come: a link, something overheard, a reader tip from `/newsroom/inbox/`, a question | Publisher |
| About 4:15 AM | The overnight gathering reads the public sources below and puts what is new in the desk's **Idea bank** under **Overnight leads**. Nothing is written from them automatically | Automation |
| By 6:10 AM | **Morning** at the desk: approve the pieces you want, write the subject and open, paste an IndyStar story into **Up the road** if you have one, check the **Preview** | Publisher |
| 6:15 AM | The morning job builds the edition (yours, or the automatic one), makes the Resend broadcast for the Morning topic, schedules it for 6:45 and emails you a note: the subject, a preview link, a **Hold** link and the edition itself | Automation |
| 6:15 to 6:45 AM | Read the note. To stop it, press **Hold** (in the note or at the desk): it turns back into a draft in Resend and nothing is sent | Publisher |
| 6:45 AM | Resend sends the morning edition | Automation |
| By 5:25 PM | **Evening** at the desk: up to two pieces, a one line open, Up the road | Publisher |
| 5:30 PM | The evening job does the same for the Evening topic and schedules it for 6:00 | Automation |
| 6:00 PM | Resend sends the evening edition unless you held it | Automation |

What the job does when: a day marked **No edition** gets none; with no
approved pieces the automatic edition goes out; an edition with nothing but
the weather is skipped and the note says why. Your subject is used unless it
has a `[CHECK]` or a dash (then the plain dated subject is), and your open and
Up the road are left out if they do. A wake more than an hour after the send
time makes a draft only and does not send. Each edition runs once a day,
recorded in Netlify Blobs (`run-<date>`, `run-<date>-evening`).

Write ahead when you can. A piece approved the night before is in the next
morning's edition the same as one approved at 6 AM.

## What is in each edition

**Morning** ("The morning edition"): the weather for today and tonight (a
link to the National Weather Service forecast for Columbus); your pieces, or
new stories from the last 36 hours; the **Shop Local Spotlight** (one
directory business a day, never the same one twice in 30 days, Founding
Members, then claimed listings, then the featured ones first, every paid or
family tie said in the box); **Open, Closed, New Hours** (changes in our
listings since the last edition, left out when there are none, always "call
ahead"); what opens early; **Lookout** for today (our events feed plus the
city and county meetings in the leads); a business story; **Up the road**;
labeled sponsors.

**Evening** ("The evening edition", about two minutes): your one line open;
the weather for tonight and tomorrow (link); up to two of your pieces; Open,
Closed, New Hours if anything changed; **Columbus by Design** (one building or
landmark a night from `landmarks.mjs`, `architecture.mjs` and
`building-history.mjs`: what it is, architect, year, street; photos only from
Wikimedia Commons, credited as `/credits/` does); **Lookout** for tomorrow and
the next three days; Up the road.

**Up the road** is one IndyStar story per edition: paste the link, type the
headline as you want it, add a comment if you like. It prints with "via
IndyStar" and your comment labeled as yours. We never open indystar.com (it
refuses automated reading), so nothing is copied from it.

Why the weather is a link: `api.weather.gov/robots.txt` disallows every path
(checked 2026-11-27), so neither the editions nor the overnight leads read the
weather API any more. Check alerts on the forecast page by hand.

## What we gather, and what we never do

**Read first-hand sources, not other newsrooms.** Facts are free; someone
else's sentences, structure and scoops are not. The best local items come
from places that publish facts and nobody turns into news:

| Source | Where | Already in the repo |
| --- | --- | --- |
| City news, and city council, public works and redevelopment agendas and minutes | columbus.in.gov | Overnight leads (`src/news/gather.mjs`) |
| County news, commissioners and board meetings, office closings | bartholomew.in.gov | Overnight leads |
| School board agendas | bcsc.k12.in.us (BoardDocs) | Not yet: BoardDocs refuses automated reads, so check it by hand |
| Business openings, closings, new hours, new online ordering | Our own directory, compared night to night | `src/news/leads.mjs`, the store crawl |
| Today's events | Library, parks and hand-entered listings | `/api/events`, `src/data/events.mjs` |
| Weather alerts | National Weather Service | By hand on the forecast page: api.weather.gov's robots.txt disallows every path. Every edition links the forecast |
| Road work, closures | INDOT, city notices | City notices are in the overnight leads; INDOT by hand |
| Reader questions, tips and letters | `/ask/`, `/tips/`, `/letters/` | `/newsroom/inbox/` |
| Public records: permits, property transfers, restaurant inspections | City and county portals | Not yet (worklog) |
| What you saw and heard yourself | You | The idea bank |

**Never:**
- Copy or closely paraphrase another outlet's story. If The Republic or a TV
  station broke it, you may report the fact with credit ("as The Republic
  reported Tuesday") and a link, then add what only you can add: your take,
  the local angle, what it means for the reader.
- Republish a press release as news. Use the facts, credit the source, say
  what it leaves out.
- Scrape sites that forbid it or sit behind a login, or pull full articles.
  The store crawl reads public business pages only.
- Let the desk invent anything. It works only from your notes and the
  sources you paste; anything it is unsure of comes back `[CHECK: ...]`, and a
  piece with a `[CHECK]` cannot be approved.

**What makes it yours** is the part nobody else can write: your angle, your
opinion (labeled as yours with the shape **The take**), your knowledge of the
town, and the choice of what matters this morning. The desk only saves you
the typing.

## The desk, piece by piece

1. **Your voice** tab, once: describe how you sound, set house rules, paste
   three to six things you wrote and like. Every suggestion reads from it.
   Then the **Beat book** tab: the names you write about, one per line as
   `Name | note | wrong spellings`, and phrases you never use. The writing
   help spells names your way and avoids the banned phrases, and **Approve**
   refuses a piece with a wrong spelling or a banned phrase. Notes help with
   spelling only; the desk never takes a fact from them.
2. **New piece** (or **Start a piece** from the idea bank). Pick a shape:
   Brief, The take, Explainer, List, Heads up.
3. **Your take and direction**: what the story is, why Columbus should care,
   what you think, what to lead with, what to leave out.
4. **Sources**: the link, who published it, and the facts you are using.
5. **Draft it**, then edit. The line under the editor gives prose numbers:
   sentences, the average and longest sentence, a reading grade, -ly words and
   likely passive voice. They are hints for your edit, never a rule. **Headlines** and **Openings** give options to
   click. **Tighten** cuts. **Sound more like me** compares it with your
   samples. **Check facts** lists anything the sources do not support.
6. **Approve**. The desk refuses while there is a `[CHECK]`, no source (unless
   it is The take), or a dash.
7. Pick **Morning** or **Evening** next to the date: each has its own plan,
   pieces and Up the road. Order the pieces with the arrows, write the
   subject and your open, check the **Preview** (it shows the whole edition as
   it will go out). **Make the draft now** puts it in Resend early; the job
   updates that same draft at its time and schedules it, so there is never a
   second copy. The subject, the open and Up the road get the same `[CHECK]`
   and dash check. **Hold this edition** shows once it is scheduled.

## Overnight leads

`netlify/functions/leads.mjs` runs at 9:15 UTC every day and reads the
sources in `SOURCES` (`src/news/gather.mjs`). It keeps a title, a link, a date
and who published it: never the text. New items are flagged **NEW** once.
Each lead has **To ideas** and **Start a piece** (which fills in the source
link); the desk lists any source it could not read. **Gather now** runs it on
demand. To add a source, add it to `SOURCES` with the date you checked that
its address answers and that robots.txt allows it, and keep to first-hand
sources (no other newsroom).

Each suggestion shows its cost (usually a few cents). Settings live in
Netlify (Site configuration > Environment variables, scoped to Functions):

| Variable | What it does |
| --- | --- |
| `ANTHROPIC_API_KEY` | Turns writing help on at the desk |
| `HOC_DESK_MODEL` | Changes the model (default `claude-opus-5-5`) |
| `HOC_ADMIN_KEY` | The desk's private key (`#k=` in the link) |
| `RESEND_API_KEY` | Resend, for the editions, signup and the notes |
| `RESEND_SEGMENT_ID` | The Resend segment the newsletter goes to. `RESEND_AUDIENCE_ID` still works: Resend renamed Audiences to Segments in November 2025 and kept the ids |
| `HOC_NEWSLETTER_FROM` | The sender, on a domain verified in Resend, like `Heart of Columbus <news@...>` |
| `HOC_NEWSLETTER_REPLY_TO` | Optional: where replies to the newsletter go |
| `RESEND_TOPIC_MORNING` | The Resend topic id for the morning edition. Required to send the morning edition |
| `RESEND_TOPIC_EVENING` | The Resend topic id for the evening edition. Required to send the evening edition |
| `HOC_NEWSLETTER_NOTIFY` | Who gets each edition's note with the Hold link (comma separated) |
| `HOC_NEWSLETTER=resend` | Build setting: turns the signup form on, posting to `/api/subscribe` |
| `BUTTONDOWN_API_KEY` | Buttondown instead of Resend |

Signup is double opt in: the email links to a page with one button, so a
mail scanner opening the link first cannot use it up (or sign someone up).
The `/newsletter/` form asks Morning, Evening or Both (Both is preselected;
every other signup box means Both), and confirming sets the reader's two
topics. Every edition's footer links to Resend's preferences page
(`{{{RESEND_UNSUBSCRIBE_URL}}}`), where readers switch editions or leave.
Make both topics **Public** in Resend, or readers who are not opted in to one
will not see it there.

Before scheduling, the job reads the saved broadcast back from Resend and
confirms it is a draft with the expected segment and topic. If it cannot,
the edition stays in draft and the publisher note says why. Check the
draft's audience in Resend before sending it manually.

Before creating a broadcast for an automatic send, the job also checks
Resend's broadcast history, up to five pages of 100, for the dated name, including
the temporary task's `(from heartofcolumbus.shop)` suffix. A matching
scheduled, queued or previously sent broadcast for the same segment is enough to
skip a second send. If history cannot be checked, the job sends no
edition and tells the publisher why. Keep the temporary tasks paused
after the site's schedule takes over.

### Production cutover

1. In [Netlify Deploys](https://app.netlify.com/projects/heartofcolumbus/deploys),
   check the published production deploy from `live`. Its commit should
   include both newsletter PRs, [#219](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/219)
   and [#221](https://github.com/Legal-Leaf-Market/Heart-Of-Columbus/pull/221).
   The [public signup](https://heartofcolumbus.shop/newsletter/) should offer
   Morning, Evening and Both.
2. Once both PRs are live, pause the temporary Claude newsletter schedules
   for 6:10 AM and 5:25 PM Columbus time. The site's jobs run at 6:15 AM and
   5:30 PM, with sends at 6:45 AM and 6:00 PM.
3. Before a manual send, search [Resend Broadcasts](https://resend.com/broadcasts)
   for the exact edition and date in the Heart of Columbus segment. An edition
   that is scheduled, queued or already sent needs no manual send. On
   Nov. 27, Resend already showed two Nov. 28 morning broadcasts marked sent.
4. For the first edition with no existing broadcast, check the publisher note
   for the subject and Resend preview. If it is scheduled, the note should
   include the edition's Hold link. Check that the broadcast uses the expected
   segment and edition topic. Resolve any audience or history error before
   considering a manual send.

**Hold** (`/api/hold`, page `/newsroom/hold/`): the note's link carries a one
time code after `#` that can hold only that edition, so the note never
carries the desk key; the desk's own button uses the desk key. Only the
button holds (a POST), never opening the link, because mail scanners open
every link. Holding cancels the scheduled broadcast in Resend, which turns it
back into a draft.
