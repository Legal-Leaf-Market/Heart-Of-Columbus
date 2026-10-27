// The architecture guide (/architecture/). Facts about the city's architecture
// as a whole, each with its source and the day it was checked; the buildings
// themselves come from src/data/landmarks.mjs, plus the three National Historic
// Landmarks we have no photo for yet.

const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const x = (text, source) => ({ text, source, checked: CHECKED });

export const TOUR = 'https://columbus.in.us/see-do/tour-info';

export const ARCH_FACTS = [
  x('In 1991 the American Institute of Architects ranked Columbus sixth among America’s most important cities for architecture.', WP + 'J._Irwin_Miller'),
  x('J. Irwin Miller of Cummins set up the Cummins Foundation in 1954. Three years later it offered to pay the architects’ fees for new public buildings.', 'https://columbus.in.us/cummins-history/'),
  x('The program started with public schools and was later opened to other nonprofit and civic groups.', WP + 'Columbus,_Indiana'),
  x('Seven buildings in Columbus are National Historic Landmarks, and about 60 others carry the city’s name for modern architecture.', WP + 'Columbus,_Indiana'),
];

// National Historic Landmarks. `landmark` points at a page in landmarks.mjs.
export const NHL = [
  { landmark: 'firstchristian' },
  { landmark: 'irwin' },
  { landmark: 'miller' },
  { landmark: 'northchristian' },
  { name: 'First Baptist Church', architect: 'Harry Weese', year: 1965, address: '3300 Fairlawn Drive',
    what: 'A church by Harry Weese, completed in 1965. A National Historic Landmark since 2000.', source: WP + 'First_Baptist_Church_(Columbus,_Indiana)', checked: CHECKED },
  { name: 'Mabel McDowell School', architect: 'John Carl Warnecke', year: 1960,
    what: 'A school by John Carl Warnecke, completed in 1960 and an adult education center since 1982. A National Historic Landmark since 2001.', source: WP + 'Mabel_McDowell_Elementary_School', checked: CHECKED },
  { name: 'The Republic Newspaper Office', architect: 'Myron Goldsmith, Skidmore, Owings & Merrill', year: 1971, address: '333 Second Street',
    what: 'A glass newspaper building finished in 1971, where people walking by could see the presses run. It now houses Indiana University’s J. Irwin Miller Architecture Program. A National Historic Landmark since 2012.', source: WP + 'The_Republic_Newspaper_Office', checked: '2026-10-27' },
];
