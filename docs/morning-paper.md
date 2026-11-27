# How the morning paper gets made

The publisher's routine for the morning newsletter, and the rules that keep
it original. The tool is the writing desk at `/newsroom/desk/#k=<HOC_ADMIN_KEY>`
(open it from the private link; the key never goes in the address bar).

## The clock (Columbus time)

| When | What happens | Who |
| --- | --- | --- |
| All day before | Ideas go in the desk's **Idea bank** as they come: a link, something overheard, a reader tip from `/newsroom/inbox/`, a question | Publisher |
| About 4:15 AM | The overnight gathering reads the public sources below and puts what is new in the desk's **Idea bank** under **Overnight leads**. Nothing is written from them automatically | Automation |
| 5:00 to 6:30 AM | Pick 3 to 5 items. For each one write **your take and direction**, add the sources, press **Draft it**, then edit until it sounds like you. **Check facts** before you approve | Publisher |
| By 6:30 AM | Write the subject line (or press **Suggest subjects**), write your open, check the **Preview**, press **Make the newsletter draft** | Publisher |
| 6:45 AM, every season | The scheduled job makes a draft if you have not. If you approved pieces at the desk, it uses yours (with the plain dated subject if you left the subject empty, and without your open if it still has a `[CHECK]` or a dash); if you marked the morning "No edition", it makes none; otherwise it drafts the automatic edition, or none when no story is new. If you already pressed **Make the newsletter draft**, it leaves yours alone. It never sends, and it emails you a one line note either way (`HOC_NEWSLETTER_NOTIFY`) | Automation |
| 6:45 to 7 AM | Open the newsletter service, read the draft once more, press send | Publisher |

Write the night before when you can. A piece approved at 10 PM is in the
next morning's edition the same as one approved at 6 AM.

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
| Weather alerts | National Weather Service (api.weather.gov) | Overnight leads, plus the weather link in every edition |
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
2. **New piece** (or **Start a piece** from the idea bank). Pick a shape:
   Brief, The take, Explainer, List, Heads up.
3. **Your take and direction**: what the story is, why Columbus should care,
   what you think, what to lead with, what to leave out.
4. **Sources**: the link, who published it, and the facts you are using.
5. **Draft it**, then edit. **Headlines** and **Openings** give options to
   click. **Tighten** cuts. **Sound more like me** compares it with your
   samples. **Check facts** lists anything the sources do not support.
6. **Approve**. The desk refuses while there is a `[CHECK]`, no source (unless
   it is The take), or a dash.
7. Order the pieces with the arrows, write the subject and your open,
   **Preview**, **Make the newsletter draft**, then send it from the service.
   The subject and the open get the same `[CHECK]` and dash check. Pressing
   it again after an edit replaces the draft in Resend rather than adding a
   second one.

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
| `RESEND_API_KEY` | Resend, for drafts, signup and the morning note |
| `RESEND_SEGMENT_ID` | The Resend segment the newsletter goes to. `RESEND_AUDIENCE_ID` still works: Resend renamed Audiences to Segments in November 2025 and kept the ids |
| `HOC_NEWSLETTER_FROM` | The sender, on a domain verified in Resend, like `Heart of Columbus <news@...>` |
| `HOC_NEWSLETTER_REPLY_TO` | Optional: where replies to the newsletter go |
| `HOC_NEWSLETTER_NOTIFY` | Who gets the 6:45 AM note (comma separated) |
| `HOC_NEWSLETTER=resend` | Build setting: turns the signup form on, posting to `/api/subscribe` |
| `BUTTONDOWN_API_KEY` | Buttondown instead of Resend |

Signup is double opt in: the email links to a page with one button, so a
mail scanner opening the link first cannot use it up (or sign someone up).
