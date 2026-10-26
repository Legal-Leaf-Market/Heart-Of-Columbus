// The newspaper: front page, sections and story pages, all built from
// content/ (src/news/content.mjs). Every page here is noindex until the
// publisher launches. See docs/newspaper-plan.md.
import { esc, t } from '../layout.mjs';
import { newsPage, setBarLinks } from '../news/frame.mjs';
import { aboutPages } from './about-pages.mjs';
import { readerPages } from './reader-pages.mjs';
import { civicPages } from './civic-pages.mjs';
import { habitPages, storyAsk } from './habit-pages.mjs';
import { sponsorSlot } from '../news/sponsor-slot.mjs';
import { ALL_STORIES, SAMPLES, stories, storiesIn, storiesBy, correctionsLog } from '../news/content.mjs';
import { SECTIONS, sectionBySlug, sectionHref } from '../news/sections.mjs';
import { disclosures } from '../news/disclosure.mjs';
import { storyList, storyCard, label, byline, editorLine, fmtWhen, fmtDate } from '../news/render.mjs';
import { card, svg, rail, PHOTOS } from '../site.mjs';
import { directory, areaBySlug, AREAS } from '../data/directory.mjs';
import { eventsSection } from './events.mjs';
import { ALERT, activeAlert, LEVELS } from '../news/alert.mjs';
import { BODIES } from '../data/civic.mjs';

// Columbus, for the weather box: the Bartholomew County Courthouse.
const WX = { lat: 39.2014, lon: -85.9214, gauge: '03364000' };

// Filled in the browser by news.js from the National Weather Service and
// USGS, with the last good reading kept as a fallback. Without JavaScript it
// is just the links.
const weatherBox = () => `
<section class="np-box np-wx" data-np-wx data-lat="${WX.lat}" data-lon="${WX.lon}" data-gauge="${WX.gauge}" aria-labelledby="wx-h">
  <h2 id="wx-h">Weather and river</h2>
  <div data-np-wx-now><p class="muted">Loading the forecast…</p></div>
  <div data-np-wx-alerts></div>
  <div class="np-river" data-np-river><p class="muted">Loading the river gauge…</p></div>
  <p class="np-wx-src" data-np-wx-src>From the <a href="https://forecast.weather.gov/MapClick.php?lat=${WX.lat}&amp;lon=${WX.lon}" target="_blank" rel="noopener">National Weather Service</a> and the <a href="https://waterdata.usgs.gov/monitoring-location/USGS-${WX.gauge}/" target="_blank" rel="noopener">USGS gauge on the East Fork White River at Columbus</a>.</p>
  <p class="np-wx-src"><a href="https://www.usgs.gov/maps/flood-inundation-maps-east-fork-white-river-columbus-indiana" target="_blank" rel="noopener">Flood inundation maps for Columbus</a></p>
</section>`;

const alertList = (title, items) => (items?.length ? `<section><h2>${esc(title)}</h2><ul>${items.map((x) => `<li>${t(x)}</li>`).join('')}</ul></section>` : '');

// /news/alert/: the emergency page. Built every time; says so plainly when
// nothing is going on.
function alertPage(ctx) {
  const a = ALERT;
  const on = activeAlert(a);
  const body = on ? `
<article class="wrap np-doc np-alert-page">
  <header class="np-doc-head"><p class="kicker">${esc(LEVELS[a.level] || 'Alert')}</p><h1>${t(a.headline)}</h1>${a.summary ? `<p class="np-dek">${t(a.summary)}</p>` : ''}
  <p class="np-meta">Last updated <time datetime="${esc(a.updated)}" data-np-updated>${a.updated ? fmtWhen(a.updated) : ''}</time>. This page changes as we confirm more.</p></header>
  ${alertList('What we know', a.know)}
  ${alertList('Closures', a.closures)}
  ${alertList('Where to go', a.whereToGo)}
  ${alertList('How to help', a.howToHelp)}
  ${a.sources?.length ? `<section><h2>Official sources</h2><ul>${a.sources.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${t(x.name)}</a></li>`).join('')}</ul></section>` : ''}
  <p class="np-tip">In an emergency, call 911. Have something we should know? <a href="/about/standards/#feedback">Tell the newsroom</a>.</p>
</article>` : `
<article class="wrap np-doc">
  <header class="np-doc-head"><p class="kicker">Alerts</p><h1>No active alert</h1><p class="np-dek">When something big is happening in Columbus, this page will say what we know, what is closed, where to go and how to help.</p></header>
  <p>In an emergency, call 911. For weather warnings, see the <a href="https://www.weather.gov/ind/" target="_blank" rel="noopener">National Weather Service in Indianapolis</a>.</p>
</article>`;
  return newsPage({ ...ctx, path: '/news/alert/', title: on ? a.headline : 'Alerts', description: on ? a.summary || a.headline : 'Breaking news and emergencies in Columbus, Indiana.', crumbs: [['/news/', 'News'], ['', 'Alert']], body });
}
import { landmarkBySlug } from '../data/landmarks.mjs';
import { newsArticleLd } from '../jsonld.mjs';
import { person } from '../data/staff.mjs';
import { PAPER } from '../data/paper.mjs';

const bizBySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));

// Everything a story tags that has a page here: business cards, landmark and
// neighborhood links, and a small map of the first place with an address.
export function inThisStory(s) {
  const biz = s.tags.map((t) => bizBySlug[t]).filter(Boolean);
  const lms = s.tags.map((t) => landmarkBySlug[t]).filter(Boolean);
  const areas = s.tags.map((t) => areaBySlug[t]).filter(Boolean);
  if (!biz.length && !lms.length && !areas.length) return '';
  const where = biz.find((b) => b.address) || lms[0];
  const q = where && encodeURIComponent(`${where.name}, ${where.address ? where.address + ', ' : ''}Columbus, IN`);
  return `
<section class="wrap np-tagged" aria-labelledby="in-story-h">
  <h2 id="in-story-h">In this story</h2>
  ${lms.length || areas.length ? `<p class="chips">${lms.map((l) => `<a class="pill" href="/l/${l.slug}/">${svg('pin', 'ic-sm')} ${esc(l.name)}</a>`).join('')}${areas.map((a) => `<a class="pill" href="/n/${a.slug}/">${esc(a.label)}</a>`).join('')}</p>` : ''}
  <div class="np-tagged-row">
    ${biz.length ? `<div class="grid np-tagged-grid">${biz.map((b) => card(b)).join('')}</div>` : ''}
    ${where ? `<iframe class="np-map" title="Map of ${esc(where.name)}" loading="lazy" src="https://www.google.com/maps?q=${q}&amp;output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe>` : ''}
  </div>
</section>`;
}

setBarLinks(() => SECTIONS.filter((s) => s.bar !== false).map((s) => [sectionHref(s), s.name]));

const host = (u) => new URL(u).hostname.replace(/^www\./, '');

const correction = (c) => `<li><time datetime="${esc(c.date)}">${fmtDate(c.date)}</time>: ${t(c.text)}</li>`;

// The Documenters-style notes box: who was there, what was decided, votes,
// and what to ask next.
const meetingBox = (m, sample) => {
  const body = BODIES.find((b) => b.slug === m.body);
  const list = (title, xs) => (xs.length ? `<div><h2>${esc(title)}</h2><ul>${xs.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div>` : '');
  return `<aside class="np-dev np-meeting" aria-label="Meeting at a glance"><p class="kicker">${esc(body ? body.name : sample ? m.body : m.body)}, ${fmtDate(m.date)}</p>
  ${list('Who was there', m.attended)}${list('What was decided', m.decisions)}
  ${m.votes.length ? `<div class="np-votes"><h2>Votes</h2><table><thead><tr><th scope="col">Motion</th><th scope="col">Result</th><th scope="col">Tally</th></tr></thead><tbody>${m.votes.map((v) => `<tr><td>${t(v.motion)}</td><td>${t(v.result)}</td><td>${t(v.tally || '')}</td></tr>`).join('')}</tbody></table></div>` : ''}
  ${list('Questions to follow up', m.followUps)}
  ${body?.url ? `<p class="np-wx-src"><a href="${esc(body.url)}" target="_blank" rel="noopener">Official agendas and minutes</a></p>` : ''}</aside>`;
};

export function storyBody(s) {
  const major = s.corrections.filter((c) => c.major);
  const minor = s.corrections.filter((c) => !c.major);
  const disc = disclosures(s.tags);
  const img = s.images[0];
  return `
<article class="wrap np-story">
  <header class="np-story-head">
    <p class="np-story-kick">${label(s)} <a href="${sectionHref(sectionBySlug[s.section])}">${esc(sectionBySlug[s.section].name)}</a></p>
    <h1>${t(s.headline)}</h1>
    ${s.dek ? `<p class="np-dek">${t(s.dek)}</p>` : ''}
    <p class="np-byline">${byline(s)}</p>
    <p class="np-meta">${editorLine(s)}${s.editor ? ' · ' : ''}Published <time datetime="${esc(s.published)}">${fmtWhen(s.published)}</time>${s.updated ? ` · Updated <time datetime="${esc(s.updated)}">${fmtWhen(s.updated)}</time>` : ''}</p>
  </header>
  ${disc.map((d) => `<p class="np-disclose" data-kind="${d.kind}"><strong>Disclosure:</strong> ${esc(d.text)}</p>`).join('')}
  ${major.length ? `<aside class="np-corr np-corr-top" aria-label="Corrections"><h2>Correction</h2><ul>${major.map(correction).join('')}</ul></aside>` : ''}
  ${img ? `<figure class="np-fig"><img src="${esc(img.file)}" alt="${esc(img.alt)}"><figcaption>${img.caption ? `${t(img.caption)} ` : ''}<span class="np-credit">${esc(img.credit)}, ${esc(img.license)}</span></figcaption></figure>` : ''}
  ${s.developing ? `<aside class="np-dev" aria-label="Developing story"><p class="kicker">Developing story</p><div><h2>What we know</h2><ul>${s.developing.know.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div><div><h2>What we don’t know yet</h2><ul>${s.developing.dontKnow.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div></aside>` : ''}
  ${s.meeting ? meetingBox(s.meeting, s.sample) : ''}
  <div class="np-prose">${s.html}</div>
  ${s.images.slice(1).map((im) => `<figure class="np-fig"><img src="${esc(im.file)}" alt="${esc(im.alt)}" loading="lazy"><figcaption>${im.caption ? `${t(im.caption)} ` : ''}<span class="np-credit">${esc(im.credit)}, ${esc(im.license)}</span></figcaption></figure>`).join('')}
  <footer class="np-trust">
    ${s.sources.length ? `<section id="references"><h2>References</h2><ul>${s.sources.map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${t(x.name)}</a> <span class="np-host">${esc(host(x.url))}</span>` : t(x.name)}${x.note ? `, ${t(x.note)}` : ''}</li>`).join('')}</ul></section>` : ''}
    ${s.methods ? `<section id="methods"><h2>How we reported this</h2><p>${t(s.methods)}</p></section>` : ''}
    ${minor.length ? `<section id="corrections"><h2>Corrections</h2><ul>${minor.map(correction).join('')}</ul></section>` : ''}
    <p class="np-tip">Spot an error? Have a tip? <a href="/tips/">Tell the newsroom</a>. Disagree? <a href="/letters/">Write a letter</a>. <a href="/about/standards/#labels">What “${esc(s.label)}” means</a>.</p>
  </footer>
</article>`;
}

function storyPage(ctx, s) {
  const sec = sectionBySlug[s.section];
  const banner = s.sample
    ? '<div class="np-sample-banner"><div class="wrap"><strong>Sample story.</strong> Sampleton and everyone in it are made up. This page only shows what a story looks like.</div></div>'
    : s.draft ? '<div class="np-sample-banner"><div class="wrap"><strong>Draft.</strong> Not approved by an editor and not listed anywhere yet.</div></div>' : '';
  return newsPage({
    ...ctx, path: s.href, title: s.headline, description: s.dek || s.headline, banner,
    crumbs: [['/news/', 'News'], [sectionHref(sec), sec.name], ['', s.headline]],
    body: storyBody(s) + inThisStory(s) + `<div class="wrap np-story-end">${storyAsk()}</div>`,
    ld: s.sample || s.draft ? [] : [newsArticleLd({ ...s, sectionName: sec.name }, { people: s.bylines.map((b) => person(b)), paper: PAPER })],
  });
}

function sectionPage(ctx, sec) {
  const items = storiesIn(sec.slug);
  const body = `
<section class="wrap np-section">
  <header class="np-doc-head"><p class="kicker">Section</p><h1>${esc(sec.name)}</h1><p class="np-dek">${esc(sec.blurb)}</p></header>
  ${sec.links ? `<nav class="chips np-sec-links" aria-label="Related">${sec.links.map(([h, l]) => `<a class="pill" href="${h}">${esc(l)}</a>`).join('')}</nav>` : ''}
  ${sec.areas ? `<nav class="chips np-sec-links" aria-label="Neighborhoods">${AREAS.map((a) => `<a class="pill" href="/n/${a.slug}/">${esc(a.label)}</a>`).join('')}</nav>` : ''}
  ${storyList(items, { showSection: false, empty: 'No stories in this section yet.' })}
</section>
${sec.events ? eventsSection({ mode: 'upcoming', id: 'whats-on', title: 'What’s on', kicker: 'Signature events' }) : ''}`;
  return newsPage({ ...ctx, path: sectionHref(sec), title: sec.name, description: sec.blurb, crumbs: [['/news/', 'News'], ['', sec.name]], body, scripts: sec.events ? ['hub.js', 'events.js'] : [] });
}

function samplesPage(ctx) {
  const body = `
<section class="wrap np-section">
  <header class="np-doc-head"><p class="kicker">Templates</p><h1>Sample stories</h1><p class="np-dek">Made-up stories in a made-up town, to show reporters and editors what each kind of story looks like here. None of this is news.</p></header>
  ${storyList(SAMPLES)}
</section>`;
  return newsPage({ ...ctx, path: '/news/samples/', title: 'Sample stories', description: 'Templates, not news.', crumbs: [['/news/', 'News'], ['', 'Samples']], body });
}

// The front page: the lead and a few more, the useful boxes, then a short
// list from each section. Every story page stands on its own; this is a
// front door, not the only one.
function frontPage(ctx) {
  const [lead, ...rest] = stories;
  const more = rest.slice(0, 5);
  const shown = new Set([lead, ...more].filter(Boolean).map((s) => s.href));
  const changes = stories.filter((s) => s.section === 'business' && s.tags.some((t) => t === 'openings' || t === 'closings')).slice(0, 4);
  const bySection = SECTIONS.map((sec) => [sec, storiesIn(sec.slug).filter((s) => !shown.has(s.href)).slice(0, 3)]).filter(([, xs]) => xs.length);
  const photo = PHOTOS.aerial;
  const body = `
<header class="wrap np-mast">
  <nav class="np-mast-links" aria-label="Get the paper"><a href="/newsletter/">Newsletter</a><a href="/games/">Games</a><a href="/ask/">Ask us</a><a href="/tips/">Send a tip</a></nav>
  <p class="np-mast-date" data-np-today></p>
  <h1 class="np-mast-name">${esc(PAPER.name)}</h1>
  <p class="np-mast-motto">${PAPER.motto ? t(PAPER.motto) : 'Local news for Columbus, Indiana'}</p>
</header>
<div class="wrap np-front">
  <div class="np-front-main">
    ${lead ? storyCard(lead, { size: 'lead' }) : `<div class="np-empty-front"><p class="kicker">Before the first edition</p><h2>No stories yet</h2><p>The newsroom is getting ready. Read <a href="/about/">who we are</a> and <a href="/about/standards/">how we report</a>.</p></div>`}
    ${more.length ? `<div class="np-front-more">${more.map((s) => storyCard(s)).join('')}</div>` : ''}
  </div>
  <aside class="np-front-side">
    ${weatherBox()}
    ${sponsorSlot('front')}
    ${changes.length ? `<section class="np-box"><h2>Openings and closings</h2>${changes.map((s) => storyCard(s, { size: 'line', showSection: false })).join('')}<a class="np-more" href="/news/business/">More business news</a></section>` : ''}
    <figure class="np-box np-photo"><img src="${esc(photo.src)}" alt="${esc(photo.title)}" loading="lazy"><figcaption>${esc(photo.title)}. Photo: ${esc(photo.credit)}, ${esc(photo.license)}. <a href="/credits/">Credits</a></figcaption></figure>
  </aside>
</div>
${rail('Open right now', '/explore/?open=1', directory.filter((b) => b.hours && !b.tempClosed && ['restaurants', 'coffee-sweets', 'bars'].includes(b.cat)).slice(0, 150), { kicker: 'From the directory', openOnly: true, id: 'open-now' })}
${eventsSection({ mode: 'weekend', id: 'this-weekend', title: 'This weekend in Columbus', kicker: 'Happening Friday to Sunday' })}
${bySection.length ? `<div class="wrap np-sections">${bySection.map(([sec, xs]) => `<section class="np-sec-block"><h2><a href="${sectionHref(sec)}">${esc(sec.name)}</a></h2>${xs.map((s) => storyCard(s, { size: 'line', showSection: false })).join('')}</section>`).join('')}</div>` : ''}`;
  return newsPage({ ...ctx, path: '/news/', title: 'News', description: 'Local news for Columbus, Indiana: the city, the county, schools, business, food, architecture, sports and things to do.', body, scripts: ['hub.js', 'events.js', 'news.js'] });
}

export function newsPages(ctx) {
  return [
    { path: 'news/index.html', html: frontPage(ctx) },
    ...SECTIONS.filter((s) => !s.href).map((s) => ({ path: `news/${s.slug}/index.html`, html: sectionPage(ctx, s) })),
    ...ALL_STORIES.map((s) => ({ path: `${s.href.slice(1)}index.html`, html: storyPage(ctx, s) })),
    { path: 'news/samples/index.html', html: samplesPage(ctx) },
    { path: 'news/alert/index.html', html: alertPage(ctx) },
    ...SAMPLES.map((s) => ({ path: `${s.href.slice(1)}index.html`, html: storyPage(ctx, s) })),
    ...readerPages(ctx),
    ...civicPages(ctx),
    ...habitPages(ctx),
    ...aboutPages(ctx, {
      corrections: correctionsLog().map((c) => ({ date: c.date, dateText: fmtDate(c.date), text: c.text, story: c.story })),
      storiesBy,
    }),
  ];
}
