# Heart of Columbus catalog and menu playbook
Checked November 24, 2026.

## Findings and rollout

Start with La Patrona’s structured menu, Garage Pub’s and Zaharakos’ priced HTML, Misora’s first-party HTML, and Apna Kitchen’s linked PDF. Chumley’s Doghouse and Jill’s Diner also showed visible menu pricing. Validate parsers against specific items before enabling a feed. Wild Bramble is a separate catering-by-quote listing, with a seasonal sample menu and independent meal-prep flow.

Wix Stores product sitemaps are the best next discovery improvement for the partially covered Wix catalogs. Treat custom-domain builders, storefronts, and reservation or ordering handoffs as separate signals. In particular, a Weebly fingerprint does not establish Square commerce, and a Wix or Squarespace fingerprint does not prove that a store is installed. Quarantine Carlos Pizza and M&Y Massage because of conflicting navigation or location evidence. Review the current setup of The Forge before inheriting its old pub order link.

The brief supplies 291 website rows. This pass got 86 direct successful root responses, deferred 55 hosted, platform or access-sensitive URLs, and recorded 150 other root outcomes including timeouts, proxy errors and non-successful robots responses. Public-index evidence supplements some failed direct requests. Direct root success does not imply menu or checkout verification. The separate no-website list is a discovery queue. Recovered URLs are included when there was a credible lead and flagged where identity or freshness needs review.

## Reading the CSV

- The first seven columns follow the requested mapping. Additional columns preserve the original scan, direct check outcome, source URL and observed handoff. Strong prior crawl data remains labeled as such. The platform column can combine an observed builder and an ordering vendor. Hosted-only URLs are marked unverified for extraction even where a customer can order.
- Treat unverified rows as research queue entries. “None” means a specific inspected surface was unsuitable, such as a construction placeholder. It does not mean the business can never publish a catalog. Use the notes to distinguish observed live pages, indexed pages, prior crawl results and leads.
- Do not automatically promote a source from this audit to ingestion. Confirm platform and merchant terms, current robots policy, correct store/location, price parsing, republishing rights, and any checkout policy. Redirects or obscured origin, weak builder markers, boilerplate prices and unmatched titles warrant review.

## Daily job and field rules

1. Maintain a registry per business and location with source URLs, method, terms review date, robots decision, request budget and order handoff. Treat product discovery, price refresh and user handoff as distinct operations. Start on a few representative sites before adding a platform-wide rule.
2. Read robots by origin and check redirected origins independently. Cache robots, use conditional GET with ETag or Last-Modified when supported, honor explicit crawl delays and Retry-After, rotate product refreshes across days when the budget is small, and stop on sign-in, CAPTCHA, 401 or 403. Retain the last verified snapshot during a temporary outage with its observed date. Honor explicit removal signals and rights requests separately.
3. Store business slug, location ID, source URL, canonical item URL, name, section, photo URL and image rights, price amount and currency, price type, quantity or size label, variant ID, availability and observed time. Store monetary amounts as integer minor units with currency. Represent price ranges, market prices and quotes explicitly. Use null when evidence is missing. A menu listing alone leaves stock unknown. Preserve platform variant IDs only when tied to the actual priced option.
4. Fetch only the verified public document. Prefer documented anonymous access, then structured public data, then DOM. Embedded state is only a candidate if the data is intentionally published to anonymous visitors and the terms allow reuse. Do not call undocumented widget APIs merely because a browser loads them.
5. Preserve source and source date. For HTML, select items within their category container and collapse duplicate desktop/mobile copies. For documents, cache the binary hash, read the text layer first, keep page provenance, and apply OCR with human review for columns, decimal points and poorly contrasted text. Avoid publishing an item image when the only source is a whole menu or unlicensed photo.
6. Use read-only requests throughout the research job. Only display prefill links after verifying a merchant-supported documented pattern and concrete, valid IDs. An order button may remain an eligible handoff on its own. Keep marketplaces excluded according to project policy and validate direct/white-label eligibility independently.

## Platform playbook

Scores describe usefulness for this credential-free daily job. Source links were reviewed as documentation, published URL evidence, or vendor references on November 24, 2026. Example requests without a live observation are implementation candidates.

### WordPress without WooCommerce

#### How to recognize it

/wp-content/ or a link to api.w.org. Confirm the actual menu or service page separately.

#### Where the products or menu live

Merchant navigation, sitemaps, and public pages REST resource. Elementor and other builders may render differently in REST.

#### One example request and the fields it returns, and how paging works

GET /wp-json/wp/v2/pages?slug=menu returns title and content.rendered if public. For enumeration use per_page and page with X-WP-TotalPages. Preserve PDF and image links.

#### Can a cart or order be pre-filled by link?

No common cart.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

4 for visible HTML, 2 for heterogeneous builders. Themes and shortcodes change.

Sources • [developer.wordpress.org](https://developer.wordpress.org/rest-api/reference/pages/) · [developer.wordpress.org](https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/)

### Wix

#### How to recognize it

wixstatic.com assets and Wix runtime. This identifies the builder only.

#### Where the products or menu live

Public sitemap index, linked pages, and restaurant menu links. Wix Stores is a separate signal.

#### One example request and the fields it returns, and how paging works

GET /sitemap.xml yields URLs or child sitemaps. GET a linked page for text and image URLs. Lucabe's /current-menu is a real site-specific entry point.

#### Can a cart or order be pre-filled by link?

No generic verified link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Visual menus and app widgets can omit reliable text.

Sources • [support.wix.com](https://support.wix.com/en/article/understanding-your-sites-sitemap-file) · [lucabecoffeeco.com](https://www.lucabecoffeeco.com/current-menu)

### Wix Stores

#### How to recognize it

A Wix site with actual product detail pages or store product sitemap entries. /product-page/ is a useful hint and can be customized.

#### Where the products or menu live

/store-products-sitemap.xml on an enabled site. Fetch discovered item pages and inspect Product, ProductGroup, Offer and visible options. Wix REST examples require authorization.

#### One example request and the fields it returns, and how paging works

GET /store-products-sitemap.xml returns product loc entries, not catalog fields. GET a discovered page for title, offered price, image, URL and availability when present. Follow sitemap children. Keep variant IDs null unless explicitly mapped.

#### Can a cart or order be pre-filled by link?

Unverified for arbitrary Wix Stores. Open product page.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

4 for discovery and 3 for item fields. Hidden products, custom slugs and variant pricing affect coverage.

Sources • [support.wix.com](https://support.wix.com/en/article/understanding-your-sites-sitemap-file) · [support.wix.com](https://support.wix.com/en/article/wix-stores-optimizing-your-seo-for-product-pages) · [dev.wix.com](https://dev.wix.com/docs/develop-websites-sdk/code-your-site/authorization/make-rest-api-calls-with-an-api-key)

### Square Online

#### How to recognize it

Merchant square.site host or custom domain with Square order and store elements. Weebly assets alone are weak evidence.

#### Where the products or menu live

Merchant-linked order or shop page for navigation. ListCatalog is authenticated and does not establish public online-menu visibility. Square Developer Terms restrict scraping and permanent retention of seller content within their scope.

#### One example request and the fields it returns, and how paging works

GET https://lucasbrothersshop.square.site/ as a customer link. Extract no automated feed pending applicable terms or permission. Seller API GET /v2/catalog/list uses auth and cursor.

#### Can a cart or order be pre-filled by link?

No verified generic link. Keep merchant-published product, order or payment URLs as issued.

#### Terms, robots and rate limits to respect

Keep hosted catalog ingestion disabled under this project workflow. See platform terms and scope in the source links below. Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2 for automated sourcing, 4 for customer handoff. Location, mode and widget affect menu.

Sources • [api.squareup.com](https://api.squareup.com/help/us/en/article/6861-create-an-order-online-page-with-square-online-store) · [developer.squareup.com](https://developer.squareup.com/reference/square/catalog-api/list-catalog) · [squareup.com](https://squareup.com/us/en/legal/general/developers)

### Weebly

#### How to recognize it

editmysite.com and Weebly references. Distinguish a brochure site from a merchant Square shop.

#### Where the products or menu live

Follow printed menu, shop link, PDF or store handoff from the site.

#### One example request and the fields it returns, and how paging works

GET merchant home then a listed menu or shop link. Expect links, visible labels and possibly prices. Follow actual next links.

#### Can a cart or order be pre-filled by link?

No common verified link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3 for brochure content. Store links may point to a separate host.

Sources • [weebly.com](https://www.weebly.com/) · [ramen-alley.com](https://www.ramen-alley.com/)

### GoDaddy Websites + Marketing

#### How to recognize it

godaddysites.com and wsimg.com assets as hints. Registrar or DNS hosting alone proves little.

#### Where the products or menu live

Visible pages and navigation. Menus may be under a single scroll section, in HTML or as an image.

#### One example request and the fields it returns, and how paging works

GET https://savagedistillingllc.godaddysites.com/ for published navigation and text. Find a menu or shop link before assigning an adapter. Follow visible next links only.

#### Can a cart or order be pre-filled by link?

No common verified link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3 for static pages, 2 for image menus. Similar asset fingerprints occur without a store.

Sources • [savagedistillingllc.godaddysites.com](https://savagedistillingllc.godaddysites.com/) · [godaddy.com](https://www.godaddy.com/help/add-an-online-store-section-to-my-website-32222)

### GoDaddy Online Store

#### How to recognize it

Confirm published store section plus actual item pages. URLs are merchant-specific.

#### Where the products or menu live

Merchant shop and product links. Parse rendered product data where permitted. Public catalog API unverified.

#### One example request and the fields it returns, and how paging works

GET the merchant-linked store page then a linked item. Look for name, price, image and explicit availability. Follow published category and pagination links.

#### Can a cart or order be pre-filled by link?

Unverified. Open item URL.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. A store section can be hidden, empty or replaced by an external link.

Sources • [godaddy.com](https://www.godaddy.com/help/get-my-store-published-23904)

### Duda

#### How to recognize it

cdn-website.com or dmapi.net assets are hints. An active native store needs store product or category evidence.

#### Where the products or menu live

Native Store includes active products and categories in its sitemap. Third-party embedded stores must be handled by vendor.

#### One example request and the fields it returns, and how paging works

GET /sitemap.xml and then listed product pages. XML loc entries supply canonical URLs. Detail pages may supply name, price and photo. Follow XML children.

#### Can a cart or order be pre-filled by link?

Unverified. Open item URL.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Store implementation and sitemap visibility vary.

Sources • [support.duda.co](https://support.duda.co/hc/en-us/articles/26519753538839-Native-Store-Overview)

### Webflow

#### How to recognize it

data-wf-site or Webflow assets. Ecommerce and CMS are distinct.

#### Where the products or menu live

Published product or CMS pages. Data API product and SKU list requires a bearer token and ecommerce:read.

#### One example request and the fields it returns, and how paging works

GET the published merchant sitemap and a linked product. Inspect rendered price and images. Follow only published collections or next links. Authenticated API pagination is out of scope.

#### Can a cart or order be pre-filled by link?

Unverified. Open item URL.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Custom collection routes and hidden fields affect coverage.

Sources • [developers.webflow.com](https://developers.webflow.com/data/reference/ecommerce/products/list)

### Thryv

#### How to recognize it

Thryv branding or localsearch.com, such as the listed Columbus Industrial Electric page. Treat as a hint pending inspect.

#### Where the products or menu live

Merchant-visible service pages or outbound scheduler. No verified public retail feed.

#### One example request and the fields it returns, and how paging works

GET merchant-linked services page if allowed. Capture visible labels and quoted prices where present. Several pages may be independent.

#### Can a cart or order be pre-filled by link?

No common verified link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Scheduling and estimates are often the only actions.

Sources • [columbusindustrialelectricinc.localsearch.com](https://columbusindustrialelectricinc.localsearch.com/) · [thryv.com](https://www.thryv.com/)

### Hibu

#### How to recognize it

Hibu attribution or platform assets, plus merchant page evidence.

#### Where the products or menu live

Merchant brochure, services and offers. Inspect linked third-party shop as a separate platform.

#### One example request and the fields it returns, and how paging works

GET the merchant's listed service page. Capture service names or published prices. Use visible page links.

#### Can a cart or order be pre-filled by link?

No common verified link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Site branding does not imply commerce.

Sources • [hibu.com](https://hibu.com/) · [percifieldradiator.com](https://percifieldradiator.com/)

### Squarespace brochure site

#### How to recognize it

Squarespace assets. A site with no product pages can still load Squarespace scripts.

#### Where the products or menu live

First-party menu and PDF links. Black Sheep has separate food and drink listings plus a Toast destination.

#### One example request and the fields it returns, and how paging works

GET the current menu URL linked from https://www.blksheeppizza.com/. Read section labels and prices if textual. Individual menus can have independent seasonal links.

#### Can a cart or order be pre-filled by link?

No confirmed generic link. Follow merchant's order link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

4 for textual menus, 2 for image-only structures. Seasonal links drift.

Sources • [blksheeppizza.com](https://www.blksheeppizza.com/)

### Squarespace Commerce

#### How to recognize it

Squarespace fingerprint plus working store collection and products.

#### Where the products or menu live

Keep the existing collection ?format=json adapter. Treat this as a convention whose availability must be checked per site.

#### One example request and the fields it returns, and how paging works

GET merchant store collection with ?format=json. Keep product data, URLs and explicit variants when provided and follow returned pagination only.

#### Can a cart or order be pre-filled by link?

No verified generic link. Use item page.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Password gates, template changes and non-store collections.

Sources • [wildwisdomstore.com](https://www.wildwisdomstore.com/) · [support.squarespace.com](https://support.squarespace.com/)

### Shopify

#### How to recognize it

Shopify theme or CDN assets plus a working store and products.

#### Where the products or menu live

Existing /products.json feed. Also consider theme item markup for a single public product.

#### One example request and the fields it returns, and how paging works

GET /products.json?limit=250&page=1 under the existing adapter. Look for handle, variants, image, price and availability. Coverage at exactly 1000 can indicate your own ceiling, so check before labeling complete.

#### Can a cart or order be pre-filled by link?

Yes, /cart/<variant-id>:<quantity>,<variant-id>:<quantity>. Verify the intended variant and merchant domain.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

4. Store protection, locale and channel inventory can differ.

Sources • [shopify.dev](https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks) · [cookieparadise.co](https://www.cookieparadise.co/collections/all)

### WooCommerce

#### How to recognize it

WordPress plus WooCommerce product signals or confirmed Store API result.

#### Where the products or menu live

Existing public Store API. Confirm a real response and usable products before assigning the adapter.

#### One example request and the fields it returns, and how paging works

GET /wp-json/wc/store/v1/products?per_page=25&page=1. Read IDs, prices and currency minor unit, is_in_stock, images, permalink and categories. Use pagination metadata.

#### Can a cart or order be pre-filled by link?

Yes, /?add-to-cart=<product-id>&quantity=1 for simple products. Variation links require the correct variation ID and any required options. Don't test by adding items during a crawl.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

5 when enabled and accurately scoped. Plugins, empty feeds and variation options vary.

Sources • [developer.woocommerce.com](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/) · [woocommerce.com](https://woocommerce.com/document/quick-guide-to-woocommerce-add-to-cart-urls/)

### BigCommerce

#### How to recognize it

Merchant theme and product links. Verify underlying storefront, since headless designs hide brand markers.

#### Where the products or menu live

Merchant product and category pages. GraphQL Storefront API uses bearer tokens and server-to-server access is subject to its private-token rules.

#### One example request and the fields it returns, and how paging works

GET a merchant-linked product URL for displayed fields. Follow category pagination. Do not use a browser token for the daily server job.

#### Can a cart or order be pre-filled by link?

Yes, documented /cart.php?action=add&sku=<urlencoded-SKU>, or /cart.php?action=add&product_id=<id>&qty=1 on compatible storefronts. Verify required options before displaying link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

4 for confirmed Stencil pages. Custom storefronts and modifier-heavy items vary.

Sources • [docs.bigcommerce.com](https://docs.bigcommerce.com/developer/docs/storefront/guides/graphql-storefront-api/authentication) · [docs.bigcommerce.com](https://docs.bigcommerce.com/developer/docs/admin/checkout-and-cart/custom-checkouts/add-to-cart-ur-ls)

### Ecwid

#### How to recognize it

Ecwid widget embedded on custom domains or Ecwid-hosted storefront. Confirm public store details and item link.

#### Where the products or menu live

First-party shop. REST Search Products requires an appropriate token and scope. Public read-only tokens exist through authorized provisioning.

#### One example request and the fields it returns, and how paging works

GET public item URL from merchant, reading visible name, price and options. Documented GET /api/v3/{storeId}/products uses limit and offset with an authorized catalog token. No token acquisition from widget internals.

#### Can a cart or order be pre-filled by link?

Unverified as a universal no-key cross-site cart. Link to item.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Embedded widgets and custom URL mode can change.

Sources • [docs.ecwid.com](https://docs.ecwid.com/api-reference/rest-api/products/search-products) · [github.com](https://github.com/Ecwid/ecwid-api-docs/blob/master/includes/_authentication.md)

### Big Cartel

#### How to recognize it

bigcartel.com store hostname or corroborated custom storefront. Inspect actual product link.

#### Where the products or menu live

Merchant shop index and published product pages. Developer API uses OAuth.

#### One example request and the fields it returns, and how paging works

GET merchant-linked product page for displayed items, options and sold-out state where available. Follow published collection pages.

#### Can a cart or order be pre-filled by link?

Unverified. Use product link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Themes and item option forms differ.

Sources • [developers.bigcartel.com](https://developers.bigcartel.com/api/v1)

### Toast

#### How to recognize it

order.toasttab.com/online/<restaurant> or merchant Toast link. Select and verify Columbus location.

#### Where the products or menu live

First-party restaurant menu preferred. Treat hosted Toast order page as handoff unless collection is authorized. Official Menus API requires authentication and restaurant access.

#### One example request and the fields it returns, and how paging works

GET https://order.toasttab.com/online/black-sheep-345-4th-street as a customer destination. It publishes menu groups and items in its customer UI. No approved anonymous API pagination.

#### Can a cart or order be pre-filled by link?

No verified general cart prefill. Link to location order page.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2 for daily ingestion, 4 for handoff. Location, time and order channel change the menu.

Sources • [doc.toasttab.com](https://doc.toasttab.com/doc/devguide/authentication.html) · [order.toasttab.com](https://order.toasttab.com/online/black-sheep-345-4th-street)

### Square for Restaurants

#### How to recognize it

Restaurant POS product. Merchant's Square Online ordering page is the customer-facing evidence.

#### Where the products or menu live

Use restaurant's own published menu and customer ordering page. POS catalog and stock need seller authorization.

#### One example request and the fields it returns, and how paging works

GET merchant-issued Square order URL as handoff. No POS API request in this workflow. Use a clearly associated first-party menu if available.

#### Can a cart or order be pre-filled by link?

No verified generic cart prefill.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. POS catalog differs from what one online location serves.

Sources • [squareup.com](https://squareup.com/us/en/point-of-sale/restaurants) · [developer.squareup.com](https://developer.squareup.com/reference/square/oauth-api)

### Clover

#### How to recognize it

clover.com/online-ordering/<restaurant> or Clover button.

#### Where the products or menu live

Prefer restaurant menu. Hosted ordering for handoff. Inventory API is merchant-authenticated.

#### One example request and the fields it returns, and how paging works

Use https://www.clover.com/online-ordering/rivera-maya-mexican-gril-columbus as a customer link. GET /v3/merchants/{mId}/items is an authenticated API and outside this workflow.

#### Can a cart or order be pre-filled by link?

No verified general cart link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Inventory and modifiers can be channel-specific.

Sources • [docs.clover.com](https://docs.clover.com/dev/reference/inventorygetitems) · [clover.com](https://www.clover.com/online-ordering/rivera-maya-mexican-gril-columbus)

### GloriaFood

#### How to recognize it

glf-button with data-glf-cuid and foodbooking.com/embedder/js/ewm2.js.

#### Where the products or menu live

Merchant menu and vendor-controlled ordering widget. The button is a launch mechanism, and its ID does not establish permission to query any underlying service.

#### One example request and the fields it returns, and how paging works

GET merchant page to see published button and any independent menu links. Widget-only catalog and paging unverified.

#### Can a cart or order be pre-filled by link?

No verified prefill. Link to merchant page that launches widget.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Old embed can remain after change of vendor or closure.

Sources • [gloriafood.com](https://www.gloriafood.com/restaurant-ideas/instructions)

### SpotHopper

#### How to recognize it

spotapps.co handoffs and merchant food-menu/drink-menu routes. Confirm both by page evidence.

#### Where the products or menu live

First-party menu pages, sometimes PDFs. Garage Pub food menu yielded 160 visible price-like strings in a preliminary scan.

#### One example request and the fields it returns, and how paging works

GET https://thegaragepubandgrill.com/food-menu. Read headings, item titles, descriptions and prices in rendered sections. Check drink page separately. No universal pagination.

#### Can a cart or order be pre-filled by link?

Unverified. Preserve actual merchant order link only.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

4 for page-specific sections. Tabs, events and repeated content can cause duplicate items.

Sources • [howto.spothopperapp.com](https://howto.spothopperapp.com/knowledge/menus) · [thegaragepubandgrill.com](https://thegaragepubandgrill.com/food-menu)

### Popmenu

#### How to recognize it

Merchant website with Popmenu branding or credited menu widget, custom URLs.

#### Where the products or menu live

Merchant interactive menu with optional first-party ordering. Prefer actual public menu, JSON-LD if present.

#### One example request and the fields it returns, and how paging works

GET the merchant's linked menu page. Read visible categories, item names and prices. Follow menu links only. Public bulk endpoint unverified.

#### Can a cart or order be pre-filled by link?

Unverified. Use actual order page.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Layers and location menus vary.

Sources • [get.popmenu.com](https://get.popmenu.com/pricing)

### BentoBox

#### How to recognize it

Merchant restaurant website with BentoBox credit or assets. Verify each merchant.

#### Where the products or menu live

Merchant's menu page can be textual, PDF or image. Separate ordering widget possible.

#### One example request and the fields it returns, and how paging works

GET merchant-linked menu. Read sections and price where present or PDF references. Actual linked menu tabs control traversal.

#### Can a cart or order be pre-filled by link?

Unverified. Use menu or merchant ordering link.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Seasonal PDFs and select menus vary.

Sources • [getbento.com](https://www.getbento.com/)

### ChowNow

#### How to recognize it

Merchant website links to ChowNow or hosted merchant location page.

#### Where the products or menu live

Use merchant menu for collection. ChowNow ordering URL for handoff if it meets your policy.

#### One example request and the fields it returns, and how paging works

Open merchant-issued ChowNow URL as customer destination. Public authorized bulk endpoint unverified.

#### Can a cart or order be pre-filled by link?

Unverified. Use actual order page.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Location, service mode and hosted terms matter.

Sources • [get.chownow.com](https://get.chownow.com/)

### Slice

#### How to recognize it

Merchant link to slicelife.com with restaurant identity and location.

#### Where the products or menu live

Prefer merchant-published menu. Treat Slice as outbound only if the commercial relationship meets the directory policy.

#### One example request and the fields it returns, and how paging works

GET merchant menu page if permitted. Do not use Slice listings as crawler input. No anonymous catalog API verified.

#### Can a cart or order be pre-filled by link?

Unverified. Use merchant's direct option where available.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

1 for ingestion under project rules.

Sources • [slicelife.com](https://slicelife.com/)

### Menufy

#### How to recognize it

Merchant-linked menufy.com location or menu with Menufy branding. Verify merchant name and city.

#### Where the products or menu live

Published merchant menu preferred. Menufy can be an order handoff depending on applicable terms and commercial policy.

#### One example request and the fields it returns, and how paging works

Open the merchant-issued storefront as a user link. No credential-free feed or paging verified.

#### Can a cart or order be pre-filled by link?

Unverified. Link directly if eligible.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Hosted location and pricing can diverge.

Sources • [menufy.com](https://www.menufy.com/)

### Owner.com

#### How to recognize it

Merchant site credits Owner or has a merchant-linked ordering page. Custom domains are common.

#### Where the products or menu live

Published merchant menus. Owner documents channel visibility rules.

#### One example request and the fields it returns, and how paging works

GET merchant menu link if terms permit. Collect visible category names, items and prices. Don't use a different channel to fill missing items.

#### Can a cart or order be pre-filled by link?

Unverified. Use verified location order URL.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Channel-specific inclusion and option groups change.

Sources • [help.owner.com](https://help.owner.com/en/articles/18302030-choose-where-your-menu-appears)

### MenuDrive

#### How to recognize it

Merchant link or MenuDrive branding evidence. Exact route unverified.

#### Where the products or menu live

Merchant menu preferred. Ordering destination from merchant navigation.

#### One example request and the fields it returns, and how paging works

GET merchant-published menu for visible items and prices. Authorized anonymous machine endpoint unverified.

#### Can a cart or order be pre-filled by link?

Unverified. Use merchant order destination.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Hosted routing and menu visibility are merchant configurable.

Sources • [menudrive.com](https://www.menudrive.com/)

### Olo

#### How to recognize it

Merchant-issued Olo host or website ordering link.

#### Where the products or menu live

Use merchant menu for collection. Olo hosted ordering page can be location-dependent.

#### One example request and the fields it returns, and how paging works

https://lucillesbbqevent.olo.com/ is an example customer landing page. A site search or location selection is not a documented anonymous feed.

#### Can a cart or order be pre-filled by link?

Unverified. Use actual location destination.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Availability depends on store and fulfillment.

Sources • [olo.com](https://www.olo.com/ordering) · [lucillesbbqevent.olo.com](https://lucillesbbqevent.olo.com/)

### DoorDash Storefront / Online Ordering

#### How to recognize it

order.online/business/<slug-id> or merchant link. Record separately from the marketplace.

#### Where the products or menu live

First-party merchant menu. The DoorDash online-ordering consumer terms control use of hosted ordering surfaces. Do not scrape those surfaces or assume merchant fee arrangements.

#### One example request and the fields it returns, and how paging works

Use merchant public menu for extraction. The hosted URL can be a user handoff only if approved under project rules.

#### Can a cart or order be pre-filled by link?

Unverified. No generated cart links.

#### Terms, robots and rate limits to respect

Keep hosted catalog ingestion disabled under this project workflow. See platform terms and scope in the source links below. Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

1 for ingest. Eligibility for handoff requires separate verification.

Sources • [help.doordash.com](https://help.doordash.com/en-us/consumers/online-ordering-consumer-terms-and-conditions) · [order.online](https://order.online/business/el-popocatepetl-mexican-restaurant-grill-11607715)

### Marketplace delivery

#### How to recognize it

DoorDash, Grubhub, Uber Eats marketplace listings and delivery app links.

#### Where the products or menu live

No ingestion source under project scope. Merchant's own site or merchant-approved file is the alternative.

#### One example request and the fields it returns, and how paging works

No automated request.

#### Can a cart or order be pre-filled by link?

No for this workflow.

#### Terms, robots and rate limits to respect

Keep hosted catalog ingestion disabled under this project workflow. See platform terms and scope in the source links below. Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

1. Platform policy, fees, markup and menu differences.

Sources • [doordash.com](https://www.doordash.com/terms/) · [grubhub.com](https://www.grubhub.com/legal/terms-of-use) · [uber.com](https://www.uber.com/legal/)

### Facebook and Instagram

#### How to recognize it

facebook.com or instagram.com profile and post links.

#### Where the products or menu live

Use an independently published merchant menu or owner-supplied copy. Automated collection requires Meta authorization. A visible public profile does not grant it.

#### One example request and the fields it returns, and how paging works

No automated request, OCR, or copying from Meta surfaces for this workflow. Public profile can remain a reference.

#### Can a cart or order be pre-filled by link?

No for this workflow.

#### Terms, robots and rate limits to respect

Keep hosted catalog ingestion disabled under this project workflow. See platform terms and scope in the source links below. Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

1. Permission and login boundaries.

Sources • [facebook.com](https://www.facebook.com/legal/automated_data_collection_terms) · [about.fb.com](https://about.fb.com/news/2021/04/how-we-combat-scraping/)

### Google Business Profile and Maps

#### How to recognize it

Google Maps place listing or business profile with Menu and order buttons.

#### Where the products or menu live

Use linked first-party site as discovery only. Skip Google-hosted menu pictures and scraping. Maps terms restrict copying and mass downloading, and Business Profile API management requires eligible authorized access.

#### One example request and the fields it returns, and how paging works

No menu harvesting request. Follow merchant site URL found by ordinary search and validate there.

#### Can a cart or order be pre-filled by link?

No for this workflow.

#### Terms, robots and rate limits to respect

Keep hosted catalog ingestion disabled under this project workflow. See platform terms and scope in the source links below. Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

1. Platform rights, user-contributed photos, missing prices and stale menus.

Sources • [google.com](https://www.google.com/help/terms_maps-earth/) · [developers.google.com](https://developers.google.com/my-business/content/prereqs)

### PDF or image menu

#### How to recognize it

Merchant navigation links to PDF or menu graphics. Verify response MIME, current dates and correct location.

#### Where the products or menu live

Use first-party linked PDF. Extract text with layout before OCR. For images, collect only the specifically linked menu asset and check permissions.

#### One example request and the fields it returns, and how paging works

GET https://apnakitchenrestaurant.com/pdf/menu.pdf. Extract sections and items with price associations, page number and OCR confidence. Process pages internally. An image menu has no item photo URLs unless individually published.

#### Can a cart or order be pre-filled by link?

No. Attach a separate verified order or call destination.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3 for text PDFs, 2 for OCR. Review ambiguous prices and page columns. Never derive real-time stock.

Sources • [apnakitchenrestaurant.com](https://apnakitchenrestaurant.com/pdf/menu.pdf) · [tesseract-ocr.github.io](https://tesseract-ocr.github.io/)

### Drupal

#### How to recognize it

drupal-settings-json or /sites/default/files/ are hints.

#### Where the products or menu live

First-party page, documents or exposed public content type. Drupal JSON:API is optional and access-controlled.

#### One example request and the fields it returns, and how paging works

GET a linked menu, service or gift-shop page. Only use GET /jsonapi/node/<type> if exposed and reviewed. Follow response links if using it.

#### Can a cart or order be pre-filled by link?

Unverified, depends on commerce component.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Many installations customize routes or disable data modules.

Sources • [drupal.org](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module)

### Joomla

#### How to recognize it

Joomla generator or recognizable template assets.

#### Where the products or menu live

Merchant-rendered articles and PDF links. Core web service interfaces do not establish anonymous access.

#### One example request and the fields it returns, and how paging works

GET merchant-linked article. Capture page title, visible product/service text and URLs. Follow actual pagination links.

#### Can a cart or order be pre-filled by link?

Unverified, depends on extension.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3. Routes and menu extensions vary.

Sources • [manual.joomla.org](https://manual.joomla.org/docs/general-concepts/webservices/)

### Webnode

#### How to recognize it

webnode.page tenant or Webnode credit. Check locally observed Columbus Nutrition URL.

#### Where the products or menu live

Public page or shop links if present.

#### One example request and the fields it returns, and how paging works

GET http://columbus-nutrition-67.webnode.page/ if allowed. Visible sections and links are the expected data. Catalog availability there is unverified.

#### Can a cart or order be pre-filled by link?

Unverified.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

2. Brochure site and storefront look similar.

Sources • [webnode.com](https://www.webnode.com/) · [columbus-nutrition-67.webnode.page](https://columbus-nutrition-67.webnode.page/)

### Unknown/custom site

#### How to recognize it

No corroborated platform or the site serves generic, conflicting or unrelated content.

#### Where the products or menu live

Use navigation, public sitemap, published HTML or linked assets. Verify brand, address and location before extracting.

#### One example request and the fields it returns, and how paging works

GET https://www.zaharakos.com/menu.html. Preliminary visit found visible prices and individual item photo references. Use one verified URL per menu section where distinct.

#### Can a cart or order be pre-filled by link?

Unverified. Preserve actual order button if verified.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it.

#### Reliability, 1 to 5, and what usually breaks

3 for stable custom markup. Unrelated redirects and generated content need review.

Sources • [zaharakos.com](https://www.zaharakos.com/menu.html)

### Booksy

#### How to recognize it

booksy.com merchant profile. Confirm the merchant and location.

#### Where the products or menu live

Public service names, stated duration and price where visible; booking handoff. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://anokhairbraiding.booksy.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [anokhairbraiding.booksy.com](https://anokhairbraiding.booksy.com/)

### GlossGenius

#### How to recognize it

glossgenius.com merchant profile. Confirm the merchant and location.

#### Where the products or menu live

Published service cards or outbound scheduling link. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://alexdavis.glossgenius.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [alexdavis.glossgenius.com](https://alexdavis.glossgenius.com/)

### Vagaro

#### How to recognize it

mysite.vagaro.com or merchant-linked Vagaro client page. Confirm the merchant and location.

#### Where the products or menu live

Published services and merchant booking link. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://mysite.vagaro.com/nextstepmassage as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [mysite.vagaro.com](https://mysite.vagaro.com/nextstepmassage)

### Acuity Scheduling

#### How to recognize it

as.me or acuityscheduling.com scheduler. Confirm the merchant and location.

#### Where the products or menu live

Appointment types and published prices where exposed. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://squarespace-example.as.me/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [squarespace-example.as.me](https://squarespace-example.as.me/)

### OpenTable

#### How to recognize it

opentable.com restaurant reservation link. Confirm the merchant and location.

#### Where the products or menu live

Use restaurant's own menu; reservations remain a customer handoff. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://www.opentable.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [opentable.com](https://www.opentable.com/)

### Square Appointments

#### How to recognize it

book.squareup.com or merchant booking button. Confirm the merchant and location.

#### Where the products or menu live

Booking service details, separate from Square Online catalog. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://squareup.com/us/en/appointments as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [squareup.com](https://squareup.com/us/en/appointments)

### Square Payment Links

#### How to recognize it

square.link seller-issued payment URL. Confirm the merchant and location.

#### Where the products or menu live

Seller-defined checkout destination, no catalog inference. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://squareup.com/us/en/payment-links as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [squareup.com](https://squareup.com/us/en/payment-links)

### Mindbody

#### How to recognize it

Mindbody Explore or merchant client URL. Confirm the merchant and location.

#### Where the products or menu live

Published classes or services where visible; use merchant service pages for extraction. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://www.mindbodyonline.com/explore/locations/elite-wellness-and-beauty as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [mindbodyonline.com](https://www.mindbodyonline.com/explore/locations/elite-wellness-and-beauty)

### Calendly

#### How to recognize it

calendly.com appointment path or embedded scheduler. Confirm the merchant and location.

#### Where the products or menu live

Event types and duration where published. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://calendly.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [calendly.com](https://calendly.com/)

### Gingr / pet booking

#### How to recognize it

gingrapp.com merchant portal hostname. Confirm the merchant and location.

#### Where the products or menu live

Public merchant services and prices where visible; stop at account prompt. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://barkavenuecolumbus.portal.gingrapp.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [barkavenuecolumbus.portal.gingrapp.com](https://barkavenuecolumbus.portal.gingrapp.com/)

### FareHarbor / tours and tickets

#### How to recognize it

merchant-issued fareharbor.com link or booking widget. Confirm the merchant and location.

#### Where the products or menu live

Public tour title and base price if labeled; schedules are separate. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://fareharbor.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [fareharbor.com](https://fareharbor.com/)

### Phorest / booking-other

#### How to recognize it

phorest.com merchant link or custom booking widget. Confirm the merchant and location.

#### Where the products or menu live

Use first-party salon service and price pages. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://www.phorest.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [phorest.com](https://www.phorest.com/)

### Noterro

#### How to recognize it

noterro.com merchant tenant. Confirm the merchant and location.

#### Where the products or menu live

Use public service info and booking link. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://massageworksstudio.noterro.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [massageworksstudio.noterro.com](https://massageworksstudio.noterro.com/)

### Mango

#### How to recognize it

Merchant-linked Mango booking hostname. Confirm the merchant and location.

#### Where the products or menu live

Use merchant service page and preserve issued booking link. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://manage2.mangoforsalon.com/booking as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [manage2.mangoforsalon.com](https://manage2.mangoforsalon.com/booking)

### Porter

#### How to recognize it

web.getporter.io merchant path. Confirm the merchant and location.

#### Where the products or menu live

Public profile or booking handoff; retail catalog unverified. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://web.getporter.io/shop/shaggy-inks as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [web.getporter.io](https://web.getporter.io/shop/shaggy-inks)

### GoCheckin

#### How to recognize it

Merchant-linked booking.gocheckin.net. Confirm the merchant and location.

#### Where the products or menu live

Use first-party service list and booking handoff. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://booking.gocheckin.net/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [booking.gocheckin.net](https://booking.gocheckin.net/)

### Visibook

#### How to recognize it

visibook.com scheduling link. Confirm the merchant and location.

#### Where the products or menu live

Appointment link; public service listing unverified. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://visibook.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [visibook.com](https://visibook.com/)

### Galaxy Access

#### How to recognize it

Merchant-linked Galaxy Access site. Confirm the merchant and location.

#### Where the products or menu live

Keep public link for appointments, use salon website for service pricing. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://booking.galaxyaccess.us/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [booking.galaxyaccess.us](https://booking.galaxyaccess.us/)

### LocalAppointments

#### How to recognize it

Merchant-linked localappointments.me. Confirm the merchant and location.

#### Where the products or menu live

Keep issued booking link; use merchant service page. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://localappointments.me/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [localappointments.me](https://localappointments.me/)

### FoodTec

#### How to recognize it

foodtecsolutions.com merchant host. Confirm the merchant and location.

#### Where the products or menu live

Location-specific ordering handoff; campus example must never be used for Columbus. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://motherbearpizza-campus.foodtecsolutions.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [motherbearpizza-campus.foodtecsolutions.com](https://motherbearpizza-campus.foodtecsolutions.com/)

### MenuSifu / MealKeyway

#### How to recognize it

order.mealkeyway.com/customer/release/index with merchant-issued mid. Confirm the merchant and location.

#### Where the products or menu live

Merchant order handoff; Misora has independent HTML. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://www.menusifu.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [menusifu.com](https://www.menusifu.com/)

### Heartland Restaurant

#### How to recognize it

hrpos.heartland.us merchant URL. Confirm the merchant and location.

#### Where the products or menu live

Merchant-published order handoff; restaurant menu first. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://freshtakekitchen.hrpos.heartland.us/menu as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [freshtakekitchen.hrpos.heartland.us](https://freshtakekitchen.hrpos.heartland.us/menu)

### SmileDining

#### How to recognize it

smiledining.com merchant host. Confirm the merchant and location.

#### Where the products or menu live

Location-specific ordering page. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://thaiconnectionin.smiledining.com/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [thaiconnectionin.smiledining.com](https://thaiconnectionin.smiledining.com/)

### OrderSave

#### How to recognize it

web.ordersave.com branded merchant URL. Confirm the merchant and location.

#### Where the products or menu live

Public customer menu handoff; confirm location before release. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://coverage-868a28158c919666cb7b12749cafd68d.web.ordersave.com/menu as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [coverage-868a28158c919666cb7b12749cafd68d.web.ordersave.com](https://coverage-868a28158c919666cb7b12749cafd68d.web.ordersave.com/menu)

### GoPrep

#### How to recognize it

goprep.com merchant tenant. Confirm the merchant and location.

#### Where the products or menu live

Meal prep handoff; seasonal order window is separate from catering. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://stunnasmealprep.goprep.com/customer/menu as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [stunnasmealprep.goprep.com](https://stunnasmealprep.goprep.com/customer/menu)

### SCVR

#### How to recognize it

scvr.co merchant ordering tenant. Confirm the merchant and location.

#### Where the products or menu live

Ordering handoff and merchant-linked menu. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://donutcentral.scvr.co/menu/online-ordering as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [donutcentral.scvr.co](https://donutcentral.scvr.co/menu/online-ordering)

### Weborder

#### How to recognize it

weborder.net merchant tenant and Groups path. Confirm the merchant and location.

#### Where the products or menu live

Customer ordering handoff; website pizzeria menu first. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://zwanzigz.weborder.net/Groups as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [zwanzigz.weborder.net](https://zwanzigz.weborder.net/Groups)

### KwickPOS / KwickMenu

#### How to recognize it

kwickmenu.com merchant host. Confirm the merchant and location.

#### Where the products or menu live

Merchant order handoff, verify current location. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://yoyoboba.kwickmenu.com/orders.php as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [yoyoboba.kwickmenu.com](https://yoyoboba.kwickmenu.com/orders.php)

### Beyond Menu

#### How to recognize it

beyondmenu.com merchant profile. Confirm the merchant and location.

#### Where the products or menu live

Check commercial policy before customer handoff; seek merchant first-party menu. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://www.beyondmenu.com/39393/columbus/china-buffet-columbus-47201.aspx as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [beyondmenu.com](https://www.beyondmenu.com/39393/columbus/china-buffet-columbus-47201.aspx)

### Etsy and social-only sellers

#### How to recognize it

etsy.com/shop/<name> or merchant social reference. Confirm the merchant and location.

#### Where the products or menu live

Request merchant-owned export or file; keep marketplace references outside ingest. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://www.etsy.com/legal/terms-of-use/ as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [etsy.com](https://www.etsy.com/legal/terms-of-use/)

### Google Forms

#### How to recognize it

docs.google.com/forms customer inquiry link. Confirm the merchant and location.

#### Where the products or menu live

Inquiry form; no read-only item feed. A public bulk feed was unverified.

#### One example request and the fields it returns, and how paging works

Open https://support.google.com/docs/topic/9055404 as a customer link or vendor reference. Read separately verified merchant pages for visible services, items, or prices. No generic pagination verified.

#### Can a cart or order be pre-filled by link?

No generic prefill verified. Retain the seller-issued link when appropriate.

#### Terms, robots and rate limits to respect

Check applicable host and platform terms and robots.txt before enrollment. Identify HeartOfColumbusBot with a monitored contact URL. Run a few requests per site per day, stop on access restrictions, and honor Retry-After. A public URL alone does not establish permission to collect or republish it. No sign-ins or private slot and account data.

#### Reliability, 1 to 5, and what usually breaks

2. Useful for handoff. Completeness, storefront-specific terms and regional access vary.

Sources • [support.google.com](https://support.google.com/docs/topic/9055404)
