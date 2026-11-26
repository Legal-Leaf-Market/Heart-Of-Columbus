# Love Me Wildly Photography: website draft and Founders Club invitation

A standalone one page site for Love Me Wildly Photography (Deidra McKenzie,
Columbus, Indiana), plus `pitch.html`, the invitation to join the Heart of
Columbus Founders Club. Built 2026-11-26 at Jacob Kennedy's request; Jacob and
Nic know her and have worked a wedding with her. Served by the main build at
`/preview/love-me-wildly/` (see `DRAFTS` in `build.mjs`).

She is NOT a Founding Member yet. She goes in `src/data/members.mjs` only
after she says yes and pays (the badge is a disclosure).

## Facts

Every fact is from her own pages, read 2026-11-26 and listed at the top of
`index.html`: lovemewildly.com (home, about, packages, portfolio, contact),
instagram.com/love.me.wildly and facebook.com/lovemewildlyphotography. Her
site publishes no prices, so none are shown. The surname is from Jacob.

## Photos

None of hers are used. Her photos are her work and show her couples, so every
frame is a labeled placeholder ("Deidra's photo here") until she sends the
ones she wants, with a credit line and her OK that the people in them can be
shown. Put them in `img/` (web sized, EXIF stripped) and swap each `.shot`
placeholder for an `<img>`. The flower mark and the van are our drawings, not
her logo; her logo replaces the mark when she sends the file.

## What the page does

* Golden hour finder: date and place in, golden hour, sunset and blue hour out
  (NOAA sunrise equation, Eastern time, labeled as an estimate).
* Coverage planner: photo start and end times suggest The Golden Hour (5
  hours), The Timeless (8 hours) or The Wildly In Love (elopement), and say
  whether golden hour falls inside the coverage. The suggestion is ours.
* Inquiry: opens the visitor's own email app addressed to her, with the
  planner summary filled in. Nothing is sent or stored by the page.

## Going live

When she approves: add her photos and logo, let her rewrite the About copy,
remove the draft bar and every `ph` tag, decide on prices, then point
lovemewildly.com at the site (Squarespace domain settings) and drop the
`noindex` meta. Keep `pitch.html` out of the live site.
