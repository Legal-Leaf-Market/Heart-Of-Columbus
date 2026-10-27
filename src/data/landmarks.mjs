// Columbus architecture landmarks: what each one is, who designed it, when,
// where, and the Wikimedia Commons photo we show (credited on /credits/).
// Every entry names its source and the day it was checked. `ll` comes from
// the building's Wikipedia article where it has coordinates, otherwise from
// the U.S. Census geocoder on its street address (`llSource` says which).
// `street` is true when the landmark can be seen from a public street.
// Photos show the landmark, never a listed business.

const CHECKED = '2026-10-25';
const C = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
const WP = 'https://en.wikipedia.org/wiki/';
const CENSUS = 'U.S. Census geocoder, street address';
const TOUR = 'https://columbus.in.us/see-do/tour-info';

export const LANDMARKS = [
  { slug: 'firstchristian', name: 'First Christian Church', architect: 'Eliel Saarinen', year: 1942,
    address: '531 Fifth Street', ll: [39.20306, -85.91889], llSource: 'Wikipedia', street: true,
    what: 'A church dedicated in 1942, with later details by Eero Saarinen and Charles Eames. A National Historic Landmark since 2001.',
    source: WP + 'First_Christian_Church_(Columbus,_Indiana)', checked: CHECKED,
    photo: { src: C + '5/5c/First_Christian_Church%2C_Columbus%2C_IN.jpg/1280px-First_Christian_Church%2C_Columbus%2C_IN.jpg',
      credit: 'T G Hess', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:First_Christian_Church,_Columbus,_IN.jpg', pos: '50% 30%' } },
  { slug: 'northchristian', name: 'North Christian Church', architect: 'Eero Saarinen', year: 1964,
    address: '850 Tipton Lane', ll: [39.22972, -85.91611], llSource: 'Wikipedia', street: true,
    what: 'A church completed in 1964, with Kevin Roche as associate architect. A National Historic Landmark since 2000. The congregation disbanded in 2022; the Bartholomew County Public Library accepted the building in 2024 and renamed it The LEX in 2025.',
    source: WP + 'North_Christian_Church', checked: CHECKED,
    photo: { src: C + 'd/da/North_Christian_Church_%28Columbus%2C_Indiana%29_-_April_2008_-_Holly_Higgins_03.jpg/1280px-North_Christian_Church_%28Columbus%2C_Indiana%29_-_April_2008_-_Holly_Higgins_03.jpg',
      credit: 'Holly Higgins', license: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:North_Christian_Church_(Columbus,_Indiana)_-_April_2008_-_Holly_Higgins_03.jpg', pos: '50% 40%' } },
  { slug: 'irwin', name: 'Irwin Union Bank', architect: 'Eero Saarinen', year: 1954,
    address: '500 Washington Street', ll: [39.20354, -85.9212], llSource: CENSUS, street: true,
    what: 'A bank hall that opened in 1955, with a 1973 annex by Kevin Roche and John Dinkeloo and landscape by Dan Kiley. A National Historic Landmark since 2000.',
    source: WP + 'Irwin_Union_Bank_and_Trust', checked: CHECKED,
    photo: { src: C + '7/76/Irwin_Union_Bank_building_in_Columbus%2C_Indiana_LCCN2013650700.tif/lossy-page1-1280px-Irwin_Union_Bank_building_in_Columbus%2C_Indiana_LCCN2013650700.tif.jpg',
      credit: 'Carol M. Highsmith, Library of Congress', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:Irwin_Union_Bank_building_in_Columbus,_Indiana_LCCN2013650700.tif', pos: '50% 50%' } },
  { slug: 'library', name: 'Cleo Rogers Memorial Library & Large Arch', architect: 'I. M. Pei; Henry Moore', year: 1969,
    note: 'I. M. Pei, 1969; Henry Moore, 1971',
    address: '536 Fifth Street', ll: [39.20395, -85.91889], llSource: 'Wikipedia', street: true,
    what: 'The public library, completed in 1969, and Henry Moore’s Large Arch, installed in 1971.',
    source: WP + 'Cleo_Rogers_Memorial_Library', checked: CHECKED,
    photo: { src: C + '6/69/Cleo_Rogers_Memorial_Library_and_Moore_Sculpture.jpeg/1280px-Cleo_Rogers_Memorial_Library_and_Moore_Sculpture.jpeg',
      credit: 'RichardMcCoy', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Cleo_Rogers_Memorial_Library_and_Moore_Sculpture.jpeg', pos: '50% 55%' } },
  { slug: 'courthouse', name: 'Bartholomew County Courthouse', architect: 'Isaac Hodgson', year: 1874,
    address: 'Third and Washington Streets', ll: [39.20111, -85.92139], llSource: 'Wikipedia', street: true,
    what: 'The county courthouse, built from 1871 to 1874. Part of the Columbus Historic District on the National Register.',
    source: WP + 'Bartholomew_County_Courthouse', checked: CHECKED,
    photo: { src: C + 'd/d2/Bartholomew_County_Courthouse.jpeg/1280px-Bartholomew_County_Courthouse.jpeg',
      credit: 'RichardMcCoy', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Bartholomew_County_Courthouse.jpeg', pos: '50% 35%' } },
  { slug: 'cityhall', name: 'Columbus City Hall', architect: 'Edward Charles Bassett, Skidmore, Owings & Merrill', year: 1981,
    note: 'Edward Charles Bassett, SOM, 1981',
    address: '123 Washington Street', ll: [39.1999, -85.92084], llSource: CENSUS, street: true,
    what: 'The city’s offices, built in 1981.',
    source: 'https://pcad.lib.washington.edu/building/11219', checked: CHECKED,
    photo: { src: C + '7/73/Columbus_City_Hall_%28Indiana%29_-_April_2008_-_Holly_Higgins.jpg/1280px-Columbus_City_Hall_%28Indiana%29_-_April_2008_-_Holly_Higgins.jpg',
      credit: 'Holly Higgins', license: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Columbus_City_Hall_(Indiana)_-_April_2008_-_Holly_Higgins.jpg', pos: '50% 50%' } },
  { slug: 'bridge', name: 'Robert N. Stewart Bridge', architect: 'J. Muller International', year: 1999,
    note: 'Second Street over the river, 1999',
    address: 'Second Street', ll: null, llSource: '', street: true,
    what: 'The Second Street bridge, completed in 1999 and renamed for Robert N. Stewart in 2013.',
    source: 'https://www.columbus.in.gov/engineering/news/about-the-bridge/', checked: CHECKED,
    photo: { src: C + '9/9b/Stewart-bridge-1933328.jpg/1280px-Stewart-bridge-1933328.jpg',
      credit: 'Carol M. Highsmith, Library of Congress', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:Stewart-bridge-1933328.jpg', pos: '50% 50%' } },
  { slug: 'miller', name: 'Miller House and Garden', architect: 'Eero Saarinen and Dan Kiley', year: 1957,
    address: '2760 Highland Way', ll: [39.2272, -85.9231], llSource: 'Wikipedia', street: false,
    what: 'A house by Eero Saarinen with Kevin Roche, and a garden by Dan Kiley, finished in 1957. There is no public access at the house; it is seen on the official tour, which starts at the Visitors Center.',
    tour: TOUR,
    // Nobody walks from the house, so the nearby rails start where the tour does.
    walkFrom: { label: 'the Visitors Center, where the tour starts', ll: [39.20359, -85.91966], llSource: CENSUS },
    source: WP + 'Miller_House_(Columbus,_Indiana)', checked: CHECKED,
    photo: { src: C + '1/19/Miller_House_%28Columbus%2C_Indiana%29_-_March_2013_-_Jeff_Hart_03.jpg/1280px-Miller_House_%28Columbus%2C_Indiana%29_-_March_2013_-_Jeff_Hart_03.jpg',
      credit: 'Jeff Hart', license: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Miller_House_(Columbus,_Indiana)_-_March_2013_-_Jeff_Hart_03.jpg', pos: '50% 60%' } },
  { slug: 'firestation', name: 'Fire Station 4', architect: 'Robert Venturi and Denise Scott Brown', year: 1968,
    note: 'Robert Venturi and Denise Scott Brown, 1968',
    address: '4730 East 25th Street', ll: [39.22368, -85.86832], llSource: CENSUS, street: true,
    what: 'A fire station, started in 1967 and completed in 1968.',
    source: WP + 'Fire_Station_Number_4_(Columbus,_Indiana)', checked: CHECKED,
    photo: { src: C + 'f/f4/Fire_Station_4%2C_Columbus%2C_Indiana_LCCN2013650708.jpg/1280px-Fire_Station_4%2C_Columbus%2C_Indiana_LCCN2013650708.jpg',
      credit: 'Carol M. Highsmith, Library of Congress', license: 'Public domain', page: 'https://commons.wikimedia.org/wiki/File:Fire_Station_4,_Columbus,_Indiana_LCCN2013650708.jpg', pos: '50% 50%' } },
  { slug: 'commons', name: 'Chaos I at The Commons', architect: 'Jean Tinguely', year: 1974,
    address: '300 Washington Street', ll: [39.20189, -85.92178], llSource: 'Wikipedia', street: false,
    what: 'A seven-ton moving sculpture by the Swiss artist Jean Tinguely, inside The Commons.',
    source: 'https://thecommonscolumbus.com/art/', checked: CHECKED,
    photo: { src: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/2015_Chaotic_Tuesday.jpg',
      credit: 'RichardMcCoy', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:2015_Chaotic_Tuesday.jpg', pos: '50% 40%' } },
];

export const landmarkBySlug = Object.fromEntries(LANDMARKS.map((l) => [l.slug, l]));
