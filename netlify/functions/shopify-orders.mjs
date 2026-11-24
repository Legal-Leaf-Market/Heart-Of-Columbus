import { createHmac, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

export const config = { path: '/api/shopify-orders' };

export async function receiveOrder(req, { secret, shop, slug, save }) {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  if (!secret || !shop || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug || '')) {
    return new Response(null, { status: 503 });
  }

  const raw = Buffer.from(await req.arrayBuffer());
  const signature = Buffer.from(req.headers.get('x-shopify-hmac-sha256') || '', 'base64');
  const expected = createHmac('sha256', secret).update(raw).digest();
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected) ||
      req.headers.get('x-shopify-shop-domain') !== shop) {
    return new Response(null, { status: 401 });
  }

  const topic = req.headers.get('x-shopify-topic');
  if (!['orders/create', 'orders/updated', 'orders/fulfilled', 'orders/partially_fulfilled'].includes(topic)) {
    return new Response(null, { status: 204 });
  }
  let payload;
  try { payload = JSON.parse(raw.toString('utf8')); } catch { return new Response(null, { status: 400 }); }

  const click = payload?.note_attributes?.find((attribute) => attribute.name === 'hoc_click')?.value;
  if (typeof click !== 'string' || !/^[a-z0-9]{1,24}$/i.test(click)) {
    return new Response(null, { status: 204 });
  }
  const order = String(payload.admin_graphql_api_id || '');
  const at = Date.parse(payload.created_at);
  const updated = Date.parse(payload.updated_at);
  const event = req.headers.get('x-shopify-event-id') || '';
  if (!/^gid:\/\/shopify\/Order\/\d+$/.test(order) || !Number.isFinite(at) ||
      !Number.isFinite(updated) || !/^[a-z0-9-]{1,80}$/i.test(event)) {
    return new Response(null, { status: 400 });
  }

  const status = payload.cancelled_at ? 'cancelled' : (payload.fulfillment_status || 'unfulfilled');
  const date = new Date(at).toISOString();
  const row = {
    slug, order, click, at: date, updated,
    triggered: Date.parse(req.headers.get('x-shopify-triggered-at')) || updated,
    total: Math.max(0, Number(payload.current_total_price ?? payload.total_price) || 0),
    currency: /^[A-Z]{3}$/.test(payload.currency) ? payload.currency : 'USD',
    items: (payload.line_items || []).reduce((sum, line) => sum + (Number(line.current_quantity ?? line.quantity) || 0), 0),
    status, fulfilled: status === 'fulfilled', via: 'shopify-app',
  };

  // Independent event keys avoid read-modify-write races between orders,
  // preserve updates delivered out of order, and make retries idempotent.
  try {
    await save(`${date.slice(0, 7)}/${event}`, row);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}

export default (req) => receiveOrder(req, {
  secret: process.env.HOC_SHOPIFY_CLIENT_SECRET,
  shop: process.env.HOC_SHOPIFY_SHOP,
  slug: process.env.HOC_SHOPIFY_SLUG,
  save: (key, row) => getStore('shopify-orders').setJSON(key, row),
});
