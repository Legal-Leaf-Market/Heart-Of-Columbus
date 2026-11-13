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
export const MEMBERS = {};

export const PRICE = 20; // dollars a month, locked for founding members
export const SPOTS = 10; // size of the founding pilot group

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
