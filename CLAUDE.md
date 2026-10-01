# CLAUDE.md: Heart of Columbus

Directory + five storefront demos for independent businesses in Columbus,
Indiana. A pitch, not a live service. See README.md.

## Standing rules

- **No em dashes anywhere a person reads** (repo owner's directive). The en dash
  is fine inside numeric ranges. The build fails on an em dash in any page.
- **Never invent facts about a real business.** Addresses, phones, hours and
  prices come from public listings and are noted at the top of each page file.
  Anything unverified is shown with the `sample` tag. No made-up reviews,
  ratings, awards, owners' names or history.
- **Demos must read as demos.** Every storefront keeps the `demoBanner`, says
  "not affiliated", and never sends an order, booking or text. Badges for
  features we built say "(demo)". Pages stay `noindex` until a business signs on.
- **Tailwind v4** (`src/styles.css`, themes as CSS variables per business).
  Class names built in `public/js` must appear literally so Tailwind finds them.
- Vanilla JS, no framework. `public/js/core.js` is the shared cart, time-slot
  and checkout engine; keep business logic in each storefront's own script.

## Checking work

- `npm test` must pass.
- Check layout in headless Chromium at 390 and 1280+ with no horizontal scroll,
  and click through every storefront's order flow after touching `core.js`.
