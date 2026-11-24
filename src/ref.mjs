// Our referral tag on every link that sends someone to a business to buy,
// order or book (step 1 of order tracking, docs/order-tracking.md). Standard
// UTM fields, so each business's own analytics and order screens already
// show "heartofcolumbus" (Shopify's landing page, WooCommerce's built-in
// order attribution, Square and Wix reports). A link that already carries a
// utm_source is left alone. Social sites and maps are not tagged.
export const REF = { source: 'heartofcolumbus', medium: 'referral' };

export function tagUrl(url, campaign) {
  let u;
  try { u = new URL(url); } catch { return url; }
  if (!/^https?:$/.test(u.protocol) || /(^|\.)(google\.[a-z.]+|goo\.gl|facebook\.com|instagram\.com|tiktok\.com|x\.com|twitter\.com)$/i.test(u.hostname)) return url;
  if (u.searchParams.has('utm_source')) return url;
  u.searchParams.set('utm_source', REF.source);
  u.searchParams.set('utm_medium', REF.medium);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}

// Marks a link for the handoff count (public/js/site.js sends one beacon per
// click to /api/handoff): which business and what kind of handoff.
export const hocAttr = (slug, kind) => ` data-hoc="${slug}|${kind}"`;
