// Pickup tickets: the shopper's ticket (/pickup/?t=), the shop's view of one
// ticket (/pickup/counter/?t=), and a partner's live board (/pickup/board/).
// All three are filled in by public/js/pickup.js from /api/pickup.
import { page } from '../layout.mjs';
import { header, footer } from '../site.mjs';

const styles = ['hoc.css'];

function ticketPage({ assets }) {
  const body = `
${header('order')}
<main id="main" class="wrap pk" data-pickup="ticket">
  <p class="kicker kicker-pill">Pickup ticket</p>
  <div data-pk-out><p class="muted">Loading your ticket…</p></div>
</main>
${footer()}`;
  return page({ title: 'Your pickup | Heart of Columbus', description: 'Your pickup ticket.', body, scripts: ['site.js', 'pickup.js'], styles, assets });
}

function counterPage({ assets }) {
  const body = `
${header('order')}
<main id="main" class="wrap pk" data-pickup="counter">
  <p class="kicker kicker-pill">Counter view</p>
  <div data-pk-out><p class="muted">Loading…</p></div>
</main>
${footer()}`;
  return page({ title: 'Counter view | Heart of Columbus', description: 'What the shop sees for one pickup.', body, scripts: ['site.js', 'pickup.js'], styles, assets });
}

function boardPage({ assets }) {
  const body = `
${header('order')}
<main id="main" class="wrap pk" data-pickup="board">
  <p class="kicker kicker-pill">Pickup board</p>
  <h1 class="pk-h" data-pk-title>Incoming pickups</h1>
  <p class="muted" data-pk-status>Connecting…</p>
  <button type="button" class="btn btn-ghost" data-pk-sound>Turn on the new-order chime</button>
  <div class="pk-board" data-pk-out></div>
</main>`;
  return page({ title: 'Pickup board | Heart of Columbus', description: 'Live pickup orders for a partner shop.', body, scripts: ['pickup.js'], styles, assets });
}

export function pickupPages(ctx) {
  return [
    { path: 'pickup/index.html', html: ticketPage(ctx) },
    { path: 'pickup/counter/index.html', html: counterPage(ctx) },
    { path: 'pickup/board/index.html', html: boardPage(ctx) },
  ];
}
