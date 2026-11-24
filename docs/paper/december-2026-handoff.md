# December 2026 print edition: where it stands (2026-11-24)

The proof is live at /print/2026-12/ and every page fits at 11 x 17
(`NODE_USE_ENV_PROXY=1 node scripts/print-pdf.mjs --out proof.pdf --shots dir`).

## Done

- First drafts of every news slot in `content/print/2026-12/` (river,
  referendum, election, camping, publisher, gathers-intro, faith, sports, and
  the three spotlights: Jill's Diner, Amy's Closet, Crossroads). All are
  `status: draft`, no byline, each with `drafted:` and `sources:`. CLAUDE.md
  records the owner's permission for these drafts (third exception).
- `[CHECK: ...]` marks show yellow on the proof; a `ready` story with any left
  is flagged.
- A story that features a business prints its disclosure automatically.
- Coupons: 10% off Crossroads (in the fill pool up to four times, and on pages
  4 and 7) and Amy's Closet spend $10 get $5 (page 7). Nothing for Jill's.
- The front page river story jumps to page 5 (`flow: 'river-jump'`), so the
  writer can add to it without breaking the front page.
- News page links to the edition; Events & Weddings moved left in the
  category bar.

## Open

1. Research: `docs/research/december-print-chrome-brief.md` went to Claude in
   Chrome. When its results come back, clear the matching `[CHECK]` marks in
   each draft, citing the sources it found.
2. Jake asks in person: Jill (last name, history, Sunday hours), Amy (hours,
   Love Chapel, coupon end date), Crossroads coupon terms, and phone
   confirmation of every Christmas service time.
3. Election results: fill `votes` for each candidate in `election.md` once the
   canvass is certified; the table then prints totals and a winner.
4. Photos: the 1970s Chaos photo on page 14 is hotlinked and fails; save a
   local copy in `public/print-media/`. The front page aerial prints at 180
   ppi; Eli Wire's riverfront photo replaces it. Kevin's photo for page 8.
5. Printing: quotes for a true 11 x 17 newsprint run (Task 6 of the brief).
   Target under $2 a copy; $5 is fine for the first run.
6. Page 2 and page 13 have some white space the fillers do not close; worth a
   look once the drafts are rewritten to their real lengths.
