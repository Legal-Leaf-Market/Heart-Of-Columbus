// Obituaries (/obituaries/). We never write, generate or copy an obituary.
// A family sends one through the form (netlify/functions/obituary.mjs); a
// person checks it with the family and the funeral home before anything is
// published, and published notices are added to PUBLISHED by hand with the
// date that check happened. Until then the page points to the funeral homes'
// own obituary listings.
//
// Funeral homes in Columbus, from their own pages or the public listing
// linked as `source`; checked 2026-10-26. `slug` links the directory card.
export const FUNERAL_HOMES = [
  { name: 'Barkes, Weaver & Glick Funeral Home', address: '1029 Washington St', phone: '', obits: '', source: 'https://www.legacy.com/funeral-homes/listing/indiana/columbus' },
  { name: 'Barkes, Weaver & Glick Funeral Home & Crematory', address: '4205 W Jonathan Moore Pike', phone: '', obits: '', source: 'https://www.legacy.com/funeral-homes/listing/indiana/columbus' },
  { name: 'Hathaway-Myers Chapel', address: '1022 Pearl St', phone: '(812) 379-4419', obits: 'https://www.dignitymemorial.com/obituaries?locationcode=1598', source: 'https://www.dignitymemorial.com/funeral-homes/indiana/columbus/hathaway-myers-chapel/1598' },
  { name: 'Jewell-Rittman Family Funeral Home', address: '3855 25th St', phone: '(812) 372-9923', obits: 'https://jewellrittman.com/obits/', source: 'https://jewellrittman.com/our-excellent-staff/', slug: 'jewell-rittman-funeral-service-and-crematory' },
  { name: 'Myers-Reed Chapel', address: '3729 25th St', phone: '(812) 376-3341', obits: 'https://www.dignitymemorial.com/obituaries?locationcode=1597', source: 'https://www.dignitymemorial.com/funeral-homes/indiana/columbus/myers-reed-chapel/1597', slug: 'myers-funeral-services' },
];

// { slug, name, born, died, town, text, services, home, submitted, confirmed }
// Every entry needs `confirmed` (the date the family and funeral home said
// yes). Empty until a family sends one in.
export const PUBLISHED = [];
