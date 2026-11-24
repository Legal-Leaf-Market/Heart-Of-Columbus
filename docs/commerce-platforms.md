# What Columbus business websites run on

Scan of October 26, 2026 (`scripts/probe-deep.mjs`, run by the "Probe commerce"
GitHub workflow). 653 directory listings have a website on their Google
listing; 539 of them answered. Of the 114 that did not, 43 are Facebook pages
(nothing to read) and most of the rest block automated visitors (403) or
were down. Results from the earlier `/api/probe` run fill in where they can.

## The direct count

The homepage "to order, book or shop direct" number went from **64 to 150**.

| | Before | Now |
| --- | ---: | ---: |
| Order online | 12 | 25 |
| Book online | 46 | 103 |
| Live catalog in the one cart | 13 | 16 |
| Shop their online store (link) | 9 | 16 |
| **Any of these** | **64** | **150** |

(Before, the number left out the shops with a live catalog. It counts them now.)

## Site builders

| Builder | Sites |
| --- | ---: |
| Custom or other | 152 |
| WordPress, no store | 127 |
| Wix | 76 |
| WordPress with WooCommerce traces | 70 |
| Squarespace | 29 |
| GoDaddy | 27 |
| Square Online or Weebly | 18 |
| Duda | 13 |
| Shopify | 11 |
| Booksy page as the website | 9 |
| GlossGenius page as the website | 4 |
| Webflow | 3 |

Only 7 of the WooCommerce sites have products in an open catalog; the rest
carry the plugin without selling.

## Ordering, booking and shop systems found, with the link each listing got

Ordering: Square Online 9, Toast 4, DoorDash Storefront (commission free) 3,
Square checkout links 2, Clover 1, FoodTec 1, and 5 restaurants' own ordering
pages, plus 1 owner-set Google order link.

Booking: Booksy 11, GlossGenius 7, Calendly 6, Wix Bookings 5, Acuity 4,
Vagaro 4, Jane 3, Square Appointments 2, Mindbody 2, OpenTable 2, Phorest 2,
Gingr 2, Housecall Pro 2, GoCheckin 2, and one each of Jobber, Workiz,
FareHarbor, NexHealth, healow, AutoVitals, OrbisX, Jackrabbit, WellnessLiving,
Microsoft Bookings and Google Calendar appointments. 20 more book on their
own site's booking page, 3 through an appointment request page, and 18
through a booking link the owner set on Google.

Shops: Shopify 11 and WooCommerce 7 sites with products (16 open catalogs in
the one cart), plus store links for Square Online, Squarespace, Wix and
Shopify stores whose catalog is closed.

The detector knows about 100 systems (`PROVIDERS` and `PLATFORM_SIGNS` in
`src/commerce-core.mjs`), including ones no Columbus site uses yet (Resy,
Tock, SevenRooms, Fresha, StyleSeat, Big Cartel, Ecwid, BigCommerce and
others), so a site that switches gets picked up on the next scan.

## The one cart: which systems can join it

The multi-store cart needs two things from a shop's own website, with no key
from the owner: a product list anyone can read, and a link that opens the
shop's checkout with the items already in it.

| System | Read the catalog | Fill their cart | In the one cart |
| --- | --- | --- | --- |
| Shopify | yes, `/products.json` | yes, `/cart/<variant>:<qty>` | yes |
| WooCommerce | yes, Store API | one item per link | yes |
| BigCommerce | needs a storefront token | yes, `cart.php` | no site uses it here |
| Squarespace Commerce | yes, `?format=json` | no cart link exists | link only |
| Square Online | owner's Square API key | owner's API key (Checkout links) | link only until an owner signs on |
| Wix Stores | owner's headless client ID | owner's client ID | link only until an owner signs on |
| Ecwid | owner's public token | no | link only |
| Toast, Clover, Square ordering | partner API only | no | link only |
| Booking systems | not a cart | | link only |

So Shopify and WooCommerce are the only engines found here that can join the
cart today. Square Online, Wix and Squarespace stores could join once an
owner signs on and gives us a key, through `partners.mjs`.

## Not counted, on purpose

- DoorDash, Grubhub and Uber Eats marketplace pages (they take a cut).
- Etsy shops (a marketplace fee on every sale).
- Payment pages (LawPay, Weave bill pay, Clover pay links), patient portals,
  job listings and "powered by" badges.
- Lacquer nail booking pages on sites that carry a "claim this salon" link,
  which suggests the salon never set them up.
- Booking scripts with no public link (a ServiceTitan or Mindbody widget
  that only works inside the business's page).

## Assessment of November 18, 2026

Same scan data (`scripts/data/probe-deep.json`, `probe-results.json`), read
again after the Gramz and Sojourn fixes, and checked against what each
vendor's own documentation says an outside site may read.

### Where the 598 reachable websites stand

| Engine (primary signal) | Sites | Live catalog in the one cart | What we link |
| --- | ---: | ---: | --- |
| Custom or none detected | 237 | 0 | website |
| WordPress, no store | 134 | 0 | website |
| WooCommerce | 67 | 7 | catalog, else website |
| Wix (Stores on 39) | 72 | 0 | store link on 4 |
| Squarespace (Commerce on 29) | 29 | 0 | store link on 1 |
| GoDaddy | 27 | 0 | website |
| Square Online / Weebly | 22 | 0 | Order online on 8, store link on 8 |
| Shopify | 10 | 10 | catalog |

The one cart can read 17 shops today: 10 Shopify (At Home with Heartland,
Boutique Elise, The Castle Games, Empire Tea Services, Footworks, XO by
Sophia's, The Bicycle Station, Cookie Paradise, Minash Boutique, and one more
by stack signal) and 7 WooCommerce (Black Jewell Popcorn, Columbus Outdoor
Power, Gracie Mae Events, Jewell Rittman, Tribal Blend Cat Cafe, Divine
Family BBQ, Sojourn Coffee). Squarespace has one store with an open product
list (Wild Wisdom, 53 products) and no cart link.

### Fixed in this pass

- **A Square Online page names other merchants.** Square's shared page assets
  on gramz-bakery.square.site carried olympio-restaurant.square.site, and the
  import kept it as a second "Order online" button to a different restaurant.
  A business whose own site is a square.site now links only its own
  subdomain. Gramz was the only one of the 26 Weebly / Square sites affected.
- **The website was the order page twice over.** Eleven of those sites
  (Amazing Joe's, Ramen Alley, Nutri-Bee, Lucas Brothers, Gramz, Really the
  Barbers, Turtle's Flowers, Meli Market, Guardian K9 and others) showed a
  Website button opening the same page as Order online or Shop. One button now.
- **WooCommerce variable products.** Sojourn's coffees come in grinds and sizes.
  The cart showed the cheapest option behind a link Woo refuses; it now reads
  every variation with its own price and stock and fills the cart the way
  Woo's own form does. This applies to all 7 Woo shops.

### Each engine, against its own documentation

| Engine | Public catalog | Cart handoff | Verdict for us |
| --- | --- | --- | --- |
| Shopify | `/products.json` | Cart permalinks, `/cart/<variant>:<qty>`, many items in one link. Shopify still supports them but adds no features; its successor is "Cart and Checkout Permalinks" (Universal Commerce Protocol) | In the cart. Watch the successor format |
| WooCommerce | Store API, documented as public and unauthenticated, stable at v1. A store can disable or rate limit it | `?add-to-cart=`, one item per link; variations need the parent id, variation id and attributes | In the cart |
| Squarespace Commerce | `?format=json` exists, but Squarespace says the format "is not static" and is not a substitute for its APIs; the Commerce API needs the owner's key | None | Link only. Not worth a reader for one shop |
| Square Online | None. Every Square Catalog API call needs a token, personal or OAuth, from the merchant | Square Checkout payment links, with the owner's token | Link only until an owner signs on through partners.mjs |
| Wix Stores | None. Wix says third party apps must use OAuth with a Read Products scope after the owner installs the app; API keys are not for third party apps | Headless checkout, owner's client | Link only until an owner signs on |
| GoDaddy, Duda, Webflow | No store engine found on these sites | | Website |
| Toast, Clover, DoorDash Storefront | Partner programs only | | Order link, never a cart |

### The market around us

Trackers disagree because they count different things, so the shape matters
more than the decimals. On the whole web WooCommerce leads Shopify (HTTP
Archive, May 2026: 6.6% of measurable origins against 4.8%, with Wix
eCommerce 1.5% and Squarespace Commerce 1.1%). Shopify leads among larger
stores and in the US, where BuiltWith and StoreLeads aggregations put it near
30% with Wix and Squarespace next. WooCommerce is strongest among small stores
(about half of stores under $127K a year in one report). No tracker reports a
share for Square Online.

Columbus looks like the small-business web, not the national store web:
WordPress and custom sites dominate, Wix and Squarespace are common, and real
online selling is rare. Of 598 sites, 17 run a store we can read and about 35
more run one we can only link.

### What to do next, in order

1. **Keep Shopify and WooCommerce healthy.** They are the whole cart. Add a
   test that runs `/api/shop` for every `feed: true` shop in the probe
   workflow, so a store that closes its catalog is caught by the next scan,
   not by a shopper.
2. **Square is the biggest owner opt-in.** 22 Square Online sites plus the
   cafes and salons on Square POS. One "Connect Square" OAuth flow with
   catalog read scope would let any owner who agrees put a live menu on their
   page. That needs a Square developer app and an owner who says yes; nothing
   is read without one.
3. **Wix second.** 39 Wix Stores sites, almost none selling products (most are
   service businesses whose site builder ships the store app). Worth it only
   for the 4 with real stores (Flowers from the Woods, Garb2Art Cosmetics,
   Sugar Bayer's Cookie Co., The Artisan Salon).
4. **Skip Squarespace, GoDaddy and Duda readers.** One open Squarespace
   catalog, an unsupported format, and no cart link: the store link is the
   right answer.
5. **Ask the owners.** A five question owner survey through the claim form
   tells us more than another scan: what you sell online today (nothing,
   products, food orders, bookings), on what system, whether you would show a
   live menu or catalog here, whether you would connect your Square or Wix
   account to do it, and what stops you selling online now. Answers go in
   `owner-words.mjs` only when sent, like everything else from owners.

### Sources

- Shopify cart permalinks: https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks and https://help.shopify.com/en/manual/checkout-settings/cart-permalink
- WooCommerce Store API: https://developer.woocommerce.com/docs/apis/store-api/ and https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/
- Squarespace JSON and Commerce APIs: https://developers.squarespace.com/view-json-data and https://developers.squarespace.com/commerce-api
- Square permissions (OAuth or personal token): https://developer.squareup.com/docs/oauth-api/square-permissions
- Wix app authentication: https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-using-oauth.md and https://dev.wix.com/docs/sdk/backend-modules/stores/products/setup
- Market share: https://www.gravitykit.com/ecommerce-platform-market-share-2026/ , https://redstagfulfillment.com/what-is-woocommerces-market-share/ , https://taylorsicard.com/blog/ecommerce-platform-market-share-north-america-2026
