# Heart of Columbus

A directory of independent businesses in Columbus, Indiana, plus five working
storefront demos showing what direct ordering and booking could look like
without delivery-app commissions. It's a pitch: every demo page says it's a
concept preview, isn't affiliated with the business, and sends nothing.

## Pages

| Path | What it is |
| --- | --- |
| `/` | The hub: Eat Local and Service & Grooming tabs, category filters, forgiving search (typos, street names, "downtown", "NexusPark"), directory cards with badges, and the "Keep it in Columbus" savings estimate |
| `/gills/` | Gill's Barber Shop: live chair queue (simulated), "save my spot", booking from real hours, history since 1962 |
| `/tacolumbus/` | TaColumbus: birria plates and street taco packs with tortilla, toppings and salsa-heat toggles, drinks, pickup times |
| `/big-cheese/` | The Big Cheese: six-step build-your-sub, combo add-ons, daily special counting down to closing time, cash-only checkout |
| `/tasty-express/` | Tasty Express: lunch special or dinner combo toggle, one tap per dish, simulated text-message confirmation |
| `/rohdes/` | Rohde's Family Diner: breakfast builder (eggs your way, meat, potatoes, bread, gravy), skillet builder, classics, pickup slots that flag the morning rush |

Every storefront shares one engine (`public/js/core.js`): a cart saved in the
browser, pickup or appointment times computed from the business's real hours
in Indiana time, a checkout with validation, and a demo confirmation. Each demo
order is logged locally and shows up on the hub's savings tracker.

## What's real and what's a sample

- **Real** (from public listings, October 2026): names, addresses, phones,
  hours, founding years, and the listed prices for named menu items. Sources
  and the exact facts used are noted at the top of each `src/pages/*.mjs`.
- **Samples**, marked on the page with a "sample" tag: anything that couldn't be
  verified, such as build-your-own pricing, most barber services, some meats and
  add-ons, the daily special and the morning-rush window.
- **Simulated**, and labeled: the barber queue's customers, the text messages,
  and all confirmations. Nothing reaches the businesses.
- **Badges** only claim what listings show. Features Heart of Columbus built
  read "(demo)", and Jill's Diner's built-but-not-live ordering reads "(soon)".
- **Left out:** "The Hair Company" from the original spec. No salon by that
  name could be found on 25th Street or elsewhere in Columbus.
- **Hidden from search:** every page is `noindex` until the businesses are on
  board.

## Running it

```bash
npm install
npm run dev     # build and serve at http://localhost:4321
npm test        # build, then check the data and every demo page
```

The build renders the pages from `src/`, compiles Tailwind CSS v4 from
`src/styles.css`, and copies `public/` into `dist/`. It fails if an em dash
shows up anywhere a person reads.

## Hosting

Netlify, from this repo: connect it in Netlify (Add new project, Import from
GitHub) and `netlify.toml` does the rest. Every push to `main` redeploys.

## Adding a business

Add an entry to `src/data/businesses.mjs` with only facts you've checked.
To give it a demo storefront, copy one of `src/pages/*.mjs` plus its script in
`public/js/`, register it in `src/pages/storefronts.mjs`, add its slug to
`prototypes`, and give it a theme class in `src/styles.css`.

## Going live with a real business

The demos are front ends only. To take real orders, reuse what's already built
for Jill's Diner (`Legal-Leaf-Market/jills-diner`): a Netlify Function that
validates and prices orders on the server, Supabase for storage with row level
security, and a staff tablet that chimes on new orders.
