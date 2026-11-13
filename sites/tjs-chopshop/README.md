# TJ's ChopShop website (draft) and Founding Member pitch

A standalone one page site for TJ's ChopShop, 1521 17th St, Columbus, IN 47201,
plus `pitch.html`, the one-sheet offer for the Heart of Columbus Founding
Members pilot. Separate from Heart of Columbus: nothing here is built or tested
by the main site.

Sources for every fact are at the top of `index.html`. Booksy publishes no
phone, hours, services, prices or barber names for the shop, so those are
tagged "placeholder" until TJ sends them. 1521 17th St also appears in the
directory as Bob Condon's Barber Shop; whether TJ's is that shop brought back
is unconfirmed, and the page only asks.

## The offer (pitch.html)

* Free listing stays free for everyone (the /owners/ page promises it).
* Founding Member: $20 a month, locked, no contract, 10 spots.
  Website built, hosted and updated within two business days, domain in the
  owner's name, featured and labeled "Founding Member" on Heart of Columbus.
* Referral: each business they bring in that joins takes one month off.
* TJ, first member: first two months free, billing starts month three.

Not built yet on Heart of Columbus: the "Founding Member" label and featured
slot. Paid placement must always be labeled (see `src/data/sponsors.mjs`).

## Deploy on Netlify

1. Netlify: Add new site, Import an existing project, pick this repo.
2. Base directory: `sites/tjs-chopshop`. Build command: empty. Publish directory: `.`
3. Deploy. The pitch is at `/pitch.html` on the same site.

Faster, no Git: drag the `sites/tjs-chopshop` folder onto https://app.netlify.com/drop

## Going live

When TJ approves: fill the placeholders, add his photos, remove the draft bar,
the `noindex` meta tag and the `X-Robots-Tag` line in `netlify.toml`, then point
his domain at the site. Keep `pitch.html` out of the live site or delete it.
