# Getting Heart of Columbus read: the distribution plan

Written November 24, 2026, for launch. The site is a local directory first;
the paper is how people find it, come back to it and pass it on. This is how
small local outlets grow an audience, matched to what the site can already do.

## What works for local outlets

These patterns come from the models in `docs/newspaper-plan.md` (Axios Local,
Mirror Indy and others, with sources there).

1. **Email is the spine.** A short, regular newsletter is the one channel a
   paper owns outright. Social reach rises and falls with each platform's
   rules; a subscriber list doesn't. Axios Local built its city editions
   around a daily email with three to five items.
2. **Be useful every time.** The emails people keep opening are the ones that
   save them time: what's open, what's happening, what changed. Ours carries
   weather, stories, what's open early and today's events.
3. **People share people.** Stories about named neighbors (a teacher, a
   business owner, a dad who served) get shared by those people and their
   families. Back YOUR Blue is built for exactly this.
4. **Go where the town already talks.** In a town of 50,000 that means
   Facebook groups, Nextdoor, church bulletins and the counter at the diner,
   as much as the paper's own pages.
5. **Partner, don't compete.** Mirror Indy shares stories with a TV station.
   A small paper grows faster by being quoted and linked by bigger ones.
6. **Show up on a rhythm.** The same days, the same times. Readers build a
   habit around a schedule, not a burst.

## What the site already does (live)

| Tool | Where |
| --- | --- |
| Morning edition, drafted each weekday at 6:45 AM for an editor to read and send | Resend Broadcasts (once the settings below are in) |
| Editor preview of the next editions | `/newsletter/next/` |
| Double opt-in signup | Every story, series page, front page, `/newsletter/` |
| Share bar: phone share sheet, text, email, Facebook, X, WhatsApp, copy link, copy for a post | Every story, series page, `/newsletter/` |
| Share cards: a shared story shows its own lead photo | Every story with a photo |
| RSS for the whole paper, each series, each section | `/news/feed.xml` and friends |
| Shareable math: the calculator opens with your numbers | "Share this math" on the homepage |
| Smart carousel and banners pointing to the paper, history and the newsletter | Homepage, news front, history |

## The weekly rhythm (start here)

- **Every morning and evening:** the editions send on their own at 6:45 AM and 6:00 PM. Read the note each one emails you (6:15 AM and 5:30 PM) and press Hold if anything is wrong.
- **Every story day:** post it once to the Heart of Columbus Facebook page
  with "Copy for a post", then share that post into the two or three local
  groups where it fits (check each group's rules on links first).
- **Tag the people in the story** on Facebook and Instagram, with their OK.
  Ask them to share it. This is the single biggest lever for a small paper.
- **Instagram:** post the story's lead photo with the headline as a short
  caption and "link in bio" pointing at `/news/`.
- **One Back YOUR Blue a week**, from a reader if possible. Every one comes
  with a family that will share it.
- **Fridays:** a "this weekend" post from the events page.

## The next things to build, in order

1. **A text alert list** for breaking local news only (the plan in
   `docs/newspaper-plan.md`, item 8), once there is breaking news to send.
2. **A Back YOUR Blue submission form**, so readers can nominate someone and
   the series fills itself (a person still writes and an editor approves).
3. **Instagram story cards** (1080 x 1920) generated for each story, like the
   share cards.
4. **A weekly "best of" edition** on Saturdays for readers who don't want daily.
5. **Referral links**: "you've sent the paper to 3 friends".

## Measuring it

Watch three numbers, weekly: newsletter subscribers, how many open the email,
and shares per story. Netlify Analytics (or a privacy-friendly tool like
Plausible) can count page views without tracking people; the privacy page
must be updated before any analytics script is added.
