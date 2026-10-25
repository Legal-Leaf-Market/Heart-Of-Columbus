// The Downtown Columbus Social District (the city's DORA): which businesses
// on our list are designated permittees. Names come from the city's page;
// addresses from the ordinance that lists them (Ord. No. 19, 2025). A
// permittee is tied to a listing by street address. The city has added a few
// since the ordinance; those are tied by name only when the name is
// effectively the same and there is one listing it could be.
// Anything we could not confirm is left untagged with a note for a person.

export const DORA_SOURCE = 'https://www.columbus.in.gov/community-development/dora';
export const DORA_ORDINANCE = 'https://www.columbus.in.gov/wp-content/uploads/2025/09/Ord.-No.-19-2025-Amend-Ord.-No.-30-2024-Creating-a-Designated-Outdoor-Refreshment-Area-DORA-Known-as-the-Downtown-Columbus-Social-District.pdf';
const CHECKED = '2026-10-25';

const p = (name, address, slug, note = '') => ({
  name, address, slug, match: slug ? (address ? 'address' : 'name') : 'none', note,
  source: address ? DORA_ORDINANCE : DORA_SOURCE, checked: CHECKED,
});

export const PERMITTEES = [
  p('ZwanzigZ Pizza', '1038 Lafayette Avenue', 'zwanzigz-pizza-and-brewing'),
  p('Thai Connection', '527 Washington Street', 'thai-connection'),
  p('Henry Social Club', '423 Washington Street', 'henry-social-club'),
  p('Bespoke Events + Experiences (formerly Swine & Dine)', '412 Washington Street', 'bespoke-events-experiences'),
  p('4th Street Bar & Grill', '433 4th Street', '4th-street-bar-and-grill'),
  p('Black Sheep Pizza', '318 Washington Street', null,
    'The ordinance gives 318 Washington Street; our listing for Black Sheep Craft Pizza & Cocktails says 345 4th Street. Confirm before tagging.'),
  p('The Columbus Bar', '322 4th Street', 'columbus-bar'),
  p('Taku Japanese Steakhouse', '305 4th Street', 'taku-japanese-steakhouse'),
  p('The Garage Pub', '308 4th Street', 'the-garage-pub-and-grill'),
  p('Upland Pumphouse', '148 Lindsey Street', 'upland-columbus-pump-house'),
  p('ZwanzigZ Production Brewery Co.', '315 12th Street', 'zwanzigz-tap-room'),
  p('Luciana’s Mexican Restaurant', '310 Washington Street', 'lucianas-mexican-restaurant'),
  p('White Star Meat Market', '410 Washington Street', 'white-star-meat-market-and-deli', 'The ordinance lists Butcher Shop 410 LLC at this address.'),
  p('The Gallery Bar & Bistro, Hotel Indigo', '400 Brown Street', null, 'Inside a chain hotel, so not in the directory.'),
  p('The Forge on 4th', null, null,
    'Added after the ordinance, no address given. Probably The Forge English Pub at 418 4th St; confirm before tagging.'),
  p('Fraternal Order of Eagles #741', null, null, 'A members’ club, not in the directory.'),
  p('St. Denis: Wine, Books, and Wonders', null, 'the-st-denis-wine-books-and-wonders'),
];

export const DORA_SLUGS = new Set(PERMITTEES.filter((x) => x.slug).map((x) => x.slug));
