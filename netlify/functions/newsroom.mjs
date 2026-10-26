// /api/newsroom: reader questions (/ask/), letters to the editor (/letters/)
// and tips (/tips/). Each is stored in Netlify Blobs for an editor to read;
// nothing is published automatically. Adapted from claim.mjs.
//
// Privacy: we keep only what the form asks for. No IP address, user agent
// or other request header is stored or logged.
//
// GET /api/newsroom?k=<HOC_ADMIN_KEY>&kind=tip lists submissions for the
// editor's inbox at /newsroom/inbox/. The key lives only in Netlify's
// environment variables.
import { blobStore } from '../../src/blobs.mjs';

export const config = { path: '/api/newsroom' };

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// What each form keeps, and what it requires.
const KINDS = {
  ask: { fields: { question: 2000, name: 80, email: 120, neighborhood: 80 }, need: [['question', 'What do you want to know?']] },
  letter: {
    fields: { body: 4000, name: 80, town: 80, email: 120, phone: 30, about: 300 },
    need: [['body', 'Please write your letter.'], ['name', 'Letters run with your name.'], ['town', 'Letters run with your town.']],
    check: (x) => (EMAIL.test(x.email) || x.phone ? '' : 'Add an email or phone so the editor can confirm you wrote it.'),
  },
  tip: { fields: { tip: 4000, contact: 200 }, need: [['tip', 'What should we know?']] },
};

function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default async (req) => {
  const store = blobStore('newsroom');
  if (!store) return json({ ok: false, error: 'The form is offline right now. Please try again later.' }, 503);
  try {
    if (req.method === 'GET') {
      const u = new URL(req.url);
      if (!sameKey(process.env.HOC_ADMIN_KEY || '', u.searchParams.get('k') || '')) return json({ ok: false, error: 'Wrong inbox link.' }, 403);
      const kind = KINDS[u.searchParams.get('kind')] ? u.searchParams.get('kind') : 'ask';
      const index = (await store.getJSON(`${kind}/index`)) || [];
      const items = (await Promise.all(index.slice(-300).map((id) => store.getJSON(`${kind}/${id}`)))).filter(Boolean).reverse();
      return json({ ok: true, kind, items });
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    let b = {};
    try { b = await req.json(); } catch { /* empty */ }
    if (clean(b.website, 10)) return json({ ok: true }); // honeypot
    const kind = clean(b.kind, 10);
    const spec = KINDS[kind];
    if (!spec) return json({ ok: false, error: 'Unknown form.' }, 400);
    const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), kind, createdAt: new Date().toISOString(), status: 'new' };
    for (const [f, max] of Object.entries(spec.fields)) item[f] = clean(b[f], max);
    for (const [f, msg] of spec.need) if (!item[f]) return json({ ok: false, error: msg }, 400);
    const bad = spec.check && spec.check(item);
    if (bad) return json({ ok: false, error: bad }, 400);
    await store.setJSON(`${kind}/${item.id}`, item);
    const index = (await store.getJSON(`${kind}/index`)) || [];
    index.push(item.id);
    await store.setJSON(`${kind}/index`, index.slice(-1000));
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'The form is offline right now. Please try again later.' }, 503);
  }
};
