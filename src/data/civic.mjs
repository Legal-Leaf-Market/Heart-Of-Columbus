// Civic coverage data: public meetings, public data sets and where official
// notices are posted (docs/newspaper-plan.md, item 10). Every entry names
// the official page it came from and the day a person checked it there;
// tests/news.test.mjs fails if either is missing. Nothing here is guessed:
// a body without a checked link says so on the page.

// The public bodies we cover. `url` is their official page for agendas and
// minutes, filled in once a reporter has checked it.
// TODO(reporter): check and add the plan commission's own agenda page.
export const BODIES = [
  { slug: 'city-council', name: 'Columbus City Council', url: 'https://www.columbus.in.gov/', checked: '2026-10-25', note: 'Agendas and minutes are posted on the city’s website.' },
  { slug: 'plan-commission', name: 'Columbus Plan Commission', url: 'https://www.columbus.in.gov/', checked: '2026-10-25', note: 'Agendas are posted on the city’s website, often as PDFs.' },
  { slug: 'county-commissioners', name: 'Bartholomew County Commissioners', url: 'https://www.bartholomew.in.gov/calendar/icalrepeat.detail/2026/08/10/2300/12%7C13/bartholomew-county-commissioners-meeting.html', checked: '2026-10-26', note: 'Meetings are Mondays at 10 AM at the Government Office Building, 440 Third Street, with exceptions marked on the county calendar. Each calendar entry links its agenda as a PDF.' },
  { slug: 'school-board', name: 'Bartholomew Consolidated School Corporation board', url: 'https://www.bcscschools.org/district-information/school-board', checked: '2026-10-26', note: 'Regular meetings are held monthly on Monday evenings at 6:30 PM and streamed on the BCSC YouTube channel. Agendas and minutes are on BoardDocs, usually by the Thursday before.' },
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
  text: 'HEA 1210 was signed on March 12, 2026, as Public Law 157. The Republic reported that it makes newspaper publication of public notices optional, and that starting July 1, 2027, local governments may post notices on their own websites.',
  source: 'https://legiscan.com/IN/bill/HB1210/2026', checked: '2026-10-26',
};
