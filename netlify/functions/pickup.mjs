// /api/pickup: pickup tickets. Adapted from Herbal Leaf Market's local-order
// route and Jill's Diner's fail-closed ordering.
//
// THE ONLY THING THIS MOVES IS A RECORD. No payment, no card. A shopper sends
// a list; the shop sees it, marks it ready, and when the shopper collects,
// types what was actually spent (people add things at the counter, items run
// out, so the list total is never the bill).
//
// WHO CAN RECEIVE ORDERS: only businesses in src/data/partners.mjs. The five
// storefront demos make demo tickets that no business ever sees, and demo
// tickets never store a phone number. Any other slug is refused.
//
// THE TOKEN IS THE AUTHENTICATION (Herbal Leaf's trade-off): whoever holds the
// 32-hex link can view or redeem that one ticket. The exposure is one order,
// a record rather than money, and every change is time-stamped.
//
// FAILS CLOSED: if storage is unavailable we say so, so a shopper is never
// told an order went through when it did not.
import { blobStore } from '../../src/blobs.mjs';
import { PARTNERS, DEMO_SLUGS, COMMISSION } from '../../src/data/partners.mjs';
import { directory } from '../../src/data/directory.mjs';

export const config = { path: '/api/pickup' };

const TTL_DAYS = 30; // a ticket is a plan, not an archive
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const DEMO_NAMES = { gills: "Gill's Barber Shop", tacolumbus: 'TaColumbus', 'big-cheese': 'The Big Cheese', 'tasty-express': 'Tasty Express', rohdes: "Rohde's Family Diner" };

// A partner's counter board key lives in the HOC_BOARD_KEYS environment
// variable on Netlify, as JSON: {"<slug>": "<long random key>"}. Never in git.
function boardKey(slug) {
  try { return (JSON.parse(process.env.HOC_BOARD_KEYS || '{}') || {})[slug] || ''; } catch { return ''; }
}
function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function newToken() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}
const shortCode = (t) => t.slice(0, 4).toUpperCase() + '-' + t.slice(4, 6).toUpperCase();

async function load(store, t) {
  if (!/^[a-f0-9]{32}$/.test(t)) return null;
  const o = await store.getJSON(`ticket/${t}`);
  if (!o) return null;
  if (Date.now() - Date.parse(o.createdAt) > TTL_DAYS * 864e5) return null;
  return o;
}

export default async (req) => {
  const store = blobStore('pickup');
  if (!store) return json({ ok: false, error: 'Pickup orders are offline right now. Please call the shop.' }, 503);

  try {
    if (req.method === 'GET') {
      const q = new URL(req.url).searchParams;
      if (q.get('board')) {
        // A partner's live counter board: today's and upcoming tickets.
        const slug = clean(q.get('board'), 80);
        if (!PARTNERS[slug] || !sameKey(boardKey(slug), clean(q.get('k'), 200))) return json({ ok: false, error: 'Wrong board link.' }, 403);
        const index = (await store.getJSON(`index/${slug}`)) || [];
        const tickets = (await Promise.all(index.slice(-80).map((t) => load(store, t)))).filter(Boolean).reverse();
        return json({ ok: true, business: tickets[0] ? tickets[0].business : slug, tickets });
      }
      const o = await load(store, new URL(req.url).searchParams.get('t') || '');
      return o ? json({ ok: true, ticket: o }) : json({ ok: false, error: 'No pickup with that code.' }, 404);
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

    let body = {};
    try { body = await req.json(); } catch { /* empty */ }
    const action = String(body.action || 'create');

    if (action === 'create') {
      const slug = clean(body.slug, 80);
      const partner = PARTNERS[slug];
      const demo = DEMO_SLUGS.includes(slug);
      if (!demo && !(partner && partner.pickup)) return json({ ok: false, error: 'This business does not take orders through Heart of Columbus.' }, 403);
      const items = (Array.isArray(body.items) ? body.items : []).slice(0, 60).map((i) => ({
        name: clean(i && i.name, 120),
        details: clean(i && i.details, 200),
        qty: Math.max(1, Math.min(20, Number(i && i.qty) || 1)),
        cents: Math.max(0, Math.min(100000, Math.round(Number(i && i.cents) || 0))),
      })).filter((i) => i.name);
      if (!items.length) return json({ ok: false, error: 'Your order is empty.' }, 400);
      const name = clean(body.name, 60);
      if (!name) return json({ ok: false, error: 'Please add your name.' }, 400);
      const biz = directory.find((b) => b.slug === slug);
      const t = newToken();
      const ticket = {
        token: t, code: shortCode(t), demo, slug,
        business: demo ? DEMO_NAMES[slug] : biz ? biz.name : slug,
        items, listCents: items.reduce((n, i) => n + i.cents * i.qty, 0),
        name, phone: demo ? '' : clean(body.phone, 20), when: clean(body.when, 80), whenAt: Number(body.whenAt) || 0,
        notes: clean(body.notes, 300), status: 'sent', createdAt: new Date().toISOString(),
      };
      await store.setJSON(`ticket/${t}`, ticket);
      if (!demo) {
        // Low volume, one counter: a read-modify-write index is enough.
        const index = (await store.getJSON(`index/${slug}`)) || [];
        index.push(t);
        await store.setJSON(`index/${slug}`, index.slice(-200));
      }
      return json({ ok: true, token: t, code: ticket.code, demo });
    }

    const t = clean(body.t, 40);
    const o = await load(store, t);
    if (!o) return json({ ok: false, error: 'No pickup with that code.' }, 404);

    if (action === 'ready') {
      if (o.status === 'sent') { o.status = 'ready'; o.readyAt = new Date().toISOString(); await store.setJSON(`ticket/${t}`, o); }
      return json({ ok: true, ticket: o });
    }
    if (action === 'redeem') {
      // First redemption wins: two scans on a busy counter must not double count.
      if (o.redeemedAt) return json({ ok: false, error: 'Already picked up.', ticket: o }, 409);
      const total = Math.max(0, Math.min(1e7, Math.round(Number(body.totalCents) || 0)));
      o.status = 'collected';
      o.redeemedAt = new Date().toISOString();
      o.finalCents = total;
      o.commissionCents = o.demo ? 0 : Math.round(total * COMMISSION);
      await store.setJSON(`ticket/${t}`, o);
      return json({ ok: true, ticket: o });
    }
    return json({ ok: false, error: 'unknown action' }, 400);
  } catch (e) {
    return json({ ok: false, error: 'Pickup orders are offline right now. Please call the shop.' }, 503);
  }
};
