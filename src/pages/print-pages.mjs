// The printed paper, laid out as web pages a browser prints at tabloid size.
//
//   /print/                  the editions
//   /print/2026-12/          the December 2026 edition: 16 pages, 11 by 17 inches
//   /print/2026-12/status/   what is ready, what each writer owes, and the
//                            checklist from here to the printer
//
// The page plan is src/print/edition-2026-12.mjs. History comes from the
// approved articles, stories from content/stories/, boxes from site data.
// News is never written here: a writer slot reads content/print/2026-12/<id>.md
// and shows the writer's brief until that file exists (CLAUDE.md, "Claude
// never writes news"). public/js/print-edition.js fits the pages in the
// browser; public/css/print-edition.css sets the paper.
import QRCode from 'qrcode';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { page, esc, t } from '../layout.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { ARTICLES } from '../data/history/index.mjs';
import { stories } from '../news/content.mjs';
import { splitFrontMatter, markdown } from '../news/markdown.mjs';
import { STAFF, person, staffList } from '../data/staff.mjs';
import { FIRST, MEALS } from '../data/help.mjs';
import { BODIES } from '../data/civic.mjs';
import { COMMERCE } from '../data/commerce.mjs';
import { directory, areaBySlug, catBySlug } from '../data/directory.mjs';
import { FREE } from '../data/free.mjs';
import { VISITORS_CENTER, TOURS } from '../data/visit.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';
import { MEMBERS, PRICE, SPOTS } from '../data/members.mjs';
import { PHOTOS } from '../site.mjs';
import { handEntered, inWindow } from '../event-feeds.mjs';
import { SOURCES as EVENT_SOURCES } from '../data/events.mjs';
import { dashes } from '../visible.mjs';
import { LABELS } from '../news/labels.mjs';
import { disclosures } from '../news/disclosure.mjs';
import { businessMedia } from '../data/media.mjs';
import { seriesBySlug, seriesHref } from '../news/series.mjs';
import { BRIEFS } from '../print/briefs.mjs';
import { almanac } from '../print/almanac.mjs';
import { buildCrossword, buildWordSearch, WORDSEARCH } from '../print/puzzles.mjs';
import { EDITION } from '../print/edition-2026-12.mjs';

const E = EDITION;
const BASE = `/print/${E.slug}/`;
const SLOT_DIR = new URL(`../../content/print/${E.slug}/`, import.meta.url);
const historyBy = Object.fromEntries(ARTICLES.map((a) => [`${a.group}/${a.slug}`, a]));
const storyBy = Object.fromEntries(stories.map((s) => [s.slug, s]));
const dirBy = Object.fromEntries(directory.map((b) => [b.slug, b]));
const name = (slug) => person(slug)?.name || '';
const BYB_HREF = seriesHref(seriesBySlug['back-your-blue']);
const short = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
// Every page here is a folder with an index.html; a trailing slash saves the
// phone a redirect after the scan.
const abs = (path) => (path.startsWith('http') ? path : ORIGIN + (/\/$|\.[a-z]+$/.test(path) ? path : path + '/'));
const words = (html) => String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

// ---------- Writer slots: content/print/2026-12/<id>.md ----------
// Front matter: headline, dek, kicker, bylines, editor, status (draft or
// ready), photo {file, alt, caption, credit, license}, box {title, items},
// results (election: list of {office, note, candidates: [{name, party, votes}]}).
// A writer marks what still needs confirming as [CHECK: ...]. The proof
// shows each one highlighted; a story with any left cannot be ready.
const markCheck = (html) => html.replace(/\[CHECK:?\s*([^\]]*)\]/g, (_, x) => `<mark class="pe-check">Check: ${x}</mark>`);

function loadSlot(id) {
  const file = new URL(`${id}.md`, SLOT_DIR);
  if (!existsSync(file)) return null;
  const { data, body } = splitFrontMatter(readFileSync(file, 'utf8'));
  const s = { id, headline: '', dek: '', kicker: '', bylines: [], editor: '', status: 'draft', ...data };
  s.bylines = [].concat(s.bylines || []);
  s.checks = ((body || '') + JSON.stringify(s.box || '')).match(/\[CHECK/g)?.length || 0;
  s.html = markCheck(markdown(body || ''));
  s.words = words(s.html.replace(/<mark class="pe-check">.*?<\/mark>/g, ''));
  const p = [];
  if (!s.headline) p.push('needs a headline');
  for (const b of s.bylines) if (!STAFF[b]) p.push(`byline "${b}" is not in src/data/staff.mjs`);
  if (!s.bylines.length && s.status === 'ready') p.push('needs a byline');
  if (s.editor && !STAFF[s.editor]?.editor) p.push(`editor "${s.editor}" is not a staff editor`);
  if (s.editor && s.bylines.includes(s.editor)) p.push('the editor cannot also be a byline (two-person rule)');
  if (s.status === 'ready' && !s.editor) p.push('a ready story needs an editor');
  if (s.status === 'ready' && s.checks) p.push(`${s.checks} [CHECK] notes still in the text`);
  if (s.photo?.file && s.photo.file.startsWith('/') && !existsSync(new URL(`../../public${s.photo.file}`, import.meta.url))) p.push(`photo ${s.photo.file} is not in public/`);
  if (s.photo?.file && !(s.photo.credit && s.photo.alt)) p.push('a photo needs alt text and a credit');
  s.problems = p;
  return s;
}
const SLOTS = {};
for (const pg of E.pages) for (const m of pg.rows.flatMap((r) => r.mods.flatMap((x) => (x.type === 'stack' ? x.mods : [x])))) if (m.type === 'writer') SLOTS[m.id] = { mod: m, page: pg.n, copy: loadSlot(m.id) };

// History cards for short columns: approved articles the edition does not
// already print, up to five per section, spread across the decades.
const USED = new Set([...(E.noCards || []), ...E.gathers.map((g) => g[0]), ...E.pages.flatMap((pg) => pg.rows.flatMap((r) => r.mods.flatMap((m) => (m.type === 'stack' ? m.mods : [m])))).filter((m) => m.type === 'history').map((m) => m.path)]);
const CARDS = Object.values(ARTICLES.filter((a) => a.status === 'approved' && a.kind === 'history' && a.group !== 'papers' && !USED.has(`${a.group}/${a.slug}`) && a.dek && a.dek.length < 260)
  .reduce((by, a) => { (by[a.section] ||= []).push(a); return by; }, {}))
  .flatMap((list) => list.sort((a, b) => String(a.when).localeCompare(String(b.when))).filter((_, i, all) => all.length <= 5 || i % Math.ceil(all.length / 5) === 0).slice(0, 5));

// ---------- QR codes ----------
// Every story ends with a code to its page online, where the sources are.
const qrUrls = new Set([`${ORIGIN}/help/`, `${ORIGIN}/newsletter/`, `${ORIGIN}/letters/`, `${ORIGIN}/tips/`, `${ORIGIN}/events/`, `${ORIGIN}/founders-club/`, `${ORIGIN}${BYB_HREF}`, `${ORIGIN}/order/`, `${ORIGIN}/history/`, `${ORIGIN}${BASE}`, `${ORIGIN}/about/standards/`, `${ORIGIN}/ask/`]);
for (const pg of E.pages) for (const m of pg.rows.flatMap((r) => r.mods.flatMap((x) => (x.type === 'stack' ? x.mods : [x])))) {
  if (m.type === 'history' && historyBy[m.path]) qrUrls.add(abs(historyBy[m.path].path));
  if (m.type === 'story' && storyBy[m.slug]) qrUrls.add(abs(storyBy[m.slug].href));
  if (m.fallback?.slug && storyBy[m.fallback.slug]) qrUrls.add(abs(storyBy[m.fallback.slug].href));
}
for (const [path] of E.gathers) if (historyBy[path]) qrUrls.add(abs(historyBy[path].path));
for (const a of CARDS) qrUrls.add(abs(a.path));
const QR = Object.fromEntries(await Promise.all([...qrUrls].map(async (u) => [u, await QRCode.toString(u, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#141310', light: '#ffffff00' } })])));
const qr = (url, label = 'Read it online, with its sources') => {
  const u = abs(url);
  const svg = (QR[u] || '').replace('<svg ', `<svg class="pe-qr-code" role="img" aria-label="QR code for ${esc(short(u))}" `);
  return `<div class="pe-qr">${svg}<p><b>${t(label)}</b><span>${esc(short(u))}</span></p></div>`;
};

// ---------- Pieces ----------
const kicker = (s) => (s ? `<p class="pe-kicker">${t(s)}</p>` : '');
const byline = (list, editor, extra = '') => {
  const by = list.map(name).filter(Boolean);
  return `<p class="pe-byline">${by.length ? `By ${t(by.join(' and '))}` : ''}${editor && name(editor) ? `${by.length ? ' · ' : ''}Edited by ${t(name(editor))}` : ''}${extra}</p>`;
};
// The print edition uses local copies of its Wikimedia photos when they
// exist (scripts/print-photos.mjs), so the PDF never waits on Wikimedia.
const psrc = (key) => (existsSync(new URL(`../../public/print-media/${key}.jpg`, import.meta.url)) ? `/print-media/${key}.jpg` : PHOTOS[key].src);
const photoFig = (p, cls = '') => {
  if (!p) return '';
  if (p.key && PHOTOS[p.key]) {
    const ph = PHOTOS[p.key];
    return `<figure class="pe-fig ${cls}"><img src="${esc(psrc(p.key))}" srcset="${esc(psrc(p.key))} 1280w" alt=""${esc(ph.title)}" style="object-position:${esc(ph.pos || '50% 50%')}"><figcaption>${t(p.caption || ph.title + '.')} <span class="pe-credit">Photo: ${t(ph.credit)}, ${t(ph.license)}, via Wikimedia Commons.</span>${p.note ? `<span class="pe-note">${t(p.note)}</span>` : ''}</figcaption></figure>`;
  }
  if (p.file) return `<figure class="pe-fig ${cls}"><img src="${esc(p.file)}" srcset="${esc(p.file)} 2000w" alt="${esc(p.alt || '')}"><figcaption>${t(p.caption || '')} <span class="pe-credit">Photo: ${t(p.credit || '')}${p.license ? `, ${t(p.license)}` : ''}</span></figcaption></figure>`;
  return `<figure class="pe-fig pe-fig-wanted ${cls}"><div class="pe-wanted"><b>Photo wanted</b><span>${t((p.note || '').replace(/^Photo wanted:\s*/, ''))}</span></div></figure>`;
};
const paras = (list) => list.map((x) => (x.startsWith('## ') ? `<h4>${t(x.slice(3))}</h4>` : `<p>${t(x)}</p>`)).join('');

// ---------- Modules ----------
function historyMod(m) {
  const a = historyBy[m.path];
  if (!a) throw new Error(`print: no history article ${m.path}`);
  const approved = a.status === 'approved';
  const cols = m.cols || m.span;
  const body = `<div class="pe-text" style="--cols:${cols}" data-fit="${m.fit === 'trim' ? 'trim' : 'report'}">${paras(a.body)}</div>`;
  const fig = m.layout === 'with-photo' ? photoFig(m.photo, 'pe-fig-side') : '';
  return `<article class="pe-mod pe-history${approved ? '' : ' pe-unapproved'}" data-kind="history" data-src="${esc(m.path)}">
    ${kicker(m.label || `From our history · ${a.when}`)}
    <h2 class="pe-hed pe-hed-${m.span}">${t(a.title)}</h2>
    <p class="pe-dek">${t(a.dek)}</p>
    <p class="pe-byline">Heart of Columbus history${a.editor && name(a.editor) ? ` · Approved by ${t(name(a.editor))}` : ''}</p>
    ${fig ? `<div class="pe-split">${fig}${body}</div>` : body}
    <div class="pe-endnote"><p class="pe-methods">An editor checked the article against the public sources listed online.</p>${qr(a.path)}</div>
    ${approved ? '' : '<p class="pe-flag">Awaiting editor approval</p>'}
  </article>`;
}

function storyMod(m, s = storyBy[m.slug]) {
  if (!s) throw new Error(`print: no published story ${m.slug}`);
  const cols = m.cols || m.span;
  const imgs = (s.images || []).slice(0, m.photos ?? 2);
  const wanted = !imgs.length && m.photo ? photoFig(m.photo, 'pe-fig-lead') : '';
  const figs = imgs.map((im, i) => `<figure class="pe-fig pe-story-fig${i === 0 ? ' pe-fig-lead' : ''}"><img src="${esc(im.file)}" srcset="${esc(im.file)} 2000w" alt="${esc(im.alt)}"><figcaption>${t(im.caption || '')} <span class="pe-credit">Photo: ${t(im.credit)}</span></figcaption></figure>`).join('');
  const flowAttr = m.flow ? ` data-flow-to="${esc(m.flow)}"` : '';
  return `<article class="pe-mod pe-story${m.big ? ' pe-big' : ''}" data-kind="story" data-src="${esc(s.href)}">
    ${kicker(s.label === 'Opinion' ? `${s.series ? seriesName(s.series) + ' · ' : ''}Opinion` : s.label)}
    <h2 class="pe-hed pe-hed-${m.span}">${t(s.headline)}</h2>
    ${s.dek ? `<p class="pe-dek">${t(s.dek)}</p>` : ''}
    ${byline(s.bylines, s.editor, ` · First published online ${esc(longDate(s.published))}`)}
    ${figs ? `<div class="pe-figs pe-figs-${imgs.length}">${figs}</div>` : wanted}
    <div class="pe-text pe-prose" style="--cols:${cols}" data-fit="${m.flow ? 'flow' : 'report'}"${flowAttr}>${printHtml(s.html)}</div>
    <div class="pe-endnote">${s.methods ? `<p class="pe-methods">${t(s.methods)}</p>` : ''}${qr(s.href)}</div>
  </article>`;
}
const seriesName = (slug) => seriesBySlug[slug]?.name || '';
// On paper a link is just words. A source linked at the end of a paragraph
// ("Reuters game recap and stats") reads as a stray phrase, so it goes; the
// QR code at the end of the story opens the version with every link.
const printHtml = (html) => html.replace(/([.!?”’)])\s*<a [^>]*>[^<]+<\/a>\s*(?=<\/p>)/g, '$1').replace(/<p>\s*<a [^>]*>[^<]+<\/a>\s*<\/p>/g, '');
const longDate = (iso) => new Date(String(iso).slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function briefBox(m) {
  const b = m.brief ? BRIEFS[m.brief] : null;
  const who = m.writer ? name(m.writer) : 'a reporter to be named';
  const ed = m.editor ? name(m.editor) : 'an editor';
  return `<div class="pe-brief">
    <p class="pe-brief-tag">Writer’s brief · not for print</p>
    <h3>Space for: ${t(m.working || b?.title || m.id)}</h3>
    <p class="pe-brief-who">About ${m.words} words by ${t(who)}, edited by ${t(ed)}. File it as <code>content/print/${E.slug}/${m.id}.md</code>.</p>
    ${m.guide ? `<p>${t(m.guide)}</p>` : ''}
    ${b ? `<h4>What the sources say</h4><ul>${b.facts.map(([f, v]) => `<li>${t(f)}${v ? ` <em class="pe-verify">${t(v)}</em>` : ''}</li>`).join('')}</ul>
    <h4>Ask</h4><p>${t(b.ask)}</p>
    <h4>Sources</h4><p class="pe-brief-src">${b.sources.map(([l, u]) => `${t(l)} <span>${esc(short(u))}</span>`).join(' · ')}</p>` : ''}
  </div>`;
}

// A story that features a business says what ties it to us, from the same
// rules the site uses (src/news/disclosure.mjs) plus the directory's `tie`.
function discloseFor(tags = []) {
  const lines = [...disclosures([].concat(tags || [])).map((d) => d.text), ...[].concat(tags || []).map((s) => dirBy[s]?.added?.tie).filter(Boolean)];
  return lines.length ? `<p class="pe-disclose"><b>Disclosure.</b> ${lines.map(t).join(' ')}</p>` : '';
}

function writerMod(m) {
  const slot = SLOTS[m.id];
  const c = slot.copy;
  if (!c && m.fallback?.type === 'story') return storyMod({ ...m, ...m.fallback, span: m.span, cols: m.cols, photos: m.photos });
  const layout = m.layout || 'normal';
  const cols = m.cols || (layout === 'lead' ? 2 : layout === 'wide' ? 3 : m.span);
  const head = c
    ? `${kicker(c.kicker || m.kicker || '')}<h2 class="pe-hed pe-hed-${layout === 'lead' ? 'lead' : m.span}">${t(c.headline)}</h2>${c.dek ? `<p class="pe-dek">${t(c.dek)}</p>` : ''}${byline(c.bylines, c.editor)}`
    : `${kicker(m.kicker || '')}<h2 class="pe-hed pe-hed-${layout === 'lead' ? 'lead' : m.span} pe-hed-working">${t(m.working || BRIEFS[m.brief]?.title || '')}</h2>`;
  const text = c ? `<div class="pe-text pe-prose" style="--cols:${cols}" data-fit="${m.flow ? 'flow' : 'report'}"${m.flow ? ` data-flow-to="${esc(m.flow)}"` : ''}>${c.html}</div>` : briefBox(m);
  const status = c ? (c.status === 'ready' && !c.problems.length ? '' : `<p class="pe-flag">${c.status === 'ready' ? 'Needs fixing: ' + t(c.problems.join('; ')) : 'Draft'}</p>`) : '<p class="pe-flag">Waiting for the writer</p>';
  const media = m.media ? businessMedia(m.media) : null;
  const photo = c?.photo ? photoFig(c.photo, 'pe-fig-lead') : media?.state === 'photo' ? `<figure class="pe-fig pe-fig-lead"><img src="${esc(media.src)}" srcset="${esc(media.src)} ${media.width}w" alt="${esc(media.alt || '')}"><figcaption><span class="pe-credit">Photo: ${t(media.credit || '')}</span></figcaption></figure>` : m.photo ? photoFig(m.photo, 'pe-fig-lead') : '';
  const side = layout === 'wide' && m.sidebar ? `<aside class="pe-sidebar"><h3>${t(c?.box?.title || m.sidebar)}</h3>${c?.box?.items ? `<ul>${c.box.items.map((i) => `<li>${t(i)}</li>`).join('')}</ul>` : '<p class="pe-empty">The writer fills this box with checked numbers.</p>'}</aside>` : '';
  const factBox = `<aside class="pe-sidebar pe-factbox"><h3>${t(c?.box?.title || m.sidebar || 'The project in numbers')}</h3>${c?.box?.items ? `<ul>${c.box.items.map((i) => `<li>${t(i)}</li>`).join('')}</ul>` : '<p class="pe-empty">The writer fills this box with checked numbers: the final cost, the money from each source, the opening dates.</p>'}</aside>`;
  const inner = layout === 'lead' ? `<div class="pe-lead"><div class="pe-lead-l">${photo}${factBox}</div><div class="pe-lead-text">${text}</div></div>`
    : layout === 'wide' ? `<div class="pe-wide">${text}${side}</div>`
    : layout === 'theme' ? `<div class="pe-theme-intro">${text}</div>`
    : `${photo}${text}`;
  const ties = c ? discloseFor(c.tags) : '';
  return `<article class="pe-mod pe-writer pe-layout-${layout}${c ? '' : ' pe-waiting'}" data-kind="writer" data-slot="${esc(m.id)}">${head}${inner}${ties}${status}</article>`;
}

// ---------- Boxes ----------
const BOX = {
  masthead: () => `<header class="pe-masthead">
    <div class="pe-ears"><p>Volume ${E.volume}, Number ${E.number}</p><p>${t(E.date)}</p></div>
    <h1 class="pe-nameplate">Heart <span>of</span> Columbus</h1>
    <p class="pe-badge" aria-hidden="true"><b>No. ${E.number}</b><span>${E.number === 1 ? 'First edition' : t(E.date)}</span></p>
    <p class="pe-motto">The local paper that shows its work. Every story ends with a code to its sources.</p>
    <div class="pe-dateline"><span>${t(E.line)}</span><span>Columbus, Indiana</span><span>Free</span><span>${esc(short(ORIGIN))}</span></div>
  </header>`,

  'teaser-referendum': () => {
    const c = SLOTS.referendum.copy;
    return `<section class="pe-box pe-teaser-box"><p class="pe-kicker">Schools · Page 3</p><h3>${t(c?.headline || 'The BCSC referendum, explained')}</h3><p>${t(c?.dek || 'What the “Vote yes” signs asked, what it costs and what it pays for.')}</p></section>`;
  },

  inside: () => `<section class="pe-box pe-inside"><h3>Inside</h3><ol>${E.pages.slice(1).filter((p, i, a) => !a[i - 1] || a[i - 1].section !== p.section).map((p) => `<li><span>${t(p.section)}</span><b>${p.n}</b></li>`).join('')}</ol></section>`,

  almanac: () => {
    const al = almanac(E.month.year);
    const day = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
    return `<section class="pe-box pe-almanac"><h3>The December sky</h3>
      <table><thead><tr><th></th><th>Sunrise</th><th>Sunset</th></tr></thead><tbody>${al.rows.map((r) => `<tr><th>${esc(day(r.date))}</th><td>${esc(r.rise)}</td><td>${esc(r.set)}</td></tr>`).join('')}</tbody></table>
      <p><b>Winter begins</b> ${esc(day(al.solstice.date))} at ${esc(al.solstice.time)}, the shortest day of the year: ${esc(al.shortest.len)} of daylight.</p>
      <p><b>Earliest sunset</b> ${esc(day(al.earliestSunset.date))}, ${esc(al.earliestSunset.set)}.</p>
      <p class="pe-fine">Computed for downtown Columbus with NOAA’s solar equations. Eastern Standard Time.</p></section>`;
  },

  teasers: () => `<section class="pe-box pe-teasers">${[...E.teasers].sort((a, b) => a.page - b.page).map((x) => `<a class="pe-teaser"><p class="pe-kicker">${t(x.kicker)} · Page ${x.page}</p><h3>${t(x.title)}</h3><p>${t(x.text)}</p></a>`).join('')}</section>`,

  staff: () => `<section class="pe-box pe-staffbox"><h3>Who makes this paper</h3><ul>${staffList().map((s) => `<li><b>${t(s.name)}</b><span>${t(s.role)}</span></li>`).join('')}</ul><p class="pe-fine">Heart of Columbus is independent and local. It is free to read.</p></section>`,

  reach: () => `<section class="pe-box"><h3>How to reach us</h3><ul class="pe-plain"><li><b>Tips</b> ${esc(short(ORIGIN))}/tips</li><li><b>Letters to the editor</b> ${esc(short(ORIGIN))}/letters</li><li><b>Questions</b> ${esc(short(ORIGIN))}/ask</li><li><b>Corrections</b> ${esc(short(ORIGIN))}/about/corrections</li></ul></section>`,

  coupon: (m) => couponHtml(m.coupon),

  'spot-head': () => `<header class="pe-spread-head"><p class="pe-kicker">Spotlight</p><h2>Three local businesses</h2><p class="pe-dek">Our December spotlights, picked by our publisher. Two are Founding Members who pay us for a website and a featured listing, and one is a business our publisher runs. Each one says so.</p></header>`,

  'how-we-work': () => `<section class="pe-box pe-how"><h3>How this paper works</h3><div class="pe-how-cols">
    <div><h4>Two people on every story</h4><p>A named person writes every story and a different person, an editor, approves it before it runs. Nobody approves their own work.</p></div>
    <div><h4>Sources</h4><p>Every story names who wrote it, who edited it and where the facts came from. The code at the end of each story opens it online with its sources.</p>
      <h4>Corrections</h4><p>When we get a fact wrong we fix it and say so, with the date. Corrections are never deleted.</p></div>
    <div><h4>What our labels mean</h4><dl>${Object.entries(LABELS).filter(([l]) => l !== 'Sponsored').map(([l, d]) => `<dt>${t(l)}</dt><dd>${t(d)}</dd>`).join('')}</dl></div>
  </div><p class="pe-fine">The whole of it, with the ethics code we follow: ${esc(short(ORIGIN))}/about/standards</p></section>`,

  survey: () => `<section class="pe-box pe-survey"><p class="pe-kicker">Your turn</p><h3>Tell us what to keep</h3><p>This is a first try at a printed Heart of Columbus. Mark it up, tear this page off and hand it back to anyone from the paper, or answer online.</p>
    <ol class="pe-q">
      <li><b>Which pages did you read first?</b><span class="pe-ln"></span></li>
      <li><b>Which would you skip?</b><span class="pe-ln"></span></li>
      <li><b>What is missing that you would read every month?</b><span class="pe-ln"></span><span class="pe-ln"></span></li>
      <li><b>Would you pick up a copy every month?</b><span class="pe-boxes"><span>Yes</span><span>Maybe</span><span>No</span></span></li>
      <li><b>Where should we leave copies?</b><span class="pe-ln"></span></li>
      <li><b>Anything else?</b><span class="pe-ln"></span><span class="pe-ln"></span></li>
    </ol>${qr('/letters/', 'Or answer online')}</section>`,

  standards: () => `<section class="pe-box pe-standards"><h3>Our standards, in brief</h3>
    <p><b>Sources.</b> Every story names who wrote it, who edited it and where the facts came from. The code at the end of each story opens it online with its sources.</p>
    <p><b>Corrections.</b> When we get a fact wrong we fix it and say so, with the date. Corrections are never deleted.</p>
    <p class="pe-fine">The full standards: ${esc(short(ORIGIN))}/about/standards</p></section>`,

  results: () => {
    const c = SLOTS.election.copy;
    const races = c?.results;
    if (!races?.length) return `<section class="pe-box pe-results pe-results-empty"><h3>Bartholomew County results</h3><p class="pe-kicker">Certified canvass, November 3, 2026</p>
      <table><thead><tr><th>Race</th><th>Candidates and votes</th></tr></thead><tbody>${['Recorder', 'Treasurer', 'Clerk', 'Auditor', 'County Commissioner, District 2', 'County Council', 'BCSC operating referendum', 'U.S. House, 6th District', 'U.S. House, 9th District'].map((r) => `<tr><th>${t(r)}</th><td class="pe-tbd">From the clerk’s certified canvass</td></tr>`).join('')}</tbody></table>
      <p class="pe-fine">The table fills from <code>results:</code> in content/print/${E.slug}/election.md. Print certified numbers only.</p></section>`;
    return `<section class="pe-box pe-results"><h3>Bartholomew County results</h3><p class="pe-kicker">${t(c.resultsLine || 'Certified canvass, November 3, 2026')}</p>
      <table><tbody>${races.map((r) => {
        const total = (r.candidates || []).reduce((n, x) => n + (Number(x.votes) || 0), 0);
        const counted = (r.candidates || []).every((x) => Number.isFinite(Number(x.votes)) && x.votes !== undefined && x.votes !== '');
        return `<tr class="pe-race"><th colspan="3">${t(r.office)}${r.note ? ` <span>${t(r.note)}</span>` : ''}</th></tr>${(r.candidates || []).map((x, i) => `<tr><td>${counted && i === 0 ? '✓ ' : ''}${t(x.name)}${x.party ? ` (${esc(x.party)})` : ''}</td>${counted ? `<td class="pe-num">${Number(x.votes).toLocaleString('en-US')}</td><td class="pe-num">${total ? ((100 * x.votes) / total).toFixed(1) + '%' : ''}</td>` : '<td class="pe-tbd" colspan="2">Certified count to come</td>'}</tr>`).join('')}`;
      }).join('')}</tbody></table>${c.resultsSource ? `<p class="pe-fine">${t(c.resultsSource)}</p>` : ''}</section>`;
  },

  civic: () => `<section class="pe-box pe-civic"><h3>Where decisions get made</h3><p class="pe-dek">The people on this page meet in public. Here is where to find their agendas.</p><ul class="pe-grid3">${BODIES.map((b) => `<li><b>${t(b.name)}</b><span>${t(b.note || '')}</span><em>${esc(short(b.url).split('/')[0])}</em></li>`).join('')}</ul></section>`,

  help: () => `<section class="pe-box pe-help"><h3>Help in Columbus</h3><p class="pe-dek">Numbers that answer tonight.</p>
    <ul class="pe-help-list">${FIRST.map((f) => `<li><b>${esc(f.number)}</b><span>${t(f.label)}</span><em>${t(f.note)}</em></li>`).join('')}</ul>
    <p>Food, rent and utility help, health care, recovery, jobs, legal help and ID: every resource in Columbus is on one page, with hours and where to apply.</p>
    ${qr('/help/', 'Every resource, on one page')}
    <p class="pe-fine">Most numbers come from United Way of Bartholomew County’s “United We Help” guide. Listing is not a referral or an endorsement. Hours change, so call first.</p></section>`,

  'spread-head': (m) => `<header class="pe-spread-head"><p class="pe-kicker">${t(m.kicker || 'From our history')}</p><h2>${t(m.title)}</h2><p class="pe-dek">${t(m.dek)}</p></header>`,

  'papers-timeline': () => {
    const list = ARTICLES.filter((a) => a.group === 'papers').sort((a, b) => String(a.when).localeCompare(String(b.when)));
    return `<section class="pe-box pe-timeline"><h3>The town’s papers, in our history</h3><ol>${list.map((a) => `<li><b>${t(a.when)}</b><span>${t(a.title)}</span></li>`).join('')}</ol><p class="pe-fine">Every one is online with its sources at ${esc(short(ORIGIN))}/history</p></section>`;
  },

  'then-and-now': () => `<section class="pe-box pe-then-now"><h3>Then and now on the river</h3><div class="pe-two">${photoFig({ note: 'Then: the old low head dam and riverbank, from the Bartholomew County Public Library archives, with permission.' })}${photoFig({ note: 'Now: the same view this winter, shot by Eli Wire.' })}</div><p class="pe-fine">The city removed the dam in September 2026. The lead story on page 1 has more.</p></section>`,

  'next-theme': () => `<section class="pe-box pe-next"><p class="pe-kicker">Next month</p><h3>The river</h3><p>Each edition follows one idea through the decades. December’s is where Columbus gathers (page 14). In January: the river, from the floods to Mill Race Park to the new riverfront.</p><p>Have a photo or a memory of the river? Send it to us at ${esc(short(ORIGIN))}/tips.</p></section>`,

  'byb-head': () => `<header class="pe-byb-head"><p class="pe-kicker">A new series</p><h2>Back YOUR Blue</h2><p class="pe-dek">Thank you stories about the people who served, and the people who serve. We start with our publisher’s, and we would like to print yours.</p></header>`,

  'byb-quote': (m) => {
    const plain = storyBy['my-father-my-hero'].body.replace(/[*_]/g, '');
    if (!plain.includes(m.quote)) throw new Error('print: the Back YOUR Blue pull quote must appear word for word in the story');
    return `<blockquote class="pe-pull">${t(m.quote)}</blockquote>`;
  },

  'byb-coupon': () => `<section class="pe-box pe-coupon"><p class="pe-kicker">Your turn</p><h3>Tell us about your Blue</h3><p>A parent, a neighbor, a teacher who served, an officer who showed up. Fill this in and hand it to anyone at Heart of Columbus, or tell us online.</p>
    <div class="pe-lines"><p>Their name</p><p>Who they are to you</p><p>How they served</p><p>What you want to say</p><p></p><p></p><p>Your name and how to reach you</p></div>
    ${qr(BYB_HREF, 'Or tell us online')}
    <p class="pe-fine">A person writes every story we print and an editor checks it. We will ask before we print yours.</p></section>`,

  'events-head': () => `<header class="pe-spread-head"><p class="pe-kicker">What’s on</p><h2>December in Columbus</h2><p class="pe-dek">The library, the parks, the Arts Council and the season’s big nights, from their own calendars.</p></header>`,

  calendar: () => {
    const from = `${E.month.year}-12-01`, to = `${E.month.year}-12-31`;
    const seed = inWindow(handEntered(), from, to);
    const y = E.month.year, al = almanac(y);
    const holidays = { [al.solstice.date]: 'Winter begins', [`${y}-12-24`]: 'Christmas Eve', [`${y}-12-25`]: 'Christmas', [`${y}-12-31`]: 'New Year’s Eve' };
    return `<section class="pe-box pe-calendar" data-calendar data-from="${from}" data-days="31" data-holidays="${esc(JSON.stringify(holidays))}">
      <p class="pe-cal-live"></p>
      <script type="application/json" class="pe-cal-seed">${JSON.stringify(seed).replace(/</g, '\\u003c')}</script>
      <div class="pe-cal-grid" aria-label="December calendar"></div>
      <div class="pe-cal-weekly"><h3>Every week</h3><ul></ul></div>
    </section>`;
  },

  'events-sources': () => `<section class="pe-box pe-cal-src"><p>Listings come from the public calendars of ${EVENT_SOURCES.filter((s) => s.id !== 'org').map((s) => t(s.name)).join(', ')}, and the organizers’ own pages. Times and places change; check with the organizer.</p>${qr('/events/', 'Every listing, kept current')}</section>`,

  'shop-guide': () => {
    const direct = Object.values(COMMERCE).filter((c) => c.order?.length || c.book?.length).length;
    return `<section class="pe-box pe-guide"><p class="pe-kicker">Shop small, order direct</p><h2 class="pe-hed pe-hed-3">Buy local this month without the app fee</h2>
    <div class="pe-text" style="--cols:2">
      <p>Ordering apps take a cut of every order, even when you drive over and pick the food up yourself. DoorDash charges restaurants 6 percent on pickup orders. Here is how to keep more of your money in town this December.</p>
      <h4>Order from their own page</h4><p>Many Columbus restaurants and shops take orders and bookings on their own websites, through services like Toast and Square. Our directory links straight to those pages for ${direct} local businesses.</p>
      <h4>Pick it up yourself</h4><p>Order from the business’s own page and drive over. No delivery app takes a cut, and you skip the delivery fee.</p>
      <h4>Give a gift card from the shop itself</h4><p>A gift card bought from the business keeps the money here. Below are local businesses that sell gift cards online, as their own websites show them.</p>
      <h4>Find them</h4><p>Every business in our directory has its own page, with the links it offers for ordering, booking and gift cards.</p>
    </div>${qr('/order/', 'Order and book direct')}</section>`;
  },

  'keep-math': () => {
    const o = 60, avg = 24, rate = 6, biz = 10, week = o * avg * (rate / 100) * biz;
    const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
    return `<section class="pe-box pe-math"><h3>Keep it in Columbus</h3><p class="pe-dek">The math, with the numbers from our website’s calculator.</p>
      <dl><dt>Pickup orders a week, at each restaurant</dt><dd>${o}</dd><dt>Average order</dt><dd>${usd(avg)}</dd><dt>App fee on pickup orders</dt><dd>${rate}%</dd><dt>Restaurants that switch to direct</dt><dd>${biz}</dd></dl>
      <p class="pe-big-num">${usd(week * 52)}<span>a year kept in Columbus, about ${usd(week)} a week</span></p>
      <p class="pe-fine">An estimate from the numbers above, not real sales data. Try your own numbers at ${esc(short(ORIGIN))}.</p></section>`;
  },

  'gift-cards': () => {
    const rows = Object.entries(COMMERCE).filter(([s, c]) => c.gift && dirBy[s]).map(([s, c]) => ({ b: dirBy[s], via: c.gift.label }));
    const byArea = {};
    for (const r of rows) (byArea[r.b.area] ||= []).push(r);
    const areas = Object.keys(byArea).sort((a, b) => (areaBySlug[a]?.label || a).localeCompare(areaBySlug[b]?.label || b));
    return `<section class="pe-box pe-gifts"><h3>Local gift cards you can buy online</h3><p class="pe-dek">${rows.length} Columbus businesses that sell gift cards on their own websites, by neighborhood. We list only what each one’s own site shows.</p>
      <div class="pe-gift-cols">${areas.map((a) => `<div class="pe-gift-area"><h4>${t(areaBySlug[a]?.label || a)}</h4><ul>${byArea[a].sort((x, y) => x.b.name.localeCompare(y.b.name)).map(({ b, via }) => `<li><b>${t(b.name)}</b><span>${t(b.address || '')}</span><em>Gift cards through ${t(via)}</em></li>`).join('')}</ul></div>`).join('')}</div>
      <p class="pe-fine">From the Heart of Columbus directory. A listing here is not an ad, and no business paid to be on it.</p></section>`;
  },

  free: () => `<section class="pe-box pe-free"><div class="pe-free-cols">${FREE.map((g) => `<div class="pe-free-group"><h4>${t(g.title)}</h4>${g.items.map((i) => `<div class="pe-free-item"><b>${t(i.name)}</b>${i.address ? `<span class="pe-addr">${t(i.address)}</span>` : ''}<p>${t(i.what)}${(i.more || []).map(([x]) => ` ${t(x)}`).join('')}</p><em>Source: ${esc(short(i.source).split('/')[0])}, checked ${esc(longDate(i.checked))}</em></div>`).join('')}</div>`).join('')}</div></section>`,

  sidewalk: (m) => `<section class="pe-box pe-sidewalk"><h3>See it from the sidewalk</h3><p class="pe-dek">Ten buildings that made Columbus famous. Looking costs nothing; the tours on this page go inside.</p>${(m.photos || []).length ? `<div class="pe-sw-photos">${m.photos.map((k) => `<figure class="pe-fig"><img src="${esc(psrc(k))}" srcset="${esc(psrc(k))} 1280w" alt="${esc(PHOTOS[k].title)}" style="object-position:${esc(PHOTOS[k].pos || '50% 50%')}"><figcaption>${t(PHOTOS[k].title)}. <span class="pe-credit">Photo: ${t(PHOTOS[k].credit)}, ${t(PHOTOS[k].license)}</span></figcaption></figure>`).join('')}</div>` : ''}<ol class="pe-sw">${LANDMARKS.map((l) => `<li><b>${t(l.name)}</b><span class="pe-addr">${t(l.address)} · ${t(l.architect)}, ${esc(l.year)}</span><p>${t(l.what)}</p></li>`).join('')}</ol><p class="pe-fine">From our landmark pages, each with its sources, at ${esc(short(ORIGIN))}/l</p></section>`,

  visitors: () => { const v = VISITORS_CENTER; return `<section class="pe-box pe-visitors"><h3>Start at the Visitors Center</h3><p class="pe-addr">${t(v.address)} · ${esc(v.phone)}</p><ul>${v.facts.map((x) => `<li>${t(x.text)}</li>`).join('')}</ul><p class="pe-fine">From the Visitors Center’s own pages, checked ${esc(longDate(v.checked))}. Holiday hours change; call first.</p></section>`; },

  tours: () => `<section class="pe-box pe-tours"><h3>Tours, and doing it yourself</h3><ul>${TOURS.facts.map((x) => `<li>${t(x.text)}</li>`).join('')}</ul></section>`,

  'order-direct': () => {
    const food = ['restaurants', 'coffee-sweets', 'bars'];
    const rows = Object.entries(COMMERCE).filter(([s, c]) => c.order?.length && dirBy[s] && food.includes(dirBy[s].cat)).map(([s, c]) => ({ b: dirBy[s], via: c.order[0].label }));
    const by = {};
    for (const r of rows) (by[r.b.cat] ||= []).push(r);
    return `<section class="pe-box pe-direct"><h3>Order straight from them</h3><p class="pe-dek">${rows.length} Columbus restaurants, coffee shops and bars that take orders on their own websites, as our directory found them. Order there, pick it up, and no delivery app takes a cut.</p>
      <div class="pe-gift-cols">${food.filter((c) => by[c]).map((c) => `<div class="pe-gift-area"><h4>${t(catBySlug[c].label)}</h4><ul>${by[c].sort((x, y) => x.b.name.localeCompare(y.b.name)).map(({ b, via }) => `<li><b>${t(b.name)}</b><span>${t(b.address || '')}</span><em>${/online ordering|their website/i.test(via) ? 'Orders on their own website' : `Orders through ${t(via.replace(/\s*\(.*\)$/, ''))}`}</em></li>`).join('')}</ul></div>`).join('')}</div>
      <p class="pe-fine">From the Heart of Columbus directory, which links each one’s ordering page. No business paid to be on this list.</p></section>`;
  },

  gathers: () => `<section class="pe-box pe-gathers"><ol>${E.gathers.map(([path, place, photo]) => {
    const a = historyBy[path];
    if (!a) throw new Error(`print: no history article ${path}`);
    return `<li class="pe-stop${a.status === 'approved' ? '' : ' pe-unapproved'}"><p class="pe-decade">${esc(path.split('/')[0])}</p>${photo && PHOTOS[photo] ? `<img src="${esc(psrc(photo))}" srcset="${esc(psrc(photo))} 1280w" alt="${esc(PHOTOS[photo].title)}" style="object-position:${esc(PHOTOS[photo].pos || '50% 50%')}">` : ''}<h4>${t(place)}</h4><p class="pe-stop-title">${t(a.title)}</p><p>${t(a.dek)}</p>${qr(a.path, 'The whole story')}</li>`;
  }).join('')}</ol><p class="pe-fine">Ten approved articles from our history, one per decade. Photos via Wikimedia Commons; credits on the back page.</p></section>`,

  meals: () => `<section class="pe-box pe-meals"><h3>Free community meals</h3><p class="pe-dek">Hot meals by day. Anyone who comes is welcome.</p><ul>${MEALS.filter(([, , w]) => !/closed[^)]*December/i.test(w)).map(([d, p, w]) => `<li><b>${t(d)}</b><span>${t(p)}</span><em>${t(w)}</em></li>`).join('')}</ul><p class="pe-fine">From United Way of Bartholomew County’s guide, as listed on our help page. Three meals that close in December are left off. Holiday hours change: call first.</p></section>`,

  crossword: () => {
    const cw = CW;
    return `<section class="pe-box pe-crossword"><p class="pe-kicker">Puzzles</p><h2 class="pe-hed pe-hed-3">The Columbus crossword</h2><p class="pe-dek">Every answer is in our history. Answers on page 16.</p>${cwGrid(cw, false)}</section>`;
  },

  clues: () => `<section class="pe-box pe-clues"><h3>Across</h3><ol>${CW.across.map((p) => `<li value="${p.n}"><b>${p.n}</b> ${t(p.clue)} (${p.word.length})</li>`).join('')}</ol><h3>Down</h3><ol>${CW.down.map((p) => `<li value="${p.n}"><b>${p.n}</b> ${t(p.clue)} (${p.word.length})</li>`).join('')}</ol></section>`,

  wordsearch: () => `<section class="pe-box pe-wordsearch"><h3>${t(WORDSEARCH.title)}</h3><p class="pe-dek">${t(WORDSEARCH.note)} Up, down, across and on the diagonal, forward and backward.</p>${wsGrid(WS, false)}<ul class="pe-wordlist">${WORDSEARCH.words.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></section>`,

  where: () => {
    const ph = PHOTOS.library;
    return `<section class="pe-box pe-where"><h3>Where in Columbus?</h3><p class="pe-dek">A close look at something downtown. Where is it? Answer on page 16.</p><div class="pe-crop"><img src="${esc(ph.src)}" alt="A close crop of a Columbus landmark" style="object-position:62% 55%"></div><p class="pe-fine">Photo: ${t(ph.credit)}, ${t(ph.license)}, via Wikimedia Commons.</p></section>`;
  },

  wallet: () => `<section class="pe-box pe-wallet"><p class="pe-scissors">✂ Cut out and keep</p><div class="pe-card">
    <div class="pe-card-l">${(QR[`${ORIGIN}/help/`] || '').replace('<svg ', '<svg class="pe-qr-code" role="img" aria-label="QR code for the help page" ')}<p>Every resource in Columbus, on one page</p></div>
    <div class="pe-card-r"><p class="pe-card-t">Need help? <b>Call 211</b></p><ul>${FIRST.slice(2).map((f) => `<li><span>${t(f.label.replace(/, single adults|, families with kids/, (m) => (m.includes('adults') ? ', adults' : ', families')))}</span><b>${esc(f.number)}</b></li>`).join('')}</ul><p class="pe-card-f">Text your ZIP to 898-211 · Emergency 911</p></div>
  </div></section>`,

  newsletter: () => `<section class="pe-box pe-newsletter"><h3>The paper, every morning</h3><p>A short email on weekday mornings: weather, stories and what’s on. Free.</p>${qr('/newsletter/', 'Sign up')}</section>`,

  letters: () => `<section class="pe-box pe-letters"><h3>Write to us</h3><p>This is a prototype. Tell us what you would keep, what you would cut and what you would pay for. Letters to the editor, tips and corrections are welcome.</p><ul class="pe-plain"><li><b>Letters</b> ${esc(short(ORIGIN))}/letters</li><li><b>Tips</b> ${esc(short(ORIGIN))}/tips</li></ul>${qr('/letters/', 'Write a letter')}</section>`,

  answers: () => `<section class="pe-box pe-answers"><h3>Answers</h3><div class="pe-ans-row"><div><h4>Crossword</h4>${cwGrid(CW, true)}</div><div><h4>Word search</h4>${wsGrid(WS, true)}</div></div><p><b>Where in Columbus?</b> ${t(PHOTOS.library.title)}, 536 Fifth Street.</p></section>`,

  founders: () => `<section class="pe-box pe-ad"><p class="pe-ad-tag">From Heart of Columbus, an ad for ourselves</p><h3>Own a local business? Be a Founder.</h3><p>The Founders Club is the local owners launching Heart of Columbus with us: your own website, kept current, and every new tool we build, for $${PRICE} a month. ${Math.max(0, SPOTS - Object.keys(MEMBERS).length)} of ${SPOTS} founding spots open. Cancel any time.</p><p><b>Your free listing never depends on it.</b></p>${qr('/founders-club/', 'Learn more')}</section>`,

  colophon: () => {
    const credits = [...new Set([...E.gathers.map((g) => g[2]).filter(Boolean), 'aerial', 'library', ...E.pages.flatMap((p) => p.rows.flatMap((r) => r.mods.flatMap((x) => x.photos && Array.isArray(x.photos) ? x.photos : [])))])].filter((k) => PHOTOS[k]).map((k) => `${t(PHOTOS[k].title)}: ${t(PHOTOS[k].credit)}, ${t(PHOTOS[k].license)}`);
    return `<section class="pe-box pe-colophon"><h3>About this edition</h3><p>${t(E.title)}, Volume ${E.volume}, Number ${E.number}, ${t(E.date)}. ${t(E.line)} Printed in a short run to see what a paper for Columbus should be. Everything in it is also online at ${esc(short(ORIGIN))}, with its sources.</p><p><b>Photo credits.</b> Wikimedia Commons: ${credits.join('; ')}. Story photos are credited where they appear.</p></section>`;
  },
};

// The puzzles are built once per build, so the grid and the key always match.
const CW = buildCrossword();
const WS = buildWordSearch();
function cwGrid(cw, solved) {
  return `<table class="pe-cw${solved ? ' pe-cw-solved' : ''}" aria-label="Crossword grid">${cw.grid.map((row, r) => `<tr>${row.map((ch, c) => (ch ? `<td>${cw.numbers.get(`${r},${c}`) ? `<sup>${cw.numbers.get(`${r},${c}`)}</sup>` : ''}${solved ? ch : ''}</td>` : '<td class="pe-cw-x"></td>')).join('')}</tr>`).join('')}</table>`;
}
function wsGrid(ws, solved) {
  const hit = new Set();
  if (solved) for (const w of ws.where) for (let i = 0; i < w.word.length; i++) hit.add(`${w.r + w.dr * i},${w.c + w.dc * i}`);
  return `<table class="pe-ws${solved ? ' pe-ws-solved' : ''}" aria-label="Word search">${ws.grid.map((row, r) => `<tr>${row.map((ch, c) => `<td${hit.has(`${r},${c}`) ? ' class="on"' : ''}>${ch}</td>`).join('')}</tr>`).join('')}</table>`;
}

function mod(m) {
  if (m.type === 'history') return historyMod(m);
  if (m.type === 'story') return storyMod(m);
  if (m.type === 'writer') return writerMod(m);
  if (m.type === 'flow') return `<article class="pe-mod pe-flow" data-flow-id="${esc(m.id)}"><p class="pe-jump">${t(m.label)}</p><div class="pe-text pe-prose" style="--cols:${m.span}"></div></article>`;
  if (m.type === 'stack') return `<div class="pe-stack">${m.mods.map(mod).join('')}</div>`;
  if (m.type === 'box') {
    if (!BOX[m.box]) throw new Error(`print: no box "${m.box}"`);
    return BOX[m.box](m);
  }
  throw new Error(`print: unknown module type ${m.type}`);
}

function sheet(pg) {
  const folio = pg.n === 1 ? '' : `<div class="pe-folio"><span>${pg.n % 2 ? `<i class="pe-sec">${t(pg.section)}</i>` : `<b class="pe-pn">${pg.n}</b>`}</span><span>Heart of Columbus · ${t(E.date)}</span><span>${pg.n % 2 ? `<b class="pe-pn">${pg.n}</b>` : `<i class="pe-sec">${t(pg.section)}</i>`}</span></div>`;
  return `<section class="pe-sheet${pg.spread ? ` pe-spread-${pg.spread}` : ''}" data-page="${pg.n}" data-topics="${esc((pg.topics || []).join(' '))}" aria-label="Page ${pg.n}">
  ${folio}
  <div class="pe-body">${pg.rows.map((row) => `<div class="pe-row${row.fill ? ' pe-fill' : ''}">${row.mods.map((m) => `<div class="pe-cell" style="grid-column:span ${m.span}">${mod(m)}</div>`).join('')}</div>`).join('')}</div>
</section>`;
}

// ---------- Coupons ----------
// Deals come from the business (the owner's word, relayed by the publisher
// for Amy's Closet; the publisher's own for Crossroads). Each is labeled as an
// ad, says what ties it to us, and keeps [CHECK] marks for the end date and
// terms until the business confirms them. `cap` is how many times the fitter
// may also drop it into a short column.
export const COUPONS = {
  crossroads: { slug: 'crossroads-wedding-co', cap: 4, big: '10% off', what: 'your booking with Crossroads Wedding and Event Co.',
    body: 'Wedding DJs, live acoustic sets, bartenders and day of coordination, from Columbus. Bring this coupon or mention Heart of Columbus when you book at crossroadsweddingco.shop.',
    terms: 'One per booking. [CHECK: expiration date, and whether it applies to every service.]' },
  amys: { slug: 'amys-closet', cap: 1, big: 'Spend $10, get $5', what: 'Spend $10 or more at Amy\u2019s Closet and get a $5 gift certificate.',
    body: 'Donated clothing, inspected three times, at 3928 25th Street. Open Tuesday through Saturday, 11 AM to 7 PM.',
    terms: 'Bring this coupon. [CHECK with Amy: the end date, and how many per visit.]' },
};
const couponHtml = (id) => {
  const c = COUPONS[id];
  const tie = disclosures([c.slug]).map((d) => d.text).concat(dirBy[c.slug]?.added?.tie || []).join(' ');
  return `<aside class="pe-coupon-ad" data-house="coupon-${id}" data-cap="${c.cap}"><p class="pe-ad-tag">✂ Ad · Clip and save</p><p class="pe-coupon-big">${t(c.big)}</p><p class="pe-coupon-what">${t(c.what)}</p><p>${t(c.body)}</p><p class="pe-fine">${markCheck(t(c.terms))}</p><p class="pe-fine">${t(tie)}</p></aside>`;
};

// ---------- House ads ----------
// Short pieces leave room at the bottom of a column. Like any paper, we fill
// it with ads for ourselves: the fitter (public/js/print-edition.js) measures
// each column and drops in the largest one that fits, each at most twice.
const HOUSE = [
  ['tips', 'Know something we should?', 'Tell us. A reporter reads every tip, and we never print your name without asking.', '/tips/', 'Send a tip'],
  ['byb', 'Back YOUR Blue', 'Tell Columbus about the person who served you: an officer, an EMT, a dispatcher, a veteran.', BYB_HREF, 'Tell us about your Blue'],
  ['newsletter', 'The paper, every morning', 'A short free email on weekday mornings: weather, stories and what’s on.', '/newsletter/', 'Sign up'],
  ['history', 'Every story here is online', 'With its sources, its writer and its editor, and corrections when we make them.', '/history/', 'Read our history'],
  ['help', 'Need help tonight? Call 211', 'Free, any hour, for food, shelter, rent and more. Every resource in town is on one page.', '/help/', 'Help in Columbus'],
  ['events', 'What’s on this week', 'The library, the parks and the season’s big nights, kept current every day.', '/events/', 'See this week'],
    ['standards', 'How we report', 'Two people on every story, sources with every story and corrections that are never deleted.', '/about/standards/', 'Read our standards'],
  ['ask', 'Ask us about Columbus', 'A question about the town, a building or a story? Ask it, and a person answers.', '/ask/', 'Ask a question'],
  ['letters', 'Write to the editor', 'Agree, disagree or tell us what we missed. We print letters with the writer’s name.', '/letters/', 'Write a letter'],
  ['order', 'Order direct, skip the app fee', 'Local restaurants and shops that take orders and bookings on their own pages.', '/order/', 'Order and book direct'],
];
const houseAds = () => `<template id="pe-fillers">${Object.keys(COUPONS).map(couponHtml).join('')}${CARDS.map((a) => `<aside class="pe-hcard" data-hist="${esc(a.group + '/' + a.slug)}" data-topic="${esc(a.section)}"><div><p class="pe-kicker">From our history · ${t(a.when)}</p><h3>${t(a.title)}</h3><p>${t(a.dek)}</p></div>${qr(a.path, 'The whole story')}</aside>`).join('')}${HOUSE.map(([id, h, p, path, label]) => `<aside class="pe-house" data-house="${id}"><div><p class="pe-house-tag">From Heart of Columbus</p><h3>${t(h)}</h3><p>${t(p)}</p></div>${qr(path, label)}</aside>`).join('')}</template>`;

// ---------- Readiness ----------
export function readiness() {
  const items = [];
  for (const [id, s] of Object.entries(SLOTS)) {
    const m = s.mod;
    const c = s.copy;
    items.push({ page: s.page, what: c?.headline || m.working || BRIEFS[m.brief]?.title || id, kind: 'Story', id,
      who: c?.bylines?.length ? c.bylines.map(name).join(' and ') : m.writer ? name(m.writer) : 'Writer to be named',
      editor: c?.editor ? name(c.editor) : m.editor ? name(m.editor) : '',
      state: c ? (c.status === 'ready' && !c.problems.length ? 'ready' : c.status === 'ready' ? 'fix' : 'draft') : m.optional ? 'optional' : 'missing',
      note: c ? [...c.problems, `${c.words} words of about ${m.words}`].join('; ') : m.optional ? 'Optional. Until it is filed, the page reprints the series’ first story.' : `About ${m.words} words. File content/print/${E.slug}/${id}.md.` });
  }
  const hist = E.pages.flatMap((pg) => pg.rows.flatMap((r) => r.mods).filter((m) => m.type === 'history').map((m) => ({ page: pg.n, m })));
  for (const { page: n, m } of hist) {
    const a = historyBy[m.path];
    items.push({ page: n, what: a.title, kind: 'History', id: m.path, who: 'Approved history', editor: a.editor ? name(a.editor) : '', state: a.status === 'approved' ? 'ready' : 'missing', note: `${a.words} words, sources checked ${a.checked}${m.fit === 'trim' ? '. May be cut to fit; the code links to the whole piece.' : ''}` });
  }
  for (const [path] of E.gathers) { const a = historyBy[path]; items.push({ page: 14, what: a.title, kind: 'History', id: path, who: 'Approved history', editor: a.editor ? name(a.editor) : '', state: a.status === 'approved' ? 'ready' : 'missing', note: 'One of December’s ten stops. The dek prints, with a code to the whole story.' }); }
  return items.sort((a, b) => a.page - b.page);
}

// Things only a person can do before the run goes to the printer.
export const TODO = [
  ['Back YOUR Blue', 'The story quotes Jake saying “you never gave me shit for it, Dad.” Decide whether the friends and family edition prints it as written. Page 8 also has room for a photo of Kevin Lee Kennedy, from the family.'],
  ['Photos', 'The front page lead uses a Wikimedia aerial as a stand in. Eli Wire shoots the riverfront this month; the river story’s file takes it as photo.'],
  ['Photo permissions', 'Ask the Bartholomew County Public Library archives for an old dam photo (page 7) and a 2008 flood photo (page 7).'],
  ['Domain', `Every QR code points to ${ORIGIN}. Scan a few from the proof with a phone before ordering the run.`],
  ['Calendar', 'Open the edition on the live site so page 11 fills from the library and parks calendars, then read every listing against its source.'],
  ['Election', 'Fill results: in content/print/2026-12/election.md from the clerk’s certified canvass only.'],
  ['Meals', 'Page 14’s meal list comes from United Way’s guide. Call each church for Christmas week hours.'],
  ['Proof', 'Print one proof copy and read every page on paper before ordering the run.'],
];

// ---------- Pages ----------
const editionPage = ({ assets }) => page({
  title: `${E.title}, ${E.date}: the print edition`,
  description: `The ${E.date} print edition of Heart of Columbus, laid out at tabloid size. ${E.line}`,
  path: BASE,
  styles: ['print-edition.css'], scripts: ['print-edition.js'], assets,
  head: '<link rel="preload" href="/fonts/newsreader-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>',
  body: `<div class="pe-toolbar" data-pe-toolbar>
    <p><b>${t(E.title)} · ${t(E.date)}</b> · 16 pages, 11 by 17 inches</p>
    <p class="pe-tb-status" data-pe-status>Fitting the pages…</p>
    <p class="pe-tb-actions"><a href="${BASE}status/">What’s left before printing</a><button type="button" data-pe-print>Print or save as PDF</button></p>
    <p class="pe-tb-help">In the print dialog: paper size Tabloid (11 by 17), margins None, scale 100%, background graphics on.</p>
  </div>
  <main id="main" class="pe-paper">${E.pages.map(sheet).join('\n')}${houseAds()}</main>`,
});

const STATE_LABEL = { ready: 'Ready', draft: 'Draft', fix: 'Needs fixing', missing: 'Missing', optional: 'Optional' };
const statusPage = ({ assets }) => {
  const items = readiness();
  const count = (s) => items.filter((i) => i.state === s).length;
  return page({
    title: `What’s left before printing: ${E.date} | Heart of Columbus`,
    description: 'Every story, page and task between the December 2026 prototype and the printer.',
    path: `${BASE}status/`, styles: ['print-edition.css'], assets,
    body: `<main id="main" class="pe-status">
      <p class="pe-kicker">Print edition · ${t(E.date)}</p>
      <h1>What’s left before printing</h1>
      <p class="pe-lede">${count('ready')} of ${items.length} pieces are ready. ${count('missing')} are waiting for a writer, ${count('draft')} are drafts${count('fix') ? `, ${count('fix')} need fixing` : ''}. <a href="${BASE}">Open the edition</a>.</p>
      <h2>Every piece, page by page</h2>
      <table class="pe-st"><thead><tr><th>Page</th><th>Piece</th><th>Writer</th><th>Editor</th><th>State</th><th>Notes</th></tr></thead><tbody>${items.map((i) => `<tr class="st-${i.state}"><td>${i.page}</td><td><b>${t(i.what)}</b><br><span>${t(i.kind)} · <code>${esc(i.id)}</code></span></td><td>${t(i.who)}</td><td>${t(i.editor)}</td><td><span class="pe-pill">${STATE_LABEL[i.state]}</span></td><td>${t(i.note)}</td></tr>`).join('')}</tbody></table>
      <h2>Before it goes to the printer</h2>
      <ol class="pe-todo">${TODO.map(([h, b]) => `<li><b>${t(h)}.</b> ${t(b)}</li>`).join('')}</ol>
      <h2>How a writer files a story</h2>
      <p>Each story is a Markdown file in <code>content/print/${E.slug}/</code>, named for its slot. The page shows the writer’s brief until the file exists, then the story. Set <code>status: ready</code> when the editor has checked it.</p>
      <pre class="pe-pre">---
headline: The river comes back
dek: One sentence under the headline.
bylines: [jacob-kennedy]
editor: terry-winchester-ii
status: draft
photo:
  file: /news-media/2026/12/riverfront.jpg
  alt: What the photo shows
  caption: One line about the photo.
  credit: Eli Wire
  license: Staff photo
---
The story, in plain paragraphs.</pre>
      <h2>Printing it</h2>
      <ul class="pe-todo"><li><b>Make the PDF.</b> Open the edition, wait for “All 16 pages fit”, then print: paper size Tabloid (11 by 17), margins None, scale 100%, background graphics on, and save as PDF. Or run <code>node scripts/print-pdf.mjs</code>, which writes the PDF and checks every page.</li>
      <li><b>Trim size</b> 11 by 17 inches, 16 pages. Everything sits inside a half inch margin, so the paper needs no bleed.</li>
      <li><b>Color.</b> The PDF is RGB. Most short run newspaper printers convert it; ask yours.</li>
      <li><b>Photos</b> should be 200 pixels per inch or more at printed size; the PDF script lists any that are not.</li>
      <li><b>Quotes.</b> Ask the Columbus press that prints The Republic, Newspaper Club and Mixam for 16 page tabloid, 100 and 200 copies (docs/paper/december-2026-prototype.md has prices).</li></ul>
    </main>`,
  });
};

const indexPage = ({ assets }) => page({
  title: 'The print edition | Heart of Columbus', description: 'Heart of Columbus in print.', path: '/print/', styles: ['print-edition.css'], assets,
  body: `<main id="main" class="pe-status"><p class="pe-kicker">In print</p><h1>Heart of Columbus in print</h1><ul class="pe-todo"><li><a href="${BASE}"><b>${t(E.date)}</b></a>: ${t(E.line)} <a href="${BASE}status/">What’s left before printing</a>.</li></ul></main>`,
});

export function printPages(ctx) {
  const out = [
    { path: 'print/index.html', html: indexPage(ctx) },
    { path: `print/${E.slug}/index.html`, html: editionPage(ctx) },
    { path: `print/${E.slug}/status/index.html`, html: statusPage(ctx) },
  ];
  // A writer's file with a dash in it would only fail at the end of the
  // build; name the file instead.
  for (const s of Object.values(SLOTS)) if (s.copy) { const d = dashes(`<p>${s.copy.html}</p><p>${esc(s.copy.headline)} ${esc(s.copy.dek)}</p>`); if (d.length) throw new Error(`content/print/${E.slug}/${s.mod.id}.md: no dashes a reader can see ("${d[0]}")`); }
  return out;
}

export const EDITION_DATA = { E, SLOTS, CW, WS, historyBy };
