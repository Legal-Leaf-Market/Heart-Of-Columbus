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
  { id: 'toast', label: 'Toast', kind: 'order', re: /https?:\/\/(?:www\.|order\.)?toasttab\.com\/(?!login|signup|egiftcards|restaurants\/?["'\s<])[^\s"'<>)]+/i },
  { id: 'square-order', label: 'Square Online', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.square\.site[^\s"'<>)]*|https?:\/\/squareup\.com\/store\/[^\s"'<>)]+/i },
  { id: 'clover', label: 'Clover', kind: 'order', re: /https?:\/\/(?:www\.)?clover\.com\/online-ordering\/[^\s"'<>)]+/i },
  { id: 'chownow', label: 'ChowNow', kind: 'order', re: /https?:\/\/(?:direct\.|order\.|ordering\.)?chownow\.com\/order\/[^\s"'<>)]+/i },
  { id: 'doordash-storefront', label: 'DoorDash Storefront (commission-free)', kind: 'order', re: /https?:\/\/order\.online\/[^\s"'<>)]+/i },
  { id: 'olo', label: 'Olo', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.olo\.com[^\s"'<>)]*/i },
  { id: 'menufy', label: 'Menufy', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.menufy\.com[^\s"'<>)]*/i },
  { id: 'slice', label: 'Slice', kind: 'order', re: /https?:\/\/(?:www\.)?slicelife\.com\/restaurants\/[^\s"'<>)]+/i },
  { id: 'spoton', label: 'SpotOn', kind: 'order', re: /https?:\/\/order\.spoton\.com\/[^\s"'<>)]+/i },
  { id: 'owner', label: 'Owner.com', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.owner\.com[^\s"'<>)]*/i },
  { id: 'gloriafood', label: 'GloriaFood', kind: 'order', re: /https?:\/\/(?:www\.)?foodbooking\.com\/ordering\/[^\s"'<>)]+/i },
  { id: 'hungerrush', label: 'HungerRush', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.hungerrush\.com[^\s"'<>)]*/i },
  { id: 'menusifu', label: 'Online ordering', kind: 'order', re: /https?:\/\/(?!www\.|website-cdn\.)[a-z0-9-]+\.(?:menusifu|ordering\.app|orderspoon|beyondmenu)\.com[^\s"'<>)]*/i },
  { id: 'vagaro', label: 'Vagaro', kind: 'book', re: /https?:\/\/(?:www\.)?vagaro\.com\/[^\s"'<>)]+/i },
  { id: 'booksy', label: 'Booksy', kind: 'book', re: /https?:\/\/booksy\.com\/[^\s"'<>)]+/i },
  { id: 'square-book', label: 'Square Appointments', kind: 'book', re: /https?:\/\/(?:[a-z]+\.)?squareup\.com\/appointments\/[^\s"'<>)]+/i },
  { id: 'fresha', label: 'Fresha', kind: 'book', re: /https?:\/\/(?:www\.)?fresha\.com\/[^\s"'<>)]+/i },
  { id: 'glossgenius', label: 'GlossGenius', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.glossgenius\.com[^\s"'<>)]*/i },
  { id: 'styleseat', label: 'StyleSeat', kind: 'book', re: /https?:\/\/(?:www\.)?styleseat\.com\/[^\s"'<>)]+/i },
  { id: 'schedulicity', label: 'Schedulicity', kind: 'book', re: /https?:\/\/(?:www\.)?schedulicity\.com\/[^\s"'<>)]+/i },
  { id: 'mindbody', label: 'Mindbody', kind: 'book', re: /https?:\/\/(?:clients\.|www\.)?mindbodyonline\.com\/[^\s"'<>)]+/i },
  { id: 'calendly', label: 'Calendly', kind: 'book', re: /https?:\/\/calendly\.com\/[^\s"'<>)]+/i },
  { id: 'acuity', label: 'Acuity', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.as\.me[^\s"'<>)]*|https?:\/\/app\.acuityscheduling\.com\/[^\s"'<>)]+/i },
  { id: 'opentable', label: 'OpenTable', kind: 'book', re: /https?:\/\/(?:www\.)?opentable\.com\/(?!widget)[^\s"'<>)]+/i },
  { id: 'resy', label: 'Resy', kind: 'book', re: /https?:\/\/(?:www\.)?resy\.com\/cities\/[^\s"'<>)]+/i },
  { id: 'tock', label: 'Tock', kind: 'book', re: /https?:\/\/(?:www\.)?exploretock\.com\/[^\s"'<>)]+/i },
  { id: 'setmore', label: 'Setmore', kind: 'book', re: /https?:\/\/(?:[a-z0-9-]+\.)?setmore\.com\/[^\s"'<>)]*/i },
  { id: 'mangomint', label: 'Mangomint', kind: 'book', re: /https?:\/\/booking\.mangomint\.com\/[^\s"'<>)]+/i },
  { id: 'boulevard', label: 'Boulevard', kind: 'book', re: /https?:\/\/(?:www\.)?(?:joinblvd\.com|blvd\.co)\/[^\s"'<>)]+/i },
  { id: 'janeapp', label: 'Jane', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.janeapp\.com[^\s"'<>)]*/i },
  { id: 'simplybook', label: 'SimplyBook.me', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.simplybook\.me[^\s"'<>)]*/i },
  { id: 'zocdoc', label: 'Zocdoc', kind: 'book', re: /https?:\/\/(?:www\.)?zocdoc\.com\/(?:practice|doctor)\/[^\s"'<>)]+/i },
  { id: 'petdesk', label: 'PetDesk', kind: 'book', re: /https?:\/\/(?:[a-z]+\.)?petdesk\.com\/[^\s"'<>)]+/i },
  { id: 'nexhealth', label: 'NexHealth', kind: 'book', re: /https?:\/\/app\.nexhealth\.com\/[^\s"'<>)]+/i },
  { id: 'localmed', label: 'LocalMed', kind: 'book', re: /https?:\/\/(?:www\.)?localmed\.com\/[^\s"'<>)]+/i },
  { id: 'zenoti', label: 'Zenoti', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.zenoti\.com[^\s"'<>)]*/i },
];

// Ordering widgets that live inside the business's own page rather than on a
// provider's domain. If one of these shows up on the site's own "order" page,
// that page is the business's direct ordering page.
export const EMBEDS = [
  { id: 'gloriafood', label: 'their website', re: /fbgcdn\.com\/embedder|data-glf-cuid/i },
  { id: 'popmenu', label: 'their website', re: /popmenu\.com|popmenucloud/i },
  { id: 'bentobox', label: 'their website', re: /getbento\.com|bentobox/i },
  { id: 'toast-embed', label: 'Toast', re: /toasttab\.com\/[a-z0-9-]+\/v3|ordering\.toasttab/i },
];

// Same-origin links on a home page that likely lead to ordering, booking or a
// shop, best guess first. Returns { order, book, shop } absolute URLs or ''.
export function findOwnPages(html, base) {
  const out = { order: '', book: '', shop: '' };
  let origin;
  try { origin = new URL(base).origin; } catch { return out; }
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(String(html || '')))) {
    let u;
    try { u = new URL(m[1].replace(/&amp;/g, '&'), base); } catch { continue; }
    if (u.origin !== origin || !/^https?:$/.test(u.protocol)) continue;
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const path = u.pathname.toLowerCase();
    const hay = text + ' ' + path;
    if (!out.order && (/\border(?:ing)?\b(?! history)|\bpickup\b|carry ?out|take ?out/.test(hay))) out.order = u.toString();
    else if (!out.book && /\bbook\b|\bbook now|appointment|schedul|reserv/.test(hay)) out.book = u.toString();
    else if (!out.shop && (/^(shop|store|shop all|shop now|online store|merch)$/.test(text) || /^\/(shop|store|products|collections)(\/|$)/.test(path))) out.shop = u.toString();
  }
  return out;
}

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

// HTML-escaped, tracking-tagged URL -> clean URL, or '' for images and the like.
export function tidyUrl(raw) {
  let u = String(raw || '').replace(/&amp;|&#0?38;/g, '&').replace(/&quot;?.*$|&#0?39;?.*$/, '').replace(/[.,;]+$/, '');
  if (/\.(?:png|jpe?g|gif|svg|webp|css|js)(?:[?#]|$)/i.test(u)) return '';
  try {
    const x = new URL(u);
    for (const k of [...x.searchParams.keys()]) if (/^(utm_|fbclid|gclid|visitorId$)/.test(k)) x.searchParams.delete(k);
    return x.toString();
  } catch { return ''; }
}

// Provider links that are not a booking page: "powered by" badges, static
// assets, app downloads, directory pages, other towns' locations.
const DENY = /static\.glossgenius|vagaro\.com\/pro\b|petdesk\.com\/download|mindbodyonline\.com\/explore|opentable\.com\/(?![^?#]*columbus)|booksy\.com\/en-us\/?$|calendly\.com\/?$/i;

// Every ordering / booking link the site points at, de-duplicated by provider.
export function findProviderLinks(html, extra = []) {
  const text = String(html || '') + ' ' + extra.join(' ');
  const out = [];
  for (const p of PROVIDERS) {
    const re = new RegExp(p.re.source, 'gi');
    for (const m of text.matchAll(re)) {
      const url = tidyUrl(m[0]);
      if (url && !DENY.test(url)) { out.push({ id: p.id, label: p.label, kind: p.kind, url }); break; }
    }
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
