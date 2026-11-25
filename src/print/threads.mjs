// A thread through the decades: every print edition follows one idea from the
// 1930s to now, one history article per decade (owner's idea, 2026-11-24).
// Each stop is an approved history article path ('<decade>/<slug>'); null is a
// gap that needs a new article researched from sources before that edition.
// `lead` says where to look for a gap; it is a research lead, never copy.
// December's lineup is the one the edition prints (edition-2026-12.mjs,
// `gathers`); tests/threads.test.mjs keeps the two in step.

export const DECADES = ['1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

export const THREADS = [
  {
    month: '2026-12', title: 'Where Columbus gathers',
    idea: 'In winter a town shows where it comes together: a theatre, churches, a bank plaza, a mall, a park, a downtown.',
    stops: {
      '1930s': '1930s/the-crump-gets-sound', '1940s': '1940s/first-christian-church-dedicated',
      '1950s': '1950s/irwin-union-bank-opens', '1960s': '1960s/north-christian-church-dedicated',
      '1970s': '1970s/the-commons-and-chaos', '1980s': '1980s/city-hall-triangle',
      '1990s': '1990s/mill-race-park', '2000s': '2000s/flood-of-2008',
      '2010s': '2010s/columbus-the-movie', '2020s': '2020s/yes-and',
    },
  },
  {
    month: '2027-01', title: 'The river',
    idea: 'Promised on page 16 of the December edition. The town grew up at the fork of two rivers; it has been flooded by them, built a park to flood, and is now turning back toward them.',
    stops: {
      '1930s': null, '1940s': null, '1950s': null, '1960s': null, '1970s': null, '1980s': null,
      '1990s': '1990s/mill-race-park', '2000s': '2000s/flood-of-2008',
      '2010s': null, '2020s': null,
    },
    lead: 'Floods and high water by decade (library archives, the National Weather Service flood history for the East Fork White River, The Republic). The 1990s could add the Second Street bridge (1990s/second-street-bridge) if Mill Race Park moves; the 2020s needs a riverfront article once the project is finished and sourced.',
  },
  {
    month: '2027-02', title: 'The world comes to Columbus',
    idea: 'Who came here from somewhere else, and what the town made of it: prisoners of war, soldiers, Japanese companies, a festival, a temple, refugee families.',
    stops: {
      '1930s': '1930s/noblitt-sparks-moves-to-columbus', '1940s': '1940s/chapel-in-the-meadow',
      '1950s': '1950s/cummins-goes-global', '1960s': '1960s/lincoln-elementary-and-lady-bird',
      '1970s': null, '1980s': '1980s/ethnic-expo-begins',
      '1990s': '1990s/toyota-forklifts', '2000s': null,
      '2010s': '2010s/infidels-and-friends', '2020s': '2020s/sri-ganesh-mandir',
    },
    lead: '1970s and 2000s: newcomer communities and congregations founded in those years (IRS exempt organization records, congregations’ own histories). Black history in Columbus has no article yet in any decade; worth its own research before February.',
  },
  {
    month: '2027-03', title: 'Houses of faith',
    idea: 'Easter is March 28. One congregation per decade, and what each asked of its building or its neighbors.',
    stops: {
      '1930s': '1930s/tabernacle-church-chooses-saarinen', '1940s': '1940s/chapel-in-the-meadow',
      '1950s': '1950s/north-christian-congregation-founded', '1960s': '1960s/first-baptist-church',
      '1970s': '1970s/sandy-hook-moves-to-taylor-road', '1980s': '1980s/st-peters-copper-spire',
      '1990s': '1990s/first-christian-turns-fifty', '2000s': '2000s/st-bartholomew-new-church',
      '2010s': '2010s/infidels-and-friends', '2020s': '2020s/sri-ganesh-mandir',
    },
    lead: 'Three stops repeat earlier months (chapel-in-the-meadow, St. Bartholomew, Infidels and friends, Sri Ganesh Mandir). Fresh 2000s and 2010s congregations would help; the places of worship work (docs/worklog.md) will list them.',
  },
  {
    month: '2027-04', title: 'Building the town',
    idea: 'The buildings that gave Columbus its name, one a decade, from the church that started it to the church that became a museum.',
    stops: {
      '1930s': '1930s/tabernacle-church-chooses-saarinen', '1940s': '1940s/first-christian-church-dedicated',
      '1950s': '1950s/irwin-union-bank-opens', '1960s': '1960s/cleo-rogers-library',
      '1970s': '1970s/indiana-bell-switching-center', '1980s': '1980s/fire-station-5',
      '1990s': '1990s/second-street-bridge', '2000s': '2000s/four-landmarks-in-a-day',
      '2010s': '2010s/exhibit-columbus', '2020s': '2020s/north-christian-becomes-the-lex',
    },
    lead: 'The 1930s and 1940s stops repeat March and December. The 1960s stop answers December’s puzzle, so it waits until after December.',
  },
  {
    month: '2027-05', title: 'Race day and game day',
    idea: 'The Indianapolis 500 is May 30. A diesel ran the 500 without a pit stop in 1931; since then Columbus has filled gyms, pools, courses and rinks.',
    stops: {
      '1930s': '1930s/diesel-at-the-indianapolis-500', '1940s': null,
      '1950s': '1950s/a-diesel-on-the-pole', '1960s': '1960s/otter-creek-golf-course',
      '1970s': null, '1980s': '1980s/north-gymnastics-thirteen-titles',
      '1990s': '1990s/north-swimming-three-straight', '2000s': '2000s/north-cross-country',
      '2010s': '2010s/mill-race-marathon', '2020s': '2020s/indiana-sentinels',
    },
    lead: '1940s and 1970s: IHSAA records for Columbus teams in those years (state finals, sectionals), and the 1972 split into North and East (1970s/columbus-east-high-school is a schools piece, kept for August).',
  },
  {
    month: '2027-06', title: 'The engine town',
    idea: 'One company, Cummins, and the town that grew around it, decade by decade, with the others that came alongside.',
    stops: {
      '1930s': '1930s/diesel-truck-crosses-the-country', '1940s': '1940s/cummins-goes-to-war',
      '1950s': '1950s/cummins-goes-global', '1960s': '1960s/cummins-technical-center',
      '1970s': '1970s/cummins-billion-dollar-year', '1980s': '1980s/cummins-headquarters-on-the-rail-yard',
      '1990s': '1990s/cummins-in-the-nineties', '2000s': '2000s/arvin-meritor-merger',
      '2010s': '2010s/cummins-turns-100', '2020s': '2020s/rumsey-leads-cummins',
    },
    lead: 'The 1950s stop repeats February; 1950s/a-diesel-on-the-pole is the other choice if May moves.',
  },
  {
    month: '2027-07', title: 'A night out',
    idea: 'Summer evenings: a drive-in, a golf course, a festival, an orchestra at the memorial, a theatre lit one letter at a time.',
    stops: {
      '1930s': '1930s/the-crump-gets-sound', '1940s': null,
      '1950s': '1950s/columbus-drive-in-opens', '1960s': '1960s/otter-creek-golf-course',
      '1970s': '1970s/arts-council-begins', '1980s': '1980s/ethnic-expo-begins',
      '1990s': '1990s/visitors-center-chandelier', '2000s': '2000s/philharmonic-salute',
      '2010s': '2010s/crump-endangered', '2020s': null,
    },
    lead: '1940s: what people did for fun during the war years (USO events for Atterbury soldiers, dances, the Crump’s programs). 2020s: a sourced summer event (Ethnic Expo, Neighborfest, concerts), not one that is still news.',
  },
  {
    month: '2027-08', title: 'Back to school',
    idea: 'BCSC starts in early August. The town paid architects to build its schools; then the colleges came.',
    stops: {
      '1930s': null, '1940s': null,
      '1950s': '1950s/lillian-schmitt-school', '1960s': '1960s/mabel-mcdowell-school',
      '1970s': '1970s/columbus-east-high-school', '1980s': '1980s/clifty-creek-school',
      '1990s': '1990s/kidscommons-opens', '2000s': '2000s/columbus-learning-center',
      '2010s': '2010s/iu-architecture-school', '2020s': '2020s/iu-columbus',
    },
    lead: '1930s and 1940s: Columbus High School and the county’s one room schools before consolidation (BCSC history, library archives, the 1960s/lincoln-elementary-and-lady-bird sources).',
  },
  {
    month: '2027-09', title: 'A town that grows',
    idea: 'From about 10,000 people in 1930 to 50,474 in 2020: power lines, hospitals, an airport, a new Commons, a census.',
    stops: {
      '1930s': '1930s/remc-brings-power-to-the-farms', '1940s': '1940s/wakeman-general-hospital',
      '1950s': '1950s/county-hospital-grows', '1960s': '1960s/fire-station-4',
      '1970s': '1970s/air-base-becomes-airport', '1980s': '1980s/the-japan-strategy',
      '1990s': '1990s/columbus-regional-hospital', '2000s': '2000s/columbus-learning-center',
      '2010s': '2010s/new-commons', '2020s': '2020s/columbus-passes-fifty-thousand',
    },
    lead: 'The 2000s stop repeats August; a sourced piece on 2000s growth (annexations, new neighborhoods, the census of 2000) would replace it.',
  },
  {
    month: '2027-10', title: 'Hard times',
    idea: 'How the town answered bad years: a bank that stayed open, a flood, a bank that failed, a theatre that closed, graffiti on churches.',
    stops: {
      '1930s': '1930s/irwin-union-trust-through-the-depression', '1940s': '1940s/a-death-and-a-wedding',
      '1950s': null, '1960s': '1960s/bakalar-reservists-go-to-vietnam',
      '1970s': null, '1980s': '1980s/the-japan-strategy',
      '1990s': null, '2000s': '2000s/irwin-union-fails',
      '2010s': '2010s/crump-endangered', '2020s': null,
    },
    lead: 'The thinnest thread; it may trade months with one that fills sooner. 1950s, 1970s and 1990s: layoffs, strikes, storms or fires reported in those years (library archives). 2020s: the pandemic in Columbus, from city and county records.',
  },
  {
    month: '2027-11', title: 'Those who serve',
    idea: 'Veterans Day is November 11. Soldiers at Atterbury and Bakalar, firefighters in town, and the memorial with the letters home.',
    stops: {
      '1930s': '1930s/fire-department-diesel-pumper', '1940s': '1940s/camp-atterbury-is-built',
      '1950s': '1950s/korea-brings-soldiers-back', '1960s': '1960s/bakalar-reservists-go-to-vietnam',
      '1970s': '1970s/air-base-becomes-airport', '1980s': '1980s/fire-station-5',
      '1990s': '1990s/memorial-for-veterans', '2000s': '2000s/atterbury-goes-back-to-war',
      '2010s': null, '2020s': '2020s/atterbury-welcomes-afghans',
    },
    lead: '2010s: Camp Atterbury or the Indiana National Guard units from Columbus in those years (army.mil, nationalguard.mil, the county veterans office).',
  },
];

// Gaps, in edition order: what needs researching, and by when.
export const gaps = () => THREADS.flatMap((t) => DECADES.filter((d) => !t.stops[d]).map((d) => ({ month: t.month, title: t.title, decade: d })));
