// The floating "Need help?" dock: a button on every directory and paper page
// that opens Help in Columbus in a sheet. Tap-to-call lines first (FIRST in
// src/data/help.mjs), then a search over every sourced resource
// (/help/index.json, fetched on first open), topic chips into /help/, the
// wallet card, and a quick exit. Only entries that carry a source appear.
// public/js/help-dock.js runs it; src/layout.mjs loads that script on any
// page whose markup has data-help-dock. Spanish pages get a plain link to
// /help/ (English), since every sourced line there would need a reviewed
// translation first.
import { esc } from './layout.mjs';
import { HELP, FIRST, CHECKED } from './data/help.mjs';

const buoy = '<svg viewBox="0 0 24 24" class="hd-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/></svg>';
const x = '<svg viewBox="0 0 24 24" class="hd-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const tel = (n) => 'tel:' + (n.replace(/\D/g, '').length === 10 ? '+1' : '') + n.replace(/\D/g, '');
const when = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });

export function helpDock({ lang = 'en' } = {}) {
  if (lang === 'es') return `<a class="hd-fab hd-fab-link" href="/help/" aria-label="Ayuda en Columbus (en inglés)">${buoy}<span>Ayuda</span></a>`;
  const tiles = FIRST.map((f, i) => `<li class="hd-tile${i === 0 ? ' is-911' : ''}"><a href="${tel(f.number)}"><span class="hd-num">${esc(f.number)}</span><span class="hd-lab">${esc(f.label)}</span><span class="hd-note">${esc(f.note)}</span></a>${f.number === '211' ? '<a class="hd-sms" href="sms:898211">Text your ZIP to 898-211</a>' : ''}</li>`).join('');
  const chips = HELP.map((g) => `<a class="hd-chip" href="/help/#${esc(g.id)}"><span aria-hidden="true">${g.emoji}</span>${esc(g.title)}</a>`).join('');
  return `
<button type="button" class="hd-fab" data-help-dock aria-haspopup="dialog" aria-controls="hd-sheet">${buoy}<span>Need help?</span></button>
<dialog class="hd-sheet" id="hd-sheet" aria-labelledby="hd-h" data-help-sheet>
  <div class="hd-head">
    <div><p class="hd-k">Free and confidential</p><h2 id="hd-h">Help in Columbus</h2></div>
    <form method="dialog"><button class="hd-x" aria-label="Close">${x}</button></form>
  </div>
  <ul class="hd-tiles" role="list">${tiles}</ul>
  <label class="hd-search"><span class="sr-only">Search help</span>${'<svg viewBox="0 0 24 24" class="hd-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'}<input type="search" data-help-q placeholder="Food, rent, a ride, an ID, a doctor…" autocomplete="off" enterkeyhint="search"></label>
  <ul class="hd-results" data-help-results role="list" aria-live="polite"></ul>
  <p class="hd-sub">What do you need?</p>
  <div class="hd-chips">${chips}</div>
  <div class="hd-foot">
    <a class="hd-btn" href="/help/">The whole guide</a>
    <a class="hd-btn" href="/help/card/">Print a wallet card</a>
    <button type="button" class="hd-btn hd-exit" data-help-exit title="Leaves this site right away">Leave this site fast</button>
  </div>
  <p class="hd-fine">Numbers come from United Way of Bartholomew County’s United We Help guide and each agency’s own page, checked ${esc(when(CHECKED))}. Not affiliated with any agency. If someone is in danger, call 911.</p>
</dialog>`;
}
