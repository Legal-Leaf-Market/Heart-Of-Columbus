import { dealResponse, ownerDealsStore, publicDeals, OWNER_DEALS_KEY } from '../../src/deals.mjs';
import { columbusDate } from '../../src/news/paper-mail.mjs';

export const config = { path: '/api/deals' };

export async function getDeals(req, { openStore = ownerDealsStore, now = new Date() } = {}) {
  if (req.method !== 'GET') return dealResponse({ ok: false, error: 'Use GET.' }, 405);
  try {
    const saved = (await openStore().get(OWNER_DEALS_KEY, { type: 'json' })) ?? [];
    return dealResponse({ ok: true, deals: publicDeals(saved, columbusDate(now)) });
  } catch (error) {
    console.error('[deals] Public storage:', error.message);
    return dealResponse({ ok: false, deals: publicDeals([], columbusDate(now)) }, 503);
  }
}

export default (req) => getDeals(req);
