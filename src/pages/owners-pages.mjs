// For business owners: what Heart of Columbus can do for a listing, and the
// claim form (/owners/), plus the private lead inbox (/owners/inbox/?k=).
import { page } from '../layout.mjs';
import { header, footer, svg } from '../site.mjs';
import { directory } from '../data/directory.mjs';

const styles = ['hoc.css'];

const TIERS = [
  ['fix', '✏️', 'Fix your listing', 'Hours, phone, website, photos, the right category. Free, always.'],
  ['link', '🔗', 'Link your own ordering or booking', 'Already on Toast, Square, Vagaro, Booksy, Shopify? Your "Order online" or "Book online" button goes straight there. We take nothing.'],
  ['pickup', '🛍️', 'Take pickup orders here', 'No ordering system yet? Customers send their order through Heart of Columbus, you get it on a live counter board on any phone or tablet, they pay you at pickup.'],
  ['storefront', '🏪', 'Get a full storefront', 'A site that looks like your place, with your real menu or services, like Jill’s Diner.'],
];

function ownersPage({ assets }) {
  const n = directory.length;
  const body = `
${header('')}
<main id="main">
<section class="order-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">For business owners</p>
    <h1>Your place is already here.<br><span class="hl">Make it yours.</span></h1>
    <p class="lede">${n} independent Columbus businesses are listed on Heart of Columbus from public records. If one of them is yours, you can fix it, point it at your own ordering, or start taking pickup orders, with no app taking a cut.</p>
  </div>
</section>
<section class="wrap ow-tiers">
  ${TIERS.map(([k, e, h, p]) => `<div class="ow-tier"><span class="ow-emoji" aria-hidden="true">${e}</span><h2>${h}</h2><p>${p}</p></div>`).join('')}
</section>
<section class="wrap ow-how">
  <h2>How pickup orders work</h2>
  <ol>
    <li><b>A customer orders</b> from your page and gets a pickup code.</li>
    <li><b>Your counter board chimes</b>. It is a web page on any phone or tablet, nothing to install.</li>
    <li><b>Tap ready</b> and the customer’s ticket updates.</li>
    <li><b>They pay you at the counter</b>, cash or card, your way. Type what they actually spent and the ticket closes.</li>
  </ol>
  <p class="muted">Try it from the customer side on any <a href="/tacolumbus/">storefront demo</a>; the ticket links to the counter view.</p>
</section>
<section class="wrap ow-form-sec" id="claim">
  <div class="pk-card">
    <h2 class="pk-h">Tell us about your business</h2>
    <p class="muted">A real person reads every one and calls or emails you back. Nothing changes on the site until we have confirmed you speak for the business.</p>
    <form class="ow-form" data-claim novalidate>
      <label class="ow-biz">Your business<input name="business" autocomplete="off" placeholder="Start typing the name" required><input type="hidden" name="slug"><span class="ow-pick" data-pick></span></label>
      <fieldset><legend>What would you like?</legend>
        ${TIERS.map(([k, e, h]) => `<label class="ow-check"><input type="checkbox" name="wants" value="${k}"> ${e} ${h}</label>`).join('')}
        <label class="ow-check"><input type="checkbox" name="wants" value="remove"> 🚫 Take my business off the site</label>
      </fieldset>
      <div class="ow-two"><label>Your name<input name="name" autocomplete="name" required></label><label>Your role<input name="role" placeholder="Owner, manager…"></label></div>
      <div class="ow-two"><label>Phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel"></label><label>Email<input name="email" type="email" autocomplete="email"></label></div>
      <label>Anything else? <span class="muted">Hours, what’s wrong, what you use now</span><textarea name="message" rows="4" maxlength="1500"></textarea></label>
      <label class="ow-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <p class="ow-err" data-err role="alert" hidden></p>
      <button class="btn">Send ${svg('arrow', 'ic-sm')}</button>
    </form>
  </div>
</section>
</main>
${footer()}`;
  return page({ title: 'For business owners | Heart of Columbus', description: 'Claim your Columbus business listing: fix it, link your own ordering, or take pickup orders with no app fees.', body, scripts: ['site.js', 'owners.js'], styles, assets });
}

function inboxPage({ assets }) {
  const body = `
${header('')}
<main id="main" class="wrap pk" data-inbox>
  <p class="kicker kicker-pill">Owner leads</p>
  <h1 class="pk-h">Inbox</h1>
  <p class="muted" data-inbox-status>Loading…</p>
  <div data-inbox-out></div>
</main>`;
  return page({ title: 'Owner inbox | Heart of Columbus', description: 'Private.', body, scripts: ['owners.js'], styles, assets });
}

export function ownersPages(ctx) {
  return [
    { path: 'owners/index.html', html: ownersPage(ctx) },
    { path: 'owners/inbox/index.html', html: inboxPage(ctx) },
  ];
}
