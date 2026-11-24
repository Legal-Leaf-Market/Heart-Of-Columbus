// Each morning: read the orders of every WooCommerce store that connected in
// one click, and keep the ones Heart of Columbus sent (src/woo-orders.mjs).
import { blobStore } from '../../src/blobs.mjs';
import { syncAll } from '../../src/woo-orders.mjs';
import { wooGet } from './woo-connect.mjs';

export const config = { schedule: '41 9 * * *' }; // 4:41 AM in Columbus (EST)

export default async () => {
  const blobs = blobStore('tracking');
  if (!blobs || !process.env.HOC_ADMIN_KEY) return new Response('offline', { status: 503 });
  const out = await syncAll({ blobs, get: wooGet });
  console.log('woo-sync', JSON.stringify(out));
  return new Response('ok');
};
