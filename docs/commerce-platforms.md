# What Columbus business websites run on

Scan of October 26, 2026 (`scripts/probe-deep.mjs`, run by the "Probe commerce"
GitHub workflow). 653 directory listings have a website on their Google
listing; 539 of them answered. Of the 114 that did not, 43 are Facebook pages
(nothing to read) and most of the rest block automated visitors (403) or
were down. Results from the earlier `/api/probe` run fill in where they can.

## The direct count

The homepage "to order, book or shop direct" number went from **64 to 151**.

| | Before | Now |
| --- | ---: | ---: |
| Order online | 12 | 25 |
| Book online | 46 | 103 |
| Live catalog in the one cart | 13 | 16 |
| Shop their online store (link) | 9 | 17 |
| **Any of these** | **64** | **151** |

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
