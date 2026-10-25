// One page per architecture landmark (/l/<slug>/): the photo and its credit,
// a few sourced facts, and the independents a short walk away. Walking times
// are straight-line estimates at about 80 m a minute, and say so.
import { page, esc, t } from '../layout.mjs';
import { header, footer, rail, svg, breadcrumbs } from '../site.mjs';
import { directory, km } from '../data/directory.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';

const styles = ['hoc.css'];
const M_PER_MIN = 80;
export const walkMin = (d) => Math.max(1, Math.round((d * 1000) / M_PER_MIN));
const host = (u) => new URL(u).hostname.replace(/^www\./, '');

// Places of one kind within `min` minutes on foot, nearest first.
// Measured from l.walkFrom when the landmark sets one.
const origin = (l) => (l.walkFrom ? l.walkFrom.ll : l.ll);
export function within(l, min, pick) {
  const o = origin(l);
  if (!o) return [];
  return directory
    .filter((b) => b.ll && pick(b))
    .map((b) => [km(o, b.ll), b])
    .filter(([d]) => walkMin(d) <= min)
    .sort((a, b) => a[0] - b[0])
    .map(([, b]) => b);
}

function landmarkPage(l, { assets }) {
  const p = l.photo;
  const o = origin(l);
  const walk = (b) => `About ${walkMin(km(o, b.ll))} min walk (estimate)`;
  const coffee = within(l, 5, (b) => b.cat === 'coffee-sweets');
  const food = within(l, 10, (b) => b.cat === 'restaurants');
  const shops = within(l, 10, (b) => b.cat === 'shopping' && b.sub !== 'smoke');
  const nearest = o && !coffee.length && !food.length && !shops.length
    ? directory.filter((b) => b.ll).map((b) => [km(o, b.ll), b]).sort((a, b) => a[0] - b[0]).slice(0, 12).map(([, b]) => b)
    : [];
  const map = l.ll ? `https://www.google.com/maps?q=${l.ll[0]},${l.ll[1]}&z=16&output=embed` : '';
  const others = LANDMARKS.filter((x) => x.slug !== l.slug);
  const body = `
${header('')}
<main id="main">
<section class="area-hero lm-hero">
  <img src="${p.src}" alt="${esc(l.name)}" style="object-position:${p.pos}">
  <span class="area-shade"></span>
  <div class="wrap area-hero-txt">
    ${breadcrumbs([['/', 'Home'], ['/#architecture', 'Architecture'], ['', l.name]])}
    <p class="kicker kicker-light">Landmark</p>
    <h1>${t(l.name)}</h1>
    <p>${esc(l.architect)}, ${l.year}</p>
    <small class="credit">Photo: ${esc(p.credit)}, ${esc(p.license)}. <a href="${p.page}" target="_blank" rel="noopener">Source</a></small>
  </div>
</section>
<section class="wrap lm-info">
  <div class="lm-facts">
    <p class="lm-what">${t(l.what)}</p>
    <dl>
      <div><dt>Designed by</dt><dd>${esc(l.architect)}</dd></div>
      <div><dt>Year</dt><dd>${l.year}</dd></div>
      <div><dt>Where</dt><dd>${esc(l.address)}, Columbus</dd></div>
      <div><dt>Seeing it</dt><dd>${l.street ? 'You can see it from the street, free.' : l.tour ? 'Only on the official tour.' : 'Indoors; check before you go.'}</dd></div>
    </dl>
    <p class="btns">${l.tour ? `<a class="btn btn-sm" href="${l.tour}" target="_blank" rel="noopener">Official tour ${svg('arrow', 'ic-sm')}</a>` : ''}<a class="btn btn-sm btn-ghost" href="/visit/#tours">Architecture tours</a><button type="button" class="btn btn-sm btn-ghost" data-save="l:${l.slug}" aria-pressed="false">${svg('heart', 'ic-sm')} <span data-save-label>Save</span></button></p>
    <p class="fine">Facts from <a href="${esc(l.source)}" target="_blank" rel="noopener">${esc(host(l.source))}</a>${l.ll ? `; map point from ${esc(l.llSource)}` : ''}. Checked ${esc(l.checked)}. Heart of Columbus is not the visitors bureau.</p>
  </div>
  ${map ? `<div class="side-card lm-map"><iframe title="Map of ${esc(l.name)}" loading="lazy" src="${map}" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
</section>
${o ? `<p class="wrap lm-walk muted">${l.walkFrom ? `Measured from ${esc(l.walkFrom.label)}. ` : ''}Walking times below are straight-line estimates at about ${M_PER_MIN} meters a minute. Streets add a little.</p>` : ''}
${rail('Coffee within a 5-minute walk', '/c/coffee-sweets/', coffee, { kicker: 'Close by', note: walk })}
${rail('Restaurants within a 10-minute walk', '/c/restaurants/', food, { kicker: 'Eat nearby', note: walk })}
${rail('Shops within a 10-minute walk', '/c/shopping/', shops, { kicker: 'On the way', note: walk })}
${rail('Closest independents', '', nearest, { kicker: 'A short drive', note: (b) => `About ${km(o, b.ll).toFixed(1)} km away` })}
<section class="wrap more-cats"><h2>More landmarks</h2>
  <div class="mini-cats">${others.map((x) => `<a href="/l/${x.slug}/">${svg('pin', 'ic-sm')} ${esc(x.name)}</a>`).join('')}</div>
</section>
</main>
${footer()}`;
  return page({
    title: `${l.name} | Columbus, Indiana architecture`,
    description: `${l.name} (${l.architect}, ${l.year}) in Columbus, Indiana, and the independent businesses a short walk away.`,
    body, scripts: ['site.js', 'hub.js'], styles, assets,
  });
}

export const landmarkPages = (ctx) => LANDMARKS.map((l) => ({ path: `l/${l.slug}/index.html`, html: landmarkPage(l, ctx) }));
