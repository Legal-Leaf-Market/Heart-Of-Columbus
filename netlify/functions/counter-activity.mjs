import { directory } from '../../src/data/directory.mjs';
import { blobStore } from '../../src/blobs.mjs';
import { countActivity } from '../../src/counter-activity.mjs';
import { shopifyOrders } from './handoff.mjs';

export const config = { path: '/api/counter-activity' };
const options = { headers: { 'cache-control': 'no-store' } };

export default async function counterActivity(request) {
  if (request.method !== 'GET') return new Response(null, { ...options, status: 405 });
  const slug = process.env.HOC_SHOPIFY_SLUG;
  if (process.env.HOC_COUNTER_PUBLIC_SLUG !== slug ||
      !/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug || '')) {
    return Response.json([], options);
  }
  const merchant = directory.find((business) => business.slug === slug);
  if (!merchant) return Response.json([], options);
  try {
    const store = blobStore('tracking');
    if (!store) return Response.json([], options);
    const now = Date.now();
    const month = (time) => new Date(time).toISOString().slice(0, 7);
    const months = [...new Set([month(now), month(now - 8 * 86400000)])];
    const [orders, handoffs] = await Promise.all([
      Promise.all(months.map(shopifyOrders)),
      Promise.all(months.map((key) => store.getJSON(`h/${key}/${slug}`))),
    ]);
    const clicks = new Set(handoffs.flatMap((row) => (row?.carts || []).map((cart) => cart.click)));
    const count = countActivity(orders.flat().filter((order) => order.slug === slug), clicks, now);
    return Response.json(count < 3 ? [] : [{ slug, name: merchant.name, count }], options);
  } catch (error) {
    console.error('Counter activity unavailable', error.name);
    return Response.json([], { ...options, status: 503 });
  }
}
