// Businesses that have signed on to take pickup orders through Heart of
// Columbus. EMPTY ON PURPOSE: until an owner agrees in writing, nobody's
// orders go anywhere. To switch a business on, add its directory slug:
//
//   'gramz-bakery-and-cafe': {
//     pickup: true,
//     signedOn: '2026-11-02',         // date the owner agreed
//     contact: 'owner name or role',  // who to call when something breaks
//   },
//
// The five storefront demos (/gills/, /tacolumbus/...) are not partners. Their
// orders make a demo ticket, so the whole pickup loop can be tried, and are
// never sent to the real business.
export const PARTNERS = {};

export const DEMO_SLUGS = ['gills', 'tacolumbus', 'big-cheese', 'tasty-express', 'rohdes'];

// Share of the counter total Heart of Columbus would charge a partner per
// collected pickup. Zero while the site says "no commission"; Herbal Leaf
// Market's version of this rail uses 5%. Changing it is a business decision,
// and the site copy must change with it.
export const COMMISSION = 0;
