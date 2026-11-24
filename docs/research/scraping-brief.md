# How Columbus shop and restaurant websites are built, and how to read their products

A research brief from Heart of Columbus, 2026-11-24. Built by scripts/research-brief.mjs from our own scan of each site; run it again after a crawl to refresh it.

## Who we are and what we need

Heart of Columbus is a directory of independent businesses in Columbus, Indiana (Bartholomew County). On our order page and on each business page we show what a shop sells or what a restaurant serves, read from the business's own website, and send the customer to the business's own checkout or ordering page. We never take payment or orders for a business that has not signed on with us, and we do not use marketplaces that take a cut (DoorDash, Grubhub, Uber Eats).

**Your job:** for every website below, work out how it is built and the easiest reliable way to read its product catalog or menu systematically, so a daily job can do it for all of them. For each item we want: name, price, in stock or not, a photo URL, the product or menu page URL, the section or category, and any variant IDs (size, color) that a cart link would need.

## Ground rules for any method you suggest

- Public data only, the same data any visitor's browser receives. No logins, no account APIs, no owner keys.
- Respect robots.txt and each platform's terms. Say so plainly when a method would break a platform's terms; we will not use it.
- No getting around bot protection, CAPTCHAs, rate limits or paywalls.
- Gentle: a few requests per site per day, identified as HeartOfColumbusBot with a contact URL.
- Prefer, in this order: (1) a documented public endpoint, (2) structured data the page already publishes (JSON-LD, Open Graph, embedded JSON state), (3) parsing HTML.
- Cite a source for every platform claim (the platform's developer docs, a help article, or the URL pattern you saw), with the date you checked. If you are not sure, say "unverified".

## What we already do, so you can skip it

- **Shopify:** `/products.json?limit=250&page=N` (public on most stores). Cart handoff by cart permalink `/cart/<variant>:<qty>,...`.
- **WooCommerce:** the Store API, `/wp-json/wc/store/v1/products` (and `?type=variation`). Cart handoff by `?add-to-cart=` links, one item per visit.
- **Squarespace Commerce:** the store page with `?format=json`, paged by `offset`. No cart link exists, so items open their own product pages.
- **Any platform:** schema.org JSON-LD `Product`, `ItemList` and `Menu`/`MenuSection`/`MenuItem` on the home, shop and menu pages, plus up to 40 product pages linked from them.
- **Results of our last crawl (2026-11-24):** 23 of 295 shops and restaurants gave us a catalog or menu (17 by store feed, 6 by page data). Everything marked "nothing yet" or "partial" below is where we need you.

## What our scan found on these sites

291 shops, restaurants, cafes, bars and makers on our list have a website (123 more have none). The cart or site platform our scan detected:

| Platform we detected | Sites |
|---|---|
| unknown | 147 |
| wordpress | 32 |
| woocommerce | 27 |
| wix-stores | 25 |
| square-online | 18 |
| squarespace-commerce | 16 |
| godaddy | 15 |
| shopify | 11 |

Every system whose fingerprint showed up in the pages (a site can show several: a Wix site with a Toast ordering link shows both):

wordpress 67, wix 29, woocommerce 29, wix-stores 21, square-online 20, godaddy 17, squarespace-commerce 17, squarespace 16, weebly 13, shopify 12, booksy 10, glossgenius 7, duda 5, vagaro 4, pet-booking 3, acuity 3, toast 3, booking-other 3, opentable 2, marketplace-delivery 2, square-appointments 2, gloriafood 2, doordash-storefront 2, thryv 2, mindbody 2, calendly 1, drupal 1, tours-tickets 1, joomla 1, webflow 1, slice 1, hibu 1, clover 1.

## Part A: a playbook for each platform

For each platform in the two lists above, plus any you find in Part B, write a short section with exactly these headings:

1. **How to recognize it:** HTML, script or header fingerprints, and typical URL shapes.
2. **Where the products or menu live:** the endpoint or embedded data (for example a JSON blob in a script tag, a public storefront API the site itself calls, a feed, a sitemap of product pages). Give a real example URL pattern.
3. **One example request and the fields it returns,** and how paging works.
4. **Can a cart or order be pre-filled by link?** If yes, the exact URL format; if no, say so.
5. **Terms, robots and rate limits** to respect.
6. **Reliability, 1 to 5,** and what usually breaks.

Platforms we especially need: Wix and Wix Stores, Square Online (Weebly), GoDaddy Websites + Marketing and GoDaddy Online Store, Duda, Webflow, Thryv and Hibu sites, plain WordPress without WooCommerce (menus in page builders, PDF menus), BigCommerce, Ecwid, Big Cartel, and restaurant systems: Toast, Square for Restaurants, Clover, ChowNow, GloriaFood, Popmenu, BentoBox, Slice, Menufy, Owner.com, SpotHopper, MenuDrive, Olo. Also: how to read a menu that is only a PDF or an image, and whether Google Business Profile or Facebook menus are usable (we suspect not, under their terms).

## Part B: one row per business

Visit each site below and fill one row each. Keep our slug so we can match rows back.

| slug | platform (confirmed) | where products or menu live (URL) | best method (endpoint, JSON-LD, embedded JSON, HTML, PDF, none) | can pre-fill cart? | sells online? (yes, no, call to order) | notes |
|---|---|---|---|---|---|---|

Use "none" when the site really has no products or menu online, and say what it has instead (a phone number, a Facebook page, a PDF).

## The websites

Grouped by our category. "Our status" is what our daily crawl gets today.

### Restaurants (51)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| amazing-joes-grill | Amazing Joe's Grill | http://www.amazingjoes.com/ | square-online | weebly | order link only | Square Online: amazingjoes.com |
| angottis-italian-restaurant | Angotti's Italian Restaurant | https://www.facebook.com/profile.php?id=100057168291406 | unreachable |   | nothing yet |   |
| antojitos-yeyes | Antojitos Yeyes | https://www.facebook.com/profile.php?id=61560260863615 | unreachable |   | nothing yet |   |
| apna-kitchen | Apna Kitchen | http://apnakitchenrestaurant.com/contact-us.php | unknown |   | nothing yet |   |
| bankin-baby-bbq | Bankin Baby BBQ | https://www.bankinbabybbq.com/ | unreachable |   | nothing yet |   |
| bips-bites | Bip's Bites | https://www.bipsbites.com/ | woocommerce | wordpress | reading it (woocommerce feed, 6 items) |   |
| black-sheep-craft-pizza-and-cocktails | Black Sheep Craft Pizza & Cocktails | https://www.blksheeppizza.com/ | squarespace-commerce | opentable, squarespace, toast | order link only | Toast: order.toasttab.com; OpenTable: opentable.com |
| blackerbys-hangar-5-restaurant | Blackerby's Hangar 5 Restaurant | https://www.blackerbyshangar5.com/ | squarespace-commerce | marketplace-delivery, squarespace | nothing yet |   |
| bonafide-bites | Bonafide Bites | https://www.bonafidebites.com/ | squarespace-commerce | squarespace | nothing yet |   |
| camilas-mexican-restaurant | Camila's Mexican Restaurant | https://camilasmexrestaurant.com/ | unreachable |   | nothing yet |   |
| carlos-pizza | Carlos Pizza | https://sancarlositalianpizza.com | unknown | gloriafood | nothing yet |   |
| chicagos-pizza | Chicago's Pizza | https://chicagospizza.com/locations/columbus/ | wordpress | doordash-storefront | order link only | DoorDash Storefront (commission-free): order.online |
| china-buffet | China Buffet | https://www.newchinabuffetcolumbusin.com/ | unknown |   | nothing yet |   |
| chumleys-doghouse | Chumley's Doghouse | https://www.chumleysdoghouse.com/ | wix-stores | wix | nothing yet |   |
| columbus-greeks-pizzeria | Columbus Greek's Pizzeria | http://www.greekspizzeria.com/ | unknown |   | nothing yet |   |
| divine-family-bbq | Divine Family BBQ | https://divinefamilybbq.com/ | woocommerce | wordpress | reading it (woocommerce feed, 8 items) | online ordering: divinefamilybbq.com |
| e-sushi-japanese-restaurant | E Sushi Japanese Restaurant | https://esushicolumbustogo.com/ | unreachable |   | nothing yet |   |
| el-nopal-mexican-cuisine | El Nopal Mexican Cuisine | https://elnopalmex.com/ | wordpress | doordash-storefront | order link only | DoorDash Storefront (commission-free): order.online |
| el-popocatepetl-mexican-restaurant-and-grill | El Popocatepetl Mexican Restaurant & Grill | https://order.online/business/el-popocatepetl-mexican-restaurant-grill-11607715 | unreachable |   | order link only | DoorDash Storefront (commission-free): order.online |
| first-class-catering | First Class Catering | https://www.firstclasscateringin.com/ | squarespace-commerce | squarespace | nothing yet |   |
| for-the-love-of-brunch | For the Love of Brunch | https://www.fortheloveofbrunch.com/ | wix-stores | toast, wix | order link only | Toast: order.toasttab.com |
| fresh-take-kitchen | Fresh Take Kitchen | http://www.freshtakekitchen.com/ | godaddy |   | nothing yet |   |
| guatemex-restaurant | Guatemex Restaurant | https://guatemexrestaurantin.com | unknown |   | nothing yet |   |
| hotbox-pizza | HotBox Pizza | https://www.hotboxpizza.com/hotbox-pizza-locations/columbus/ | unreachable |   | nothing yet |   |
| jills-diner | Jill's Diner | https://jills-diner.netlify.app | unreachable |   | nothing yet |   |
| la-guanajuato-grocery-and-restaurant | La Guanajuato Grocery and Restaurant | https://www.facebook.com/GuanajuatoStore | unreachable |   | nothing yet |   |
| la-patrona-cantina-and-grill | La Patrona Cantina and Grill | https://lapatronagrill.com/ | unreachable |   | nothing yet |   |
| lucas-brothers-sandwich-shop | Lucas Brothers Sandwich Shop | https://lucasbrothersshop.square.site | square-online | weebly | order link only | Square Online: lucasbrothersshop.square.site |
| lucianas-mexican-restaurant | Luciana's Mexican Restaurant | https://www.lucianasmexicanrestaurant.com/ | wordpress |   | nothing yet |   |
| mancinos-pizza-and-grinders | Mancino's Pizza & Grinders | https://www.mancinospizzagrinderscolumbus.com/ | unknown | slice | nothing yet |   |
| masala-magic | Masala Magic | https://masalamagic.shop/ | unknown |   | order link only | online ordering: masalamagic.shop |
| misora | Misora | http://www.eatmisora.com/ | wordpress | woocommerce | nothing yet |   |
| mother-bears-pizza | Mother Bear's Pizza | https://www.motherbearspizza.com | wix-stores | wix | order link only | FoodTec: motherbearpizza-campus.foodtecsolutions.com |
| my-whole-kitchen | My Whole Kitchen | https://www.mywholekitchen.com/ | wix-stores | wix, wordpress | order link only | online ordering: mywholekitchen.com |
| olesyas-kitchen | Olesya's Kitchen | https://olesyaskitchen.com/ | unknown | marketplace-delivery | order link only | online ordering: olesyaskitchen.com |
| papas-grill | Papa's Grill | http://papasfamily.net/ | godaddy |   | nothing yet |   |
| pig-and-tasty-bbq-food-truck | PIG & TASTY BBQ Food Truck | https://www.facebook.com/profile.php?id=100057361813953 | unreachable |   | nothing yet |   |
| ramen-alley | Ramen Alley | http://www.ramen-alley.com/ | square-online | weebly | order link only | Square Online: ramen-alley.com |
| riviera-maya | Riviera Maya | https://www.rivieramayamexicanrestaurant.com/ | unknown |   | nothing yet |   |
| riviera-maya-west | Riviera Maya West | https://www.clover.com/online-ordering/rivera-maya-mexican-gril-columbus | unknown | clover | order link only | Clover: clover.com |
| ru-yi-asian-cuisine | Ru Yi Asian Cuisine | http://ruyiasiancuisine.com/ | unknown |   | nothing yet |   |
| sabor-de-la-vida | Sabor de la Vida | https://www.facebook.com/sabordelavidacolumbus/ | unreachable |   | nothing yet |   |
| sophea-asian-restaurant | Sophea Asian Restaurant | http://facebook.com/sopheaasianrestaurant | unreachable |   | nothing yet |   |
| stunnas | Stunna's | https://www.stunnas812.com/ | wix-stores | wix | nothing yet |   |
| thai-connection | Thai Connection | https://www.thaiconnection.net/ | unreachable |   | nothing yet |   |
| the-gallery-kitchen-and-bar | The Gallery Kitchen & Bar | https://www.ihg.com/hotelindigo/hotels/us/en/columbus/clubs/hoteldetail?cm_mmc=GoogleMaps-_-IN-_-US-_-CLUBS | unreachable |   | nothing yet |   |
| yats | Yats | https://yatscajuncreole.online/ | woocommerce | gloriafood, wordpress | nothing yet |   |
| ye-olde-fish-house | Ye Olde Fish House | http://www.yeoldefishhouse.com/ | unknown |   | nothing yet |   |
| yee-kee-restaurant | Yee Kee Restaurant | https://www.yeekeerestaurant.com | unreachable |   | nothing yet |   |
| yummy-bowl | Yummy Bowl | http://www.yummybow1455.com/ | unknown |   | order link only | online ordering: yummybow1455.com |
| zwanzigz-pizza-and-brewing | ZwanzigZ Pizza & Brewing | https://www.zwanzigz.com | unknown |   | nothing yet |   |

### Coffee & Sweets (22)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| black-jewell-popcorn | Black Jewell Popcorn | http://www.blackjewell.com/ | woocommerce | wordpress | live feed, not in last crawl |   |
| columbus-nutrition | Columbus Nutrition | http://columbus-nutrition-67.webnode.page/ | unknown |   | nothing yet |   |
| cookie-paradise-llc | Cookie Paradise LLC | https://www.cookieparadise.co/collections/all | shopify |   | reading it (shopify feed, 19 items) |   |
| donut-central | Donut Central | http://donutcentralcolumbus.com/ | wix-stores | wix | nothing yet |   |
| donuts-n-coffee | Donuts 'n' Coffee | https://donutsncoffeein.com/ | unknown |   | nothing yet |   |
| gramz-bakery-and-cafe | Gramz Bakery & Cafe | http://gramz-bakery.square.site/ | square-online | weebly | order link only | Square Online: gramz-bakery.square.site |
| icing-on-the-cake-by-kristina | Icing On The Cake By Kristina | https://www.icingonthecakebykristina.com/ | wix-stores | wix | nothing yet |   |
| koveners-korner-ice-cream | Kovener's Korner Ice Cream | https://www.kovenerskorner.com/ | unknown |   | nothing yet |   |
| legal-leaf-market-cafe | Legal Leaf Market Cafe | https://shop.legalleafmarket.shop/ | shopify |   | reading it (shopify feed, 1000 items) |   |
| lucabe-coffee-co-4th-street | Lucabe Coffee Co. 4th Street | http://www.lucabecoffeeco.com/ | square-online | wix, wix-stores | order link only | Square Online: lucabecoffeeco-order.square.site |
| lucabe-coffee-co-eastbrook | Lucabe Coffee Co. Eastbrook | http://lucabecoffeeco.com/ | square-online | wix, wix-stores | order link only | Square Online: lucabecoffeeco-order.square.site |
| miss-rachels-neat-treats | Miss Rachel's Neat Treats | http://www.neat-treats.com/ | wordpress |   | nothing yet |   |
| nancys-creative-cakes-n-bakes | Nancy's Creative Cakes N Bakes | https://nancyscakesnbakes.com/ | unreachable |   | nothing yet |   |
| nutri-bee | Nutri Bee | https://www.nutri-bee.org/ | square-online | weebly | order link only | Square Online: nutri-bee.org |
| smallz-ice-cream | Smallz Ice Cream | https://www.facebook.com/profile.php?id=61576999862860 | unreachable |   | nothing yet |   |
| sojourn-coffee-company | Sojourn Coffee Company | https://www.sojourncoffeecompany.com/ | woocommerce | wordpress | reading it (woocommerce feed, 59 items) |   |
| sugar-bayers-cookie-co | Sugar Bayer's Cookie Co | http://www.sugarbayerscookie.com/ | wix-stores | wix | partial (schema.org data, 4 products) |   |
| sweet-tooth-bakes-by-janet | Sweet Tooth Bakes By Janet | http://www.sweettoothbakes.com/ | unreachable |   | nothing yet |   |
| the-nifty-beet | The Nifty Beet | https://facebook.com/theniftybeet | unreachable |   | nothing yet |   |
| tribal-blend-cat-cafe | Tribal Blend Cat Cafe | http://columbuscat.cafe/ | woocommerce | wordpress | reading it (woocommerce feed, 14 items) | online booking: columbuscat.cafe |
| winnie-mochi-donut | Winnie Mochi Donut | https://www.winniemochi-columbus.com/ | woocommerce | wordpress | nothing yet |   |
| zaharakos-ice-cream-parlor | Zaharakos Ice Cream Parlor | https://www.zaharakos.com | unknown |   | nothing yet | online booking: zaharakos.com |

### Bars & Breweries (11)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| 4th-street-bar-and-grill | 4th Street Bar and Grill | https://www.4thstreetbar.com/ | godaddy |   | nothing yet |   |
| columbus-bar | Columbus Bar | http://www.thecolumbusbar.com/ | woocommerce | wordpress | nothing yet |   |
| cozy-lounge | Cozy Lounge | https://m.facebook.com/Cozy-Lounge-149100758482621/ | unreachable |   | nothing yet |   |
| henry-social-club | Henry Social Club | http://www.henrysocialclub.com/ | unknown |   | nothing yet |   |
| hog-molly-brewing-company | Hog Molly Brewing Company | http://www.hogmollybrewing.com/ | wordpress |   | nothing yet |   |
| savage-distilling | Savage Distilling | https://savagedistillingllc.godaddysites.com/ | godaddy |   | nothing yet |   |
| simmons-winery-450-north-brewery | Simmons Winery / 450 North Brewery | http://450northbrewing.com/ | wordpress |   | order link only | Toast: 450northbrewingcompany.toast.site |
| the-forge-english-pub | The Forge English Pub | https://forgeon4th.com/ | wordpress |   | order link only | Square Online: forgepub-on-4th.square.site |
| the-garage-pub-and-grill | The Garage Pub & Grill | http://thegaragepubandgrill.com/ | unknown |   | nothing yet | tmt.spotapps.co: tmt.spotapps.co |
| the-st-denis-wine-books-and-wonders | The St Denis: Wine, Books, and Wonders | https://www.thestdenis.com/ | unknown |   | nothing yet |   |
| upland-columbus-pump-house | Upland Columbus Pump House | https://uplandbeer.com/columbus/ | wordpress | opentable, toast | order link only | Toast: toasttab.com; OpenTable: opentable.com |

### Beauty & Grooming (74)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| aesthetic-centre-of-indiana | Aesthetic Centre of Indiana | https://skinsolutionsaci.com/ | wordpress |   | nothing yet |   |
| amazing-nail-spa-one | Amazing Nail Spa One | https://amazingnailspaonecolumbus.com/ | unknown |   | nothing yet |   |
| anok-hair-braiding | Anok Hair Braiding | http://anokhairbraiding.booksy.com/ | unknown | booksy | nothing yet | Booksy: anokhairbraiding.booksy.com |
| bad-boys-barbershop | Bad Boys Barbershop | http://www.badboyscuts.com/ | unknown |   | nothing yet |   |
| balance-massage-and-wellness-studio | Balance Massage and Wellness Studio | http://www.balancecolumbus.com/ | woocommerce | glossgenius, wordpress | nothing yet | GlossGenius: balancecolumbus.glossgenius.com |
| blondies-salon-and-spa | Blondie's Salon & Spa | http://www.blondiescolumbus.com/ | wordpress | booking-other | nothing yet | Phorest: phorest.com; blondiescolumbus.com: blondiescolumbus.com |
| breathe-halotherapy-wellness-center | Breathe Halotherapy Wellness Center | http://www.breathesaltair.com/ | square-online | square-appointments | shop link only | Square Appointments: squareup.com |
| buns-and-beards-beauty-lounge | Buns and Beards Beauty Lounge | https://www.bunsandbeardsbeauty.com/ | square-online | wix, wix-stores | shop link only |   |
| cameo-room-salon | Cameo Room Salon | http://cameoroomsalon.com/ | unreachable |   | nothing yet |   |
| ciscos-barber-shop | Cisco's Barber Shop | https://www.ciscos.site/ | wix-stores | wix, wordpress | nothing yet |   |
| columbus-massage-center-and-salon | Columbus Massage Center and Salon | http://www.columbusmassagecenter.com/ | wordpress | vagaro | nothing yet | Vagaro: vagaro.com |
| columbus-uppercuts | Columbus Uppercuts | https://www.columbusuppercuts.com/ | squarespace-commerce | squarespace | nothing yet |   |
| cozy-cauldron-hair-studio | Cozy Cauldron Hair Studio | https://cozycauldronhairstudio.com/ | square-online | weebly | nothing yet |   |
| creative-eyes-eyebrow-threading | Creative Eyes Eyebrow Threading | https://threadedeyebrow.com/ | godaddy |   | nothing yet |   |
| creative-hair-design | Creative Hair Design | https://www.facebook.com/CreativeHairDesignOfColumbus/ | unreachable |   | nothing yet |   |
| daniel-shanti-barber | Daniel Shanti Barber | https://shantybarber.booksy.com/ | unknown | booksy | nothing yet | Booksy: shantybarber.booksy.com |
| divine-hair-studio | Divine Hair Studio | http://divinehairstudio.squarespace.com/ | squarespace-commerce | squarespace | nothing yet |   |
| divine-hands | Divine Hands | https://divinehands990.booksy.com/ | unknown | booksy | nothing yet | Booksy: divinehands990.booksy.com |
| elan-aveda-concept-shop | Elan Aveda Concept Shop | https://www.aveda.com/locations | unreachable |   | nothing yet |   |
| elite-wellness-and-beauty | Elite Wellness & Beauty | http://www.elitewellnesscolumbus.com/ | wordpress | mindbody | nothing yet | Mindbody: clients.mindbodyonline.com |
| energy-balancing-holistic-wellness-center | Energy Balancing Holistic Wellness Center | http://energybalancing444.com/ | wix-stores | wix, wordpress | nothing yet |   |
| ginger-ink-boutique | Ginger Ink Boutique | https://www.gingerinkboutique.com/ | godaddy |   | nothing yet | online booking: gingerinkboutique.com |
| gossip-nails-columbus | Gossip Nails Columbus | https://gossipnailscolumbus.com/ | wordpress |   | nothing yet | booking.galaxyaccess.us: booking.galaxyaccess.us |
| hair-by-alkat | Hair By Alkat | https://alexdavis.glossgenius.com/ | unknown | glossgenius | nothing yet | GlossGenius: alexdavis.glossgenius.com |
| hair-by-chelisy | Hair by Chelisy | https://chelisyfoster.glossgenius.com/ | unknown | glossgenius | nothing yet | GlossGenius: chelisyfoster.glossgenius.com |
| hair-by-savanna | Hair By Savanna | https://savannaperry.glossgenius.com/ | unknown | glossgenius | nothing yet | GlossGenius: files.glossgenius.com |
| hex-beauty-collective | Hex Beauty Collective | http://hexbeauty.glossgenius.com/ | unknown | glossgenius, webflow | nothing yet | GlossGenius: app.glossgenius.com |
| hush-aesthetics-and-wellness | Hush Aesthetics & Wellness | http://hushaestheticswellness.com/ | unknown | shopify | shop link only |   |
| jennifer-nails | Jennifer Nails | https://www.facebook.com/Jennifer-Nails-LLC-803528896415366/ | unreachable |   | nothing yet |   |
| laurels-hair-studio | Laurel's Hair Studio | http://www.laurelshairstudio.org/ | square-online | weebly | nothing yet |   |
| lhs-and-barbershop | LHS & Barbershop | https://lhsbarbershop.com/ | unreachable |   | nothing yet |   |
| lynns-nails | Lynns Nails | https://www.facebook.com/Lynn-Nails-in-Columbus-IN-47203-105623328154528 | unreachable |   | nothing yet |   |
| m-and-y-massage-and-foot-massage | M&Y Massage and Foot Massage | https://mymassagein.net/ | woocommerce | wordpress | nothing yet |   |
| massage-by-morgan | Massage by Morgan | https://www.mindbodyonline.com/explore/locations/elite-wellness-and-beauty | unknown | mindbody | nothing yet |   |
| massage-works-studio | Massage Works Studio | https://massageworksstudio.noterro.com/ | unknown |   | nothing yet |   |
| michaels-signature-massage-llc | Michael's Signature Massage LLC | https://www.facebook.com/share/18FUmozmvx/ | unreachable |   | nothing yet |   |
| monarch-massage-and-yoga | Monarch Massage and Yoga | https://m.facebook.com/people/Monarch-Massage-Yoga/61575067307785/ | unreachable |   | nothing yet |   |
| nail-world-llc | Nail World LLC | https://www.facebook.com/nailworldcolumbus | unreachable |   | nothing yet |   |
| nails-station-and-spa-columbus | Nails Station & Spa Columbus | https://nailsstationandspa.com/ | wordpress |   | nothing yet |   |
| next-step-massage | Next Step Massage | https://mysite.vagaro.com/nextstepmassage | unknown | vagaro | nothing yet | Vagaro: mysite.vagaro.com |
| nomad-barber-shop | Nomad Barber Shop | https://nomadbarbershop.com | godaddy | booking-other | nothing yet |   |
| nordic-ink-tattoo | Nordic Ink Tattoo | https://www.facebook.com/Nordicink-Tattoos-104163911303956 | unreachable |   | nothing yet |   |
| ofelias-fades | Ofelia's Fades | http://haircutsclauher.booksy.com/ | unknown | booksy | nothing yet | Booksy: haircutsclauher.booksy.com |
| pink-and-white-nails | Pink & White Nails | https://www.facebook.com/profile.php?id=61555831384990 | unreachable |   | nothing yet |   |
| polished-brows | Polished Brows | https://polishedbrows.com/ | unreachable |   | nothing yet |   |
| posh-sloth-massage | Posh Sloth Massage | http://poshsloth.massagetherapy.com/ | unknown |   | nothing yet |   |
| pro-nails | Pro Nails | https://manage2.mangoforsalon.com/booking?id=y9cjkAkBD4eKZp%2FtuI3Jcw== | unknown |   | nothing yet | manage2.mangoforsalon.com: manage2.mangoforsalon.com |
| radiance-by-rhianna-spa | Radiance by Rhianna Spa | http://radiancebyrhianna.com/ | unknown | vagaro | nothing yet | Vagaro: mysite.vagaro.com |
| raging-hair-by-brandie | Raging Hair by Brandie | https://raginghairbybrandie.booksy.com/ | unknown | booksy | nothing yet | Booksy: raginghairbybrandie.booksy.com |
| really-the-barbers | Really The Barbers' | https://really-the-barber.square.site/ | square-online | weebly | shop link only |   |
| ritual-adornment-tattoo-and-piercing | Ritual Adornment Tattoo and Piercing | https://www.facebook.com/profile.php?id=100090420616467&mibextid=ZbWKwL | unreachable |   | nothing yet |   |
| salon-1750 | Salon 1750 | http://www.salon1750.com/ | unreachable |   | nothing yet |   |
| salon-aura-hair-color-studio | Salon Aura / Hair Color Studio | http://salonaura812.booksy.com/ | unknown | booksy | nothing yet | Booksy: salonaura812.booksy.com; visibook.com: visibook.com |
| saner-barbershop | Saner Barbershop | https://daycutz14.booksy.com/ | unknown | booksy | nothing yet | Booksy: daycutz14.booksy.com |
| sassafras-salon-and-spa | Sassafras Salon and Spa | https://www.sassafras-salon.com/ | squarespace-commerce | booking-other, squarespace | nothing yet | Phorest: phorest.com |
| shaggy-inks | Shaggy Inks | https://web.getporter.io/shop/shaggy-inks | unknown |   | nothing yet |   |
| skeleton-crew-tattoo | Skeleton Crew Tattoo | https://m.facebook.com/Skeleton-Crew-Tattoo-LLC-111528712244220/ | unreachable |   | nothing yet |   |
| skin-solutions-dermatology-and-aesthetics | Skin Solutions Dermatology & Aesthetics | https://www.skinsolutions1.com/ | wordpress |   | nothing yet |   |
| skin-trendz-day-spa | Skin Trendz Day Spa | https://skintrendz.skincaretherapy.net/ | wix-stores | vagaro, wix | nothing yet | Vagaro: vagaro.com |
| sophea-nails | Sophea Nails | https://sophea-nails-columbus.nailsites.com/ | unknown |   | nothing yet | GoCheckin: booking.gocheckin.net |
| studio-55 | Studio 55 | https://www.facebook.com/Studio55LLC/ | unreachable |   | nothing yet |   |
| studio-shag-salon-and-boutique | Studio Shag Salon & Boutique | https://studioshagsalon.com/ | woocommerce | square-appointments, square-online, wordpress | shop link only | Square Appointments: book.squareup.com |
| stylez-by-nette | Stylez By Nette | https://annetteprescott.glossgenius.com/ | unknown | glossgenius | nothing yet | GlossGenius: annetteprescott.glossgenius.com |
| the-alley-mobile-salon | The Alley Mobile Salon | http://thealleymobilesalon.booksy.com/ | unknown | booksy | nothing yet |   |
| the-artisan-salon | The Artisan Salon | http://theartisancolumbus.com/ | wix-stores | glossgenius, square-online, wix | shop link only | GlossGenius: mindfulmassagecolumbus.glossgenius.com |
| tinas-nails | Tina's Nails | https://tinanailscolumbus.com/ | unknown |   | nothing yet | localappointments.me: localappointments.me |
| top-nails | Top Nails | http://topnailspacolumbus.com/ | wordpress |   | nothing yet | GoCheckin: booking.gocheckin.net |
| twisted-scizzors | Twisted Scizzors | https://www.facebook.com/Twisted-Scizzors-Hair-and-Day-Spa-130959473620022/ | unreachable |   | nothing yet |   |
| tyler-thompson-barber | Tyler Thompson Barber | http://fadedwithhonor.booksy.com/ | unknown | booksy | nothing yet | Booksy: fadedwithhonor.booksy.com |
| venus-nails | Venus Nails | https://venus-nails-columbus.nailsites.com/ | unknown |   | nothing yet |   |
| vip-nail-spa | VIP Nail Spa | https://vip-nail-spa-columbus.nailsites.com/ | unknown |   | nothing yet |   |
| vivian-lou-paul-mitchell-focus-salon | Vivian Lou Paul Mitchell Focus Salon | http://www.vivianloupmsalon.com/ | wix-stores | wix | nothing yet |   |
| wax-that-cat | Wax that Cat | https://waxthatcat.com/ | godaddy | booksy | order link only | Square: square.link; Booksy: booksy.com |
| y-and-s-massage | Y&S Massage | http://ysmassage.com/ | woocommerce | wordpress | nothing yet |   |

### Shopping (59)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| 411-gallery | 411 Gallery | https://www.artsincolumbus.org/411 | wix-stores | wix, wordpress | nothing yet |   |
| amari-arrangements-and-gifts-llc | Amari Arrangements & Gifts LLC | https://www.columbusinflorist.com/ | unreachable |   | nothing yet |   |
| at-home-with-heartland | At Home With Heartland | https://ahwheartland.com/ | shopify |   | reading it (shopify feed, 1000 items) |   |
| bakers-fine-gifts-and-accessories | Baker's Fine Gifts and Accessories | http://www.bakersfinegifts.com/ | unreachable |   | nothing yet |   |
| boutique-elise | Boutique Elise | http://www.boutiqueelise.com/ | shopify |   | reading it (shopify feed, 569 items) |   |
| brittnys-bobbins | Brittny's Bobbins | https://www.britbobbins.com/ | squarespace-commerce | squarespace | nothing yet |   |
| bushs-market | Bush's Market | http://bushsmarket.com/ | unknown |   | nothing yet |   |
| columbus-cycling-and-fitness | Columbus Cycling & Fitness | http://www.columbus-cycling.com/ | unknown |   | partial (schema.org data, 25 products) |   |
| columbus-gold-and-diamond | Columbus Gold & Diamond | http://columbusgoldanddiamondin.com/ | unknown |   | nothing yet |   |
| columbus-oriental-market | Columbus Oriental Market | http://columbus-market.edan.io/ | unreachable |   | nothing yet |   |
| columbus-outdoor-power | Columbus Outdoor Power | https://www.columbusoutdoorpower.com/ | woocommerce | wordpress | live feed, not in last crawl |   |
| columbus-visitors-center-gift-shop | Columbus Visitors Center Gift Shop | https://columbus.in.us/ | unknown | drupal, tours-tickets | nothing yet | FareHarbor: fareharbor.com |
| copper-creek-coatings-and-farm-toys | Copper Creek Coatings & Farm Toys | https://www.coppercreekfarmtoys.com/ | unreachable |   | nothing yet |   |
| cork-liquors | Cork Liquors | http://www.corkliquor.com/ | wordpress |   | nothing yet |   |
| days-of-old-antique-shoppe | Days of Old Antique Shoppe | http://www.daysofold.store/ | wordpress | woocommerce | nothing yet |   |
| fantastic-finds-resale | Fantastic Finds Resale | http://www.facebook.com/fantasticfindsonline | unreachable |   | nothing yet |   |
| farmhouse-favorites | Farmhouse Favorites | http://favoritebakery.net/ | godaddy |   | nothing yet |   |
| firefly-shirt-co | Firefly Shirt Co. | https://fireflyshirtcompany.com/ | squarespace-commerce | acuity, squarespace | nothing yet | Acuity: app.acuityscheduling.com |
| fishers-flower-basket | Fisher's Flower Basket | https://www.fishersflowerbasket.com/ | unreachable |   | nothing yet |   |
| flora-and-fauna-flowers | Flora & Fauna Flowers | http://modernfloristcolumbusindiana.com/ | unknown |   | shop link only |   |
| florist-mk-llc | Florist MK LLC | https://www.floristmk.com/ | unknown |   | partial (schema.org data, 32 products) |   |
| flowers-from-the-woods | Flowers From the Woods | https://www.flowersfromthewoods.com/ | wix-stores | wix | partial (schema.org data, 18 products) |   |
| footworks | Footworks | http://www.safetyshoedistributors.com/ | shopify | wordpress | reading it (shopify feed, 647 items) |   |
| garb2art-cosmetics | Garb2Art Cosmetics | http://garb2art.com/ | wix-stores | wix | partial (schema.org data, 11 products) |   |
| girlee-boutique | Girlee Boutique | http://girleeboutique.com/ | wix-stores | squarespace-commerce, wix | partial (schema.org data, 21 products) |   |
| good-used-furniture | Good Used Furniture | https://www.facebook.com/goodusedfurniture/ | unreachable |   | nothing yet |   |
| growbys-rto-home-furnishings | Growby's RTO Home Furnishings | https://www.growbys.com/columbus-in | unknown |   | nothing yet |   |
| h-and-m-gunsmith | H&M Gunsmith | http://www.hmgunsmith.com/ | unknown | duda | nothing yet |   |
| hidden-treasures-finders-keepers | Hidden Treasures Finders Keepers | https://www.hiddentreasuresfinderskeepers.com/ | squarespace-commerce | squarespace | nothing yet |   |
| hoosier-sporting-goods | Hoosier Sporting Goods | https://www.hoosiersportinggoods.com/ | wordpress |   | nothing yet |   |
| j-and-s-outfitters | J&S Outfitters | http://www.jnsoutfitters.com/ | wordpress |   | nothing yet |   |
| m-and-w-tactical-solutions | M&W Tactical Solutions | http://www.mwtacticalsoultions.com/ | unreachable |   | nothing yet |   |
| mariah-retail-store | Mariah Retail Store | http://peerfoods.com/ | unknown |   | nothing yet |   |
| meli-market | Meli Market | http://www.melimarket.co/ | square-online | weebly | shop link only |   |
| midwest-malibu-boutique | Midwest Malibu Boutique | http://www.midwestmalibuboutique.com/ | unreachable |   | nothing yet |   |
| minash-boutique | Minash Boutique | https://www.minashboutique.com/ | shopify |   | reading it (shopify feed, 63 items) |   |
| monroe-stable-boutique | Monroe Stable Boutique | https://monroestableboutique.myshopify.com/?key=9417cb0ca975a99ee8ea8092454f23b74588c91caa34a95fac89e788cccd2e6d | unreachable |   | nothing yet |   |
| out-of-the-blue-finds | Out of the Blue Finds | http://outofthebluefinds.com/ | unknown |   | nothing yet |   |
| pomp-and-bloom | Pomp & Bloom | http://pompandbloom.com/ | squarespace-commerce | squarespace | nothing yet |   |
| psi-iota-xi-sorority-thrift-shop | Psi Iota Xi Sorority Thrift Shop | https://www.facebook.com/PsiIotaXiThriftShop?mibextid=LQQJ4d | unreachable |   | nothing yet |   |
| sans-souci | Sans Souci | http://www.sanssouci.org/ | unknown |   | nothing yet |   |
| sew-crazy | Sew Crazy | http://www.sewcrazycolumbus.com/ | unknown |   | nothing yet |   |
| sew-vivid-designs | Sew Vivid Designs | http://sewvividdesigns.com/ | shopify |   | reading it (shopify feed, 1000 items) |   |
| shabby-sheep-and-ewe | Shabby Sheep and Ewe | https://shabbysheepandewe.com/ | square-online | weebly | shop link only |   |
| stillframes-art-and-design | Stillframes Art & Design | https://www.stillframes.com/ | unknown |   | nothing yet |   |
| stylish-bundles-and-more | Stylish Bundles and More | http://stylishbundles.beauty/ | unknown |   | nothing yet |   |
| the-bicycle-station | The Bicycle Station | https://www.thebicyclestation.com/ | shopify | calendly | reading it (shopify feed, 858 items) | Calendly: calendly.com |
| the-castle-games | The Castle Games | http://castlegameshoppe.com/ | shopify |   | reading it (shopify feed, 1000 items) |   |
| the-vibe-smoke-shop | The Vibe Smoke Shop | https://thevibesmokevape.com/ | unknown |   | nothing yet |   |
| thompson-furniture-and-mattress | Thompson Furniture & Mattress | http://www.thompsonfurniture.net/ | unknown |   | nothing yet |   |
| tom-picketts-music-center | Tom Pickett's Music Center | http://www.tompicketts.com/ | godaddy |   | nothing yet |   |
| turtles-flowers | Turtle's Flowers | http://turtlesflowers.com/ | square-online | weebly | shop link only |   |
| viewpoint-books | Viewpoint Books | http://www.viewpointbooks.com/ | unreachable |   | nothing yet |   |
| viewpoint-books-chapter-two | Viewpoint Books Chapter Two | http://viewpointbooks.com/ | unreachable |   | nothing yet |   |
| whipkers-market-and-greenhouses | Whipker's Market and Greenhouses | http://whipkersmarket.com/ | godaddy |   | nothing yet |   |
| white-river-running-company | White River Running Company | https://whiteriverrunningcompany.com/ | woocommerce | wordpress | nothing yet |   |
| white-star-meat-market-and-deli | White Star Meat Market & Deli | https://whitestarmeatmarket.com/ | wordpress |   | nothing yet |   |
| wild-wisdom | Wild Wisdom | http://www.wildwisdomstore.com/ | squarespace-commerce | squarespace | reading it (squarespace-commerce feed, 53 items) |   |
| xo-by-sophias | XO by Sophia's | https://www.xobysophias.com/ | shopify |   | reading it (shopify feed, 883 items) |   |

### Pets (11)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| athens-animal-clinic | Athens Animal Clinic | https://athensanimalclinic.com/ | woocommerce | pet-booking, wordpress | nothing yet | online booking: athensanimalclinic.com |
| bark-avenue | Bark Avenue | https://barkavenuecolumbus.com/ | wordpress | pet-booking | nothing yet | Gingr: barkavenuecolumbus.portal.gingrapp.com |
| best-friends-animal-healthcare | Best Friends Animal Healthcare | http://bfanimal.com/ | woocommerce | wordpress | nothing yet |   |
| columbus-animal-hospital | Columbus Animal Hospital | http://columbusanimalhospital.com/ | unreachable |   | nothing yet |   |
| columbus-veterinary-services | Columbus Veterinary Services | http://columbusveterinaryservices.com/ | squarespace-commerce | squarespace | nothing yet |   |
| dirty-dogs | Dirty Dogs | https://rymap.org/business/dirty-dogs-zggpyf | unknown |   | nothing yet |   |
| dog-world-daycare-and-behavior-center | Dog World Daycare and Behavior Center | http://www.dogworlddaycare.net/ | godaddy |   | nothing yet |   |
| guardian-k9-llc | Guardian K9 LLC | http://www.guardiank9columbus.com/ | square-online | pet-booking, weebly | shop link only | Gingr: gk9columbus.portal.gingrapp.com |
| mutt-tubbs-n-stylin-dogs | Mutt Tubbs N' Stylin Dogs | http://mutttubbdogs.top/ | unknown |   | nothing yet |   |
| tail-twisters-dog-spaw | Tail Twisters Dog Spaw | https://www.facebook.com/share/16GszquSCY/ | unreachable |   | nothing yet |   |
| tailwaggers-grooming-salon | Tailwaggers Grooming Salon | http://www.facebook.com/pages/Tailwaggers-Grooming-Salon/270230349555 | unreachable |   | nothing yet |   |

### Kids & Learning (20)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| all-pro-driving-academy-llc | All Pro Driving Academy, LLC | http://www.allprodrivingacademy.com/ | wordpress |   | nothing yet |   |
| bei-bambini | Bei Bambini | http://www.beibambini.com/ | wix-stores | wix | nothing yet |   |
| beths-dancenter | Beth's Dancenter | http://www.bethsdancenter.com/ | squarespace-commerce | acuity, squarespace | nothing yet | Acuity: squarespace-example.as.me |
| bright-start-child-care | Bright Start Child Care | https://m.facebook.com/pages/category/Child-Care-Service/Bright-Start-Child-Care-Ministry-104149833768226/ | unreachable |   | nothing yet |   |
| busy-bees-academy | Busy Bees Academy | https://www.bcscschools.org/site/default.aspx?PageType=3&ModuleInstanceID=708&ViewID=5C8B25C6-C8F8-4BD5-923B-8A7C70A93DDA&RenderLoc=0&FlexDataID=830&PageID=474&Comments=true | unreachable |   | nothing yet |   |
| craft-and-bounce-with-us | Craft and Bounce With Us | http://www.craftandbounce.com/ | squarespace-commerce | acuity, squarespace | nothing yet |   |
| dance-by-design | Dance by Design | http://www.dance-by-design.com/ | woocommerce | godaddy, wordpress | nothing yet |   |
| dance-street | Dance Street | http://dancestreetcolumbus.com/ | godaddy |   | nothing yet |   |
| dancers-studio-inc | Dancers Studio Inc. | http://www.dancers-studio.org/ | wix-stores | wix | nothing yet |   |
| dorothys-playhouse | Dorothy's Playhouse | http://www.dorothysplayhouse.com/ | square-online | wix, wix-stores | shop link only |   |
| faithprep-academy-of-indiana | FaithPrep Academy of Indiana | https://www.faithprep.com/ | unknown |   | nothing yet |   |
| indiana-conservatory-of-music | Indiana Conservatory of Music | http://www.indianaconservatory.com/ | squarespace-commerce | squarespace | nothing yet |   |
| indiana-road-ready-llc | Indiana Road Ready LLC | https://www.indianaroadready.com/ | wix-stores | wix, wordpress | nothing yet |   |
| kidz-first-daycare-and-preschool | Kidz First Daycare and Preschool | https://www.kidzfirstdaycare.org/ | wix-stores | wix, wordpress | nothing yet |   |
| learning-tree-preschool | Learning Tree Preschool | https://www.fumccolumbus.org/learning-tree-preschool | wix-stores | wix, wordpress | nothing yet |   |
| little-lambs-child-care | Little Lambs Child Care | https://www.sandyhook.org/childrens-ministries/ | unreachable |   | nothing yet |   |
| little-seeds-preschool | Little Seeds Preschool | https://www.cccolumbus.org/little-seeds-preschool/ | unreachable |   | nothing yet |   |
| sanctuary-kidscare | Sanctuary KidsCare | http://www.sanctuarykids.care/ | unknown |   | nothing yet |   |
| sonyas-dance-zone | Sonya's Dance Zone | http://sonyasdancezone.com/ | unreachable |   | nothing yet |   |
| st-paul-lutheran-preschool | St Paul Lutheran Preschool | https://www.stpaulcolumbus.org/preschool | wix-stores | wix | nothing yet |   |

### Things to Do (6)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| columbus-bowling-center | Columbus Bowling Center | http://www.columbusbowlingcenter.com/ | godaddy |   | nothing yet |   |
| harrison-lake-country-club | Harrison Lake Country Club | http://www.harrisonlakeclub.com/ | unknown |   | nothing yet |   |
| indiana-usssa-utrippin-sports-academy | Indiana USSSA / UTrippin Sports Academy | http://www.indianausssabaseball.com/ | unreachable |   | nothing yet |   |
| inn-at-irwin-gardens | Inn at Irwin Gardens | https://www.irwingardens.com/ | wix-stores | wix | nothing yet |   |
| my-motorsports | MY Motorsports | http://myridercourse.com/contact-us/ | woocommerce | wordpress | nothing yet |   |
| yes-cinema | YES Cinema | https://yescinemaandconferencecenter.com/ | unknown |   | nothing yet |   |

### Makers & Industry (37)

| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |
|---|---|---|---|---|---|---|
| analytical-engineering-inc | Analytical Engineering, Inc. | https://www.aei-tech.com/ | woocommerce | wordpress | nothing yet |   |
| bettner-wire-coating-dies-inc | Bettner Wire Coating Dies, Inc. | http://www.bettner.com/ | wordpress |   | nothing yet |   |
| boyer-machine-and-tool-co-inc | Boyer Machine & Tool Co. Inc. | http://www.boyermachine.com/ | wordpress |   | nothing yet |   |
| capco-llc | Capco LLC | http://capco-llc.com/ | unreachable |   | nothing yet |   |
| ce-systems | CE Systems | http://www.cunninghamprecision.com/ | unknown |   | nothing yet |   |
| cinlee-services-llc | CinLee Services, LLC | http://www.cinleecleaning.com/ | woocommerce | wordpress | nothing yet |   |
| columbus-industrial-electric | Columbus Industrial Electric | https://columbusindustrialelectricinc.localsearch.com/ | unknown | thryv | nothing yet |   |
| columbus-warehouse-and-cartage | Columbus Warehouse & Cartage | http://www.columbuswarehouse.com/ | wix-stores | wix | nothing yet |   |
| creative-tool-and-machining-inc | Creative Tool and Machining, Inc. | http://www.creativetool.net/ | unknown | joomla | nothing yet |   |
| cunningham-pattern-and-engineering-inc | Cunningham Pattern & Engineering Inc | http://cunninghamprecision.com/ | unknown |   | nothing yet |   |
| daileys-cnc-machining-llc | Dailey's CNC Machining LLC | https://daileyscnc.com/ | woocommerce | wordpress | nothing yet |   |
| davids-inc | David's Inc. | https://www.davidsinc.com/ | unknown | duda | nothing yet |   |
| driftwood-builders-inc | Driftwood Builders, Inc. | http://driftwoodbuildersinc.com/ | wordpress |   | nothing yet |   |
| dunlap-and-co-inc | Dunlap & Co. Inc. | http://www.dunlapinc.com/ | wordpress |   | nothing yet |   |
| empire-tea-services | Empire Tea Services | https://empiretea.com/ | shopify |   | reading it (shopify feed, 446 items) |   |
| force-construction-co-inc | Force Construction Co. Inc. | http://www.forceco.com/ | unknown | duda | nothing yet |   |
| gaylor-inc | Gaylor Inc. | http://www.gaylor.com/ | woocommerce | wordpress | nothing yet |   |
| grammer-logistics | Grammer Logistics | https://www.grammerlogistics.com/ | woocommerce | godaddy, wordpress | nothing yet |   |
| hiker-trailers | Hiker Trailers | http://www.hikertrailers.com/ | woocommerce | wordpress | reading it (woocommerce feed, 10 items) | online booking: hikertrailers.com |
| kinney-paper-and-chemical-co | Kinney Paper & Chemical Co. | http://www.kinneypaper.com/ | unknown |   | nothing yet |   |
| lear-machining-and-waterjet-inc | Lear Machining & Waterjet Inc. | http://www.learmachining.com/ | unknown | duda, thryv | nothing yet |   |
| lhp-engineering-solutions | LHP Engineering Solutions | https://www.lhpes.com/ | unknown |   | nothing yet |   |
| master-power-transmission | Master Power Transmission | http://master-pt.com/ | woocommerce | wordpress | nothing yet |   |
| meeks-and-company-professional-surveying-inc | Meeks & Company Professional Surveying, Inc. | http://meekscompany.com/ | square-online | weebly | nothing yet |   |
| milestone-design-group-inc | Milestone Design Group, Inc. | http://milestonedesign.org/ | unknown |   | nothing yet |   |
| noblitt-fabricating | Noblitt Fabricating | https://noblittfab.com/ | wordpress |   | nothing yet |   |
| ono-brothers-general-contractors-inc | Ono Brothers General Contractors, Inc. | http://www.onobrothers.com/ | godaddy |   | nothing yet |   |
| ozols-construction-corp | Ozols Construction Corp. | http://ozolsconstruction.com/ | wordpress |   | nothing yet |   |
| percifield-inc | Percifield Inc. | http://percifieldradiator.com/ | unknown | hibu | nothing yet |   |
| pollert-design-associates-inc | Pollert Design Associates Inc. | http://www.pollertdesign.com/ | wordpress |   | nothing yet |   |
| pyramid | Pyramid | http://www.pcp-mfg.com/ | unknown |   | nothing yet |   |
| real-world-testing-inc | Real World Testing, Inc | http://www.realworldtest.com/ | unknown |   | nothing yet |   |
| strand-associates | Strand Associates | https://www.strand.com/ | wordpress |   | nothing yet |   |
| taylor-bros-construction-co-inc | Taylor Bros. Construction Co., Inc. | http://www.tbcci.com/ | unknown |   | nothing yet |   |
| the-kroot-corporation | The Kroot Corporation | http://krootcorp.com/ | unknown | duda | nothing yet |   |
| the-phillips-company-inc | The Phillips Company, Inc. | http://thephillipscompany.com/ | woocommerce | wordpress | nothing yet |   |
| tobar-inc | Tobar Inc. | http://www.tobar.com/ | woocommerce | wordpress | nothing yet |   |

## Businesses with no website on file

These may sell through Facebook, Instagram, Etsy or a market stall. If you find a website or an online menu or shop for any of them, add a row to Part B with the URL.

124-smoke-shop (Shopping), a-cut-above (Beauty & Grooming), aanartana-arts (Kids & Learning), ahlmeyer-bakery (Coffee & Sweets), ajs-daycare-llc (Kids & Learning), amys-closet (Shopping), aubrie-yeh-music-studio (Kids & Learning), bankai-tattoo-collective (Beauty & Grooming), bartholomew-county-beverage (Makers & Industry), beauty-room (Beauty & Grooming), benedetto-salon (Beauty & Grooming), bob-condons-barber-shop (Beauty & Grooming), bored-games-llc (Shopping), bougielicious (Shopping), browns-antiques-and-furniture (Shopping), bruncheria-espinoza (Restaurants), c-4-school-of-cosmetology (Beauty & Grooming), central-avenue-barber-stylist (Beauty & Grooming), ceraland-park (Things to Do), circle-math-club (Kids & Learning), cloud-13-vape-and-smoke-shop (Shopping), coachs-cutz (Beauty & Grooming), coconut-cuties-child-care-llc (Kids & Learning), color-me-happy (Beauty & Grooming), columbus-food-mart (Shopping), columbus-hair-removal-clinic (Beauty & Grooming), columbus-home-supply (Shopping), columbus-nails-and-pro-dip (Beauty & Grooming), columbus-pawn (Shopping), columbus-pet-salon (Pets), comb-together (Beauty & Grooming), country-paws-grooming (Pets), crowder-and-darnall-inc (Makers & Industry), crump-center-for-the-performing-arts (Things to Do), don-r-scheidt-and-co-inc (Makers & Industry), doobys-smoke-and-vape (Shopping), dragon-maiden-spa (Beauty & Grooming), dubbs-backyard-bbq (Restaurants), ejblends (Beauty & Grooming), el-guacalito-restaurante-nicaraguense (Restaurants), el-mexicano (Restaurants), el-nopal-mexican-cuisine-north (Restaurants), esquire-hair-design (Beauty & Grooming), expressions-ink-tattoo (Beauty & Grooming), the-finishing-touch (Beauty & Grooming), genesis-salon (Beauty & Grooming), granny-beas (Shopping), great-wall-chinese-restaurant (Restaurants), grillerz-bar-and-grill-2 (Bars & Breweries), grizzleepretty-thrift-store (Shopping), grunt-n-gobble (Restaurants), h-and-h-vape-and-smoke (Shopping), hair-and-nails-by-phyllis (Beauty & Grooming), hair-in-motion (Beauty & Grooming), homeboyz-fried-chicken-and-fish (Restaurants), ickle-pickle-magic-inc (Kids & Learning), imagination-and-dreams (Kids & Learning), indiana-sentinels-hockey (Things to Do), jacks-place-two-inc (Shopping), karma-46 (Shopping), karma-records (Shopping), kellys-nails (Beauty & Grooming), king-nails-and-pro-dip-llc (Beauty & Grooming), la-mode-permanent-makeup-and-cosmetology-studio (Beauty & Grooming), la-prima-sewing-service (Shopping), the-landing-at-ceraland (Restaurants), las-delicias-food-truck (Restaurants), legends-alley (Things to Do), maple-lisa (Restaurants), maricity-by-storm (Beauty & Grooming), melissa-reardon-art (Shopping), mi-tierra (Shopping), michelles-renaissance (Beauty & Grooming), mine-yours-and-theirs (Shopping), miracles-hair-salon (Beauty & Grooming), miss-pollys-music-class (Kids & Learning), nails-by-liane (Beauty & Grooming), natural-choices-for-healthful-living-inc (Shopping), the-nutrition-lounge (Coffee & Sweets), otter-creek-bar-and-grill (Restaurants), panaderia-la-azteca (Coffee & Sweets), the-parts-house-llc (Makers & Industry), pho-shiki (Restaurants), phoenix-guns (Shopping), pickers-paradise (Shopping), piepers-gourmet-catering (Restaurants), play-and-learn-childcare (Kids & Learning), pokies-beauty-salon (Beauty & Grooming), precision-tools-service-inc (Makers & Industry), quick-way (Shopping), raining-acorns-outdoors (Shopping), reason-and-co-beauty-lounge (Beauty & Grooming), redefined (Shopping), refreshable-flavors-llc (Coffee & Sweets), ronas-creative-cutz (Beauty & Grooming), room-with-a-do (Beauty & Grooming), salon-independence (Beauty & Grooming), savings-bodega (Shopping), shear-perfection (Beauty & Grooming), shoppers-mart (Shopping), skin-by-nicoleta (Beauty & Grooming), smoke-collection (Shopping), sno-biz (Coffee & Sweets), sophias-bridal-and-tux (Shopping), sophias-massage (Beauty & Grooming), suite-d-hair-salon (Beauty & Grooming), sultry-salon-and-spa (Beauty & Grooming), supermercado-morales-2 (Shopping), taku-japanese-steakhouse (Restaurants), tangled-waves-hair-salon (Beauty & Grooming), taqueria-j-and-c (Restaurants), tjs-chopshop (Beauty & Grooming), travel-wonderland-by-alice (Things to Do), turners-barber-styling (Beauty & Grooming), tweak-medical-beauty-bar (Beauty & Grooming), twins-furniture-and-more (Shopping), vaneszko-hair-house (Beauty & Grooming), wilsons-kennel (Pets), winnie-tea-bar-at-nexuspark (Coffee & Sweets), winnie-tea-bar-at-the-commons (Coffee & Sweets), yoyo-boba-teahouse (Coffee & Sweets), ziggies-bar-and-grill (Bars & Breweries), zwanzigz-tap-room (Bars & Breweries).
