// What a business's own website can do for a shopper, and how to hand the
// shopper's cart to it. Shared by the build, the Netlify functions and tests.
//
// Ported from the cart handoffs in KawaiiKatz (lib/store.tsx) and Herbal Leaf
// Market (public/app.js): we never take payment. Heart of Columbus builds the
// cart, then sends the shopper to the business's own checkout with the items
// already in it, so the sale, the money and the customer stay with them.

// Providers we recognize in a site's HTML or links, and what they mean.
// kind: 'order' (food pickup/delivery), 'book' (appointments), 'shop' (retail cart).
export const PROVIDERS = [
  { id: 'toast', label: 'Toast', kind: 'order', re: /https?:\/\/(?:www\.)?order\.toasttab\.com\/[^\s"'<>)]+/i },
  { id: 'square-order', label: 'Square Online', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.square\.site[^\s"'<>)]*/i },
  { id: 'clover', label: 'Clover', kind: 'order', re: /https?:\/\/(?:www\.)?clover\.com\/online-ordering\/[^\s"'<>)]+/i },
  { id: 'chownow', label: 'ChowNow', kind: 'order', re: /https?:\/\/(?:direct\.|order\.)?chownow\.com\/order\/[^\s"'<>)]+/i },
  { id: 'doordash-storefront', label: 'DoorDash Storefront (commission-free)', kind: 'order', re: /https?:\/\/order\.online\/[^\s"'<>)]+/i },
  { id: 'olo', label: 'Olo', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.olo\.com[^\s"'<>)]*/i },
  { id: 'menufy', label: 'Menufy', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.menufy\.com[^\s"'<>)]*/i },
  { id: 'slice', label: 'Slice', kind: 'order', re: /https?:\/\/(?:www\.)?slicelife\.com\/restaurants\/[^\s"'<>)]+/i },
  { id: 'spoton', label: 'SpotOn', kind: 'order', re: /https?:\/\/order\.spoton\.com\/[^\s"'<>)]+/i },
  { id: 'owner', label: 'Owner.com', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.owner\.com[^\s"'<>)]*/i },
  { id: 'vagaro', label: 'Vagaro', kind: 'book', re: /https?:\/\/(?:www\.)?vagaro\.com\/[^\s"'<>)]+/i },
  { id: 'booksy', label: 'Booksy', kind: 'book', re: /https?:\/\/booksy\.com\/[^\s"'<>)]+/i },
  { id: 'square-book', label: 'Square Appointments', kind: 'book', re: /https?:\/\/(?:book\.)?squareup\.com\/appointments\/[^\s"'<>)]+/i },
  { id: 'fresha', label: 'Fresha', kind: 'book', re: /https?:\/\/(?:www\.)?fresha\.com\/[^\s"'<>)]+/i },
  { id: 'glossgenius', label: 'GlossGenius', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.glossgenius\.com[^\s"'<>)]*/i },
  { id: 'styleseat', label: 'StyleSeat', kind: 'book', re: /https?:\/\/(?:www\.)?styleseat\.com\/[^\s"'<>)]+/i },
  { id: 'schedulicity', label: 'Schedulicity', kind: 'book', re: /https?:\/\/(?:www\.)?schedulicity\.com\/[^\s"'<>)]+/i },
  { id: 'mindbody', label: 'Mindbody', kind: 'book', re: /https?:\/\/(?:clients\.)?mindbodyonline\.com\/[^\s"'<>)]+/i },
  { id: 'calendly', label: 'Calendly', kind: 'book', re: /https?:\/\/calendly\.com\/[^\s"'<>)]+/i },
  { id: 'acuity', label: 'Acuity', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.as\.me[^\s"'<>)]*|https?:\/\/app\.acuityscheduling\.com\/[^\s"'<>)]+/i },
  { id: 'opentable', label: 'OpenTable', kind: 'book', re: /https?:\/\/(?:www\.)?opentable\.com\/[^\s"'<>)]+/i },
];

// Which cart engine a site runs, from its HTML.
export function detectPlatform(html) {
  const h = String(html || '');
  if (/cdn\.shopify\.com|Shopify\.theme|shopify-features/i.test(h)) return 'shopify';
  if (/woocommerce|wc-block|wp-content\/plugins\/woocommerce/i.test(h)) return 'woocommerce';
  if (/cdn\d*\.bigcommerce\.com|bigcommerce\.com\/s-|data-stencil/i.test(h)) return 'bigcommerce';
  if (/static1\.squarespace\.com/i.test(h)) return /commerce|product-block|sqs-add-to-cart/i.test(h) ? 'squarespace-commerce' : 'squarespace';
  if (/square\.site|squareup\.com\/online|weebly\.com/i.test(h)) return 'square-online';
  if (/wixstatic\.com|wix\.com/i.test(h)) return /wix-ecommerce|stores-/i.test(h) ? 'wix-stores' : 'wix';
  if (/wp-content|wordpress/i.test(h)) return 'wordpress';
  if (/godaddy|img1\.wsimg\.com/i.test(h)) return 'godaddy';
  return '';
}

// Every ordering / booking link the site points at, de-duplicated by provider.
export function findProviderLinks(html, extra = []) {
  const text = String(html || '') + ' ' + extra.join(' ');
  const out = [];
  for (const p of PROVIDERS) {
    const m = text.match(p.re);
    if (m) out.push({ id: p.id, label: p.label, kind: p.kind, url: m[0].replace(/&amp;/g, '&').replace(/[.,;]+$/, '') });
  }
  return out;
}

// ---------- Cart handoff ----------
// Shopify: one permalink carries the whole cart. Sold-out lines must be left
// out, because Shopify rejects the entire /cart/ URL if any variant is gone.
export function shopifyCartUrl(origin, lines) {
  const parts = lines.filter((l) => l.available !== false && l.variantId).map((l) => `${encodeURIComponent(l.variantId)}:${l.qty}`);
  return parts.length ? `${origin}/cart/${parts.join(',')}` : `${origin}/cart`;
}
// WooCommerce: ?add-to-cart= adds ONE line per request. The first line rides
// the redirect; the rest are listed so the shopper can tap them in.
export function wooCartUrls(origin, lines) {
  return lines.filter((l) => l.available !== false && l.productId)
    .map((l) => `${origin}/?add-to-cart=${encodeURIComponent(l.variantId || l.productId)}&quantity=${l.qty}`);
}
// BigCommerce: cart.php adds one product per request, same shape as Woo.
export function bigcommerceCartUrls(origin, lines) {
  return lines.filter((l) => l.available !== false && l.productId)
    .map((l) => `${origin}/cart.php?action=add&product_id=${encodeURIComponent(l.productId)}&qty=${l.qty}`);
}

// ---------- Catalog normalizing ----------
const money = (v) => Math.round(Number(v || 0) * 100) / 100;
export function mapShopify(origin, products) {
  return (products || []).filter((p) => p && p.variants && p.variants.length).map((p) => ({
    id: `s${p.id}`, title: p.title, type: (p.product_type || '').trim(), url: `${origin}/products/${p.handle}`,
    image: p.images && p.images[0] ? p.images[0].src : '',
    price: money(p.variants[0].price),
    available: p.variants.some((v) => v.available !== false),
    variants: p.variants.map((v) => ({ id: String(v.id), title: v.title === 'Default Title' ? '' : v.title, price: money(v.price), available: v.available !== false })),
  }));
}
export function mapWoo(origin, products) {
  return (products || []).filter((p) => p && p.prices).map((p) => {
    const minor = Number(p.prices.currency_minor_unit || 2);
    const price = Number(p.prices.price || 0) / 10 ** minor;
    return {
      id: `w${p.id}`, title: (p.name || '').replace(/&amp;/g, '&').replace(/&#8217;/g, '’'), type: (p.categories && p.categories[0] && p.categories[0].name) || '',
      url: p.permalink || origin, image: p.images && p.images[0] ? p.images[0].thumbnail || p.images[0].src : '',
      price: money(price), available: p.is_purchasable !== false && p.is_in_stock !== false,
      variants: [{ id: String(p.id), title: '', price: money(price), available: p.is_in_stock !== false, simple: p.type === 'simple' }],
    };
  });
}
