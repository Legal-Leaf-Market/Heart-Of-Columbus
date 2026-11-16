// Boost: a business pays to have its listing boosted for a set run.
//
// What a boost does:
//   - sorts the listing to the top of its category and neighborhood lists,
//   - features it in the Boosted row on the home page and on /events/
//     (slots 'home' and 'events'),
//   - shows it as one small side card on other business pages in its category
//     (slot 'side').
//
// The rules, each enforced in tests/promotions.test.mjs:
//   - Every boosted card says "Boosted · paid" wherever it is sorted up or
//     featured, and each row carries the disclosure line. The label and the
//     sort go together: a page never sorts a business up without saying so.
//   - Only a directory business, only with an agreement that is confirmed
//     (`confirmed`, `by`) and has `since` and `until`. A boost not running on
//     the build day is ignored entirely; featured rows and side cards also
//     come down in the browser on the day after `until`.
//   - The words are the owner's (`line`, `offer`), published as written.
//   - At most MAX featured per slot, in the order the agreements started.
//   - Search results never read it (Explore's Best match stays as typed), and
//     a boost has no say in what we write.
//
// Agreements live in src/data/sponsors.mjs beside the newspaper's sponsors,
// with `boost: true` and the slots below.
import { SPONSORS } from './data/sponsors.mjs';
import { directory, catBySlug } from './data/directory.mjs';
import { card } from './site.mjs';
import { esc, t } from './layout.mjs';

export const BOOST_SLOTS = ['home', 'events', 'side'];
export const MAX = 3;
export const DISCLOSURE = 'Boosted listings pay Heart of Columbus to be sorted up and featured. Search results, and what we write, never depend on it.';
export const TAG = '<span class="tag tag-boost">Boosted · paid</span>';

const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));
const day = (now) => now.toISOString().slice(0, 10);
const live = (s, now) => s && s.boost && s.confirmed && s.by && s.since && s.until && s.since <= day(now) && s.until >= day(now);

// Every boost running on the build day, oldest agreement first.
export function boosts({ now = new Date(), sponsors = SPONSORS } = {}) {
  return Object.entries(sponsors)
    .filter(([slug, s]) => bySlug[slug] && live(s, now))
    .map(([slug, s]) => ({ ...s, slug, b: bySlug[slug] }))
    .sort((a, z) => a.since.localeCompare(z.since) || a.slug.localeCompare(z.slug));
}
export const isBoosted = (slug, opts) => boosts(opts).some((x) => x.slug === slug);

// Boosted listings first (in agreement order), then the list as it was.
export function boostFirst(list, opts) {
  const on = boosts(opts).map((x) => x.slug);
  // Marked, so the card that draws it says Boosted wherever the list goes.
  const up = on.map((s) => list.find((b) => b.slug === s)).filter(Boolean).map((b) => ({ ...b, boosted: true }));
  return [...up, ...list.filter((b) => !on.includes(b.slug))];
}

// A featured row for a slot ('home' or 'events'). Empty when nothing runs.
export function boostedRow(slot, { title = 'Boosted local businesses', id = '', ...opts } = {}) {
  const list = boosts(opts).filter((x) => (x.slots || []).includes(slot)).slice(0, MAX);
  if (!list.length) return '';
  return `
<section class="wrap promo"${id ? ` id="${id}"` : ''} aria-label="Boosted listings">
  <div class="promo-head"><p class="kicker">Boosted</p><h2>${esc(title)}</h2></div>
  <div class="promo-grid">${list.map((p) => `<div class="promo-item" data-ends="${p.until}">
    ${card(p.b, { boosted: true })}
    ${p.line ? `<p class="promo-line">${t(p.line)}</p>` : ''}
    ${p.offer ? `<p class="promo-offer"><strong>Offer:</strong> ${t(p.offer)}${p.offerEnds ? ` Ends ${esc(p.offerEnds)}.` : ''}</p>` : ''}
  </div>`).join('')}</div>
  <p class="fine promo-note">${DISCLOSURE} <a href="/owners/#boost">How boosting works</a></p>
</section>`;
}

// One small side card on a business page: a boosted business in the same
// category, never the page's own business.
export function boostedSide(b, opts) {
  const p = boosts(opts).find((x) => (x.slots || []).includes('side') && x.slug !== b.slug && x.b.cat === b.cat);
  if (!p) return '';
  return `<div class="side-card promo-side" data-ends="${p.until}" aria-label="Boosted listing">
    <div class="side-body"><p class="kicker">Boosted · paid</p>
    <p><a href="/b/${p.slug}/"><strong>${t(p.b.name)}</strong></a><br><span class="muted">${esc(catBySlug[p.b.cat].label)}${p.line ? `. ${t(p.line)}` : ''}</span></p>
    <p class="fine">${DISCLOSURE}</p></div></div>`;
}

// The disclosure on a boosted business's own page, while it runs.
export function boostNote(b, opts = {}) {
  const p = boosts(opts).find((x) => x.slug === b.slug);
  if (!p) return '';
  return `<p class="direct-note promo-own" data-ends="${p.until}">${TAG} <span>${t(b.name)} pays Heart of Columbus to boost this listing until ${esc(p.until)}. It has no say in what we write or how search ranks.</span></p>`;
}
