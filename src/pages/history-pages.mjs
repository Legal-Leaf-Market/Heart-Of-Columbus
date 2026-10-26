// Columbus history (/history/): the front page, one page per decade and
// series, one per section, and one per article, plus /history/articles.json,
// the same articles with their print metadata for the magazine and newspaper.
// Articles come from src/data/history/; this file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs, PHOTOS } from '../site.mjs';
import { DECADES, SERIES, SECTIONS, ARTICLES, DECADE_ARTICLES, sectionBySlug, groupBySlug } from '../data/history/index.mjs';
import { landmarkBySlug } from '../data/landmarks.mjs';
import { ORIGIN } from '../jsonld.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const fmt = (n) => n.toLocaleString('en-US');
const crumbs = (...rest) => breadcrumbs([['/', 'Home'], ['/history/', 'History'], ...rest]);
const LENGTH = { brief: 'Brief', standard: 'Standard', feature: 'Feature' };

const mark = (s, cls = 'hx-mark') => `<img class="${cls}" src="/art/${s.art}" alt="" loading="lazy">`;
const secTag = (a) => `<a class="hx-sec" href="/history/section/${a.section}/">${esc(sectionBySlug[a.section].label)}</a>`;
const label = (a) => (a.kind === 'opinion' ? '<span class="hx-flag">Opinion</span>' : a.kind === 'essay' ? '<span class="hx-flag">Essay</span>' : a.kind === 'tribute' ? '<span class="hx-flag">From the archive</span>' : '');

// One article in a list.
const item = (a, { group = false } = {}) => `
<li class="hx-item">
  <a href="${a.path}">
    <span class="hx-when">${esc(a.when)}${group && a.decade ? ` · ${a.decade}` : ''}</span>
    <strong>${t(a.title)}</strong>
    <span class="hx-dek">${t(a.dek)}</span>
  </a>
  <span class="hx-meta">${label(a)}${secTag(a)}<span>${a.readMin} min read</span></span>
</li>`;

const intro = `Ten stories a decade, from the Depression to now. Each one is built from public sources, listed at its foot, and says so where they disagree. No made-up quotes, people or numbers.`;

function frontPage({ assets }) {
  const body = `
${header('', { alt: '' })}
<main id="main">
${breadcrumbs([['/', 'Home'], ['', 'History']])}
<section class="order-hero hx-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Columbus history</p>
    <h1>Columbus, Indiana,<br><span class="hl">decade by decade.</span></h1>
    <p class="lede">${esc(intro)}</p>
    <nav class="chips vs-jump" aria-label="Decades">${DECADES.map((d) => `<a class="pill" href="#d${d.slug}">${d.slug}</a>`).join('')}</nav>
    <nav class="chips vs-jump hx-secnav" aria-label="Sections">${SECTIONS.filter((s) => ARTICLES.some((a) => a.section === s.slug)).map((s) => `<a class="pill" href="/history/section/${s.slug}/">${mark(s, 'hx-pill-art')}${esc(s.label)}</a>`).join('')}</nav>
  </div>
</section>
<div class="wrap hx-front">
${SERIES.map((g) => `
<section class="hx-series" id="${g.slug}" aria-labelledby="${g.slug}-h">
  <p class="kicker">${esc(g.kicker)}</p>
  <h2 id="${g.slug}-h"><a href="/history/${g.slug}/">${t(g.title)}</a></h2>
  <p class="vs-lead">${t(g.lead)}</p>
  <ol class="hx-list hx-list-2">${g.items.map((a) => item(a, { group: true })).join('')}</ol>
</section>`).join('')}
${DECADES.map((d) => `
<section class="hx-decade" id="d${d.slug}" aria-labelledby="h${d.slug}" style="--pat:url('/art/${d.art}')">
  <header class="hx-dhead">
    <h2 id="h${d.slug}"><a href="/history/${d.slug}/">${d.title}</a></h2>
    <p>${fmt(d.pop[1])} people in Columbus at the ${d.pop[0]} census</p>
  </header>
  <ol class="hx-list hx-list-2">${d.items.map((a) => item(a)).join('')}</ol>
</section>`).join('')}
<p class="fine hx-foot">Population figures: U.S. census counts as listed on <a href="${DECADES[0].popSource}" target="_blank" rel="noopener">Wikipedia</a>. Heart of Columbus is not affiliated with the organizations, churches or businesses written about here. The same articles, with word counts and print lengths, are at <a href="/history/articles.json">articles.json</a>.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Columbus history, decade by decade | Heart of Columbus',
    description: `${DECADE_ARTICLES.length} sourced stories about Columbus, Indiana, from the 1930s to the 2020s: industry, architecture, faith, schools, the river and the people who built the town.`,
    body, scripts: ['site.js'], styles, assets,
  });
}

function groupPage(g, { assets }) {
  const isDecade = DECADES.includes(g);
  const i = DECADES.indexOf(g);
  const prev = DECADES[i - 1], next = DECADES[i + 1];
  const body = `
${header()}
<main id="main">
${crumbs(['', isDecade ? g.slug : g.title])}
<section class="order-hero hx-hero hx-ghero" style="--pat:url('/art/${g.art || 'pattern-arches.png'}')">
  <div class="wrap">
    <p class="kicker kicker-pill">${isDecade ? 'Columbus history' : esc(g.kicker)}</p>
    <h1>${t(g.title)}</h1>
    <p class="lede">${isDecade ? `${fmt(g.pop[1])} people lived in Columbus at the ${g.pop[0]} census. Ten stories from the decade.` : t(g.lead)}</p>
  </div>
</section>
<div class="wrap hx-front">
  <ol class="hx-list hx-list-1">${g.items.map((a) => item(a)).join('')}</ol>
  <nav class="hx-pager" aria-label="Decades">${prev ? `<a class="btn btn-sm btn-ghost" href="/history/${prev.slug}/">‹ ${prev.slug}</a>` : ''}<a class="btn btn-sm btn-ghost" href="/history/">All decades</a>${next ? `<a class="btn btn-sm btn-ghost" href="/history/${next.slug}/">${next.slug} ›</a>` : ''}</nav>
</div>
</main>
${footer()}`;
  return page({
    title: `${isDecade ? `Columbus in the ${g.slug}` : g.title} | Heart of Columbus`,
    description: isDecade ? `Ten sourced stories about Columbus, Indiana, in the ${g.slug}.` : g.lead,
    body, scripts: ['site.js'], styles, assets,
  });
}

function sectionPage(s, { assets }) {
  const items = ARTICLES.filter((a) => a.section === s.slug);
  const body = `
${header()}
<main id="main">
${crumbs(['', s.label])}
<section class="order-hero hx-hero">
  <div class="wrap hx-shead">
    ${mark(s, 'hx-big-art')}
    <div><p class="kicker kicker-pill">Section</p>
    <h1>${esc(s.label)}</h1>
    <p class="lede">${items.length} ${items.length === 1 ? 'story' : 'stories'}, oldest first.</p></div>
  </div>
</section>
<div class="wrap hx-front">
  <ol class="hx-list hx-list-1">${items.map((a) => item(a, { group: true })).join('')}</ol>
  <nav class="mini-cats hx-others" aria-label="Other sections">${SECTIONS.filter((x) => x.slug !== s.slug && ARTICLES.some((a) => a.section === x.slug)).map((x) => `<a href="/history/section/${x.slug}/">${mark(x, 'hx-pill-art')}${esc(x.label)}</a>`).join('')}</nav>
</div>
</main>
${footer()}`;
  return page({ title: `${s.label}: Columbus history | Heart of Columbus`, description: `Stories from the ${s.label} section of Columbus history on Heart of Columbus.`, body, scripts: ['site.js'], styles, assets });
}

function articlePage(a, { assets }) {
  const g = groupBySlug[a.group];
  const s = sectionBySlug[a.section];
  const lm = a.landmark && landmarkBySlug[a.landmark];
  const photo = lm ? PHOTOS[lm.slug] : null;
  const i = g.items.indexOf(a);
  const prev = g.items[i - 1], next = g.items[i + 1];
  const opinion = a.kind === 'opinion' || a.kind === 'essay';
  const body = `
${header()}
<main id="main">
${crumbs([`/history/${g.slug}/`, DECADES.includes(g) ? g.slug : g.title], ['', a.title])}
<article class="wrap hx-article">
  <header class="hx-ahead">
    <p class="kicker">${label(a)}<a href="/history/section/${s.slug}/">${esc(s.label)}</a> · ${esc(a.when)}</p>
    <h1>${t(a.title)}</h1>
    <p class="hx-adek">${t(a.dek)}</p>
    <p class="hx-byline">By ${esc(a.byline)} · ${a.readMin} min read · ${fmt(a.words)} words</p>
    ${a.status === 'draft' ? '<p class="hx-draft">Draft: awaiting editor approval</p>' : ''}
    ${a.note ? `<p class="vs-note vs-review">${t(a.note)}</p>` : ''}
  </header>
  ${photo ? `<figure class="hx-fig"><img src="${photo.src}" alt="${esc(lm.name)}" style="object-position:${photo.pos}"><figcaption>${t(lm.name)}. Photo: ${esc(photo.credit)}, ${esc(photo.license)}. <a href="${photo.page}" target="_blank" rel="noopener">Source</a></figcaption></figure>` : `<div class="hx-band" style="--pat:url('/art/${g.art || 'pattern-arches.png'}')">${mark(s, 'hx-band-art')}</div>`}
  <div class="hx-body">${a.body.map((p) => (p.startsWith('## ') ? `<h2>${t(p.slice(3))}</h2>` : `<p>${t(p)}</p>`)).join('')}</div>
  ${lm ? `<p class="btns hx-lm"><a class="btn btn-sm btn-ghost" href="/l/${lm.slug}/">${svg('pin', 'ic-sm')} Visit ${esc(lm.name)}</a></p>` : ''}
  ${a.sources.length ? `<section class="hx-sources" aria-labelledby="src-h"><h2 id="src-h">Sources</h2><ol>${a.sources.map(([l, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${t(l)}</a> <span class="vs-src">${esc(host(u))}</span></li>`).join('')}</ol>
  <h3>How we reported this</h3><p class="fine">${t(a.methods)}${a.checked ? ` Sources checked ${esc(a.checked)}.` : ''} Know something we got wrong? Tell us and we’ll fix it.</p></section>` : `<p class="fine">${opinion ? 'Opinion: the views here are the author’s.' : ''}</p>`}
  <nav class="hx-pager" aria-label="More from ${esc(g.slug)}">${prev ? `<a class="btn btn-sm btn-ghost" href="${prev.path}">‹ Previous</a>` : ''}<a class="btn btn-sm btn-ghost" href="/history/${g.slug}/">${DECADES.includes(g) ? `All of the ${g.slug}` : esc(g.title)}</a>${next ? `<a class="btn btn-sm btn-ghost" href="${next.path}">Next ›</a>` : ''}</nav>
</article>
</main>
${footer()}`;
  return page({
    title: `${a.title} | Columbus history | Heart of Columbus`, description: a.dek, body, scripts: ['site.js'], styles, assets,
    ld: opinion ? [] : [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.dek, url: ORIGIN + a.path, wordCount: a.words, articleSection: s.label, author: { '@type': 'Organization', name: a.byline }, citation: a.sources.map(([, u]) => u) }],
  });
}

// For the print and online magazine: everything a layout tool needs, no HTML.
export const articlesJson = () => JSON.stringify({
  generated: 'Heart of Columbus history', wordsPerColumnInch: 35, wordsPerMagazinePage: 500,
  sections: SECTIONS.map(({ slug, label }) => ({ slug, label })),
  articles: ARTICLES.map((a) => ({
    slug: a.slug, path: a.path, group: a.group, decade: a.decade, when: a.when, section: a.section, kind: a.kind, label: a.label,
    status: a.status, editor: a.editor, tags: a.tags, methods: a.methods, original: a.original || null,
    title: a.title, dek: a.dek, byline: a.byline, words: a.words, readMin: a.readMin, print: a.print,
    body: a.body, sources: a.sources.map(([label, url]) => ({ label, url })), checked: a.checked, note: a.note || null,
  })),
}, null, 1);

export const historyPages = (ctx) => [
  { path: 'history/index.html', html: frontPage(ctx) },
  ...[...DECADES, ...SERIES].map((g) => ({ path: `history/${g.slug}/index.html`, html: groupPage(g, ctx) })),
  ...SECTIONS.filter((s) => ARTICLES.some((a) => a.section === s.slug)).map((s) => ({ path: `history/section/${s.slug}/index.html`, html: sectionPage(s, ctx) })),
  ...ARTICLES.map((a) => ({ path: `history/${a.group}/${a.slug}/index.html`, html: articlePage(a, ctx) })),
];
