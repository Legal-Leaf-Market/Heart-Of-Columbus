// The businesses the site features up front: the home page, their category
// and neighborhood pages, /visit/ and /holidays/, and an "Owner's picks"
// section on each one's own page.
//
// Picks are the owner's words, so they come only from the owner. Until an
// owner sends theirs, `picks` stays empty and no picks box is shown at all,
// only a one-line invitation on the business's own page. To add one:
//
//   picks: [
//     { name: 'Biscuits and gravy', note: 'Why the owner picked it, as they said it',
//       from: 'Owner email, 2026-11-02', checked: '2026-11-02' },
//   ],
export const PICK_SLOTS = 3;

export const SPOTLIGHT = [
  { slug: 'jills-diner', picks: [] },
  { slug: 'amys-closet', picks: [] },
  { slug: 'crossroads-wedding-co', picks: [] },
];

export const SPOTLIGHT_SLUGS = new Set(SPOTLIGHT.map((s) => s.slug));
