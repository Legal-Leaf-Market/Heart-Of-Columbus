# Cross promotion audit: the family's five sites

Jake asked on 2026-11-27 for an audit of how Heart of Columbus, Crossroads
Wedding & Event Co., Ship It With AI, Kawaii Katz and Legal Leaf Cafe & Market
promote each other, and for a lot more of it. Checked in each repository the
same day, because this sandbox cannot reach the live sites.

## Before: who linked to whom

| From \ To        | Heart of Columbus | Crossroads | Ship It | Kawaii Katz | Legal Leaf |
|------------------|-------------------|------------|---------|-------------|------------|
| Heart of Columbus | (self) | listing only | footer and /owners/ | listing only | listing only |
| Crossroads       | 3 partner pages, 2 on the old netlify.app address | (self) | none | none | none |
| Ship It          | case study, every page's canonical | home and /work/ | (self) | home and /work/ | home and /work/ |
| Kawaii Katz      | none (only in its own address) | none | none | (self) | dead .com in hidden sameAs |
| Legal Leaf       | founder line on 6 policy pages | founder line on 6 policy pages | none | none | (self) |

The gaps: Kawaii Katz linked to nobody, Crossroads to Heart of Columbus only,
Legal Leaf's home page (the cafe) to nobody, and nothing on Heart of Columbus
said which listed businesses were the publisher's own beyond each listing's
own page. Heart of Columbus's footer also said "Not affiliated with the
businesses listed", which was not true for four of them.

## After: what each site now carries

Every link is tagged `utm_source=<site>&utm_medium=referral&utm_campaign=family`
so each site's analytics can count what the family sends it.

- **Heart of Columbus.** A footer row on every page, "Also from the publisher",
  naming all four with the tie said beside them (`src/data/family.mjs`,
  `familyRow()` in `src/site.mjs`). The footer's "not affiliated" line now
  excepts them. /about/ gains "The publisher's other businesses". Each
  family listing links the others ("Also from the same family"). A story
  tagging one discloses the tie automatically (`src/news/disclosure.mjs`,
  kind `own`). tests/family.test.mjs.
- **Crossroads.** A family block in the footer of every page (Heart of
  Columbus's /plan/ page, the Ship It case study, Kawaii Katz, Legal Leaf
  labeled 21+). Partner pages and the playbook moved to heartofcolumbus.shop.
- **Ship It With AI.** A "My live work, open to visit" row under every footer
  (all 24 pages), linking all four, with the tie said.
- **Kawaii Katz.** A family line in both footers (home and product pages):
  Heart of Columbus (its own listing), Crossroads, and the Ship It story of
  how the shop was built. The dead legal-leafmarket.com in `SISTER_SITES` is
  now legalleafmarket.shop.
- **Legal Leaf.** The founder line names Ship It too and links Heart of
  Columbus to Legal Leaf's own listing; the cafe and shelf footers gain a
  family line; analytics.js counts clicks to heartofcolumbus.shop and
  crossroadsweddingco.shop as `sister_site_click`.

## Rules this follows

- **The tie is always said where the link is.** Heart of Columbus is a
  directory with a "disclose our ties" rule; a footer promoting the
  publisher's own businesses without saying so would break it.
- **Nothing touches ranking.** Family links never change search order,
  category order, Boost or the Founding Member sort. Kawaii Katz's Founding
  Member place is its own, unchanged.
- **Kawaii Katz and Legal Leaf never point at each other.** Kawaii Katz is a
  children's friendly shop (it filters adult products out of its catalog);
  Legal Leaf sells 21+ smoke shop goods. Every other link to Legal Leaf says
  21+. Heart of Columbus's site wide footer names both, since it is a
  general audience directory that already lists both.
- **Only what each site says about itself.** The one line describing each
  site comes from that site's own pages or repository notes.

## Decisions left for Jake

- Kawaii Katz's hidden schema.org `sameAs` still lists Legal Leaf, Nicotia and
  Herbal Leaf (now with Legal Leaf's live address). `sameAs` means "the same
  entity", which these are not, and it ties a kids' shop to three smoke shops
  in search engines' eyes. Recommend removing the list; left as it was because
  an earlier change put it there on purpose.
- Heart of Columbus's /plan/ and /djs/ pages could carry a disclosed
  "From the publisher: Crossroads" card the way /owners/ carries the Ship It
  one. Not done: it sits next to competing DJs and is Jake's call.
- Shared metrics: each site now tags its family links. A weekly look at
  `utm_campaign=family` referrals on each site would show which placement
  earns its keep.
