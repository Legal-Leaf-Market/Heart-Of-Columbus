// Order tracking for the businesses we send customers to (docs/order-tracking.md).
// /owners/tracking/: public setup steps an owner follows to count the orders
// Heart of Columbus sends them (step 2). /owners/report/#k=: the private
// monthly report and each business's tracking key (step 1 and 2 numbers).
import { page, esc } from '../layout.mjs';
import { header, footer } from '../site.mjs';

const styles = ['hoc.css'];
const ORIGIN = 'https://heartofcolumbus.netlify.app';

const code = (s) => `<pre class="tk-code"><code>${esc(s.trim())}</code></pre>`;

const SHOPIFY_PIXEL = `
// Heart of Columbus order count. Sends only the order number, total,
// currency and item count, and only for orders that came from
// Heart of Columbus. Never the customer's name, email or address.
const HOC = { shop: 'YOUR-SHOP-ID', key: 'YOUR-KEY' };

analytics.subscribe('page_viewed', async (event) => {
  const url = new URL(event.context.document.location.href);
  if (url.searchParams.get('utm_source') === 'heartofcolumbus') {
    await browser.localStorage.setItem('hoc_click', url.searchParams.get('utm_content') || 'visit');
  }
});

analytics.subscribe('checkout_completed', async (event) => {
  const c = event.data.checkout;
  const attr = (c.attributes || []).find((a) => a.key === 'hoc_click');
  const click = (attr && attr.value) || (await browser.localStorage.getItem('hoc_click'));
  if (!click) return;
  fetch('${ORIGIN}/api/conversion', {
    method: 'POST',
    keepalive: true,
    body: JSON.stringify({
      shop: HOC.shop, key: HOC.key, via: 'shopify', click,
      order: c.order && c.order.id,
      total: c.totalPrice && c.totalPrice.amount,
      currency: c.currencyCode,
      items: (c.lineItems || []).reduce((n, l) => n + (l.quantity || 0), 0),
    }),
  });
  await browser.localStorage.removeItem('hoc_click');
});`;

const WOO_SNIPPET = `
// Heart of Columbus order count. Uses WooCommerce's own order attribution
// (on by default since WooCommerce 8.5) and sends only the order number,
// total, currency and item count for orders that came from Heart of Columbus.
add_action( 'woocommerce_thankyou', function ( $order_id ) {
  $order = wc_get_order( $order_id );
  if ( ! $order || $order->get_meta( '_hoc_counted' ) ) return;
  if ( 'heartofcolumbus' !== $order->get_meta( '_wc_order_attribution_utm_source' ) ) return;
  wp_remote_post( '${ORIGIN}/api/conversion', array(
    'blocking' => false,
    'headers'  => array( 'content-type' => 'text/plain' ),
    'body'     => wp_json_encode( array(
      'shop'     => 'YOUR-SHOP-ID',
      'key'      => 'YOUR-KEY',
      'via'      => 'woocommerce',
      'order'    => (string) $order->get_order_number(),
      'total'    => $order->get_total(),
      'currency' => $order->get_currency(),
      'items'    => $order->get_item_count(),
      'click'    => (string) $order->get_meta( '_wc_order_attribution_utm_content' ),
    ) ),
  ) );
  $order->update_meta_data( '_hoc_counted', '1' );
  $order->save();
} );`;

function setupPage({ assets }) {
  const body = `
${header('')}
<main id="main" class="wrap prose tk">
  <p class="kicker kicker-pill">For business owners</p>
  <h1>Count the orders we send you</h1>
  <p class="lede">Every time someone taps Order online, Book online or Shop on Heart of Columbus, or checks out a cart we built, the link carries our tag: <code>utm_source=heartofcolumbus</code>. Your own store already records it. These steps let us count the orders too, so you can see what Heart of Columbus does for your business, in dollars.</p>
  <div class="tk-facts">
    <p><b>What gets sent:</b> the order number, the total, the currency and how many items. Only for orders that came from us.</p>
    <p><b>What never gets sent:</b> the customer’s name, email, phone, address, or what they bought.</p>
    <p><b>What it costs:</b> nothing. We take no commission. The numbers are yours; we use them to show you, and only you, what we sent.</p>
  </div>
  <p>Before you start, ask us for your <b>shop ID</b> and <b>key</b>. They are made for your business only: <a href="/owners/#claim">send a note through the owner form</a> and we reply with both.</p>

  <h2 id="shopify">Shopify</h2>
  <ol>
    <li>In your Shopify admin, open <b>Settings</b>, then <b>Customer events</b>.</li>
    <li>Choose <b>Add custom pixel</b> and name it <b>Heart of Columbus</b>.</li>
    <li>Paste the code below. Replace <code>YOUR-SHOP-ID</code> and <code>YOUR-KEY</code> with the two we sent you.</li>
    <li>Under permissions, choose <b>Not required</b> (it collects no personal data), then <b>Save</b> and <b>Connect</b>.</li>
  </ol>
  ${code(SHOPIFY_PIXEL)}
  <p>You can also see our orders yourself, with no code: open an order and look at its <b>Conversion summary</b> or landing page, which shows <code>heartofcolumbus</code> for orders we sent.</p>

  <h2 id="woocommerce">WooCommerce</h2>
  <h3>One click (easiest)</h3>
  <ol>
    <li>Open the link we send you. It looks like <code>heartofcolumbus.netlify.app/api/woo-connect?b=your-shop</code>.</li>
    <li>Log in to your WordPress admin if it asks. WooCommerce shows <b>Heart of Columbus would like to connect to your store</b>, with <b>Read</b> access only.</li>
    <li>Press <b>Approve</b>. That’s it. Once a day we read your recent orders and keep only the ones we sent you: the order number, total, status and whether it’s completed. We can’t change anything in your store.</li>
    <li>To disconnect any time: WooCommerce, Settings, Advanced, REST API, and revoke the Heart of Columbus key.</li>
  </ol>
  <h3>Or paste a snippet instead</h3>
  <ol>
    <li>Make sure WooCommerce is version 8.5 or newer and <b>Order attribution</b> is on (WooCommerce, Settings, Advanced, Features). It is on by default.</li>
    <li>Install the free <b>Code Snippets</b> plugin, or use your theme’s <code>functions.php</code>.</li>
    <li>Add the snippet below as a new snippet that runs everywhere. Replace <code>YOUR-SHOP-ID</code> and <code>YOUR-KEY</code>.</li>
  </ol>
  ${code(WOO_SNIPPET)}
  <p>With no code at all, WooCommerce’s order screen already shows <b>Origin: Source: heartofcolumbus</b> on orders we sent.</p>

  <h2 id="other">Square, Wix, Toast, Clover and everyone else</h2>
  <p>These systems don’t let a small snippet run at checkout, so we use a code instead:</p>
  <ol>
    <li>Make a discount code just for us, for example <b>HOC5</b> for 5 percent off, or a free item. You choose the offer.</li>
    <li>Tell us the code. We show it on your listing as yours, with the end date you give.</li>
    <li>Once a month, send us how many times it was used and the total. Your system’s discount report has both.</li>
  </ol>
  <p>Your own reports also show visits we sent: look for the source <b>heartofcolumbus</b> in your website analytics.</p>

  <h2 id="test">Test it</h2>
  <p>Place one test order through your own Heart of Columbus listing (Shopify’s test payment mode works), then tell us. We confirm it reached your count and delete it.</p>

  <h2 id="what-counts">What the numbers mean</h2>
  <ul>
    <li><b>Visits sent:</b> taps from Heart of Columbus to your ordering, booking or shop pages.</li>
    <li><b>Carts sent:</b> carts we built and handed to your checkout, with their value.</li>
    <li><b>Orders placed:</b> orders your snippet or discount code confirmed. A cancelled or refunded order still counts until you tell us; send corrections any time.</li>
  </ul>
</main>
${footer()}`;
  return page({ title: 'Count the orders we send you | Heart of Columbus', description: 'How a Columbus business can count the visits and orders Heart of Columbus sends it: a Shopify pixel, a WooCommerce snippet, or a discount code.', body, styles, assets, path: '/owners/tracking/' });
}

function reportPage({ assets }) {
  const body = `
${header('')}
<main id="main" class="wrap pk" data-track-report>
  <p class="kicker kicker-pill">Private</p>
  <h1 class="pk-h">What we sent each business</h1>
  <p class="muted">Visits and carts counted by Heart of Columbus, and orders confirmed by each owner’s snippet or code. <a href="/owners/tracking/">How owners set it up</a>.</p>
  <form class="tk-bar" data-track-form>
    <label>Month <input type="month" name="month" data-track-month></label>
    <label>Key for a business <input name="slug" placeholder="business-slug" data-track-slug></label>
    <button class="btn btn-sm" type="submit">Show</button>
  </form>
  <p class="muted" data-track-status>Loading…</p>
  <p data-track-lookup hidden></p>
  <div data-track-out></div>
</main>`;
  return page({ title: 'Tracking report | Heart of Columbus', description: 'Private.', body, scripts: ['tracking.js'], styles, assets, head: '<meta name="referrer" content="no-referrer">', path: '/owners/report/' });
}

function connectedPage({ assets }) {
  const body = `
${header('')}
<main id="main" class="wrap prose tk">
  <p class="kicker kicker-pill">For business owners</p>
  <h1 data-connected-h>You’re connected</h1>
  <p data-connected-p>Thank you. Heart of Columbus can now count the orders it sends your store. Once a day we read your recent orders and keep only ours: the order number, total, status and whether it’s completed. Nothing about your customers.</p>
  <p>You can disconnect any time in WooCommerce, Settings, Advanced, REST API.</p>
  <p class="btns"><a class="btn" href="/owners/">Back to Heart of Columbus for owners</a></p>
  <script>(function(){var q=new URLSearchParams(location.search);if(q.get('success')==='0'){document.querySelector('[data-connected-h]').textContent='Not connected';document.querySelector('[data-connected-p]').textContent='The connection was not approved, so nothing was shared. You can open the link again any time.';}})();</script>
</main>
${footer()}`;
  return page({ title: 'Connected | Heart of Columbus', description: 'Your store is connected to Heart of Columbus order tracking.', body, styles, assets, head: '<meta name="referrer" content="no-referrer">', path: '/owners/connected/' });
}

export const trackingPages = (ctx) => [
  { path: 'owners/tracking/index.html', html: setupPage(ctx) },
  { path: 'owners/report/index.html', html: reportPage(ctx) },
  { path: 'owners/connected/index.html', html: connectedPage(ctx) },
];
