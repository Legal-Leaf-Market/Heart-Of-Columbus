# How the morning paper gets made

The publisher's routine for the morning newsletter, and the rules that keep
it original. The tool is the writing desk at `/newsroom/desk/#k=<HOC_ADMIN_KEY>`
(open it from the private link; the key never goes in the address bar).

## The clock (Columbus time)

| When | What happens | Who |
| --- | --- | --- |
| All day before | Ideas go in the desk's **Idea bank** as they come: a link, something overheard, a reader tip from `/newsroom/inbox/`, a question | Publisher |
| Overnight, by 5 AM | The machines gather leads (below). Nothing is written from them automatically | Automation |
| 5:00 to 6:30 AM | Pick 3 to 5 items. For each one write **your take and direction**, add the sources, press **Draft it**, then edit until it sounds like you. **Check facts** before you approve | Publisher |
| By 6:30 AM | Write the subject line (or press **Suggest subjects**), write your open, check the **Preview**, press **Make the newsletter draft** | Publisher |
| 6:30 to 7 AM | Open the newsletter service, read the draft once more, press send | Publisher |
| 10:30 UTC (5:30 or 6:30 AM) | The scheduled job makes a draft by itself. If you approved pieces at the desk, it uses yours; if you marked the morning "No edition", it makes none; otherwise it drafts the automatic edition. It never sends | Automation |

Write the night before when you can. A piece approved at 10 PM is in the
next morning's edition the same as one approved at 6 AM.

## What we gather, and what we never do

**Read first-hand sources, not other newsrooms.** Facts are free; someone
else's sentences, structure and scoops are not. The best local items come
from places that publish facts and nobody turns into news:

| Source | Where | Already in the repo |
| --- | --- | --- |
| City council, county commissioners, school board agendas and minutes | columbus.in.gov, bartholomew.in.gov, bcsc.k12.in.us | Lead lists planned (docs/newspaper-plan.md) |
| Business openings, closings, new hours, new online ordering | Our own directory, compared night to night | `src/news/leads.mjs`, the store crawl |
| Today's events | Library, parks and hand-entered listings | `/api/events`, `src/data/events.mjs` |
| Weather, road work, closures | National Weather Service, INDOT, city notices | Weather link in every edition |
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

Each suggestion shows its cost (usually a few cents). Settings live in
Netlify: `ANTHROPIC_API_KEY` turns writing help on, `HOC_DESK_MODEL` changes
the model (default `claude-opus-5-5`), and `RESEND_*` or `BUTTONDOWN_API_KEY`
pick the newsletter service.
