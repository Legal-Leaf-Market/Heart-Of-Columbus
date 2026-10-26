// The arts guide (/arts/): public art you can go and see, and Exhibit
// Columbus. Every work is on public ground or in a public building, never
// inside a listed business. Titles, artists, years and places come from
// Wikipedia's list of public art in Bartholomew County; descriptions in
// quotes come from the visitors bureau's sculpture page.

const CHECKED = '2026-10-26';
const LIST = 'https://en.wikipedia.org/wiki/List_of_public_art_in_Bartholomew_County,_Indiana';
const VB = 'https://columbus.in.us/blog-sculptures/';
const EC = 'https://landmarkcolumbusfoundation.org/exhibit-columbus';
const EC23 = 'https://landmarkcolumbusfoundation.org/news/ec-2023-opens';

const w = (o) => ({ source: LIST, checked: CHECKED, ...o });

export const EXHIBIT = {
  name: 'Exhibit Columbus', url: 'https://www.exhibitcolumbus.org/',
  facts: [
    { text: 'A free, public design program run by the Landmark Columbus Foundation. Every two years it commissions installations from architects, designers and artists.', source: EC, checked: CHECKED },
    { text: 'Each cycle has a symposium, public design presentations where people give feedback, and the exhibition.', source: EC, checked: CHECKED },
    { text: 'The 2023 exhibition put 13 works of art and architecture around downtown, at places like Library Plaza, The Commons and Mill Race Park.', source: EC23, checked: CHECKED },
    { text: 'The foundation calls 2026 a fieldwork year, with no exhibition, spent caring for existing installations and preparing the next cycle.', source: EC, checked: CHECKED },
  ],
};

// Grouped by where you'll find them. `landmark` links the landmark page.
export const ART = [
  { id: 'downtown', title: 'Downtown, outdoors', items: [
    w({ title: 'Large Arch', artist: 'Henry Moore', year: 1971, where: 'Library Plaza, Fifth Street', landmark: 'library' }),
    w({ title: 'Eos', artist: 'Dessa Kirk', year: 2006, where: 'Fifth Street median, between Brown and Lindsey Streets', line: 'The visitors bureau says she “faces the west as if she rises with the sun each morning.”', lineSource: VB }),
    w({ title: 'Ancestral Way', artist: 'Robert Pulley', year: 2006, where: 'Along Third Street, between Jackson and Lindsey Streets', line: 'The visitors bureau describes “eleven organic forms appearing to march in procession.”', lineSource: VB }),
    w({ title: '2 Arcs de 212.5˚', artist: 'Bernar Venet', year: 1987, where: 'Outside The Commons, Washington Street' }),
    w({ title: 'Daquqi', artist: 'Peter Lundberg', year: 1998, where: 'Robert D. Garton Veterans Plaza', line: 'The visitors bureau calls it “a nine-ton sculpture.”', lineSource: VB }),
    w({ title: 'Crack the Whip', artist: 'Jo Saylors', year: 1998, where: 'Robert D. Garton Veterans Plaza' }),
    w({ title: 'Bartholomew County Memorial for Veterans', artist: 'Charles Rose and Maryann Thompson', year: 1997, where: 'Courthouse lawn, Third and Washington Streets', landmark: 'courthouse' }),
  ] },
  { id: 'parks', title: 'In Mill Race Park', items: [
    w({ title: 'Skopos', artist: 'Ric Bauer', year: 1979, where: 'Mill Race Park', line: 'The visitors bureau says the name “translates as ‘the watcher’ in Greek,” and that it went back up after the 2008 flood.', lineSource: VB }),
    w({ title: 'Red Arbor', artist: 'Stanley Saitowitz', year: 1992, where: 'Mill Race Park' }),
  ] },
  { id: 'indoors', title: 'Inside public buildings', items: [
    w({ title: 'Chaos I', artist: 'Jean Tinguely', year: 1974, where: 'The Commons, 300 Washington Street', landmark: 'commons' }),
    w({ title: 'Yellow Neon Chandelier and Persians', artist: 'Dale Chihuly', year: 1995, where: 'Columbus Visitors Center, 506 Fifth Street', line: 'The visitors bureau counts “900 hand-blown elements in shades of vibrant yellow.”', lineSource: VB }),
    w({ title: 'C', artist: 'Robert Indiana', year: 1981, where: 'Columbus City Hall, west staircase', landmark: 'cityhall' }),
    w({ title: 'History and Mystery', artist: 'William T. Wiley', year: 1984, where: 'Columbus City Hall, above the council chambers', landmark: 'cityhall' }),
    w({ title: 'Sun Garden Panels in Suspended Circle', artist: 'Dale Chihuly', year: 2007, where: 'IUPUC Learning Center' }),
    w({ title: 'Exploded Engine', artist: 'Rudolph de Harak', year: 1984, where: 'Lobby of the Cummins Corporate Office Building, 500 Jackson Street' }),
  ] },
];
