// Civic coverage data: public meetings, public data sets and where official
// notices are posted (docs/newspaper-plan.md, item 10). Every entry names
// the official page it came from and the day a person checked it there;
// tests/news.test.mjs fails if either is missing. Nothing here is guessed:
// a body without a checked link says so on the page.

// The public bodies we cover. `url` is their official page for agendas and
// minutes, filled in once a reporter has checked it.
// TODO(reporter): check and add the official agenda pages for the county,
// school board and plan commission.
export const BODIES = [
  { slug: 'city-council', name: 'Columbus City Council', url: 'https://www.columbus.in.gov/', checked: '2026-10-25', note: 'Agendas and minutes are posted on the city’s website.' },
  { slug: 'plan-commission', name: 'Columbus Plan Commission', url: 'https://www.columbus.in.gov/', checked: '2026-10-25', note: 'Agendas are posted on the city’s website, often as PDFs.' },
  { slug: 'county-commissioners', name: 'Bartholomew County Commissioners', url: '', checked: '' },
  { slug: 'school-board', name: 'Bartholomew Consolidated School Corporation board', url: '', checked: '' },
];

// Upcoming meetings, copied from the official agenda or calendar:
//   { body: 'city-council', title: 'Regular meeting', start: '2026-11-03T18:00:00-05:00',
//     place: 'City Hall, 123 Washington Street', agenda: 'https://...', source: 'https://...', checked: '2026-10-30' }
export const MEETINGS = [];

// Public data sets, first from Indiana Gateway (budgets, then department
// totals). Rows are copied from the source, never estimated.
//   { slug: 'city-budget-2027', title: 'City of Columbus budget, 2027', source: 'https://gateway.ifionline.org/...',
//     checked: '2026-11-01', unit: 'dollars', columns: ['Fund', 'Budget'], rows: [['General', 123]], note: '...' }
export const DATASETS = [];
export const GATEWAY = 'https://gateway.ifionline.org/';

// Where official public notices are posted. TODO(reporter): add the city,
// county and school notice pages once checked, and the newspaper of record.
export const NOTICE_SOURCES = [];
export const NOTICE_LAW = {
  text: 'The Republic reported in February 2026 that a bill, HEA 1210, had passed both chambers of the Indiana General Assembly. It would let local governments post public notices on their own websites, instead of only in a newspaper, starting July 1, 2027.',
  source: 'https://www.therepublic.com/?p=891566', checked: '2026-10-25',
};
