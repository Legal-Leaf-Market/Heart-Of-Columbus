import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { directory } from './data/directory.mjs';
import { FAMILY } from './data/family.mjs';
import { DEALS } from './data/owner-words.mjs';
import { columbusDate } from './news/paper-mail.mjs';
import { disclosures } from './news/disclosure.mjs';

export const dealBusinesses = directory.filter((business) => !business.tempClosed);
const businesses = new Map(dealBusinesses.map((business) => [business.slug, business]));
export const OWNER_DEALS_KEY = 'deals';
const adultBusinesses = new Set(FAMILY.filter((business) => business.adult).map((business) => business.slug));

export const ownerDealsStore = () => getStore({ name: 'owner-deals', consistency: 'strong' });
export const dealResponse = (body, status = 200) => Response.json(body, {
  status, headers: { 'cache-control': 'no-store' },
});

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
}

const identity = ({ slug, text, ends }) =>
  createHash('sha256').update(JSON.stringify([slug, text, ends])).digest('hex');

export function publicDeals(saved, today) {
  const unique = new Map();
  for (const deal of [...DEALS, ...saved]) {
    const business = businesses.get(deal.slug);
    if (!business || !deal.confirmed || !validDate(deal.ends) || deal.ends < today) continue;
    unique.set(identity(deal), {
      slug: deal.slug, name: business.name, text: deal.text, ends: deal.ends,
      adult: adultBusinesses.has(deal.slug),
      disclosures: disclosures([deal.slug]).map(({ text }) => text),
    });
  }
  return [...unique.values()].sort((a, b) => a.ends.localeCompare(b.ends) || a.name.localeCompare(b.name));
}

export async function deskDeals(body, { openStore = ownerDealsStore, now = new Date() } = {}) {
  const today = columbusDate(now);
  let deal;
  if (body.action === 'deal-save') {
    const { slug, sent, ends, confirmed } = body;
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!businesses.has(slug)) return dealResponse({ ok: false, error: 'Choose an open business from the directory.' }, 422);
    if (!text || text.length > 600) return dealResponse({ ok: false, error: 'Paste the offer as written by the business, up to 600 characters.' }, 422);
    if (!validDate(sent) || sent > today) return dealResponse({ ok: false, error: 'Enter the date the business sent the offer.' }, 422);
    if (!validDate(ends) || ends < today) return dealResponse({ ok: false, error: 'Choose an end date of today or later.' }, 422);
    if (confirmed !== true) return dealResponse({ ok: false, error: 'Confirm that the business supplied and authorized the offer.' }, 422);
    deal = { slug, text, sent, ends, confirmed: today };
    deal.id = identity(deal);
  }
  if (body.action === 'deal-remove' && !/^[a-f0-9]{64}$/.test(body.id)) {
    return dealResponse({ ok: false, error: 'Choose a deal to remove.' }, 422);
  }
  try {
    const store = openStore();
    for (let attempt = 0; attempt < 3; attempt++) {
      const record = await store.getWithMetadata(OWNER_DEALS_KEY, { type: 'json' });
      const current = record?.data ?? [];
      if (body.action === 'deals') return dealResponse({ ok: true, deals: current, today });

      const id = deal?.id ?? body.id;
      const exists = current.some((item) => item.id === id);
      if (exists === Boolean(deal)) return dealResponse({ ok: true, deals: current, today });
      const next = deal
        ? [deal, ...current.filter((item) => item.ends >= today)]
        : current.filter((item) => item.id !== id);

      const condition = record ? { onlyIfMatch: record.etag } : { onlyIfNew: true };
      if (record && !record.etag) throw new Error('Deals record is missing its ETag');
      const result = await store.setJSON(OWNER_DEALS_KEY, next, condition);
      if (result.modified) return dealResponse({ ok: true, deals: next, today });
    }
    return dealResponse({ ok: false, error: 'Deals changed while you were working. Try again.' }, 409);
  } catch (error) {
    console.error('[deals] Desk storage:', error.message);
    return dealResponse({ ok: false, error: 'Could not access deals. Try again shortly.' }, 503);
  }
}
