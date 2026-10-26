// Sponsor slots: the only places a sponsor appears. Always labeled
// "Sponsored", never inside a story, and only while the agreement runs.
import { SPONSORS } from '../data/sponsors.mjs';

const h = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const SLOTS = ['front', 'newsletter', 'section'];

export function sponsorsFor(slot, now = new Date(), sponsors = SPONSORS) {
  const day = now.toISOString().slice(0, 10);
  return Object.entries(sponsors).filter(([, s]) => (s.slots || []).includes(slot) && s.since <= day && (!s.until || s.until >= day)).map(([slug, s]) => ({ slug, ...s }));
}

export function sponsorSlot(slot, opts = {}) {
  const list = sponsorsFor(slot, opts.now, opts.sponsors);
  if (!list.length) return '';
  return `<aside class="np-box np-sponsor" aria-label="Sponsored"><p class="np-sponsor-tag">Sponsored</p>${list.map((s) => `<p><strong>${h(s.name)}</strong>. ${h(s.line)} ${s.url ? `<a href="${h(s.url)}" target="_blank" rel="noopener sponsored">Visit</a>` : ''}</p>`).join('')}<p class="np-wx-src">Sponsors have no say in our coverage. <a href="/about/#funding">About our funding</a></p></aside>`;
}
