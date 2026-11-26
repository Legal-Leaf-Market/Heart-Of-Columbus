// Facts a business publishes about itself on its own website. They beat the
// listings we swept (Chamber, Google) because the owner wrote them, so a
// business that keeps its own site current is shown the way it says it is.
// Same rule as every data file: only what that page says, with the page and
// the date we checked it. directory.mjs applies these after the sweep.
//
//   address, where, hours   street line, a pointer, and hours rows shaped like
//                           hours.mjs, from their own contact or hours page
//   links    their own pages worth a button: [{ label, url }]
//   also     another section their own pages show they serve, as
//            { cat, sub, type, title, points: [..], cta, url }. The business
//            is listed there too and keeps its home section and page. `points`
//            are plain facts from `url`, never our words about how good it is.
//   kin      a family business it names, as [{ slug, label, about }]: a line on its
//            page linking the other listing (and the other one back, if that
//            business says so too). Only what the owners told us.
//
// Turtle's Flowers (checked 2026-11-15), https://www.turtlesflowers.com/ :
//   page title "Premium Flower Delivery Columbus IN | Artisan Florist";
//   description "Send luxury flowers in Columbus, IN. Artisan arrangements from
//   thoughtful to unforgettable for anniversaries, birthdays & more."; share
//   text "Florist in Columbus Indiana. Specializing in bouquets made from
//   locally grown flowers. We welcome weddings of all budgets." The site runs
//   on Square Online and renders its menu in the browser, so no section pages
//   could be read; the buttons stay on the home page. Sister business: Rabbit's
//   Balloons, per its owner Rachael Starr (2026-11-15).
//
// Rabbit's Balloons (checked 2026-11-15): from its owner, Rachael Starr; see
// added.mjs. Its standalone website hosts the preview and Color Studio.
//
// Cookie Paradise (checked 2026-11-13):
//   - https://cookieparadise.co/pages/contact : "Address: 3950 25th St,
//     Columbus, IN 47203" and the hours (Tuesday to Friday 10 AM to 6 PM,
//     Saturday 10 AM to 8 PM, Sunday and Monday closed).
//   - https://cookieparadise.co/ : "Find our trailer in the Holiday Center
//     parking lot, 3950 25th St."
//   The Chamber row had 3346 Cox Ln; Google's listing pins 3950 25th St with
//   shorter hours (Tuesday to Friday 11 AM to 5:30 PM). The owner's own page wins.
export const OWN_FACTS = {
  'ciscos-barber-shop': {
    address: '1719 Central Ave',
    hours: [[1, 540, 1200], [2, 540, 1200], [3, 540, 1200], [4, 540, 1200], [5, 540, 1200], [6, 540, 960]],
    source: 'https://www.ciscos.site/',
    checked: '2026-11-25',
  },
  'cookie-paradise-llc': {
    address: '3950 25th St',
    where: 'Trailer in the Holiday Center parking lot',
    // [day (0 is Sunday), opens, closes] in minutes after midnight, like hours.mjs.
    hours: [[2, 600, 1080], [3, 600, 1080], [4, 600, 1080], [5, 600, 1080], [6, 600, 1200]],
    source: 'https://cookieparadise.co/pages/contact',
    checked: '2026-11-13',
    // From the Weddings & Private Parties and Corporate Catering pages (same
    // day): dessert tables; ask about individually packaged favors; ask whether
    // the yellow trailer can come to your venue; a quote form. The owner asked
    // to cross promote the wedding page (via Jacob Kennedy, 2026-11-13).
    links: [
      { label: 'Weddings & parties', url: 'https://cookieparadise.co/pages/weddings-private-parties' },
      { label: 'Corporate catering', url: 'https://cookieparadise.co/pages/corporate-catering' },
    ],
    also: [
      {
        cat: 'events',
        sub: 'events',
        type: 'Cookies for weddings and parties: dessert tables, favors and a cookie trailer',
        title: 'Weddings and parties',
        points: [
          'Dessert tables: a mix of cookies set out for guests at a reception, rehearsal dinner, birthday or shower.',
          'Cookie favors: ask about individually packaged cookies for place settings or welcome bags.',
          'Outdoor parties: ask whether their yellow cookie trailer can come to your venue.',
          'Send your date and details through their form and they follow up about flavors, pricing and availability.',
        ],
        cta: 'Request an event quote',
        url: 'https://cookieparadise.co/pages/weddings-private-parties',
      },
    ],
  },
  'turtles-flowers': {
    source: 'https://www.turtlesflowers.com/',
    checked: '2026-11-15',
    kin: [{ slug: 'rabbits-balloons', label: 'Sister business', about: 'balloon arches and installs' }],
    also: [
      {
        cat: 'events',
        sub: 'events',
        type: 'Wedding and event flowers from an artisan florist, made with locally grown flowers',
        title: 'Wedding flowers',
        points: [
          'Specializes in bouquets made from locally grown flowers.',
          'Welcomes weddings of all budgets.',
          'Artisan arrangements for anniversaries, birthdays and more, with flower delivery in Columbus.',
        ],
        cta: 'Plan your flowers',
        url: 'https://www.turtlesflowers.com/',
      },
    ],
  },
  // Stunna's (https://www.stunnas812.com/, checked 2026-11-15): "What started
  // as a small meal prep service by a busy mom has grown into a full-circle
  // food experience"; "Meal Pick-up Location, Events & Kitchen" at "1604
  // Central Avenue"; event catering; event space and kitchen rentals; meal prep
  // ordered online through GoPrep.
  stunnas: {
    source: 'https://www.stunnas812.com/',
    checked: '2026-11-15',
    links: [
      { label: 'Ask about catering', url: 'https://www.stunnas812.com/contact' },
      { label: 'Rent the event space', url: 'https://www.stunnas812.com/event-space' },
      { label: 'Meal prep menu', url: 'https://stunnasmealprep.goprep.com/customer/menu' },
    ],
    also: [
      {
        cat: 'events',
        sub: 'events',
        type: 'Event catering and an event space to rent on Central Avenue',
        title: 'Catering and event space',
        points: [
          'Event catering from its kitchen at 1604 Central Avenue.',
          'An event space you can rent at the same address, and a kitchen to rent too.',
          'It started as a meal prep service by a busy mom, and meal prep is still on the menu to order online.',
        ],
        cta: 'Ask about catering',
        url: 'https://www.stunnas812.com/contact',
      },
    ],
  },
  // Bip's Bites (https://www.bipsbites.com/ and its shop and recipe pages,
  // checked 2026-11-15); see added.mjs.
  'bips-bites': {
    source: 'https://www.bipsbites.com/',
    checked: '2026-11-15',
    links: [
      { label: 'Shop the BBQ rub', url: 'https://www.bipsbites.com/product/smoky-sweet-heat-bbq-rub/' },
      { label: 'Cooking videos', url: 'https://www.bipsbites.com/recipes/' },
      { label: 'Shop', url: 'https://www.bipsbites.com/shop/' },
    ],
  },
  // Kawaii Katz (checked 2026-11-25): buttons to sections its own site has,
  // read from its routes (app/gifts, app/decora, app/anime) and its guide list
  // (lib/boards.ts: "Kawaii Christmas Gift Guide" at /gifts/christmas) in its
  // repository. www.kawaiikatz.com lapsed in November 2026; the shop runs at
  // https://kawaiikatz.heartofcolumbus.shop (its lib/site.ts) until it moves to its own .shop domain.
  'kawaii-katz': {
    source: 'https://github.com/Legal-Leaf-Market/KawaiiKatz',
    checked: '2026-11-25',
    links: [
      { label: 'Christmas gift guide', url: 'https://kawaiikatz.heartofcolumbus.shop/gifts/christmas' },
      { label: 'Gift guides', url: 'https://kawaiikatz.heartofcolumbus.shop/gifts' },
      { label: 'Decora', url: 'https://kawaiikatz.heartofcolumbus.shop/decora' },
      { label: 'Anime', url: 'https://kawaiikatz.heartofcolumbus.shop/anime' },
    ],
  },
  // Love Me Wildly Photography (checked 2026-11-26): its own site's menu,
  // https://www.lovemewildly.com/ : About, Packages ("THE GOLDEN HOUR PACKAGE,
  // 5 hours of coverage", "THE TIMELESS PACKAGE, 8 hours of coverage", "THE
  // WILDLY IN LOVE PACKAGE, Elopement Wedding"), Portfolio (Weddings,
  // Portraits, Newborn Lifestyle) and Contact. No prices are published.
  'love-me-wildly-photography': {
    source: 'https://www.lovemewildly.com/',
    checked: '2026-11-26',
    links: [
      { label: 'Packages', url: 'https://www.lovemewildly.com/packages' },
      { label: 'Portfolio', url: 'https://www.lovemewildly.com/portfolio-1' },
      { label: 'Contact', url: 'https://www.lovemewildly.com/contact' },
    ],
  },
  'rabbits-balloons': {
    source: 'https://rabbits-balloons.netlify.app/',
    checked: '2026-11-15',
    links: [{ label: 'Color Studio', url: 'https://rabbits-balloons.netlify.app/#studio' }],
    kin: [{ slug: 'turtles-flowers', label: 'Sister business', about: 'artisan florist' }],
  },
};
