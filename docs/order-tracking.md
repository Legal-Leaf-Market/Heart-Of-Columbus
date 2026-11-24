# Order tracking: how we know an order really happened

Heart of Columbus never takes the payment, so the order always happens on the
business's own store. That means we can't see it directly. Tracking works the
way affiliate programs (GoAffPro and the like) do: we tag what we send, the
store keeps the tag on the order, and something reports the order back.

## The three pieces

**1. We tag and log every handoff (built, runs on its own).**
- Every Order, Book, Shop and Gift card button, and every cart we hand to a
  store's checkout, carries `utm_source=heartofcolumbus` (`src/ref.mjs`).
- A cart also gets a visit id. On Shopify it rides in the cart link as the
  cart attribute `hoc_click`, which Shopify saves on the order itself. On
  WooCommerce it rides as `utm_content`, which WooCommerce's built-in order
  attribution saves on the order.
- At the same moment the site logs the handoff to `/api/handoff`: the
  business, the kind of handoff, and for a cart its visit id, item count and
  total. Nothing about the shopper.

**2. The store reports the order back (needs the owner, once).**
The owner picks one of three ways, all on `/owners/tracking/`:
- **Shopify:** paste our custom pixel into Settings, Customer events. When a
  checkout completes it posts the order number, total, currency, item count
  and the visit id to `/api/conversion`, only if the order came from us.
- **WooCommerce:** add our snippet (Code Snippets plugin or `functions.php`).
  Same fields, same rule.
- **Anything else (Square, Wix, Toast, Clover):** a discount code just for
  Heart of Columbus, and the owner sends the month's redemption count and
  total.
Each business gets its own key (`src/pixel-key.mjs`) so nobody can post
orders for a store that isn't theirs. An order number counts once.

**3. We match them (built).**
The private report (`/owners/report/#k=<HOC_ADMIN_KEY>`) shows, per business
per month: visits sent, carts sent and their value, orders the store
confirmed, and how many of those matched a cart we sent by visit id. Matched
means certain: that exact cart became that order.

## What it can and can't prove

- **Placed, not fulfilled.** The snippet fires when the order is placed. A
  cancelled or refunded order still counts until the owner tells us. Proving
  fulfillment would need access to the store's admin (a Shopify app or a
  WooCommerce webhook with the owner's permission); not built.
- **No install, no automatic count.** Without step 2 we still know what we
  sent (visits, carts, cart value). The owner can also see our orders in
  their own store with no code: Shopify shows the landing page and
  conversion source on each order, WooCommerce shows Origin: heartofcolumbus.
- **Untracked stock.** Unrelated to counting, but noted: a store that doesn't
  track inventory can sell an item at our checkout that it doesn't have.

## Setting a business up

1. Open the report with the admin link, type the business's slug in "Key for
   a business" and press Show. It returns their shop ID and key.
2. Send them `/owners/tracking/`, the shop ID and the key.
3. Ask them to place one test order through their own listing; it should
   appear on the report within a minute.

Storage: Netlify Blobs store `tracking` (`h/<month>/<slug>` for handoffs,
`c/<month>/<slug>` for confirmed orders). Tests: `tests/tracking.test.mjs`.
