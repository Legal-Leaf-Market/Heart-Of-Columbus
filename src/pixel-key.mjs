// Each business's order-tracking key (step 2, docs/order-tracking.md): an
// HMAC of its slug with HOC_ADMIN_KEY, so no list of keys is stored anywhere
// and a leaked key only lets someone post orders for that one business. The
// owner report (/owners/report/) shows each key to hand to its owner.
import { createHmac } from 'node:crypto';

export const pixelKey = (slug, secret = process.env.HOC_ADMIN_KEY || '') =>
  secret ? createHmac('sha256', secret).update('pixel:' + String(slug)).digest('hex').slice(0, 20) : '';

export function sameKey(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
