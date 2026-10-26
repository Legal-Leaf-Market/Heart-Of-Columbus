// /api/claim: an owner asks to fix their listing, link their ordering, or
// take pickup orders through Heart of Columbus. Stored as a lead in Netlify
// Blobs for a person to follow up; nothing on the site changes until someone
// has confirmed they really speak for the business.
//
// GET /api/claim with an x-hoc-key header lists leads for the inbox page. The
// key lives only in Netlify's environment variables, and never in a query
// string, where it would sit in server logs and referrers.
//
// The form posts JSON when its script runs. Without the script it is an
// ordinary form POST (never a GET, which would put a name and phone number in
// the URL) and gets a plain HTML page back.
import { blobStore } from '../../src/blobs.mjs';
import { directory } from '../../src/data/directory.mjs';

export const config = { path: '/api/claim' };

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const WANTS = ['fix', 'link', 'pickup', 'storefront', 'remove'];
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// The answer to a form sent without its script: a plain page, never a redirect
// carrying what was typed.
function htmlReply(ok, error, status) {
  const msg = ok ? 'Thanks. We got it and a real person will reach out.' : escHtml(error);
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${ok ? 'Sent' : 'Not sent'} | Heart of Columbus</title></head><body style="font:18px/1.5 system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem"><h1>${ok ? 'Sent' : 'Not sent yet'}</h1><p>${msg}</p><p><a href="/owners/#claim">${ok ? 'Back to Heart of Columbus' : 'Go back to the form'}</a></p></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default async (req) => {
  const store = blobStore('claims');
  if (!store) return req.method === 'POST' && /form/.test(req.headers.get('content-type') || '') ? htmlReply(false, 'The form is offline right now. Please try again later.', 503) : json({ ok: false, error: 'The form is offline right now. Please try again later.' }, 503);
  try {
    if (req.method === 'GET') {
      const k = req.headers.get('x-hoc-key') || '';
      if (!sameKey(process.env.HOC_ADMIN_KEY || '', k)) return json({ ok: false, error: 'Wrong inbox link.' }, 403);
      const index = (await store.getJSON('index')) || [];
      const leads = (await Promise.all(index.slice(-300).map((id) => store.getJSON(`lead/${id}`)))).filter(Boolean).reverse();
      return json({ ok: true, leads });
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    const asForm = /application\/x-www-form-urlencoded|multipart\/form-data/.test(req.headers.get('content-type') || '');
    let b = {};
    if (asForm) {
      try { const f = await req.formData(); b = Object.fromEntries(f); b.wants = f.getAll('wants'); } catch { /* empty */ }
    } else {
      try { b = await req.json(); } catch { /* empty */ }
    }
    const reply = (ok, error, status) => (asForm ? htmlReply(ok, error, status) : json(ok ? { ok: true } : { ok: false, error }, status));
    if (clean(b.website, 10)) return reply(true, '', 200); // honeypot: bots fill every field
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
    if (!lead.business) return reply(false, 'Which business is this about?', 400);
    if (!lead.name) return reply(false, 'Please add your name.', 400);
    if (!lead.phone && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) return reply(false, 'Add a phone number or email so we can reach you.', 400);
    await store.setJSON(`lead/${lead.id}`, lead);
    const index = (await store.getJSON('index')) || [];
    index.push(lead.id);
    await store.setJSON('index', index.slice(-1000));
    return reply(true, '', 200);
  } catch {
    return json({ ok: false, error: 'The form is offline right now. Please try again later.' }, 503);
  }
};
