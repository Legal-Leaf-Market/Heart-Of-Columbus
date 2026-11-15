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
// added.mjs. Its draft website is the page it has for now.
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
  'rabbits-balloons': {
    source: 'https://heartofcolumbus.netlify.app/preview/rabbits-balloons/',
    checked: '2026-11-15',
    links: [{ label: 'Draft website and Color Studio', url: '/preview/rabbits-balloons/' }],
    kin: [{ slug: 'turtles-flowers', label: 'Sister business', about: 'artisan florist' }],
  },
};
