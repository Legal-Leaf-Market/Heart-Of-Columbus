// Sports in Columbus (/sports/) and the Indiana Sentinels dashboard
// (/sports/sentinels/). Entered by hand from public pages, each fact with its
// source and the day it was checked; tests/sports.test.mjs fails if one is
// missing. Scores are added only after a source lists the final. No team
// logo or team art is used: the app icon is ours. Times are Columbus local
// (Eastern), as the league schedule lists them.

const CHECKED = '2026-10-26';

export const SRC = {
  team: 'https://indianasentinels.hockeyshift.com/',
  tickets: 'https://universe.com/indianasentinels',
  gameInfo: 'https://indianasentinels.hockeyshift.com/arena/game-info',
  calendar: 'https://indianasentinels.hockeyshift.com/calendar',
  standings: 'https://indianasentinels.hockeyshift.com/stats#/182/standings?team_id=684211',
  stats: 'https://indianasentinels.hockeyshift.com/stats#/182/team/684211/stats',
  roster: 'https://indianasentinels.hockeyshift.com/stats#/182/team/684211/roster',
  news: 'https://indianasentinels.hockeyshift.com/news',
  shop: 'https://sentinelshockeyshop.com',
  youtube: 'https://www.youtube.com/@indianasentinelshockey',
  league: 'https://www.federalhockey.com/fphl-schedule',
  away: 'https://www.rateyourseats.com/tickets/indiana-sentinels',
  scores: 'https://www.oursportscentral.com/services/schedule/indiana-sentinels/t-4765',
  iuc: 'https://indianasentinels.hockeyshift.com/news/iu-columbus-partners-with-indiana-sentinels-to-str',
  opener: 'https://indianasentinels.hockeyshift.com/news/2026-2027-sentinels-season-opener-announced',
  announce: 'https://indianasentinels.hockeyshift.com/news/sentinels-announce-2026-2027-regular-season-schedu',
  arena: 'https://en.wikipedia.org/wiki/Hamilton_Community_Center_%26_Ice_Arena',
  parksArena: 'https://columbusparksandrec.com/?p=746',
  wish: 'https://www.wishtv.com/news/indiana-sentinels-ready-for-year-two/',
  mojo: 'https://www.mojo1029.com/news/latest-news-test/indiana-sentinels-return-for-second-season-at-hamilton-center-in-columbus/',
};

export const TEAM = {
  name: 'Indiana Sentinels',
  short: 'Sentinels',
  season: '2026 to 2027',
  arena: 'Hamilton Community Center and Ice Arena',
  arenaShort: 'The Ham',
  ll: [39.22214, -85.89618], llSource: 'Wikipedia',
  listing: 'indiana-sentinels-hockey',
  checked: CHECKED,
};

// What we can say about the team, each line with the page that says it.
export const FACTS = [
  ['Columbus’s professional hockey team, founded in 2025. It plays in the Federal Prospects Hockey League (FPHL), a Single-A minor pro league.', SRC.iuc],
  ['This is year two. The 2026 to 2027 regular season is 56 games, 28 of them at home.', SRC.league],
  ['Home ice is the Hamilton Community Center and Ice Arena at Lincoln Park, which the team calls “The Ham.”', SRC.opener],
  ['The city owns the arena. Harry Weese designed it as an outdoor rink in 1958; it was enclosed in 1975 and seats 1,150.', SRC.arena],
  ['Everett Thompson coaches the team.', SRC.wish],
].map(([text, source]) => ({ text, source, checked: CHECKED }));

// Game day, from the team's game info page.
export const GAMEDAY = [
  ['Doors open 60 minutes before puck drop, and 90 minutes before for season ticket holders.', SRC.gameInfo],
  ['The box office opens 90 minutes before puck drop. Tickets online are sold through Universe.', SRC.gameInfo],
  ['Groups of 10 or more get discounted tickets: groups@indianasentinels.com.', SRC.gameInfo],
  ['The merch stand is open on game days and closes at the start of the third period. There is also an online shop.', SRC.gameInfo],
  ['Can’t make it? Games stream on the Sentinels Hockey Network on YouTube.', SRC.gameInfo],
  ['The arena also runs public skating, youth programs and other community events.', SRC.mojo],
].map(([text, source]) => ({ text, source, checked: CHECKED }));

// Where road games are played, as a ticket listing names the city
// (SRC.away). Teams without a listed city show none.
export const OPPONENTS = {
  'Port Huron Prowlers': 'Port Huron, Michigan',
  'Topeka Scarecrows': 'Topeka, Kansas',
  'Watertown Wolves': 'Watertown, New York',
  'Twin City Thunderbirds': 'Winston-Salem, North Carolina',
  'Blue Ridge Bobcats': 'Wytheville, Virginia',
  'Danbury Hat Tricks': 'Danbury, Connecticut',
  'Baton Rouge Kingfish': 'Baton Rouge, Louisiana',
  'Stockton Thunder': 'Stockton, California',
};

// The regular season: [date, 'H' or 'A', opponent, puck drop (Columbus
// time, or null where no time is listed), result]. Dates and opponents from the FPHL schedule; times and
// finals from the league feed on OurSports Central. A result is
// [Sentinels goals, opponent goals] or 'postponed'.
const G = [
  ['2026-10-09', 'H', 'Minnesota Northern Lights', null, [4, 2]],
  ['2026-10-10', 'H', 'Minnesota Northern Lights', null, [5, 2]],
  ['2026-10-16', 'A', 'Topeka Scarecrows', null, [0, 2]],
  ['2026-10-17', 'A', 'Topeka Scarecrows', null, [1, 2]],
  ['2026-10-23', 'A', 'Port Huron Prowlers', null, 'postponed'],
  ['2026-10-30', 'H', 'Motor City Rockers', '19:30'],
  ['2026-10-31', 'H', 'Motor City Rockers', '19:30'],
  ['2026-11-06', 'A', 'Watertown Wolves', '19:05'],
  ['2026-11-07', 'A', 'Watertown Wolves', '19:05'],
  ['2026-11-13', 'H', 'Topeka Scarecrows', '19:35'],
  ['2026-11-14', 'H', 'Topeka Scarecrows', '19:30'],
  ['2026-11-20', 'A', 'Twin City Thunderbirds', '19:35'],
  ['2026-11-21', 'A', 'Twin City Thunderbirds', '18:05'],
  ['2026-11-27', 'H', 'Motor City Rockers', '19:30'],
  ['2026-11-28', 'H', 'Motor City Rockers', '19:30'],
  ['2026-12-04', 'A', 'Watertown Wolves', '19:05'],
  ['2026-12-05', 'A', 'Watertown Wolves', '19:05'],
  ['2026-12-11', 'H', 'Watertown Wolves', '19:30'],
  ['2026-12-12', 'H', 'Watertown Wolves', '19:30'],
  ['2026-12-18', 'A', 'Motor City Rockers', '19:30'],
  ['2026-12-19', 'A', 'Motor City Rockers', '18:30'],
  ['2026-12-31', 'A', 'Twin City Thunderbirds', '20:35'],
  ['2027-01-02', 'H', 'Twin City Thunderbirds', '19:30'],
  ['2027-01-03', 'H', 'Twin City Thunderbirds', '13:30'],
  ['2027-01-08', 'H', 'Topeka Scarecrows', '19:30'],
  ['2027-01-09', 'H', 'Topeka Scarecrows', '19:30'],
  ['2027-01-15', 'H', 'Watertown Wolves', '19:30'],
  ['2027-01-16', 'H', 'Watertown Wolves', '19:30'],
  ['2027-01-22', 'H', 'Port Huron Prowlers', '19:30'],
  ['2027-01-23', 'A', 'Port Huron Prowlers', '20:05'],
  ['2027-01-29', 'A', 'Blue Ridge Bobcats', '19:00'],
  ['2027-01-30', 'A', 'Blue Ridge Bobcats', '19:00'],
  ['2027-02-05', 'A', 'Topeka Scarecrows', '20:05'],
  ['2027-02-06', 'A', 'Topeka Scarecrows', '20:05'],
  ['2027-02-12', 'H', 'Binghamton Black Bears', '19:30'],
  ['2027-02-13', 'H', 'Binghamton Black Bears', '19:30'],
  ['2027-02-19', 'H', 'Fresno Falcons', '19:30'],
  ['2027-02-20', 'H', 'Fresno Falcons', '19:30'],
  ['2027-02-26', 'H', 'Watertown Wolves', '19:30'],
  ['2027-02-27', 'H', 'Watertown Wolves', '19:30'],
  ['2027-03-05', 'A', 'Danbury Hat Tricks', '19:30'],
  ['2027-03-06', 'A', 'Danbury Hat Tricks', '19:00'],
  ['2027-03-12', 'H', 'Minnesota Northern Lights', '19:30'],
  ['2027-03-13', 'H', 'Minnesota Northern Lights', '19:30'],
  ['2027-03-19', 'A', 'Baton Rouge Kingfish', '20:05'],
  ['2027-03-20', 'A', 'Baton Rouge Kingfish', '20:05'],
  ['2027-03-21', 'A', 'Baton Rouge Kingfish', '17:05'],
  ['2027-03-26', 'H', 'Monroe Moccasins', '19:30'],
  ['2027-03-27', 'H', 'Monroe Moccasins', '19:30'],
  ['2027-04-02', 'A', 'Stockton Thunder', '22:11'],
  ['2027-04-03', 'A', 'Stockton Thunder', '21:11'],
  ['2027-04-09', 'H', 'Port Huron Prowlers', '19:30'],
  ['2027-04-10', 'A', 'Port Huron Prowlers', '18:05'],
  ['2027-04-11', 'A', 'Port Huron Prowlers', '17:05'],
  ['2027-04-15', 'A', 'Minnesota Northern Lights', '20:00'],
  ['2027-04-16', 'A', 'Minnesota Northern Lights', '20:00'],
];

export const GAMES = G.map(([date, ha, opp, time, result]) => ({
  id: `${date}-${ha === 'H' ? 'home' : 'away'}`, date, home: ha === 'H', opp, time,
  ...(result ? { result } : {}), source: result ? SRC.scores : SRC.league, checked: CHECKED,
}));

// Wins and losses from the finals above. The league splits overtime and
// shootout losses out; the source we read doesn't, so the dashboard links to
// the official standings for that.
export function record(games = GAMES) {
  const r = { w: 0, l: 0, gf: 0, ga: 0, home: [0, 0], away: [0, 0] };
  for (const g of games) {
    if (!Array.isArray(g.result)) continue;
    const [us, them] = g.result, win = us > them, side = g.home ? r.home : r.away;
    win ? r.w++ : r.l++;
    side[win ? 0 : 1]++;
    r.gf += us; r.ga += them;
  }
  return r;
}

// Headlines, newest first, linked to whoever wrote them. Official recaps
// are labeled by the game they cover.
export const NEWS = [
  { title: 'Sents Come from Behind Again to Sweep the Northern Lights', outlet: 'Indiana Sentinels', game: '2026-10-10', url: 'https://indianasentinels.hockeyshift.com/news/sents-recap-2' },
  { title: 'Sentinels Come from Behind to Douse the Northern Lights', outlet: 'OurSports Central', game: '2026-10-09', url: 'https://www.oursportscentral.com/services/releases/sentinels-come-from-behind-to-douse-the-northern-lights/n-6420293' },
  { title: 'Indiana Sentinels ready for year two', outlet: 'WISH-TV', date: '2026-10-05', url: SRC.wish },
  { title: 'Sentinels set for Year No. 2 in Columbus', outlet: 'The Republic', date: '2026-10-03', url: 'https://www.therepublic.com/2026/10/03/sentinels-set-for-year-no-2-in-columbus/' },
  { title: 'Sentinels Announce 2026 to 2027 Regular Season Schedule', outlet: 'Indiana Sentinels', url: SRC.announce },
].map((n) => ({ ...n, checked: CHECKED }));

// Everything else on /sports/, in groups, each team with its own site, where
// its scores live, and one fact with its source. We link to schedules and
// scores; we don't write game recaps. STORIES is the slot for game stories
// written by people who were there, empty until someone sends one.
const W = 'https://en.wikipedia.org/wiki/';
const MAX = 'https://www.maxpreps.com/in/';
const REP = 'https://www.therepublic.com/?p=';

export const SPORTS = [
  { id: 'high-school', title: 'High school', lead: 'Scores, schedules and rosters for every sport are on MaxPreps; state tournament brackets are on the IHSAA site.', teams: [
    { id: 'columbus-north', emoji: '🐶', name: 'Columbus North Bull Dogs', url: 'https://north.bcscschools.org/', scores: MAX + 'columbus/columbus-north-bull-dogs/',
      what: 'Columbus North plays in Conference Indiana. Its boys have won 7 state titles in cross country, the latest in 2025, and 13 in gymnastics.', source: W + 'Columbus_North_High_School' },
    { id: 'columbus-east', emoji: '🔥', name: 'Columbus East Olympians', url: 'https://east.bcscschools.org/', scores: MAX + 'columbus/columbus-east-olympians/',
      what: 'Columbus East High School’s teams are the Olympians. MaxPreps lists 12 boys’ and 10 girls’ sports there.', source: MAX + 'columbus/columbus-east-olympians/' },
    { id: 'hauser', emoji: '✈️', name: 'Hauser Jets', url: MAX + 'hope/hauser-jets/', scores: MAX + 'hope/hauser-jets/',
      what: 'Hauser Junior-Senior High School in Hope plays in the Mid-Hoosier Conference.', source: W + 'Hauser_Junior-Senior_High_School' },
  ], links: [['IHSAA, the state association', 'https://ihsaa.org/']] },
  { id: 'college', title: 'College', lead: 'IU Columbus is the college in town with teams. It competes in the NAIA.', teams: [
    { id: 'iu-columbus', emoji: '🏀', name: 'IU Columbus Crimson Pride', url: 'https://columbus.iu.edu/', scores: 'https://www.thescore.com/ncaab/teams/3590-iu-columbus-crimson-pride/schedule',
      what: 'Indiana University Columbus plays in the NAIA, mostly in the River States Conference.', source: W + 'Indiana_University_Columbus',
      more: [['Men’s basketball played its first season in 2024 to 2025.', REP + '733348'], ['There is a women’s soccer team.', REP + '578938'], ['And a volleyball team.', REP + '711048']] },
  ] },
  { id: 'play', title: 'Play', lead: 'Ice, fields and leagues you can use yourself.', teams: [
    { id: 'hamilton', emoji: '⛸️', name: 'Hamilton Center ice', url: SRC.parksArena,
      what: 'The city’s ice arena has public skating, private ice rentals, and youth and adult programs. It is home to the Columbus Icemen high school team, Columbus Flames youth hockey, the Lincoln Center Skate Club, Full Throttle Speedskating and the Columbus Broomball Association.', source: SRC.arena,
      more: [['Columbus Parks and Recreation lists the programs and rentals.', SRC.parksArena]] },
    { id: 'parks-sports', emoji: '⚽', name: 'Columbus Parks and Recreation', url: 'https://columbusparksandrec.com/facilities-parks-trails/',
      what: 'The parks department runs youth and adult sports, camps and programs.', source: SRC.parksArena },
  ] },
  { id: 'indiana', title: 'Indiana teams', lead: 'The closest big league teams, an hour up the road in Indianapolis, and the state’s two Big Ten schools.', teams: [
    { id: 'colts', emoji: '🏈', name: 'Indianapolis Colts', league: 'NFL', url: 'https://www.colts.com/' },
    { id: 'pacers', emoji: '🏀', name: 'Indiana Pacers', league: 'NBA', url: 'https://www.nba.com/pacers/' },
    { id: 'fever', emoji: '🏀', name: 'Indiana Fever', league: 'WNBA', url: 'https://fever.wnba.com/' },
    { id: 'indians', emoji: '⚾', name: 'Indianapolis Indians', league: 'Triple-A baseball', url: 'https://www.milb.com/indianapolis' },
    { id: 'indy-fuel', emoji: '🏒', name: 'Indy Fuel', league: 'ECHL hockey', url: 'https://www.indyfuelhockey.com/' },
    { id: 'indy-eleven', emoji: '⚽', name: 'Indy Eleven', league: 'USL soccer', url: 'https://www.indyeleven.com/' },
    { id: 'iu', emoji: '🔴', name: 'Indiana Hoosiers', league: 'Big Ten', url: 'https://iuhoosiers.com/' },
    { id: 'purdue', emoji: '🚂', name: 'Purdue Boilermakers', league: 'Big Ten', url: 'https://purduesports.com/' },
  ] },
  { id: 'national', title: 'National scores', lead: 'Every league’s own scoreboard.', links: [
    ['NFL', 'https://www.nfl.com/scores/'], ['NBA', 'https://www.nba.com/games'], ['WNBA', 'https://www.wnba.com/schedule'],
    ['MLB', 'https://www.mlb.com/scores'], ['NHL', 'https://www.nhl.com/scores'], ['MLS', 'https://www.mlssoccer.com/schedule/scores'],
    ['College', 'https://www.ncaa.com/scoreboard/'],
  ] },
].map((g) => ({ ...g, checked: CHECKED }));

// Game stories by people who were there: { title, byline, date, sport, url }.
export const STORIES = [];
