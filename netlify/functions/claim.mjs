// /api/claim: an owner asks to fix their listing, link their ordering, or
// take pickup orders through Heart of Columbus. Stored as a lead in Netlify
// Blobs for a person to follow up; nothing on the site changes until someone
// has confirmed they really speak for the business.
//
// GET /api/claim?k=<HOC_ADMIN_KEY> lists leads for the inbox page. The key
// lives only in Netlify's environment variables.
import { blobStore } from '../../src/blobs.mjs';
import { directory } from '../../src/data/directory.mjs';

export const config = { path: '/api/claim' };

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const WANTS = ['fix', 'link', 'pickup', 'storefront', 'remove'];

function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default async (req) => {
  const store = blobStore('claims');
  if (!store) return json({ ok: false, error: 'The form is offline right now. Please try again later.' }, 503);
  try {
    if (req.method === 'GET') {
      const k = new URL(req.url).searchParams.get('k') || '';
      if (!sameKey(process.env.HOC_ADMIN_KEY || '', k)) return json({ ok: false, error: 'Wrong inbox link.' }, 403);
      const index = (await store.getJSON('index')) || [];
      const leads = (await Promise.all(index.slice(-300).map((id) => store.getJSON(`lead/${id}`)))).filter(Boolean).reverse();
      return json({ ok: true, leads });
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    let b = {};
    try { b = await req.json(); } catch { /* empty */ }
    if (clean(b.website, 10)) return json({ ok: true }); // honeypot: bots fill every field
    const slug = clean(b.slug, 80);
    const biz = directory.find((x) => x.slug === slug);
    const lead = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      slug: biz ? slug : '', business: biz ? biz.name : clean(b.business, 120),
      name: clean(b.name, 80), role: clean(b.role, 60),
      phone: clean(b.phone, 30), email: clean(b.email, 120),
      wants: (Array.isArray(b.wants) ? b.wants : []).map((w) => clean(w, 20)).filter((w) => WANTS.includes(w)),
      message: clean(b.message, 1500), createdAt: new Date().toISOString(), status: 'new',
    };
    if (!lead.business) return json({ ok: false, error: 'Which business is this about?' }, 400);
    if (!lead.name) return json({ ok: false, error: 'Please add your name.' }, 400);
    if (!lead.phone && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) return json({ ok: false, error: 'Add a phone number or email so we can reach you.' }, 400);
    await store.setJSON(`lead/${lead.id}`, lead);
    const index = (await store.getJSON('index')) || [];
    index.push(lead.id);
    await store.setJSON('index', index.slice(-1000));
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'The form is offline right now. Please try again later.' }, 503);
  }
};
