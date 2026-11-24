// What a listed business's building was, and what was in its space just
// before. Shown on the business's own page as at most two tags: the
// building's historic name and year ("Historically"), and the last business
// at that exact address ("Before"). Jake asked for this on 2026-11-24.
//
// Rules: every entry quotes or follows one source read in the session named
// by `checked`; nothing from memory. A building matches a listing only on the
// same street, inside the building's number range, and on the same side of
// the street (odd or even), so 211 to 219 never claims 212. Years that the
// source gives as "c." are written "about". No dashes in anything shown.
//
// HISTORIC: buildings in the 1982 National Register nomination for the
// Columbus Historic District, from its inventory lines (continuation pages 2
// to 6), read on 2026-11-24 through npgallery.nps.gov. The document is an OCR
// scan; each `quote` is its line as read, typos left in, so a person can find
// it. `note` repeats what the inventory itself says about a past use. Only
// buildings with a name in the nomination and a listing in them today are
// here; the many it calls "Commercial Building" are left out on purpose.
const CHECKED = '2026-11-24';
const NR = ['Columbus Historic District, National Register of Historic Places nomination (listed December 10, 1982), inventory', 'https://npgallery.nps.gov/GetAsset/e77e6dff-18ef-4952-959c-128be685417c'];

// `in` is how a sentence names the building ("In the Eagles Building").
const h = (o) => ({ street: 'washington', source: NR, checked: CHECKED, note: '', in: 'the ' + o.name, ...o });

export const HISTORIC = [
  h({ from: 211, to: 219, name: 'Eagles Building', built: '1927', quote: 'C, 5-04. Eagles Building (211-219 Washington St.), 1927, Moderne, 2 story brick;' }),
  h({ from: 227, to: 233, name: 'Crump’s Block', in: 'Crump’s Block', built: '1872', quote: "5-07. Crump's Block (227-233 Washington St.), 1872, Italianate, 2 story brick," }),
  h({ from: 305, to: 305, name: 'Masonic Temple', built: '1931', quote: '6-03. Masonic Temple (305 Washington St.), 1931, Neo-Classic;',
    note: 'The nomination says St. John’s Lodge No. 20 occupied a building on this site from 1853 to 1979.' }),
  h({ from: 329, to: 329, name: 'Zaharako’s', in: 'the building the nomination names Zaharako’s', built: '1900', quote: '6-09. ?aharako*s (329 Washington St.), 1900, 2 story brick,',
    note: 'In 1982 the nomination said the Zaharako brothers had run a candy store and restaurant here since 1900.' }),
  h({ from: 331, to: 333, name: 'First National Bank Building', built: '1925', quote: '6-10. First National Bank Building (331*333 Washington St.), Neo-Classic,' }),
  h({ from: 401, to: 411, name: 'Crump-Lucas Building', built: 'about 1910', quote: '7-06. Crump-Lucas Building (401-411 Washington St.), c. 1910, Chicago Commercial,' }),
  h({ from: 402, to: 408, name: 'Custer Building', built: 'about 1880', quote: 'C 3-03. Custer Building (402.408 Washington St.), c. 1880, Italianate, 2 story brick,',
    note: 'In 1982 the nomination listed Cummins Book Store here, “since 1892.”' }),
  h({ from: 417, to: 417, name: 'C. M. Keller Building', built: '1913', quote: '7-07. C. m. Keller Building (417 Washington St.), 1913, Chicago Commercial,' }),
  h({ from: 430, to: 436, name: 'St. Denis Block', built: '1874', quote: 'C 3-07. St. Denis Block (430-436 Washington St.), 1874, 3 story brick,',
    note: 'The nomination says the St. Denis Hotel was here from about 1880 to 1964.' }),
  h({ from: 433, to: 433, name: 'Law Building', built: 'about 1900', quote: '7-11. Law Building (433 Washington St.), c. 1900, Chicago Commercial,' }),
  h({ from: 525, to: 531, name: 'Mercantile Block', built: 'about 1880', quote: '8-11. Mercantile Block (525-531 Washington St.), c. 1880, Italianate;' }),
  h({ from: 629, to: 629, name: 'Bassett Building', built: 'about 1910', quote: '9-12. Bassett Building (629 Washington St.), c.1910, Chicago Commercial;' }),
  h({ from: 637, to: 645, name: 'Charlotte Building', built: 'about 1925', quote: '9-13. Charlotte Building (637-645 Washington St.), c. 1925, Chicago Commercial;' }),
];

// BEFORE: the business that was at this exact address just before the one
// listed now. `said` names who told us it closed when that is a person.
export const BEFORE = [
  { street: 'washington', number: 401, was: 'Max’s Jewelry',
    source: ['Max’s Jewelry, YellowPages listing at 401 Washington St', 'https://www.yellowpages.com/columbus-in/mip/maxs-jewelry-7632076'],
    said: 'Heart of Columbus editor Jake Kennedy reports it has closed and another business is in its space (November 2026).', checked: CHECKED },
];

// "425 Washington St Suite 4" -> { number: 425, street: 'washington' }.
export function parseAddress(address) {
  const m = String(address || '').match(/^\s*(\d{1,5})\s+(?:(?:north|south|east|west|n|s|e|w)\.?\s+)?([a-z]+)\s+(?:st|street|ave|avenue)\b/i);
  return m ? { number: +m[1], street: m[2].toLowerCase(), dir: /^\s*\d+\s+(?:north|south|east|west|n|s|e|w)\.?\s/i.test(address) } : null;
}

// The two tags a listing at this address gets, or null for each.
export function buildingFor(address) {
  const a = parseAddress(address);
  if (!a || a.dir) return { historic: null, before: null };
  const historic = HISTORIC.find((b) => b.street === a.street && a.number >= b.from && a.number <= b.to && a.number % 2 === b.from % 2) || null;
  const before = BEFORE.find((b) => b.street === a.street && b.number === a.number) || null;
  return { historic, before };
}
