// Founding Members: businesses that pay Heart of Columbus $20 a month for a
// website we build and keep current, and a featured, labeled spot here. EMPTY
// ON PURPOSE: a business goes in only after its owner has agreed and paid. A
// badge on someone who has not signed is a false claim about a real business.
//
//   'tjs-chopshop': {
//     since: '2026-11-20',           // date the owner agreed
//     contact: 'owner name or role', // who we answer to
//   },
//
// What membership changes, and nothing else: a "Founding Member" tag on the
// card and the business page, first place in its category list, and a
// disclosure line on the business page and on any story that tags it. Search
// ranking never changes (search ranks by relevance, never by who pays), and
// the free listing never depends on joining.
export const MEMBERS = {
  // Founder #1. Jacob Kennedy confirmed on 2026-11-13 that the owner agreed
  // and paid. Facts on the listing come from the owner's own site (own-facts.mjs);
  // the draft website for review is sites/cookie-paradise/.
  'cookie-paradise-llc': {
    since: '2026-11-13',
    contact: 'Trung, owner (trung@cookieparadise.co, published on the contact page)',
  },
  // Founders #2 to #7. Jacob Kennedy confirmed on 2026-11-15 that each of these
  // owners agreed and paid. Same date for all six: on a shared date, founders
  // number in the order they are listed here, so add new ones at the end.
  'amys-closet': { since: '2026-11-15', contact: 'the owner, via Jacob Kennedy' },
  'jills-diner': { since: '2026-11-15', contact: 'the owner, via Jacob Kennedy' },
  'rabbits-balloons': { since: '2026-11-15', contact: 'Rachael Starr, owner. Standalone website preview' },
  'salon-aura-hair-color-studio': { since: '2026-11-15', contact: 'the owner, via Jacob Kennedy' },
  'tjs-chopshop': { since: '2026-11-15', contact: 'TJ, owner, via Jacob Kennedy. Draft website: sites/tjs-chopshop/' },
  'turtles-flowers': { since: '2026-11-15', contact: 'Tiffany, owner, via Jacob Kennedy' },
  // Founder #8. Jacob Kennedy confirmed on 2026-11-15, after #2 to #7, that the
  // owner agreed and paid.
  'bips-bites': { since: '2026-11-15', contact: 'Bip, owner (bip@bipsbites.com, published on his site), via Jacob Kennedy' },
  // Founder #9. Jacob Kennedy confirmed on 2026-11-15, after #8, that the owner
  // joined as a Founding Member.
  'tribal-blend-cat-cafe': { since: '2026-11-15', contact: 'the owner, via Jacob Kennedy' },
  // Founder #10, the last founding spot. Jacob Kennedy asked on 2026-11-25 for
  // his daughter Ada's site to be "a proper founding member". Family tie
  // disclosed on its page (`tie` in added.mjs).
  'kawaii-katz': { since: '2026-11-25', contact: 'Ada, owner, via Jacob Kennedy (her father)' },
};

export const PRICE = 20; // dollars a month, locked for founding members
// Size of the founding group. Jacob Kennedy raised it from 10 to 20 on
// 2026-11-27, once the first ten were taken.
export const SPOTS = 20;
export const FIRST_SPOTS = 10; // the original pilot, full since 2026-11-25
// The founding promise, Jacob Kennedy's words (2026-11-27): every Founding
// Member is grandfathered into every feature, the small business ERP
// included, promised and guaranteed. Shown on /founders-club/, /owners/ and
// the home page slide; change it only on his say so.
export const FOUNDER_PROMISE = `Every Founding Member is grandfathered in: every feature we build, the small business ERP included, at $${PRICE} a month for as long as you stay. Promised and guaranteed.`;

export const isMember = (slug, members = MEMBERS) => Object.hasOwn(members, slug);

// Ambassadors: one owner per category who helps bring that section's
// businesses on as we launch. Keyed by category slug (CATEGORIES in
// directory.mjs). EMPTY until an owner says yes; /founders-club/ lists every
// category as open until then.
//
//   beauty: { slug: 'tjs-chopshop', since: '2026-11-20' },
export const AMBASSADORS = {};

// Rewards shown on /founders-club/. The pitch sheets in sites/<slug>/pitch.html
// state the same terms; change both together.
export const WELCOME_MONTHS = 3; // hosting and updates free after the welcome site
export const REFERRAL_TIERS = [
  [1, 'One month free'],
  [3, 'Three months free, plus a feature on our homepage'],
  [5, 'Your site free for a full year'],
];
