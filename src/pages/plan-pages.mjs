// "Plan an event" (/plan/ and /plan/<track>/): the jobs a wedding, a corporate
// event or a private party needs filled, each with the Columbus businesses
// whose listings say they do that job (src/data/plan.mjs). A visitor picks a
// favorite in each, then shares or prints the list and contacts each business
// directly. Picks live only in that browser (public/js/plan.js); Heart of
// Columbus sends nothing and books nothing.
import { page, esc, t } from '../layout.mjs';
import { header, footer, card, svg, breadcrumbs } from '../site.mjs';
import { ROLES, TRACKS, vendorsFor, isDirect, isPick } from '../data/plan.mjs';
import { PRICE } from '../data/members.mjs';

const styles = ['hoc.css'];
const SHOW = 12; // cards per role before "See all"

const notes = () => `
  <p class="vs-note">${svg('globe', 'ic-sm')}<span>Each business is placed by what its listing says it is, not by whether it has done an event like yours. Ask about your date, size and budget. Heart of Columbus books nothing and takes no cut: you reach each one directly.</span></p>
  <p class="vs-note">♥ <span>Our picks come first: businesses our publisher recommends for that job. Nobody pays to be one.</span></p>
  <p class="vs-note">★ <span>Founding Members come next. They pay Heart of Columbus $${PRICE} a month and have no say in what we write. <a href="/founders-club/">About the Founders Club</a></span></p>`;

export function plannerControls(track, { focused = false } = {}) {
  return `<div class="pl-bar" data-plan-bar hidden>
  <div class="wrap"><p><strong data-plan-count>0</strong> <span data-plan-noun>picked</span> for your ${esc(track.label.toLowerCase().replace(/s$/, ''))}</p><button type="button" class="btn btn-sm" data-plan-open>See your team ${svg('arrow', 'ic-sm')}</button></div>
</div>
<dialog class="pl-team" data-plan-team aria-labelledby="pl-team-h">
  <div class="pl-team-head"><h2 id="pl-team-h">Your ${esc(track.label.toLowerCase().replace(/s$/, ''))} team</h2><button type="button" class="pl-x" data-plan-close aria-label="Close">×</button></div>
  <div class="pl-shared" data-plan-shared hidden><p>Someone shared this team with you.</p><button type="button" class="btn btn-sm" data-plan-keep>Keep it as my team</button></div>
  <ol class="pl-list" data-plan-list></ol>
  <p class="muted" data-plan-none>No picks yet. Tap “Pick” on a business to add it.</p>
  <p class="pl-actions"><button type="button" class="btn btn-sm" data-plan-share>${svg('share', 'ic-sm')} <span>Share this team</span></button><button type="button" class="btn btn-sm btn-ghost" data-plan-print>Print</button><button type="button" class="btn btn-sm btn-ghost" data-plan-clear>Start over</button></p>
  <p class="fine">Your picks stay on this device. Nothing is sent to the businesses: ${focused ? 'use the vendor’s phone or website to reach them.' : 'contact each one from its page.'}</p>
</dialog>
`;
}

export function roleSection(role, track, { renderVendor = null, open = false } = {}) {
  const r = ROLES[role];
  const all = vendorsFor(role);
  const vendors = renderVendor ? all.filter((b) => !b.tempClosed) : all.slice(0, SHOW);
  const items = vendors.map((b) => `
    <div class="pl-item${isPick(role, b.slug) ? ' is-pick' : ''}" data-slug="${b.slug}" data-name="${esc(b.name)}"${isDirect(b) ? ' data-direct' : ''}>
      ${isPick(role, b.slug) ? '<p class="pl-ourpick">♥ Our pick</p>' : ''}
      ${renderVendor ? renderVendor(b, role, r) : card(b, { compact: true })}
      <button type="button" class="btn btn-sm btn-ghost pl-pick" data-pick aria-pressed="false" hidden>+ Pick for ${esc(r.label.toLowerCase())}</button>
    </div>`).join('');
  if (renderVendor) return `
<details class="pl-role focus-plan-role" id="${role}" data-role="${role}" data-role-label="${esc(r.label)}"${open ? ' open' : ''}>
  <summary><strong>${esc(r.label)}</strong> <span>${vendors.length}</span></summary>
  <p class="focus-role-note">${esc(r.blurb)}</p>
  <div class="pl-row">${items}</div>
  <p class="pl-empty" hidden>No vendors in this category have direct online ordering or booking.</p>
</details>`;
  return `
<section class="pl-role" id="${role}" data-role="${role}" data-role-label="${esc(r.label)}" aria-labelledby="${role}-h">
  <div class="pl-role-head">
    <span class="pl-emoji" aria-hidden="true">${r.emoji}</span>
    <div><h2 id="${role}-h">${esc(r.label)}</h2><p>${esc(r.blurb)}</p></div>
    ${all.length > SHOW ? `<a class="see-all" href="${r.see}">See all ${all.length} ${svg('arrow', 'ic-sm')}</a>` : ''}
  </div>
  ${all.length ? `<div class="pl-row">${items}</div>` : ''}
  <p class="pl-empty" hidden>None of these can be booked or bought online yet. Turn off the filter above to see them all.</p>
  ${all.length < 3 ? `<p class="fine pl-more">Do this in Columbus? <a href="/owners/">Get listed free</a> and you show up here for every ${esc(track.label.toLowerCase().replace(/s$/, ''))} planner.</p>` : ''}
</section>`;
}

function trackPage(track, { assets }) {
  const body = `
${header('events')}
<main id="main" class="pl-page" data-plan="${track.slug}" style="--c:${track.color};--t:${track.tint}">
${breadcrumbs([['/', 'Home'], ['/plan/', 'Plan an event'], ['', track.label]])}
<section class="order-hero vs-hero pl-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${track.emoji} ${esc(track.kicker)}</p>
    <h1>${esc(track.title)}<br><span class="hl">${esc(track.hl)}</span></h1>
    <p class="lede">${esc(track.lede)}</p>
    <nav class="chips pl-tracks" aria-label="Kind of event">${TRACKS.map((x) => `<a class="pill" href="/plan/${x.slug}/"${x === track ? ' aria-current="page"' : ''}>${x.emoji} ${esc(x.label)}</a>`).join('')}</nav>
    <nav class="chips pl-jump" aria-label="Jobs to fill">${track.roles.map((r) => `<a class="pill" href="#${r}">${ROLES[r].emoji} ${esc(ROLES[r].label)}</a>`).join('')}</nav>
    <label class="pl-filter"><input type="checkbox" data-plan-direct> Only ones you can order, book or shop with online</label>
    ${notes()}
  </div>
</section>
<div class="wrap pl-roles">
${track.roles.map((r) => roleSection(r, track)).join('')}
</div>
${plannerControls(track)}
<section class="wrap vs-sec pl-listed"><span class="vs-emoji" aria-hidden="true">📣</span><div><h3>Missing someone?</h3><p>If you make weddings, events or parties happen in Columbus and you are not here, your free listing puts you in the right list.</p><p class="btns"><a class="btn btn-sm" href="/owners/">Get listed ${svg('arrow', 'ic-sm')}</a></p></div></section>
</main>
${footer()}`;
  return page({
    title: `${track.kicker}: local vendors in Columbus, Indiana | Heart of Columbus`,
    description: `${track.lede} Independent businesses in Columbus, Indiana.`,
    body, scripts: ['site.js', 'hub.js', 'plan.js'], styles, assets, path: `/plan/${track.slug}/`,
  });
}

function hubPage({ assets }) {
  const body = `
${header('events')}
<main id="main" class="pl-page">
${breadcrumbs([['/', 'Home'], ['/c/events/', 'Events & Weddings'], ['', 'Plan an event']])}
<section class="order-hero vs-hero pl-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">🗓️ Plan an event</p>
    <h1>Everything for the day,<br><span class="hl">from down the street.</span></h1>
    <p class="lede">Pick the kind of event, then pick a local business for each job: venue, food, flowers, balloons, music and the rest. Share the list with whoever is planning with you.</p>
    <p><a class="btn btn-ghost" href="/apps/weddings/">Open the Weddings &amp; Events app</a></p>
    ${notes()}
  </div>
</section>
<div class="wrap pl-hub">
  ${TRACKS.map((x) => {
    const n = new Set(x.roles.flatMap((r) => vendorsFor(r).map((b) => b.slug))).size;
    return `<a class="pl-track" href="/plan/${x.slug}/" style="--c:${x.color};--t:${x.tint}">
      <span class="pl-track-emoji" aria-hidden="true">${x.emoji}</span>
      <h2>${esc(x.label)}</h2>
      <p>${esc(x.lede)}</p>
      <ul>${x.roles.map((r) => `<li>${ROLES[r].emoji} ${esc(ROLES[r].label)}</li>`).join('')}</ul>
      <span class="btn btn-sm">${n} local businesses ${svg('arrow', 'ic-sm')}</span>
    </a>`;
  }).join('')}
</div>
<section class="wrap vs-sec pl-listed"><span class="vs-emoji" aria-hidden="true">🎧</span><div><h3>Looking for a DJ?</h3><p>Columbus DJs, with what each one’s own page says they do.</p><p class="btns"><a class="btn btn-sm" href="/djs/">Columbus DJs ${svg('arrow', 'ic-sm')}</a></p></div></section>
</main>
${footer()}`;
  return page({
    title: 'Plan a wedding, corporate event or party with Columbus businesses | Heart of Columbus',
    description: 'Venues, catering, flowers, balloons, music, photos and rentals from independent businesses in Columbus, Indiana, sorted by the job they do.',
    body, scripts: ['site.js', 'hub.js'], styles, assets, path: '/plan/',
  });
}

export const planPages = (ctx) => [
  { path: 'plan/index.html', html: hubPage(ctx) },
  ...TRACKS.map((x) => ({ path: `plan/${x.slug}/index.html`, html: trackPage(x, ctx) })),
];
