// /api/obituary: a family sends an obituary for Heart of Columbus to carry.
//
// We never write, generate or copy an obituary. What comes in is the
// family's own text, stored in Netlify Blobs as "received". Nothing is
// published from here: a person checks it with the submitter and the funeral
// home first, then adds it to PUBLISHED in src/data/obituaries.mjs.
//
// The fields are the ones a printed notice needs (name, dates, town, the
// text, services, memorials, funeral home), kept separate so the same record
// can be laid out for the web or for print.
//
// GET /api/obituary with an x-hoc-key: <HOC_ADMIN_KEY> header lists submissions for the private
// review page. The key lives only in Netlify's environment variables.
import { blobStore } from '../../src/blobs.mjs';
import { FUNERAL_HOMES } from '../../src/data/obituaries.mjs';

export const config = { path: '/api/obituary' };

export const LIMITS = { text: 5000, services: 1200, memorials: 600 };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
// Line breaks matter in an obituary, so long fields keep \n and lose the rest.
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const para = (s, max) => String(s ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
const day = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && !Number.isNaN(Date.parse(s)) ? s : '');
const offline = () => json({ ok: false, error: 'The form is offline right now. Please contact your funeral home, or try again later.' }, 503);

function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default async (req) => {
  const store = blobStore('obituaries');
  if (!store) return offline();
  try {
    if (req.method === 'GET') {
      const k = req.headers.get('x-hoc-key') || '';
      if (!sameKey(process.env.HOC_ADMIN_KEY || '', k)) return json({ ok: false, error: 'Wrong review link.' }, 403);
      const index = (await store.getJSON('index')) || [];
      const items = (await Promise.all(index.slice(-200).map((id) => store.getJSON(`notice/${id}`)))).filter(Boolean).reverse();
      return json({ ok: true, items });
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    let b = {};
    try { b = await req.json(); } catch { /* empty */ }
    if (clean(b.website, 10)) return json({ ok: true }); // honeypot
    const home = FUNERAL_HOMES.find((h) => h.name === b.home);
    const n = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: clean(b.name, 120), known: clean(b.known, 60), age: clean(b.age, 3).replace(/\D/g, ''),
      town: clean(b.town, 80), born: day(b.born), died: day(b.died),
      text: para(b.text, LIMITS.text), services: para(b.services, LIMITS.services), memorials: para(b.memorials, LIMITS.memorials),
      home: home ? home.name : clean(b.homeOther, 120),
      from: { name: clean(b.fromName, 80), relation: clean(b.relation, 60), phone: clean(b.phone, 30), email: clean(b.email, 120) },
      consent: b.consent === true,
      createdAt: new Date().toISOString(), status: 'received',
    };
    if (!n.name) return json({ ok: false, error: 'Please add the full name of the person who died.' }, 400);
    if (!n.died) return json({ ok: false, error: 'Please add the date of death.' }, 400);
    if (n.born && n.born > n.died) return json({ ok: false, error: 'The date of birth is after the date of death.' }, 400);
    if (n.text.length < 40) return json({ ok: false, error: 'Please add the obituary text.' }, 400);
    if (!n.from.name) return json({ ok: false, error: 'Please add your name.' }, 400);
    if (!n.from.phone && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(n.from.email)) return json({ ok: false, error: 'Add a phone number or email so we can confirm with you.' }, 400);
    if (!n.consent) return json({ ok: false, error: 'Please confirm you are family or speak for the family.' }, 400);
    await store.setJSON(`notice/${n.id}`, n);
    const index = (await store.getJSON('index')) || [];
    index.push(n.id);
    await store.setJSON('index', index.slice(-1000));
    return json({ ok: true });
  } catch {
    return offline();
  }
};
