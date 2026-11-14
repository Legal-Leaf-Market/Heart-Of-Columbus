// What a business's own website says about it, where that is newer or more
// specific than the listings sweep. Same rule as everywhere else: only what
// the page says, with the page and the date we checked it. An entry here wins
// over landscape.mjs (address), hours.mjs (Google hours) for that business.
//
//   address  street line from their own contact page
//   hours    rows shaped like hours.mjs ([day, open, close], minutes), from
//            their own hours page; the business page names it as the source
//   links    their own pages worth a button: [{ label, url }]
//   also     another section their own pages show they serve, as
//            { cat, sub, type, points: [..], url }. The business is listed
//            there too and keeps its home section and page. `points` are
//            plain facts from `url`, never our words about how good it is.
//
// Cookie Paradise (checked 2026-11-13). Contact & Hours page: storefront at
// 3950 25th St, Columbus, IN 47203 (also on the home page: the trailer in the
// Holiday Center lot); Monday closed, Tuesday to Friday 10 AM to 6 PM,
// Saturday 10 AM to 8 PM, Sunday closed. The Chamber listing's 3346 Cox Ln
// and Google's Tuesday to Friday 11 AM to 5:30 PM are older. Weddings &
// Private Parties page: dessert tables; ask about individually packaged
// favors; ask whether the yellow cookie trailer can come to your venue; a
// quote form for flavors, pricing and availability. The owner asked to
// cross promote the wedding page (via Jacob Kennedy, 2026-11-13).
export const OWN_SITE = {
  'cookie-paradise-llc': {
    source: 'https://cookieparadise.co/pages/contact',
    checked: '2026-11-13',
    address: '3950 25th St',
    hours: [[2, 600, 1080], [3, 600, 1080], [4, 600, 1080], [5, 600, 1080], [6, 600, 1200]],
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
};

export const ownSiteFor = (slug) => OWN_SITE[slug] || null;
