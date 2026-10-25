// schema.org JSON-LD for business, landmark, event and trip pages, built only
// from the data each page already shows. Pages stay noindex; this is ready for
// the day a business signs on. tests/jsonld.test.mjs checks that every block
// parses and that its name, phone and address appear on the page itself.

export const ORIGIN = process.env.HOC_ORIGIN || 'https://heartofcolumbus.netlify.app';
const abs = (p) => (p.startsWith('http') ? p : ORIGIN + p);

// The most specific type that fits a whole subcategory; LocalBusiness otherwise.
const TYPE = {
  'restaurants/*': 'Restaurant', 'bars/bars': 'BarOrPub', 'coffee-sweets/coffee-sweets': 'FoodEstablishment',
  'beauty/salons': 'HairSalon', 'beauty/barbers': 'HairSalon', 'beauty/nails': 'NailSalon', 'beauty/spa': 'DaySpa', 'beauty/tattoo': 'TattooParlor',
  'auto/auto-repair': 'AutoRepair', 'auto/tires-body': 'AutoBodyShop', 'auto/used-cars': 'AutoDealer', 'auto/detail-tow': 'AutomotiveBusiness',
  'health/dental': 'Dentist', 'health/clinics': 'MedicalClinic', 'health/*': 'MedicalBusiness',
  'fitness/fitness': 'HealthClub', 'kids/childcare': 'ChildCare',
  'home-services/electric': 'Electrician', 'home-services/contractors': 'GeneralContractor', 'home-services/laundry': 'DryCleaningOrLaundry', 'home-services/*': 'HomeAndConstructionBusiness',
  'pros/legal': 'LegalService', 'pros/insurance': 'InsuranceAgency', 'pros/accounting': 'AccountingService', 'pros/finance': 'FinancialService', 'pros/real-estate': 'RealEstateAgent', 'pros/*': 'ProfessionalService',
  'shopping/boutiques': 'ClothingStore', 'shopping/hobbies': 'HobbyShop', 'shopping/*': 'Store',
};
export const schemaType = (b) => TYPE[`${b.cat}/${b.sub}`] || TYPE[`${b.cat}/*`] || 'LocalBusiness';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hhmm = (m) => { m = m >= 1440 ? m - 1440 : m; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
// A close past midnight is written as the next morning's time, which schema.org reads as overnight.
const hoursSpec = (rows) => rows.map(([d, o, c]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS[d], opens: hhmm(o), closes: c === 1440 ? '23:59' : hhmm(c) }));

const address = (street) => ({ '@type': 'PostalAddress', streetAddress: street, addressLocality: 'Columbus', addressRegion: 'IN', addressCountry: 'US' });
const geo = (ll) => ({ '@type': 'GeoCoordinates', latitude: ll[0], longitude: ll[1] });

export function businessLd(b) {
  return {
    '@context': 'https://schema.org', '@type': schemaType(b), name: b.name,
    ...(b.address ? { address: address(b.address) } : {}),
    ...(b.ll ? { geo: geo(b.ll) } : {}),
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.website ? { url: b.website, sameAs: [b.website] } : {}),
    ...(b.hours && !b.tempClosed ? { openingHoursSpecification: hoursSpec(b.hours) } : {}),
  };
}

export function landmarkLd(l) {
  return {
    '@context': 'https://schema.org', '@type': ['LandmarksOrHistoricalBuildings', 'TouristAttraction'], name: l.name, description: l.what,
    address: address(l.address), ...(l.ll ? { geo: geo(l.ll) } : {}), url: abs(`/l/${l.slug}/`), sameAs: [l.source],
    ...(l.photo ? { image: l.photo.src } : {}),
  };
}

export function eventLd(e) {
  return {
    '@context': 'https://schema.org', '@type': 'Event', name: e.name, description: e.line, url: e.url, startDate: e.start, endDate: e.end,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', addressLocality: 'Columbus', addressRegion: 'IN', addressCountry: 'US' }, ...(e.ll ? { geo: geo(e.ll) } : {}) },
  };
}

// [[name, href], ...] in order.
export const itemListLd = (name, items) => ({
  '@context': 'https://schema.org', '@type': 'ItemList', name,
  itemListElement: items.map(([n, href], i) => ({ '@type': 'ListItem', position: i + 1, name: n, url: abs(href) })),
});

// Same pairs as breadcrumbs() in site.mjs; the last one has no link.
export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([href, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, ...(href ? { item: abs(href) } : {}) })),
});
