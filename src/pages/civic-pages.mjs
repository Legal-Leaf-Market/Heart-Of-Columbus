// Civic pages: upcoming public meetings (/meetings/), public data (/data/)
// and where to find official notices (/notices/). Data in src/data/civic.mjs,
// every line with its official source and checked date.
import { esc, t } from '../layout.mjs';
import { newsPage } from '../news/frame.mjs';
import { BODIES, MEETINGS, DATASETS, GATEWAY, NOTICE_SOURCES, NOTICE_LAW } from '../data/civic.mjs';
import { stories } from '../news/content.mjs';
import { storyList, fmtWhen, fmtDate } from '../news/render.mjs';

const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u, checked) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>${checked ? ` <span class="muted">checked ${fmtDate(checked)}</span>` : ''}`;
const doc = (kicker, h1, dek, inner) => `<article class="wrap np-doc"><header class="np-doc-head"><p class="kicker">${esc(kicker)}</p><h1>${esc(h1)}</h1><p class="np-dek">${dek}</p></header>${inner}</article>`;

function meetingsPage(ctx) {
  const notes = stories.filter((s) => s.label === 'Meeting notes').slice(0, 10);
  const byBody = Object.fromEntries(BODIES.map((b) => [b.slug, b]));
  const upcoming = MEETINGS.filter((m) => Date.parse(m.start) > Date.now() - 86400000).sort((a, b) => a.start.localeCompare(b.start));
  const body = doc('Local government', 'Public meetings', 'When the people who run Columbus meet, and what they decided. Times come from each body’s official calendar; check there before you go.', `
<section><h2>Coming up</h2>${upcoming.length ? `<ul class="np-list np-meetings">${upcoming.map((m) => `<li data-start="${esc(m.start)}"><strong>${esc(byBody[m.body]?.name || m.body)}</strong>, ${esc(m.title)}. ${fmtWhen(m.start)}, ${esc(m.place)}. ${m.agenda ? `<a href="${esc(m.agenda)}" target="_blank" rel="noopener">Agenda</a>. ` : ''}${src(m.source, m.checked)}</li>`).join('')}</ul>` : '<p>No upcoming meetings entered yet. Use the official pages below.</p>'}</section>
<section><h2>Who we cover</h2><ul class="np-list">${BODIES.map((b) => `<li><strong>${esc(b.name)}</strong>. ${b.url ? `${b.note ? esc(b.note) + ' ' : ''}${src(b.url, b.checked)}` : 'Official agenda page coming once we have checked it.'}</li>`).join('')}</ul></section>
<section><h2>Meeting notes</h2><p>Our notes follow one format: who was there, what was decided, how people voted, and what to ask next. A named person takes them and an editor checks them.</p>${storyList(notes, { size: 'line', empty: 'No meeting notes published yet.' })}</section>`);
  return newsPage({ ...ctx, path: '/meetings/', title: 'Public meetings', description: 'Upcoming public meetings in Columbus and Bartholomew County, with links to official agendas.', crumbs: [['/news/', 'News'], ['', 'Meetings']], body });
}

const num = (v) => (typeof v === 'number' ? v.toLocaleString('en-US') : esc(v));

function dataIndex(ctx) {
  const body = doc('Public data', 'Columbus by the numbers', 'Public records turned into tables you can read, each with a link to where the numbers came from.', `
<section>${DATASETS.length ? `<ul class="np-list">${DATASETS.map((d) => `<li><a href="/data/${d.slug}/">${esc(d.title)}</a>, from ${esc(host(d.source))}, checked ${fmtDate(d.checked)}</li>`).join('')}</ul>` : '<p>Our first tables are being built from public records. We start with city, county and school budgets.</p>'}</section>
<section><h2>Where the numbers come from</h2><p>Local government budgets and spending in Indiana are published on <a href="${GATEWAY}" target="_blank" rel="noopener">Indiana Gateway</a>. We copy figures from there and link back to them; we don’t estimate. We show department totals before anything about individual people.</p></section>`);
  return newsPage({ ...ctx, path: '/data/', title: 'Public data', description: 'Columbus and Bartholomew County public data, from public records.', crumbs: [['/news/', 'News'], ['', 'Data']], body });
}

function dataPage(ctx, d) {
  const isNum = d.rows.map((r) => r.map((c) => typeof c === 'number'));
  const body = doc('Public data', d.title, `${d.note ? t(d.note) + ' ' : ''}From ${src(d.source, d.checked)}.`, `
<div class="np-data"><table><thead><tr>${d.columns.map((c, i) => `<th scope="col"${isNum[0]?.[i] ? ' class="num"' : ''}>${esc(c)}</th>`).join('')}</tr></thead>
<tbody>${d.rows.map((r, j) => `<tr>${r.map((c, i) => `<td${isNum[j][i] ? ' class="num"' : ''}>${num(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
${d.unit ? `<p class="fine">Figures in ${esc(d.unit)}.</p>` : ''}`);
  return newsPage({ ...ctx, path: `/data/${d.slug}/`, title: d.title, description: d.note || d.title, crumbs: [['/data/', 'Data'], ['', d.title]], body });
}

function noticesPage(ctx) {
  const body = doc('Public notices', 'Official public notices', 'Hearings, bids, budgets and other notices that governments are required to publish. We link to the official versions; we don’t publish notices ourselves.', `
<section>${NOTICE_SOURCES.length ? `<ul class="np-list">${NOTICE_SOURCES.map((n) => `<li><strong>${esc(n.name)}</strong> ${src(n.url, n.checked)}</li>`).join('')}</ul>` : '<p>We are collecting the official notice pages for the city, the county and the schools. Until then, check each government’s own website.</p>'}</section>
<section><h2>Why this page exists</h2><p>${esc(NOTICE_LAW.text)} ${src(NOTICE_LAW.source, NOTICE_LAW.checked)}</p><p>If notices move to many separate websites, one page that points to all of them will help.</p></section>`);
  return newsPage({ ...ctx, path: '/notices/', title: 'Public notices', description: 'Links to official public notices for Columbus and Bartholomew County.', crumbs: [['/news/', 'News'], ['', 'Notices']], body });
}

export const civicPages = (ctx) => [
  { path: 'meetings/index.html', html: meetingsPage(ctx) },
  { path: 'data/index.html', html: dataIndex(ctx) },
  ...DATASETS.map((d) => ({ path: `data/${d.slug}/index.html`, html: dataPage(ctx, d) })),
  { path: 'notices/index.html', html: noticesPage(ctx) },
];
