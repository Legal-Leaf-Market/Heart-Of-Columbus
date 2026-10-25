// "Columbus your way": trip ideas built only from data on this site. Each
// stop is a business slug or a landmark (l:slug) with a time slot on the
// trip's day. The reasons shown for a stop are computed from its listing
// (hours, distance, ordering, tags), never written by hand, and
// tests/trips.test.mjs fails if a business is not open for its whole slot.
// If a place changes its hours, the build says the trip is wrong.

const t = (h, m = 0) => h * 60 + m;

export const TRIPS = [
  {
    slug: 'architecture-morning', title: 'Architecture morning and a downtown lunch', day: 6,
    line: 'Coffee, four landmarks you can see from the street, then lunch. Each stop is a short walk from the last.',
    stops: [
      ['lucabe-coffee-co-4th-street', t(8, 30), t(9, 15)],
      ['l:firstchristian', t(9, 15), t(9, 45)],
      ['l:library', t(9, 45), t(10, 15)],
      ['l:irwin', t(10, 15), t(10, 45)],
      ['l:courthouse', t(10, 45), t(11, 15)],
      ['thai-connection', t(12), t(13)],
    ],
  },
  {
    slug: 'shop-small-saturday', title: 'Shop small on a Saturday', day: 6,
    line: 'Pastries, books and gifts downtown, with lunch and ice cream in between. Each stop is a short walk from the last.',
    stops: [
      ['gramz-bakery-and-cafe', t(10), t(10, 45)],
      ['viewpoint-books', t(10, 45), t(11, 30)],
      ['lucianas-mexican-restaurant', t(12), t(13)],
      ['bakers-fine-gifts-and-accessories', t(13), t(13, 45)],
      ['firefly-shirt-co', t(13, 45), t(14, 30)],
      ['zaharakos-ice-cream-parlor', t(14, 30), t(15, 15)],
      ['columbus-visitors-center-gift-shop', t(15, 15), t(16)],
    ],
  },
  {
    slug: 'date-night', title: 'Date night downtown', day: 5,
    line: 'Dinner, a soda-fountain dessert, then a drink in the Social District. Each stop is a short walk from the last.',
    stops: [
      ['angottis-italian-restaurant', t(18, 30), t(20)],
      ['zaharakos-ice-cream-parlor', t(20), t(20, 45)],
      ['the-st-denis-wine-books-and-wonders', t(20, 45), t(22)],
    ],
  },
];
