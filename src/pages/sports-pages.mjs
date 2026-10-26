// Sports in Columbus (/sports/) and the Indiana Sentinels dashboard
// (/sports/sentinels/), which installs as a home screen app: a manifest and
// a service worker scoped to /sports/sentinels/ keep it working offline.
// Facts and games come from src/data/sports.mjs; public/js/sentinels.js
// picks the next game at load time so the static page is never stale.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs, mapsLink } from '../site.mjs';
import { TEAM, FACTS, GAMEDAY, GAMES, NEWS, SPORTS, STORIES, OPPONENTS, SRC, record } from '../data/sports.mjs';

const APP = '/sports/sentinels/';
const styles = ['hoc.css', 'sports.css'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ymd = (s) => s.split('-').map(Number);
export const fmtDay = (s) => { const [y, m, d] = ymd(s); return `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${MONTHS[m - 1]} ${d}`; };
export const fmtTime = (hm) => { const [h, m] = hm.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;
const out = (u, label, cls = 'btn btn-sm btn-ghost') => `<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener">${label}</a>`;
const score = (g) => (g.result === 'postponed' ? 'Postponed' : `${g.result[0] > g.result[1] ? 'W' : 'L'} ${g.result[0]}-${g.result[1]}`);
const where = (g) => (g.home ? TEAM.arenaShort : OPPONENTS[g.opp] || 'Road game');
const facts = (list) => `<ul class="vs-facts">${list.map((f) => `<li>${t(f.text)} ${src(f.source)}</li>`).join('')}</ul>`;
const r = record();
const rec = (a) => `${a[0]}-${a[1]}`;

// The season, in the shape public/js/sentinels.js reads.
const gameData = () => GAMES.map((g) => ({ d: g.date, h: g.home ? 1 : 0, o: g.opp, t: g.time, ...(g.result ? { r: g.result } : {}), c: OPPONENTS[g.opp] || '' }));

// The next game card. The build fills it with the first game after the
// build date; the script swaps in the right one when the page loads.
const nextCard = (big) => {
  const built = new Date().toISOString().slice(0, 10);
  const g = GAMES.find((x) => !x.result && x.date >= built) || GAMES[GAMES.length - 1];
  return `
<article class="sn-next${big ? ' sn-next-big' : ''}" data-next aria-live="polite">
  <p class="sn-when" data-next-when>${esc(fmtDay(g.date))}${g.time ? `, ${esc(fmtTime(g.time))}` : ''}</p>
  <h2 class="sn-match"><span data-next-ha>${g.home ? 'vs' : 'at'}</span> <span data-next-opp>${esc(g.opp)}</span></h2>
  <p class="sn-where">${svg('pin', 'ic-sm')}<span data-next-where>${esc(g.home ? TEAM.arena : OPPONENTS[g.opp] || 'Road game')}</span></p>
  <p class="sn-count" data-next-count hidden></p>
  <p class="btns sn-next-btns">
    ${out(SRC.tickets, `Tickets ${svg('arrow', 'ic-sm')}`, 'btn btn-sm')}
    ${out(SRC.youtube, 'Watch on YouTube')}
    <a class="btn btn-sm btn-ghost" href="${APP}games.ics">Add the season to my calendar</a>
  </p>
</article>`;
};

function sentinelsPage({ assets }) {
  const months = [];
  for (const g of GAMES) {
    const k = g.date.slice(0, 7);
    if (!months.length || months[months.length - 1].k !== k) months.push({ k, games: [] });
    months[months.length - 1].games.push(g);
  }
  const row = (g) => `
<li class="sn-game${g.home ? ' sn-home' : ''}${g.result ? ' sn-done' : ''}" data-game data-date="${g.date}" data-home="${g.home ? 1 : 0}" id="g-${g.id}">
  <span class="sn-date"><b>${esc(fmtDay(g.date).split(', ')[1])}</b><small>${esc(fmtDay(g.date).split(', ')[0])}</small></span>
  <span class="sn-opp"><small>${g.home ? 'Home vs' : 'Away at'}</small><strong>${esc(g.opp)}</strong><small class="sn-city">${esc(where(g))}</small></span>
  <span class="sn-res">${g.result ? `<b class="${g.result === 'postponed' ? 'sn-pp' : g.result[0] > g.result[1] ? 'sn-w' : 'sn-l'}">${esc(score(g))}</b>` : g.time ? esc(fmtTime(g.time)) : 'Time to come'}</span>
</li>`;
  const played = GAMES.filter((g) => Array.isArray(g.result)).length;
  const body = `
${header('', {})}
<main id="main" class="sn">
${breadcrumbs([['/', 'Home'], ['/sports/', 'Sports'], ['', 'Indiana Sentinels']])}
<section class="sn-hero">
  <div class="wrap sn-hero-grid">
    <div>
      <p class="kicker kicker-pill">Columbus pro hockey · FPHL</p>
      <h1>Indiana <span class="hl">Sentinels</span></h1>
      <p class="lede">Year two at The Ham. The next game, the whole season, scores and news, in one page you can keep on your phone.</p>
      <ul class="sn-stats" aria-label="Season so far">
        <li><b>${r.w}</b><span>Wins</span></li>
        <li><b>${r.l}</b><span>Losses</span></li>
        <li><b>${rec(r.home)}</b><span>At home</span></li>
        <li><b>${rec(r.away)}</b><span>On the road</span></li>
        <li><b>${r.gf}</b><span>Goals for</span></li>
        <li><b>${r.ga}</b><span>Against</span></li>
      </ul>
      <p class="fine">From ${played} finals so far. Losses here include any in overtime or a shootout; the <a href="${esc(SRC.standings)}" target="_blank" rel="noopener">official standings</a> split those out.</p>
    </div>
    ${nextCard(true)}
  </div>
  <nav class="wrap chips sn-tabs" aria-label="On this page">
    <a class="pill" href="#schedule">Schedule</a><a class="pill" href="#standings">Standings</a><a class="pill" href="#game-day">Game day</a><a class="pill" href="#news">News</a><a class="pill" href="#about">About</a><a class="pill" href="#install">Add to home screen</a>
  </nav>
</section>

<div class="wrap sn-body">
<section class="sn-sec sn-sched" id="schedule" aria-labelledby="schedule-h">
  <div class="sn-sec-head">
    <h2 id="schedule-h">${esc(TEAM.season)} schedule</h2>
    <div class="chips sn-filter" role="group" aria-label="Show games">
      <button type="button" class="pill" data-filter="all" aria-pressed="true">All ${GAMES.length}</button>
      <button type="button" class="pill" data-filter="home" aria-pressed="false">Home ${GAMES.filter((g) => g.home).length}</button>
      <button type="button" class="pill" data-filter="away" aria-pressed="false">Away ${GAMES.filter((g) => !g.home).length}</button>
      <button type="button" class="pill" data-filter="left" aria-pressed="false">Still to play</button>
    </div>
  </div>
  ${months.map((m) => { const [y, mo] = ymd(m.k + '-01'); return `<div class="sn-month" data-month><h3>${LONG[mo - 1]} ${y}</h3><ol class="sn-games">${m.games.map(row).join('')}</ol></div>`; }).join('')}
  <p class="fine">Dates and opponents from the <a href="${esc(SRC.league)}" target="_blank" rel="noopener">FPHL schedule</a>; puck drop times and finals from the <a href="${esc(SRC.scores)}" target="_blank" rel="noopener">league feed on OurSports Central</a>, Columbus time. Checked ${esc(fmtDay(TEAM.checked))}, 2026. Times change, so check the <a href="${esc(SRC.calendar)}" target="_blank" rel="noopener">team calendar</a> before you go.</p>
</section>

<section class="sn-sec" id="standings" aria-labelledby="standings-h">
  <h2 id="standings-h">Standings and stats</h2>
  <p>The league keeps the live table, the scoring leaders and the roster on the team’s own site. We link to it rather than copy numbers that change every night.</p>
  <p class="btns">${out(SRC.standings, `FPHL standings ${svg('arrow', 'ic-sm')}`, 'btn btn-sm')}${out(SRC.stats, 'Team stats')}${out(SRC.roster, 'Roster')}</p>
</section>

<section class="sn-sec" id="game-day" aria-labelledby="game-day-h">
  <h2 id="game-day-h">Game day at The Ham</h2>
  ${facts(GAMEDAY)}
  <p class="btns">${out(SRC.tickets, `Buy tickets ${svg('arrow', 'ic-sm')}`, 'btn btn-sm')}<a class="btn btn-sm btn-ghost" href="${esc(mapsLink({ name: TEAM.arena, address: '' }))}" target="_blank" rel="noopener">${svg('map', 'ic-sm')} Directions</a>${out(SRC.shop, 'Team shop')}<a class="btn btn-sm btn-ghost" href="/explore/?view=map&amp;now=1">What’s open near me</a></p>
</section>

<section class="sn-sec" id="news" aria-labelledby="news-h">
  <h2 id="news-h">News</h2>
  <ul class="sn-news">${NEWS.map((n) => `<li><a href="${esc(n.url)}" target="_blank" rel="noopener"><strong>${t(n.title)}</strong><small>${esc(n.outlet)}${n.game ? `, recap of the ${esc(fmtDay(n.game))} game` : n.date ? `, ${esc(fmtDay(n.date))}` : ''}</small></a></li>`).join('')}</ul>
  <p class="btns">${out(SRC.news, `All team news ${svg('arrow', 'ic-sm')}`)}</p>
</section>

<section class="sn-sec" id="about" aria-labelledby="about-h">
  <h2 id="about-h">About the team</h2>
  ${facts(FACTS)}
  <p class="btns">${out(SRC.team, `Official team site ${svg('arrow', 'ic-sm')}`, 'btn btn-sm')}<a class="btn btn-sm btn-ghost" href="/b/${TEAM.listing}/">Its listing here</a></p>
</section>

<section class="sn-sec sn-install" id="install" aria-labelledby="install-h">
  <h2 id="install-h">Put it on your home screen</h2>
  <p>This page works like an app: add it once and it opens full screen, with the schedule saved for when the rink Wi-Fi isn’t.</p>
  <p class="btns"><button type="button" class="btn btn-sm" data-install hidden>Install the app</button></p>
  <ul class="vs-facts">
    <li><b>iPhone and iPad:</b> open this page in Safari, tap Share, then Add to Home Screen.</li>
    <li><b>Android:</b> in Chrome, open the menu and tap Install app or Add to Home screen.</li>
  </ul>
  <p class="sn-installed" data-installed hidden>You’re in the app. Pull down to refresh the schedule.</p>
</section>

<p class="fine sn-foot">Heart of Columbus is not affiliated with or endorsed by the Indiana Sentinels or the Federal Prospects Hockey League. No team logos are used here; the app icon is our own art. Tickets are sold by the team, not by us.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Indiana Sentinels dashboard | Heart of Columbus',
    description: 'The Indiana Sentinels, Columbus’s pro hockey team: next game, the 2026 to 2027 schedule, scores, game day info and news, as an app for your home screen.',
    body, scripts: ['site.js', 'sentinels.js'], styles, assets,
    data: { games: gameData(), arena: TEAM.arena },
    head: `<link rel="manifest" href="${APP}manifest.webmanifest">
<meta name="theme-color" content="#12324a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Sentinels">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/art/sports-app-icon-180.png">`,
  });
}

// One group on /sports/: teams with a fact and their sources, or just links.
const group = (g) => `
<section class="sn-sec" id="${g.id}" aria-labelledby="${g.id}-h">
  <h2 id="${g.id}-h">${esc(g.title)}</h2>
  ${g.lead ? `<p class="vs-lead">${t(g.lead)}</p>` : ''}
  ${g.teams ? `<div class="sn-local${g.teams.some((x) => x.what) ? '' : ' sn-grid'}">${g.teams.map((x) => `
    <article class="sn-loc" id="${x.id}">
      <span class="vs-emoji" aria-hidden="true">${x.emoji}</span>
      <div><h3><a href="${esc(x.url)}" target="_blank" rel="noopener">${t(x.name)}</a></h3>
      ${x.league ? `<p class="muted">${esc(x.league)}</p>` : ''}
      ${x.what ? `<ul class="vs-facts"><li>${t(x.what)} ${src(x.source)}</li>${(x.more || []).map(([m, u]) => `<li>${t(m)} ${src(u)}</li>`).join('')}</ul>` : ''}
      ${x.scores ? `<p class="btns">${out(x.scores, 'Scores and schedules')}</p>` : ''}</div>
    </article>`).join('')}</div>` : ''}
  ${g.links ? `<p class="btns">${g.links.map(([l, u]) => out(u, esc(l))).join('')}</p>` : ''}
</section>`;

function sportsPage({ assets }) {
  const body = `
${header('', {})}
<main id="main">
${breadcrumbs([['/', 'Home'], ['', 'Sports']])}
<section class="order-hero sn-hub-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Sports</p>
    <h1>Game night in<br><span class="hl">Columbus.</span></h1>
    <p class="lede">Pro hockey at a Harry Weese rink, the high schools, IU Columbus, the Indiana teams up the road and every league’s scores, with ice and fields you can use yourself.</p>
  </div>
</section>
<div class="wrap sn-body">
  <section class="sn-sec sn-feature" aria-labelledby="sentinels-h">
    <div>
      <p class="kicker">Pro hockey · FPHL</p>
      <h2 id="sentinels-h">Indiana Sentinels</h2>
      <p>Columbus’s pro hockey team, in year two at the Hamilton Center. ${r.w} wins and ${r.l} losses so far.</p>
      <p class="btns"><a class="btn btn-sm" href="${APP}">Open the Sentinels app ${svg('arrow', 'ic-sm')}</a>${out(SRC.team, 'Official team site')}</p>
    </div>
    ${nextCard(false)}
  </section>
  <nav class="chips sn-tabs sn-hub-tabs" aria-label="On this page">${SPORTS.map((g) => `<a class="pill" href="#${g.id}">${esc(g.title)}</a>`).join('')}<a class="pill" href="#stories">Local stories</a></nav>
  ${SPORTS.map(group).join('')}
  <section class="sn-sec" id="stories" aria-labelledby="stories-h">
    <h2 id="stories-h">Local stories</h2>
    ${STORIES.length
      ? `<ul class="sn-news">${STORIES.map((x) => `<li><a href="${esc(x.url)}"><strong>${t(x.title)}</strong><small>${esc(x.byline)}, ${esc(fmtDay(x.date))}</small></a></li>`).join('')}</ul>`
      : '<p>This space is for game stories written by people who were in the stands: Friday night football, a Sentinels win, a Crimson Pride tip off. None are published yet. We link to scores; we don’t have a computer write the story.</p>'}
    <p class="fine">For scores from every local team, read the sports pages of <a href="https://www.therepublic.com/" target="_blank" rel="noopener">The Republic</a>.</p>
  </section>
  <p class="fine sn-foot">Heart of Columbus is not affiliated with these teams or schools.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Sports in Columbus | Heart of Columbus',
    description: 'Sports in Columbus, Indiana: the Indiana Sentinels pro hockey team, Columbus North, Columbus East and Hauser, IU Columbus, Indiana pro teams and national scores, each linked to its source.',
    body, scripts: ['site.js', 'sentinels.js'], styles, assets, data: { games: gameData(), arena: TEAM.arena },
  });
}

const manifest = () => JSON.stringify({
  name: 'Indiana Sentinels dashboard, by Heart of Columbus',
  short_name: 'Sentinels',
  description: 'Next game, schedule, scores and news for Columbus pro hockey. Not affiliated with the team.',
  id: APP, start_url: APP, scope: APP, display: 'standalone',
  background_color: '#fbf7f0', theme_color: '#12324a',
  icons: [
    { src: '/art/sports-app-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/art/sports-app-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2);

// The service worker: the page from the network when there is one, the last
// copy when there isn't. Same-site assets are cached as they load. The
// version changes with the schedule so old copies are dropped.
const worker = () => {
  const v = GAMES.map((g) => g.date + (g.result || '')).join('').length + '-' + TEAM.checked;
  return `// Sentinels dashboard offline cache (built by src/pages/sports-pages.mjs).
const CACHE = 'sentinels-${v}';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['${APP}'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('sentinels-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('${APP}', copy)); return res; }).catch(() => caches.match('${APP}')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
});
`;
};

// UTC instant for a Columbus wall-clock time (Eastern, with daylight time).
const utc = (date, hm) => {
  const [y, m, d] = ymd(date), [h, mi] = hm.split(':').map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, h + 5, mi));
  const off = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', timeZoneName: 'shortOffset' })
    .formatToParts(guess).find((p) => p.type === 'timeZoneName').value; // "GMT-4"
  return new Date(Date.UTC(y, m - 1, d, h - Number(off.replace('GMT', '')), mi));
};

// Every scheduled game as a calendar entry, two and a half hours long.
export function gamesIcs(now = new Date()) {
  const text = (s) => s.replace(/[\\;,]/g, (c) => '\\' + c);
  const stamp = (x) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Heart of Columbus//Sentinels//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Indiana Sentinels games', 'X-WR-TIMEZONE:America/Indiana/Indianapolis'];
  for (const g of GAMES) {
    if (g.result === 'postponed') continue;
    const when = g.time
      ? [`DTSTART:${stamp(utc(g.date, g.time))}`, `DTEND:${stamp(new Date(utc(g.date, g.time).getTime() + 150 * 60000))}`]
      : [`DTSTART;VALUE=DATE:${g.date.replace(/-/g, '')}`];
    lines.push('BEGIN:VEVENT', `UID:sentinels-${g.id}@heartofcolumbus`, `DTSTAMP:${stamp(now)}`, ...when,
      `SUMMARY:${text(`Sentinels ${g.home ? 'vs' : 'at'} ${g.opp}${Array.isArray(g.result) ? ` (${score(g)})` : ''}`)}`,
      `LOCATION:${text(g.home ? `${TEAM.arena}, Columbus, Indiana` : OPPONENTS[g.opp] || g.opp)}`,
      `URL:${SRC.calendar}`, `DESCRIPTION:${text('Times change; check the team calendar. Not affiliated with the team.')}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map((l) => l.match(/.{1,73}/g).join('\r\n ')).join('\r\n') + '\r\n';
}

export const sportsPages = (ctx) => [
  { path: 'sports/index.html', html: sportsPage(ctx) },
  { path: 'sports/sentinels/index.html', html: sentinelsPage(ctx) },
  { path: 'sports/sentinels/manifest.webmanifest', html: manifest() },
  { path: 'sports/sentinels/sw.js', html: worker() },
  { path: 'sports/sentinels/games.ics', html: gamesIcs() },
];
