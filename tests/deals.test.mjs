import assert from 'node:assert/strict';
import { test } from 'node:test';
import desk from '../netlify/functions/desk.mjs';
import { getDeals } from '../netlify/functions/deals.mjs';
import { dealBusinesses, deskDeals } from '../src/deals.mjs';

const now = new Date('2026-11-28T03:00:00Z');
const slug = 'crossroads-wedding-co';
const offer = { action: 'deal-save', slug, text: 'Two cups for $5 <until closing>', sent: '2026-11-27', ends: '2026-11-27', confirmed: true };

function memory() {
  let etag = 0;
  let data;
  return {
    get: async () => structuredClone(data),
    getWithMetadata: async () => data ? { data: structuredClone(data), etag: String(etag) } : null,
    async setJSON(key, next, condition) {
      assert.equal(key, 'deals');
      if (data ? condition.onlyIfMatch !== String(etag) : !condition.onlyIfNew) return { modified: false };
      data = structuredClone(next);
      etag++;
      return { modified: true };
    },
  };
}

test('the desk key is required before deal actions are handled', async () => {
  const result = await desk(new Request('https://heartofcolumbus.shop/api/desk', {
    method: 'POST', body: JSON.stringify(offer),
  }));
  assert.equal(result.status, 403);
});

test('deal entry requires a directory business, real dates and explicit owner confirmation', async () => {
  const openStore = () => assert.fail('Invalid offers must not reach storage');
  for (const changes of [
    { slug: 'missing-business' }, { text: ' ' }, { text: 'x'.repeat(601) },
    { sent: '2026-11-31' }, { sent: '2026-11-28' }, { ends: '2026-11-26' },
    { ends: '2026-13-01' }, { confirmed: 'true' }, { confirmed: false },
  ]) {
    assert.equal((await deskDeals({ ...offer, ...changes }, { openStore, now })).status, 422);
  }
});

test('concurrent saves preserve distinct offers and repeated saves and removals are idempotent', async () => {
  const store = memory();
  const options = { openStore: () => store, now };
  const other = { ...offer, text: '20% off a second cup' };
  await Promise.all([deskDeals(offer, options), deskDeals(other, options)]);
  const repeated = await (await deskDeals(offer, options)).json();
  assert.equal(repeated.deals.length, 2);
  const remove = { action: 'deal-remove', id: repeated.deals.find((item) => item.text === offer.text).id };
  for (let i = 0; i < 2; i++) {
    const result = await (await deskDeals(remove, options)).json();
    assert.deepEqual(result.deals.map(({ text }) => text), [other.text]);
  }
});

test('the public route lists offers through Columbus midnight and exposes only public fields', async () => {
  const store = memory();
  const options = { openStore: () => store, now };
  await deskDeals(offer, options);
  const request = new Request('https://heartofcolumbus.shop/api/deals');
  const result = await getDeals(request, options);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  const { deals } = await result.json();
  assert.deepEqual(deals.find((item) => item.slug === slug && item.text === offer.text), {
    slug, name: dealBusinesses.find((item) => item.slug === slug).name, text: offer.text, ends: offer.ends, adult: false,
    disclosures: ['Crossroads Wedding Co. is run by Jacob Kennedy, who also runs Heart of Columbus.'],
  });
  const after = await (await getDeals(request, { ...options, now: new Date('2026-11-28T05:00:00Z') })).json();
  assert.equal(after.deals.some((item) => item.text === offer.text), false);
  assert.equal((await getDeals(new Request(request, { method: 'POST' }), options)).status, 405);
});
