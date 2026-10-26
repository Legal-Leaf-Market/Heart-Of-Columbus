// "Shop small for the holidays" (/holidays/): Small Business Saturday, gift
// cards sold on each business's own page ("Give local"), local shops that
// sell online, and gifts downtown. Every list is computed from the directory.
// Gift-card links come from /api/probe through scripts/import-commerce.mjs.
// /es/holidays/ uses the same lists as plain Spanish cards; the spotlight and
// events stay on the English page because their text is English.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, rail, breadcrumbs } from '../site.mjs';
import { directory } from '../data/directory.mjs';
import { SMALL_BUSINESS_SATURDAY as SBS } from '../data/holidays.mjs';
import { eventsSection } from './events.mjs';
import { spotlightSection } from './spotlight.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { PAGES, FACTS, REVIEW_NOTE, CATEGORY, VISIT, esDate } from '../i18n/es.mjs';

const styles = ['hoc.css'];
const open = directory.filter((b) => !b.tempClosed);
const longDate = (s) => new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const byName = (a, b) => a.name.replace(/^the /i, '').localeCompare(b.name.replace(/^the /i, ''));

export const giftList = () => open.filter((b) => b.gift).sort(byName);
export const onlineList = () => open.filter((b) => b.feed || b.store).sort(byName);
export const downtownGifts = () => open.filter((b) => b.cat === 'shopping' && b.area === 'downtown' && b.sub !== 'smoke').sort(byName);

function holidayPage({ assets }) {
  const gifts = giftList(), online = onlineList(), downtown = downtownGifts();
  const treats = open.filter((b) => b.cat === 'coffee-sweets' && b.area === 'downtown').sort(byName);
  const body = `
${header('visit', { alt: '/es/holidays/' })}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', 'Shop small for the holidays']])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Shop small for the holidays</p>
    <h1>Give local<br><span class="hl">this year.</span></h1>
    <p class="lede">Small Business Saturday is <strong>${esc(longDate(SBS.date))}</strong>. Here are Columbus independents to shop that day and all season, including the ones you can buy from online without leaving their own website.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(SBS.text)} <a href="${SBS.source}" target="_blank" rel="noopener">${esc(host(SBS.source))}</a>. We link to each business’s own pages and take nothing.</span></p>
    <nav class="chips vs-jump" aria-label="On this page">${gifts.length ? '<a class="pill" href="#gift-cards">Gift cards</a>' : ''}${online.length ? '<a class="pill" href="#shop-online">Shop online</a>' : ''}<a class="pill" href="#downtown">Gifts downtown</a><a class="pill" href="#saturday">A Saturday plan</a></nav>
  </div>
</section>
${gifts.length ? `<section class="wrap hol-gifts" id="gift-cards">
  <div class="rail-head"><div><p class="kicker">Give local</p><h2>Gift cards, bought from them</h2></div></div>
  <ul class="hol-list">${gifts.map((b) => `<li><a class="hol-name" href="/b/${b.slug}/">${t(b.name)}</a><span>${esc(b.type)}</span><a class="btn btn-sm" href="${esc(b.gift.url)}" target="_blank" rel="noopener">${svg('heart', 'ic-sm')} Gift cards on ${esc(b.gift.label)}</a></li>`).join('')}</ul>
  <p class="fine">Each link goes to the gift-card page on the business’s own website or its own provider. The money goes to them; we take nothing.</p>
</section>` : ''}
${spotlightSection({ kicker: 'Shop small, start here', title: 'In the spotlight this season' })}
<div id="shop-online">${rail('Shop online, check out on their site', '/order/#stores', online, { kicker: 'From your couch', note: (b) => (b.feed ? 'Live catalog on our site, checkout on theirs' : 'Their own online store') })}</div>
<div id="downtown">${rail('Gifts downtown', '/n/downtown/', downtown, { kicker: 'Walk Washington Street' })}</div>
${rail('Something sweet on the way', '/n/downtown/', treats, { kicker: 'Coffee and sweets downtown' })}
<section class="wrap yw" id="saturday">
  <div class="rail-head"><div><p class="kicker">A Saturday plan</p><h2>Shop small on a Saturday</h2></div></div>
  <div class="yw-grid"><a class="yw-card" href="/trips/shop-small-saturday/"><span class="yw-day">Saturday · stops downtown</span><strong>Pastries, books, gifts, lunch and ice cream</strong><span>Each stop is a short walk from the last and open for its whole slot on a regular Saturday. Holiday hours can differ, so call ahead.</span></a></div>
</section>
${eventsSection({ mode: 'upcoming', id: 'whats-on', title: 'What’s on this season', kicker: 'Signature events' })}
<section class="wrap"><p class="fine hol-foot">Business details come from public listings and can change around the holidays. We are not affiliated with these businesses, and we never take payment or orders for them.</p></section>
</main>
${footer()}`;
  return page({
    title: 'Shop small for the holidays | Heart of Columbus',
    description: `Small Business Saturday in Columbus, Indiana is ${longDate(SBS.date)}. Independent shops, gift cards bought directly, and local stores that sell online.`,
    alternates: [['en', `${ORIGIN}/holidays/`], ['es', `${ORIGIN}/es/holidays/`]],
    body, scripts: ['site.js', 'hub.js', 'events.js'], styles, assets,
  });
}

// One Spanish card per business: name, category, address. The business pages
// themselves are still English.
const esList = (items, extra = () => '') =>
  `<ul class="hol-list">${items.map((b) => `<li><a class="hol-name" href="/b/${b.slug}/">${t(b.name)}</a><span>${esc(CATEGORY[b.cat])} · ${esc(b.address)}</span>${extra(b)}</li>`).join('')}</ul>`;

function esHolidayPage({ assets }) {
  const L = PAGES.holidays;
  const gifts = giftList(), online = onlineList(), downtown = downtownGifts();
  const treats = open.filter((b) => b.cat === 'coffee-sweets' && b.area === 'downtown').sort(byName);
  const sec = (id, kicker, title, items, extra, lead = '') => (items.length ? `
<section class="wrap hol-gifts" id="${id}">
  <div class="rail-head"><div><p class="kicker">${esc(kicker)}</p><h2>${esc(title)}</h2></div></div>
  ${lead ? `<p class="fine">${esc(lead)}</p>` : ''}${esList(items, extra)}
</section>` : '');
  const jump = [gifts.length && ['gift-cards', L.gifts[1]], online.length && ['shop-online', L.online[1]], ['downtown', L.downtown[1]], ['saturday', L.saturday[0]]].filter(Boolean);
  const [tripTitle, tripLead] = PAGES.trip.titles['shop-small-saturday'];
  const body = `
${header('visit', { lang: 'es', alt: '/holidays/' })}
<main id="main">
${breadcrumbs([['/', 'Inicio'], ['/es/visit/', 'Planee su visita'], ['', L.kicker]])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${esc(L.kicker)}</p>
    <h1>${esc(L.h1a)}<br><span class="hl">${esc(L.h1b)}</span></h1>
    <p class="lede">${L.lede(esc(esDate(SBS.date)))}</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(FACTS[SBS.text])} <a href="${SBS.source}" target="_blank" rel="noopener">${esc(host(SBS.source))}</a> (${esc(L.english)}). ${esc(L.take)}</span></p>
    <p class="vs-note vs-review">${esc(REVIEW_NOTE)}</p>
    <nav class="chips vs-jump" aria-label="En esta página">${jump.map(([id, label]) => `<a class="pill" href="#${id}">${esc(label)}</a>`).join('')}</nav>
  </div>
</section>
${sec('gift-cards', ...L.gifts, gifts, (b) => `<a class="btn btn-sm" href="${esc(b.gift.url)}" target="_blank" rel="noopener">${svg('heart', 'ic-sm')} ${esc(L.giftOn(b.gift.label))}</a>`, L.giftNote)}
${sec('shop-online', ...L.online, online, (b) => `<small>${esc(b.feed ? L.feed : L.store)}</small>`)}
${sec('downtown', ...L.downtown, downtown)}
${sec('sweets', ...L.sweets, treats)}
<section class="wrap yw" id="saturday">
  <div class="rail-head"><div><p class="kicker">${esc(L.saturday[0])}</p><h2>${esc(L.saturday[1])}</h2></div></div>
  <div class="yw-grid"><a class="yw-card" href="/es/trips/shop-small-saturday/"><span class="yw-day">${esc(L.tripDay)}</span><strong>${esc(tripTitle)}</strong><span>${esc(tripLead)} ${esc(L.call)}</span></a></div>
</section>
<section class="wrap"><p class="fine hol-foot">${esc(VISIT.english)} ${esc(L.foot)}</p></section>
</main>
${footer({ lang: 'es' })}`;
  return page({
    title: L.title, description: L.description(esDate(SBS.date)), lang: 'es',
    alternates: [['en', `${ORIGIN}/holidays/`], ['es', `${ORIGIN}/es/holidays/`]],
    body, scripts: ['site.js'], styles, assets,
  });
}

export const holidayPages = (ctx) => [
  { path: 'holidays/index.html', html: holidayPage(ctx) },
  { path: 'es/holidays/index.html', html: esHolidayPage(ctx) },
];
