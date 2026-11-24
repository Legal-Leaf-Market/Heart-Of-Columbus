// Encrypts a connected store's API key before it is stored (Netlify Blobs).
// AES-256-GCM with a key derived from HOC_ADMIN_KEY: no new secret to manage,
// and the stored blob is useless without the site's environment. Changing
// HOC_ADMIN_KEY means stores reconnect (their one-click link again).
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const keyFrom = (secret) => createHash('sha256').update('vault:' + secret).digest();

export function seal(text, secret = process.env.HOC_ADMIN_KEY || '') {
  if (!secret) throw new Error('no vault key');
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', keyFrom(secret), iv);
  const body = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), body].map((b) => b.toString('base64url')).join('.');
}

export function open(sealed, secret = process.env.HOC_ADMIN_KEY || '') {
  const [iv, tag, body] = String(sealed || '').split('.').map((s) => Buffer.from(s, 'base64url'));
  const d = createDecipheriv('aes-256-gcm', keyFrom(secret), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(body), d.final()]).toString('utf8');
}
