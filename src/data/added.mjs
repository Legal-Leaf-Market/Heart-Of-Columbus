// Listings added by hand that are not in the landscape sweep. Same rule as
// everywhere else: only what the business's own public page says, with the
// page and the date we checked it.
//
// Crossroads Wedding Co. (crossroadsweddingco.shop, checked 2026-10-26): "Based
// in Columbus, Indiana"; wedding DJ and MC, live solo acoustic sets, bar
// service and coordination on the day; dates booked from its own /book page. No
// street address or phone is published, so none is shown.
//
// Matty O Entertainment (mattyoentertainment.com, checked 2026-10-26): DJ for
// weddings, school dances and proms, corporate events, karaoke, a 360 video
// booth and staging, "Central & South Central Indiana"; phone from its Contact
// Us page. No street address is published.
//
// TJ's ChopShop (booksy.com/en-us/1010454_tj-s-chopshop_barber-shop_19373_columbus,
// checked 2026-11-13): barbershop at 1521 17th St, Columbus, IN 47201, with map
// coordinates from the same page. New shop in a restored space (its Facebook
// post, seen by the publisher). Booksy publishes no phone, hours or services, so
// none are shown; booking goes to its own Booksy page.
//
// Legal Leaf Market Cafe: from its owner, Jacob Kennedy, who also publishes
// Heart of Columbus (2026-11-13): a cafe coming soon to Columbus, Indiana. No
// address, hours or menu yet. Listed as coming soon, with the tie disclosed on
// its page. Moved to Shopping, Smoke & Vape on 2026-11-24 (see the entry).
//
// Rabbit's Balloons: from its owner, Rachael Starr, in conversation with Jacob
// Kennedy (2026-11-15): organic balloon arches, garlands and displays in all
// natural latex (Sempertex) for corporate events, weddings, showers and
// private parties in Columbus. She has no public page yet, so `source` is the
// draft website Heart of Columbus built from what she told us for her to
// review (sites/rabbits-balloons/). No address, phone or prices yet. She owns
// a domain; put it in `website` when it goes live.
//
// Love Me Wildly Photography (facebook.com/lovemewildlyphotography, checked
// 2026-11-15): page name "love.me.wildly", "Specializing in weddings and
// elopement photography", Photographer, Columbus, IN, (812) 593-5541. No
// website or street address. Its photos stay on Facebook: we show business
// photos only when the owner sends them with permission (media.mjs).
//
// First Class Catering (firstclasscateringin.com, checked 2026-11-15): "We are
// a Southern Indiana based catering company" serving "Indianapolis,
// Bloomington, Jeffersonville, and beyond"; Weddings, Private Events and Bar
// Services; 812-314-7849. Listed as a caterer on the Columbus visitors
// bureau's planner page. No street address.
//
// Bonafide Bites (bonafidebites.com, checked 2026-11-15): "a 100% chef owned
// and operated boutique catering company based in South Central Indiana
// serving Nashville, Bloomington, Columbus, and surrounding areas"; full
// service catering, drop-off deliveries, corporate and contract services. No
// phone or street address. Also on the visitors bureau's caterer list.
//
// Bip's Bites (bipsbites.com, checked 2026-11-15): "Dark-fantasy BBQ rubs and
// whole hog pitmaster content from Southern Indiana"; "Bip's Bites comes from
// Southern Indiana"; the Smoky Sweet Heat BBQ Rub, "made for burgers, pork,
// chicken and vegetables"; cooking videos; 812-764-8400. Its founder's own
// LinkedIn profile lists "Private chef, Food and Beverage consultant, Bip's
// Bites" in Columbus, Indiana. No street address.
export const ADDED = [
  {
    name: 'Crossroads Wedding Co.',
    cat: 'events',
    sub: 'events',
    type: 'Wedding DJ and MC, live acoustic sets, bar service and coordination on the day',
    address: '',
    phone: '',
    website: 'https://crossroadsweddingco.shop/',
    book: [{ label: 'booking', url: 'https://crossroadsweddingco.shop/book' }],
    tie: 'Crossroads Wedding Co. is run by Jacob Kennedy, who also runs Heart of Columbus.',
    source: 'https://crossroadsweddingco.shop/',
    checked: '2026-10-26',
  },
  {
    name: 'Matty O Entertainment',
    cat: 'events',
    sub: 'events',
    type: 'DJ for weddings, school dances, corporate events and karaoke, with a 360 video booth',
    address: '',
    phone: '(812) 344-3598',
    website: 'https://www.mattyoentertainment.com/',
    book: [],
    source: 'https://www.mattyoentertainment.com/',
    checked: '2026-10-26',
  },
  {
    name: "TJ's ChopShop",
    cat: 'beauty',
    sub: 'barbers',
    type: 'Barber shop',
    address: '1521 17th St',
    phone: '',
    website: '',
    ll: [39.21565, -85.9075],
    book: [{ label: 'Booksy', url: 'https://booksy.com/en-us/1010454_tj-s-chopshop_barber-shop_19373_columbus' }],
    source: 'https://booksy.com/en-us/1010454_tj-s-chopshop_barber-shop_19373_columbus',
    checked: '2026-11-13',
  },
  {
    name: 'Legal Leaf Market Cafe',
    // Filed under Smoke & Vape for now (owner's call, 2026-11-24): its online
    // store sells vapes and smoke goods today. Its coffee and tea shop isn't
    // open yet; move it back to Coffee & Sweets (or list it in both, `also`
    // in own-facts.mjs) once coffee and tea are on sale.
    cat: 'smoke',
    sub: 'smoke',
    type: 'Vape shop',
    address: '',
    phone: '',
    website: 'https://shop.legalleafmarket.shop/',
    book: [],
    soon: true,
    tie: 'Legal Leaf Market is owned by Jacob Kennedy, who also runs Heart of Columbus.',
    source: 'https://shop.legalleafmarket.shop/',
    checked: '2026-11-13',
  },
  {
    name: "Rabbit's Balloons",
    cat: 'events',
    sub: 'events',
    type: 'Organic balloon arches, garlands and installs in all natural latex',
    address: '',
    phone: '',
    website: '',
    book: [],
    source: 'https://heartofcolumbus.netlify.app/preview/rabbits-balloons/',
    checked: '2026-11-15',
  },
  {
    name: 'Love Me Wildly Photography',
    cat: 'pros',
    sub: 'creative',
    type: 'Wedding and elopement photographer',
    address: '',
    phone: '(812) 593-5541',
    website: 'https://www.facebook.com/lovemewildlyphotography/',
    book: [],
    source: 'https://www.facebook.com/lovemewildlyphotography/',
    checked: '2026-11-15',
  },
  {
    name: 'First Class Catering',
    cat: 'restaurants',
    sub: 'bbq-trucks',
    type: 'Catering for weddings and private events, with bar service',
    address: '',
    phone: '(812) 314-7849',
    website: 'https://www.firstclasscateringin.com/',
    book: [],
    source: 'https://firstclasscateringin.com/',
    checked: '2026-11-15',
  },
  {
    name: 'Bonafide Bites',
    cat: 'restaurants',
    sub: 'bbq-trucks',
    type: 'Chef-owned catering: full service, drop-off and corporate',
    address: '',
    phone: '',
    website: 'https://www.bonafidebites.com/',
    book: [],
    source: 'https://www.bonafidebites.com/',
    checked: '2026-11-15',
  },
  {
    name: "Bip's Bites",
    cat: 'restaurants',
    sub: 'bbq-trucks',
    type: 'Fantasy-inspired BBQ rubs, whole hog barbecue and a private chef',
    address: '',
    phone: '(812) 764-8400',
    website: 'https://www.bipsbites.com/',
    book: [],
    source: 'https://www.bipsbites.com/',
    checked: '2026-11-15',
  },
];
