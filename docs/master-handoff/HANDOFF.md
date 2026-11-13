# Handoff for the next Claude session (2026-11-13)

Read this first, then `CLAUDE.md`. Jacob Kennedy (Jake) is Co-Founder and Chief
Editor of Heart of Columbus; Terry Winchester II is the other Co-Founder.

## What shipped today (all live, all on `main`)

Heart of Columbus (`heartofcolumbus.netlify.app`, Netlify deploys `main`):

- **TJ's ChopShop:** listing at `/b/tjs-chopshop/`, draft site and ambassador pitch at
  `/preview/tjs-chopshop/` and `/preview/tjs-chopshop/pitch.html` (built from
  `sites/tjs-chopshop/`, including his brand library and another session's motion layer).
- **Founding Member badge** (`src/data/members.mjs`, empty until an owner pays) and the
  **Founders Club** at `/founders-club/`: $20 a month, cancel any time, sites portable to any
  host, every new tool included, one Ambassador per section, works alongside the Chamber.
- **Chamber pilot brief** for Jon Myers at `/preview/chamber-pilot/` (Jake has a coffee
  planned with him).
- **Legal Leaf Market Cafe** listed as coming soon, with the owner tie disclosed.
- **History sign-off:** 117 articles approved (`src/data/history/signoff.mjs`, two-person rule
  enforced by `tests/signoff.test.mjs`).
- **Barbershop views and map art v2**, with close-zoom cutouts for all nine landmarks.
- **"Columbus, building by building"** at `/history/buildings/`: eleven field guides, still
  DRAFTS. Jake approves by adding their keys to `signoff.mjs` (editor `jacob-kennedy`).

Crossroads Wedding and Event Co. (`crossroadsweddingco.shop`, repo
Legal-Leaf-Market/CrossroadsWeddingCo, Netlify deploys `main`):

- **Back YOUR Blue** at `/back-your-blue` (PR #118): Jake's tribute to his father, Kevin Lee
  Kennedy, turning 60 on November 16, with a moderated notes board for family, coworkers and
  church family. Notes are approved at `/admin/<key>/reviews` and show on that page only.

## Next, in order

1. **Section art** (task started, not finished). The eight WebP scenes are already in
   `public/art/sections-v1/`; instructions in `section-art/CLAUDE_CODE_HANDOFF.md`. Plan
   agreed: a category-level hero reusing the barbershop `ed-hero` pattern
   (`src/editorial-art.mjs`, `categoryPage` in `src/pages/directory-pages.mjs`):
   coffee-sweets = coffee-and-sweets, bars = downtown-after-dark (navy copy panel),
   shopping = makers-and-markets, events = arts-and-music, things-to-do = parks-and-trails,
   Explore = downtown-day. Use `srcset` 768/1440. Do NOT use one painting as every card's
   fallback in a category. Tag each as an illustration.
2. **Approve the field guides** when Jake says so.
3. **Backlog:** `planning/EXECUTION_BACKLOG.md` (shared place contract, downtown spatial
   pilot, passport and Landmark Trail, merchant pilot). `planning/TRAILS_PASSPORTS_AND_MERCHANTS.md`
   has the detail. Jake holds the full master handoff zip, including the internal product and
   partnership documents deliberately kept out of this public repo.

## Open decisions for Jake

- Rename North Christian to The LEX in the directory?
- Three barbers whose Booksy names or addresses differ from the directory (see PR #57).
- TJ's terms (three free months, rewards at 1, 3 and 5 referrals) were proposed by Claude; confirm.
- Brian Blair byline confirmations on the faith retellings.

## Working notes

- The environment allows the sources and hosts used today; ask before adding more.
- Merge by PR with `expectedHeadSha`; another session merged #58 in parallel today.
- Both repos are public: keep strategy about real institutions and private details out.
