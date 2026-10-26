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
  { id: 'toast', label: 'Toast', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.toast\.site\/order[^\s"'<>)]*|https?:\/\/(?:www\.|order\.)?toasttab\.com\/(?!login|signup|egiftcards|restaurants\/?["'\s<])[^\s"'<>)]+/i },
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
  { id: 'booksy', label: 'Booksy', kind: 'book', re: /https?:\/\/(?:booksy\.com\/[^\s"'<>)]+|[a-z0-9-]+\.booksy\.com\/?[^\s"'<>)]*)/i },
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
  { id: 'square-link', label: 'Square', kind: 'order', re: /https?:\/\/(?:square\.link\/u\/|checkout\.square\.site\/(?:merchant|buy)\/)[^\s"'<>)]+/i },
  { id: 'lunchbox', label: 'Lunchbox', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.lunchbox\.io[^\s"'<>)]*/i },
  { id: 'upserve', label: 'Upserve', kind: 'order', re: /https?:\/\/app\.upserve\.com\/(?:s|b)\/[^\s"'<>)]+/i },
  { id: 'revel', label: 'Revel', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.revelup\.com\/weborder[^\s"'<>)]*/i },
  { id: 'touchbistro', label: 'TouchBistro', kind: 'order', re: /https?:\/\/(?:[a-z0-9-]+\.tbdine\.com|order\.touchbistro\.com\/)[^\s"'<>)]*/i },
  { id: 'skytab', label: 'SkyTab', kind: 'order', re: /https?:\/\/(?:order|online)\.skytab\.com\/[^\s"'<>)]+/i },
  { id: 'tapmango', label: 'TapMango', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.tapmango\.com[^\s"'<>)]*/i },
  { id: 'foodtec', label: 'FoodTec', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.foodtecsolutions\.com[^\s"'<>)]*/i },
  { id: 'brygid', label: 'Brygid', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.brygid\.online[^\s"'<>)]*/i },
  { id: 'popmenu-order', label: 'Popmenu', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.popmenu\.com\/[^\s"'<>)]*order[^\s"'<>)]*/i },
  { id: 'imenu360', label: 'iMenu360', kind: 'order', re: /https?:\/\/[a-z0-9-]+\.imenu360\.com[^\s"'<>)]*/i },
  { id: 'housecallpro', label: 'Housecall Pro', kind: 'book', re: /https?:\/\/book\.housecallpro\.com\/book\/[^\s"'<>)]+/i },
  { id: 'jobber', label: 'Jobber', kind: 'book', re: /https?:\/\/clienthub\.getjobber\.com\/(?:booking|client_hubs)\/[^\s"'<>)]+/i },
  { id: 'workiz', label: 'Workiz', kind: 'book', re: /https?:\/\/online-booking\.workiz\.com\/[^\s"'<>)]+/i },
  { id: 'servicetitan', label: 'ServiceTitan', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.servicetitan\.com\/(?:book|schedul)[^\s"'<>)]*/i },
  { id: 'autovitals', label: 'AutoVitals', kind: 'book', re: /https?:\/\/shop\.autovitals\.com\/RequestAppointment[^\s"'<>)]*/i },
  { id: 'shopmonkey', label: 'Shopmonkey', kind: 'book', re: /https?:\/\/app\.shopmonkey\.(?:io|cloud)\/[^\s"'<>)]*(?:book|schedul|appoint)[^\s"'<>)]*/i },
  { id: 'tekmetric', label: 'Tekmetric', kind: 'book', re: /https?:\/\/[a-z0-9-]*\.?tekmetric\.com\/[^\s"'<>)]*(?:book|appoint|schedul)[^\s"'<>)]*/i },
  { id: 'orbisx', label: 'OrbisX', kind: 'book', re: /https?:\/\/orbisx\.ca\/app\/booknow\/[^\s"'<>)]+/i },
  { id: 'weave', label: 'Weave', kind: 'book', re: /https?:\/\/book\.getweave\.com\/[^\s"'<>)]+/i },
  { id: 'healow', label: 'healow', kind: 'book', re: /https?:\/\/healow\.com\/apps\/[^\s"'<>)]+/i },
  { id: 'vetstoria', label: 'Vetstoria', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.vetstoria\.com[^\s"'<>)]*/i },
  { id: 'gingr', label: 'Gingr', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.portal\.gingrapp\.com[^\s"'<>)]*/i },
  { id: 'petexec', label: 'PetExec', kind: 'book', re: /https?:\/\/(?:secure\.)?petexec\.net\/[^\s"'<>)]+/i },
  { id: 'moego', label: 'MoeGo', kind: 'book', re: /https?:\/\/booking\.moego\.pet\/[^\s"'<>)]+/i },
  { id: 'squire', label: 'Squire', kind: 'book', re: /https?:\/\/(?:www\.)?getsquire\.com\/(?:booking|discover)\/[^\s"'<>)]+/i },
  { id: 'meevo', label: 'Meevo', kind: 'book', re: /https?:\/\/[a-z0-9]+\.meevo\.com\/onlinebooking[^\s"'<>)]*/i },
  { id: 'phorest', label: 'Phorest', kind: 'book', re: /https?:\/\/(?:www\.)?phorest\.com\/book\/[^\s"'<>)]+/i },
  { id: 'timely', label: 'Timely', kind: 'book', re: /https?:\/\/bookings\.gettimely\.com\/[^\s"'<>)]+/i },
  { id: 'wellnessliving', label: 'WellnessLiving', kind: 'book', re: /https?:\/\/(?:www\.)?wellnessliving\.com\/(?:rs|schedule|catalog)\/[^\s"'<>)]+/i },
  { id: 'zenplanner', label: 'Zen Planner', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.sites\.zenplanner\.com[^\s"'<>)]*/i },
  { id: 'pushpress', label: 'PushPress', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.pushpress\.com[^\s"'<>)]*/i },
  { id: 'glofox', label: 'Glofox', kind: 'book', re: /https?:\/\/app\.glofox\.com\/portal\/[^\s"'<>)]+/i },
  { id: 'marianatek', label: 'Mariana Tek', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.marianatek\.com[^\s"'<>)]*/i },
  { id: 'momence', label: 'Momence', kind: 'book', re: /https?:\/\/(?:www\.)?momence\.com\/(?!sign-in|login)[^\s"'<>)]+/i },
  { id: 'punchpass', label: 'Punchpass', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.punchpass\.com[^\s"'<>)]*/i },
  { id: 'walla', label: 'Walla', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.hellowalla\.com[^\s"'<>)]*/i },
  { id: 'arketa', label: 'Arketa', kind: 'book', re: /https?:\/\/app\.arketa\.co\/[^\s"'<>)]+/i },
  { id: 'teamup', label: 'TeamUp', kind: 'book', re: /https?:\/\/goteamup\.com\/p\/[^\s"'<>)]+/i },
  { id: 'jackrabbit', label: 'Jackrabbit', kind: 'book', re: /https?:\/\/app\d*\.jackrabbitclass\.com\/(?:regv2|jr3\.0\/Openings)[^\s"'<>)]*/i },
  { id: 'sawyer', label: 'Sawyer', kind: 'book', re: /https?:\/\/(?:www\.)?hisawyer\.com\/[^\s"'<>)]+/i },
  { id: 'amilia', label: 'Amilia', kind: 'book', re: /https?:\/\/app\.amilia\.com\/store\/[^\s"'<>)]+/i },
  { id: 'gocheckin', label: 'GoCheckin', kind: 'book', re: /https?:\/\/booking\.gocheckin\.net\/[^\s"'<>)]+/i },
  { id: 'vagaro-site', label: 'Vagaro', kind: 'book', re: /https?:\/\/mysite\.vagaro\.com\/[^\s"'<>)]+/i },
  { id: 'appointy', label: 'Appointy', kind: 'book', re: /https?:\/\/booking\.appointy\.com\/[^\s"'<>)]+/i },
  { id: 'youcanbookme', label: 'YouCanBook.me', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.youcanbook\.me[^\s"'<>)]*/i },
  { id: 'tidycal', label: 'TidyCal', kind: 'book', re: /https?:\/\/tidycal\.com\/[^\s"'<>)]+/i },
  { id: 'hubspot-meetings', label: 'HubSpot Meetings', kind: 'book', re: /https?:\/\/meetings\.hubspot\.com\/[^\s"'<>)]+/i },
  { id: 'ms-bookings', label: 'Microsoft Bookings', kind: 'book', re: /https?:\/\/outlook\.office(?:365)?\.com\/(?:owa\/calendar|book)\/[^\s"'<>)]+/i },
  { id: 'google-appointments', label: 'Google Calendar', kind: 'book', re: /https?:\/\/(?:calendar\.app\.google\/|calendar\.google\.com\/calendar\/(?:u\/\d\/)?appointments\/schedules\/)[^\s"'<>)]+/i },
  { id: 'bookeo', label: 'Bookeo', kind: 'book', re: /https?:\/\/(?:www\.)?bookeo\.com\/[^\s"'<>)]+/i },
  { id: 'sevenrooms', label: 'SevenRooms', kind: 'book', re: /https?:\/\/(?:www\.)?sevenrooms\.com\/(?:reservations|explore|landing)\/[^\s"'<>)]+/i },
  { id: 'fareharbor', label: 'FareHarbor', kind: 'book', re: /https?:\/\/fareharbor\.com\/(?:embeds\/book\/)?[a-z0-9-]+\/[^\s"'<>)]*/i },
  { id: 'peek', label: 'Peek', kind: 'book', re: /https?:\/\/book\.peek\.com\/[^\s"'<>)]+/i },
  { id: 'checkfront', label: 'Checkfront', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.checkfront\.com\/reserve[^\s"'<>)]*/i },
  { id: 'resova', label: 'Resova', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.resova\.(?:us|io|eu)[^\s"'<>)]*/i },
  { id: 'roller', label: 'ROLLER', kind: 'book', re: /https?:\/\/ecom\.roller\.app\/[^\s"'<>)]+/i },
  { id: 'cloudbeds', label: 'Cloudbeds', kind: 'book', re: /https?:\/\/hotels\.cloudbeds\.com\/reservation\/[^\s"'<>)]+/i },
  { id: 'thinkreservations', label: 'ThinkReservations', kind: 'book', re: /https?:\/\/secure\.thinkreservations\.com\/[^\s"'<>)]+/i },
  { id: 'resnexus', label: 'ResNexus', kind: 'book', re: /https?:\/\/(?:www\.)?resnexus\.com\/resnexus\/reservations\/[^\s"'<>)]+/i },
  { id: 'lodgify', label: 'Lodgify', kind: 'book', re: /https?:\/\/checkout\.lodgify\.com\/[^\s"'<>)]+/i },
  { id: 'webrez', label: 'WebRezPro', kind: 'book', re: /https?:\/\/secure\.webrez\.com\/[^\s"'<>)]+/i },
  { id: 'foreup', label: 'foreUP', kind: 'book', re: /https?:\/\/foreupsoftware\.com\/index\.php\/booking\/[^\s"'<>)]+/i },
  { id: 'chronogolf', label: 'Chronogolf', kind: 'book', re: /https?:\/\/(?:www\.)?chronogolf\.com\/club\/[^\s"'<>)]+/i },
  { id: 'teesnap', label: 'Teesnap', kind: 'book', re: /https?:\/\/[a-z0-9-]+\.teesnap\.net[^\s"'<>)]*/i },
  { id: 'courtreserve', label: 'CourtReserve', kind: 'book', re: /https?:\/\/app\.courtreserve\.com\/Online\/[^\s"'<>)]+/i },
  { id: 'myshopify', label: 'Shopify', kind: 'shop', re: /https?:\/\/[a-z0-9-]+\.myshopify\.com[^\s"'<>)]*/i },
  { id: 'bigcartel', label: 'Big Cartel', kind: 'shop', re: /https?:\/\/[a-z0-9-]+\.bigcartel\.com[^\s"'<>)]*/i },
  { id: 'ecwid', label: 'Ecwid', kind: 'shop', re: /https?:\/\/(?:[a-z0-9-]+\.company\.site|store\d+\.company\.site)[^\s"'<>)]*/i },
  { id: 'wix-store', label: 'Wix', kind: 'shop', re: /https?:\/\/[a-z0-9-]+\.wixsite\.com\/[^\s"'<>)]*(?:shop|store|product-page)[^\s"'<>)]*/i },
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

// Every engine whose fingerprint shows in a page, for the platform report.
// Builders, cart engines and the ordering, booking and gift systems a site
// embeds. A fingerprint is only a sign of the software; the links a business
// gets still come from PROVIDERS and the import rules.
export const PLATFORM_SIGNS = [
  ['shopify', /cdn\.shopify\.com|Shopify\.theme|shopify-features|myshopify\.com/i],
  ['shopify-buy-button', /sdks\.shopifycdn\.com\/buy-button/i],
  ['woocommerce', /woocommerce|wc-block|wp-content\/plugins\/woocommerce/i],
  ['bigcommerce', /cdn\d*\.bigcommerce\.com|bigcommerce\.com\/s-|data-stencil/i],
  ['squarespace', /static1\.squarespace\.com|squarespace-cdn\.com/i],
  ['squarespace-commerce', /sqs-add-to-cart|ProductItem-details|"storeSettings"/i],
  ['square-online', /square\.site|squareup\.com\/online|editmysite\.com|weebly\.com/i],
  ['wix', /wixstatic\.com|static\.parastorage\.com|wix\.com/i],
  ['wix-stores', /wix-ecommerce|wixstores|"stores-/i],
  ['wordpress', /wp-content|wp-includes|wordpress/i],
  ['godaddy', /img1\.wsimg\.com|godaddy/i],
  ['godaddy-commerce', /wsimg\.com\/[^"']*(?:ola|commerce)|onlinestore\.godaddy/i],
  ['ecwid', /app\.ecwid\.com|ecwid\.com\/script\.js|company\.site/i],
  ['bigcartel', /bigcartel\.com|bigcartel\.net/i],
  ['lightspeed-ecom', /webshopapp\.com|shoplightspeed\.com/i],
  ['volusion', /volusion\.com|\/v\/vspfiles\//i],
  ['shift4shop', /3dcartstores\.com|shift4shop/i],
  ['duda', /dudaone|cdn-website\.com|multiscreensite/i],
  ['webflow', /webflow\.(?:com|io)|data-wf-site/i],
  ['weebly', /weebly\.com|editmysite\.com/i],
  ['joomla', /\/media\/jui\/|joomla/i],
  ['drupal', /drupal-settings-json|\/sites\/default\/files\//i],
  ['hibu', /hibu\.com|yodle/i],
  ['thryv', /thryv/i],
  ['scorpion', /scorpion\.co|scorpioncms/i],
  ['clover', /clover\.com\/online-ordering|cloverstatic/i],
  ['toast', /toasttab\.com/i],
  ['square-appointments', /squareup\.com\/appointments/i],
  ['chownow', /chownow\.com/i],
  ['popmenu', /popmenu\.com|popmenucloud/i],
  ['bentobox', /getbento\.com/i],
  ['gloriafood', /fbgcdn\.com\/embedder|data-glf-cuid|foodbooking\.com/i],
  ['menufy', /menufy\.com/i],
  ['owner', /\.owner\.com/i],
  ['spoton', /spoton\.com/i],
  ['doordash-storefront', /order\.online\//i],
  ['olo', /\.olo\.com/i],
  ['slice', /slicelife\.com/i],
  ['opentable', /opentable\.com/i],
  ['resy', /resy\.com/i],
  ['tock', /exploretock\.com/i],
  ['sevenrooms', /sevenrooms\.com/i],
  ['vagaro', /vagaro\.com/i],
  ['booksy', /booksy\.com/i],
  ['glossgenius', /glossgenius\.com/i],
  ['fresha', /fresha\.com/i],
  ['styleseat', /styleseat\.com/i],
  ['schedulicity', /schedulicity\.com/i],
  ['mindbody', /mindbodyonline\.com|healcode\.com/i],
  ['calendly', /calendly\.com/i],
  ['acuity', /acuityscheduling\.com|\.as\.me\b/i],
  ['setmore', /setmore\.com/i],
  ['booking-other', /simplybook\.me|youcanbook\.me|appointy\.com|tidycal\.com|meetings\.hubspot\.com|bookeo\.com|gettimely\.com|phorest\.com|meevo\.com|getsquire\.com/i],
  ['fitness-booking', /wellnessliving\.com|zenplanner\.com|pushpress\.com|glofox\.com|marianatek\.com|momence\.com|punchpass\.com|hellowalla\.com|wodify\.com|arketa\.co|goteamup\.com/i],
  ['class-registration', /jackrabbitclass\.com|hisawyer\.com|amilia\.com/i],
  ['health-booking', /zocdoc\.com|nexhealth\.com|localmed\.com|getweave\.com|healow\.com|janeapp\.com|solutionreach|lighthouse360|patientpop|demandforce/i],
  ['pet-booking', /petdesk\.com|vetstoria\.com|gingrapp\.com|petexec\.net|moego\.pet/i],
  ['home-services-booking', /housecallpro\.com|getjobber\.com|servicetitan\.com|workiz\.com|scheduleengine/i],
  ['auto-booking', /autovitals\.com|shopmonkey\.(?:io|cloud)|tekmetric\.com|orbisx\.ca|mitchell1|myshopmanager/i],
  ['tours-tickets', /fareharbor\.com|book\.peek\.com|checkfront\.com|resova\.|roller\.app|eventbrite\.com|ludus\.com|showclix\.com|ticketleap/i],
  ['lodging-booking', /cloudbeds\.com|thinkreservations\.com|resnexus\.com|lodgify\.com|webrez\.com|innroad/i],
  ['golf-courts', /foreupsoftware\.com|chronogolf\.com|teesnap\.net|courtreserve\.com/i],
  ['etsy', /etsy\.com\/shop\//i],
  ['marketplace-delivery', /doordash\.com\/store|grubhub\.com\/restaurant|ubereats\.com\/store|seamless\.com/i],
];
export function detectStack(html, headers = {}) {
  const h = String(html || '') + ' ' + Object.values(headers || {}).join(' ');
  return PLATFORM_SIGNS.filter(([, re]) => re.test(h)).map(([id]) => id);
}

// OpenTable's reservation widget names the restaurant only by number; its
// public booking page takes the same number.
export function widgetLinks(text) {
  const out = [];
  const ot = String(text || '').match(/opentable\.com\/widget\/reservation\/loader\?[^"'\s<>]*\brids?=(\d+)/i);
  if (ot) out.push({ id: 'opentable', label: 'OpenTable', kind: 'book', url: `https://www.opentable.com/restref/client/?rid=${ot[1]}` });
  return out;
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
const DENY = /static\.glossgenius|vagaro\.com\/(?:pro\b|resources|websitebuilder|js\/|images|users\/|signup|login)|booksy\.com\/(?:biz|widget|static)|fareharbor\.com\/(?:embeds\/(?:script|api)|static|help)|momence\.com\/(?:plugin|_next|static)|fresha\.com\/(?:for-business|assets|partners)|squareup\.com\/appointments\/?(?:["'\s]|$)|calendly\.com\/(?:assets|login|signup)|myshopify\.com\/(?:admin|cdn)|(?:www\.)?setmore\.com\/(?:pricing|features)|vagaro\.com\/?$|petdesk\.com\/download|mindbodyonline\.com\/explore|opentable\.com\/(?![^?#]*columbus)|booksy\.com\/en-us\/?$|calendly\.com\/?$/i;

// Every ordering / booking link the site points at, de-duplicated by provider.
export function findProviderLinks(html, extra = []) {
  const text = String(html || '') + ' ' + extra.join(' ');
  const out = [];
  for (const p of PROVIDERS) {
    const re = new RegExp(p.re.source, 'gi');
    for (const m of text.matchAll(re)) {
      const url = tidyUrl(m[0]);
      if (url && !DENY.test(url) && !/\.(?:js|css|png|jpe?g|svg|woff2?)(?:[?#]|$)/i.test(url)) { out.push({ id: p.id, label: p.label, kind: p.kind, url }); break; }
    }
  }
  for (const w of widgetLinks(text)) if (!out.some((x) => x.id === w.id)) out.push(w);
  return out;
}

// ---------- Gift cards ----------
// Gift-card pages on the providers above (and the gift-card services small
// shops use), so "Give local" can link to the business's own page. Same rule
// as ordering: we link to theirs and take nothing.
export const GIFT_PROVIDERS = [
  { id: 'toast-gift', label: 'Toast', re: /https?:\/\/(?:www\.)?toasttab\.com\/[a-z0-9-]+\/giftcards[^\s"'<>)]*|https?:\/\/order\.toasttab\.com\/egiftcards\/[^\s"'<>)]+/i },
  { id: 'square-gift', label: 'Square', re: /https?:\/\/(?:app\.)?squareup\.com\/gift\/[^\s"'<>)]+/i },
  { id: 'clover-gift', label: 'Clover', re: /https?:\/\/(?:www\.)?clover\.com\/[^\s"'<>)]*gift-?cards?[^\s"'<>)]*/i },
  { id: 'giftup', label: 'Gift Up!', re: /https?:\/\/(?:www\.)?giftup\.app\/place-order\/[^\s"'<>)]+/i },
  { id: 'giftfly', label: 'Giftfly', re: /https?:\/\/(?:www\.)?giftfly\.com\/(?:shop|e)\/[^\s"'<>)]+/i },
  { id: 'vagaro-gift', label: 'Vagaro', re: /https?:\/\/(?:www\.)?vagaro\.com\/[a-z0-9-]+\/(?:giftcards?|gift-certificates?)[^\s"'<>)]*/i },
  { id: 'mindbody-gift', label: 'Mindbody', re: /https?:\/\/clients\.mindbodyonline\.com\/[^\s"'<>)]*giftcard[^\s"'<>)]*/i },
];

// The site's own gift-card page: a same-origin link whose text or path says
// gift card (or gift certificate), including a Shopify gift-card product.
export function findGiftLinks(html, base) {
  const h = String(html || '');
  for (const p of GIFT_PROVIDERS) {
    const m = h.match(p.re);
    const url = m && tidyUrl(m[0]);
    if (url) return { id: p.id, label: p.label, url };
  }
  let origin;
  try { origin = new URL(base).origin; } catch { return null; }
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of h.matchAll(re)) {
    let u;
    try { u = new URL(m[1].replace(/&amp;/g, '&'), base); } catch { continue; }
    if (u.origin !== origin) continue;
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (/gift ?cards?|gift certificates?|e-?gift/.test(text) || /\/(?:products\/)?(?:e-?)?gift-?(?:cards?|certificates?)(?:[/-]|$)/i.test(u.pathname)) return { id: 'own', label: 'their website', url: tidyUrl(u.toString()) };
  }
  return null;
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
