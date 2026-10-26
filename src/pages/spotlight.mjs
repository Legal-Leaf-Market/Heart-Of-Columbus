// The spotlight: big cards for the businesses in data/spotlight.mjs, and the
// "Owner's picks" section on each one's own page. Facts come from the
// directory; picks come only from the owner, and empty slots say so.
import { esc, t } from '../layout.mjs';
import { directory, catBySlug, subBySlug, areaBySlug } from '../data/directory.mjs';
import { SPOTLIGHT, PICK_SLOTS } from '../data/spotlight.mjs';
import { svg, tel, coverArt } from '../site.mjs';

const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));
export const spotlit = () => SPOTLIGHT.map((s) => ({ ...s, b: bySlug[s.slug] })).filter((s) => s.b);
export const spotFor = (slug) => spotlit().find((s) => s.slug === slug) || null;

// The owner's picks, then empty slots up to PICK_SLOTS, numbered.
const pickRows = (picks, { notes = false } = {}) => {
  const rows = picks.map((p, i) => `<li class="sp-pick"><span class="sp-n">${i + 1}</span><span><strong>${t(p.name)}</strong>${notes && p.note ? `<span class="sp-why">${t(p.note)}</span>` : ''}</span></li>`);
  for (let i = picks.length; i < PICK_SLOTS; i++)
    rows.push(`<li class="sp-pick is-empty"><span class="sp-n">${i + 1}</span><span><strong>Coming from the owner</strong><span class="sample">placeholder</span></span></li>`);
  return `<ol class="sp-picks">${rows.join('')}</ol>`;
};

const mainAction = (b) =>
  b.order[0] ? `<a class="btn btn-sm btn-ghost" href="${esc(b.order[0].url)}" target="_blank" rel="noopener">${svg('store', 'ic-sm')} Order online</a>`
  : b.book[0] ? `<a class="btn btn-sm btn-ghost" href="${esc(b.book[0].url)}" target="_blank" rel="noopener">${svg('store', 'ic-sm')} Check a date</a>`
  : b.phone ? `<a class="btn btn-sm btn-ghost" href="${tel(b.phone)}">${svg('phone', 'ic-sm')} Call</a>`
  : '';

export function spotCard({ b, picks }) {
  const cat = catBySlug[b.cat], sub = subBySlug[b.sub], area = areaBySlug[b.area];
  return `
<article class="sp-card" style="--c:${cat.color};--t:${cat.tint}">
  <a class="sp-cover pat-arch" href="/b/${b.slug}/" tabindex="-1" aria-hidden="true">
    ${coverArt(b.sub)}
    <span class="sp-emoji">${sub.emoji}</span>
    <span class="sp-flag">★ Spotlight</span>
  </a>
  <div class="sp-body">
    <p class="kicker">${esc(sub.label)}${area ? ` · ${esc(area.label)}` : ''}</p>
    <h3><a href="/b/${b.slug}/">${t(b.name)}</a></h3>
    <p class="sp-type">${t(b.type)}</p>
    <p class="sp-addr">${svg('pin', 'ic-xs')} ${b.address ? t(b.address) + ', ' : ''}Columbus, Indiana</p>
    <div class="sp-picks-box"><p class="sp-picks-h">Owner’s picks</p>${pickRows(picks)}</div>
    <div class="sp-actions"><a class="btn btn-sm" href="/b/${b.slug}/#owners-picks">See the listing ${svg('arrow', 'ic-sm')}</a>${mainAction(b)}</div>
  </div>
</article>`;
}

// only: limit to slugs, cats or areas (the band shows nothing if none match).
export function spotlightSection({ id = 'spotlight', kicker = 'Spotlight', title = 'Three Columbus independents to know', sub = '', only = null } = {}) {
  const items = spotlit().filter((s) => !only || only(s.b));
  if (!items.length) return '';
  const lead = sub || (items.length > 1 ? 'Featured up front, each with picks from the owner.' : 'Featured up front, with picks from the owner.');
  return `
<section class="wrap sp-band" id="${id}" aria-labelledby="${id}-h">
  <div class="sp-head"><div><p class="kicker">${esc(kicker)}</p><h2 id="${id}-h">${esc(title)}</h2><p class="sub">${esc(lead)} Picks marked <span class="sample">placeholder</span> are open until the owner sends theirs.</p></div></div>
  <div class="sp-grid sp-n-${items.length}">${items.map(spotCard).join('')}</div>
</section>`;
}

// On the business's own page.
export function ownersPicks(b) {
  const s = spotFor(b.slug);
  if (!s) return '';
  return `
<section class="wrap sp-own" id="owners-picks" aria-labelledby="owners-picks-h" style="--c:${catBySlug[b.cat].color};--t:${catBySlug[b.cat].tint}">
  <div class="sp-own-box">
    <div>
      <p class="kicker">★ Spotlight</p>
      <h2 id="owners-picks-h">Owner’s picks</h2>
      <p class="sub">${s.picks.length ? `Chosen by the owner of ${t(b.name)}, in their words.` : `What the owner of ${t(b.name)} would point you to first. These slots stay empty until the owner sends their picks; we don’t write them for them.`}</p>
    </div>
    ${pickRows(s.picks, { notes: true })}
    ${s.picks.length < PICK_SLOTS ? `<p class="fine">Own ${t(b.name)}? <a href="/owners/?b=${b.slug}#claim">Send us your picks</a> and we’ll put them here.</p>` : ''}
  </div>
</section>`;
}
