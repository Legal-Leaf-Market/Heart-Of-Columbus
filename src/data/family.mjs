// The publisher's own businesses. Jake Kennedy runs Heart of Columbus and
// these four; he asked for a cross promotion audit across all five sites and
// for each to promote the others (2026-11-27). The tie is a disclosure, so
// every place this list shows says whose they are, and nothing here touches
// search ranking, category order, Boost or the Founding Member sort.
//
// Each line says only what the site's own pages say (checked 2026-11-27 in the
// repositories, since this sandbox cannot reach the sites):
//   Crossroads    crossroadsweddingco/components/Footer.tsx and lib/site.ts
//   Ship It       ship-it-with-ai/CLAUDE.md "What this is"
//   Legal Leaf    legalleafmarketshop/public/cafe.html and shop.html (21+)
//   Kawaii Katz   KawaiiKatz/lib/site.ts SITE_DESCRIPTION
// `slug` is the business's own page here, when it has one. `adult` marks a
// site for adults 21 and over, and every link to it says so.
//
// `ref` tags each link so the sites can count what the family sends them.
export const FAMILY_REF = 'utm_source=heartofcolumbus&utm_medium=referral&utm_campaign=family';

export const FAMILY = [
  {
    name: 'Crossroads Wedding & Event Co.',
    url: 'https://crossroadsweddingco.shop/',
    what: 'Wedding DJ and MC, live acoustic sets and bar service',
    slug: 'crossroads-wedding-co',
    tie: 'Crossroads Wedding Co. is run by Jacob Kennedy, who also runs Heart of Columbus.',
  },
  {
    name: 'Ship It With AI',
    url: 'https://shipitwithai.heartofcolumbus.shop/',
    what: 'Websites, small business ERP and workflow tools, built by Jake',
    tie: 'Ship It With AI is Jake Kennedy\'s own business, and he also runs Heart of Columbus.',
  },
  {
    name: 'Kawaii Katz',
    url: 'https://kawaiikatz.heartofcolumbus.shop/',
    what: 'Cute finds for every budget, curated by Ada',
    slug: 'kawaii-katz',
    tie: 'Kawaii Katz is run by Ada, the daughter of Jacob Kennedy, who also runs Heart of Columbus.',
  },
  {
    name: 'Legal Leaf Cafe & Market',
    url: 'https://legalleafmarket.shop/',
    what: 'A cafe coming soon, and smoke shop accessories delivered in Columbus',
    slug: 'legal-leaf-market-cafe',
    adult: true,
    tie: 'Legal Leaf Market is owned by Jacob Kennedy, who also runs Heart of Columbus.',
  },
];

export const familyHref = (f) => f.url + (f.url.includes('?') ? '&' : '?') + FAMILY_REF;
// The ties, as each listing's own page words them (src/data/added.mjs `tie`).
export const FAMILY_TIE = 'Jake Kennedy, who runs Heart of Columbus, runs these, and Kawaii Katz is his daughter Ada\'s.';

// The others to show beside one of them. Kawaii Katz is a children's
// friendly shop (it filters adult products out of its own catalog), so it and
// the 21+ site never point at each other, here or on the sites themselves.
export const KID_SAFE = new Set(['kawaii-katz']);
export const familyBeside = (slug) => {
  const kid = KID_SAFE.has(slug);
  const adult = FAMILY.find((f) => f.slug === slug)?.adult;
  return FAMILY.filter((f) => f.slug !== slug && !(kid && f.adult) && !(adult && KID_SAFE.has(f.slug)));
};
