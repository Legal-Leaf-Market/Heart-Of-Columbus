// Facts for the "Plan your visit" page (/visit/). Every fact names the page
// it came from and the day someone checked it there; tests/visit.test.mjs
// fails the build if either is missing. Recheck before changing the date.
// Heart of Columbus is not the visitors bureau: link out for anything official.

const CHECKED = '2026-10-25';

export const SRC = {
  visitors: 'https://columbus.in.us/visitors-center',
  tours: 'https://columbus.in.us/see-do/tour-info',
  gettingHere: 'https://columbus.in.us/getting-to-columbus/',
  hike: 'https://columbus.in.us/take-a-hike/',
  official: 'https://visitcolumbusindiana.com/',
  events: 'https://visitcolumbusindiana.com/events/',
  transit: 'https://www.columbus.in.gov/columbus-transit/?p=14500',
  routes: 'https://columbus.in.gov/columbus-transit/fixed-route-service',
  parks: 'https://columbusparksandrec.com/?p=3858',
  trails: 'https://columbusparksandrec.com/facilities-parks-trails/',
  dora: 'https://www.columbus.in.gov/community-development/dora',
};

const f = (text, source, extra = {}) => ({ text, source, checked: CHECKED, ...extra });

export const VISITORS_CENTER = {
  name: 'Columbus Visitors Center',
  address: '506 Fifth Street',
  phone: '(812) 378-2622',
  slug: 'columbus-visitors-center-gift-shop',
  source: SRC.visitors,
  checked: CHECKED,
  facts: [
    f('Open Monday to Saturday, 10 AM to 5 PM. Closed Mondays in January and February. Holiday hours are posted on their site.', SRC.visitors),
    f('Free parking. The lot is just past the building on Franklin Street, which runs one way north; visitor spaces are at the south end of the lot.', SRC.gettingHere),
    f('Staff on the first floor help plan a visit and pick a tour. Maps, brochures and city guides are free to take.', SRC.visitors),
    f('Free videos about Columbus, shown any time, and a Dale Chihuly yellow neon chandelier.', SRC.visitors),
    f('A gift shop with work by local and regional artists.', SRC.visitors),
  ],
};

export const TOURS = {
  facts: [
    f('Architectural Highlights by shuttle: about 2 hours. No children under 6.', SRC.tours),
    f('Miller House and Garden: about 90 minutes, ages 10 and up. There is no public access at the house except on the tour.', SRC.tours),
    f('Iconic Columbus Walking Tour: about 90 minutes on foot.', SRC.tours),
    f('All three start and end at the Visitors Center. Tours regularly sell out, so the Visitors Center recommends reserving ahead.', SRC.tours),
    f('On your own: up to 82 stops on the Downtown and City loops, with a printed stop guide sold at the Visitors Center, Viewpoint Books and Hotel Indigo.', SRC.tours),
    f('Free self-guided bike tour maps are available at the Visitors Center.', SRC.tours),
  ],
};

export const GETTING_HERE = {
  facts: [
    f('By car on I-65 (from Indianapolis, Louisville or Bloomington): take exit 68 and follow State Road 46 east into Columbus.', SRC.gettingHere),
    f('From Cincinnati: I-74 to the Greensburg exit (134A), then State Road 46 west to Columbus.', SRC.gettingHere),
    f('The Indianapolis airport is about an hour’s drive, and Louisville’s about an hour and a half. No shuttles or taxis run from the Indianapolis airport, so the Visitors Center suggests renting a car.', SRC.gettingHere),
  ],
};

export const GETTING_AROUND = {
  facts: [
    f('ColumBUS, the city bus, is free to ride.', SRC.transit),
    f('Five fixed routes run Monday to Friday, 6 AM to 8 PM, and Saturday, 8 AM to 5 PM. No Sunday service is listed.', SRC.routes),
    f('The Columbus Transit Depot is at 850 Lindsey Street. Questions: (812) 376-2506.', SRC.transit),
    f('The People Trail: the parks department maintains over 23 miles of paved trail linking the city’s parks.', SRC.parks),
    f('The Visitors Center suggests Mill Race Park as a place to start on the trail.', SRC.hike),
  ],
};

export const SOCIAL_DISTRICT = {
  name: 'Downtown Columbus Social District',
  maps: [
    ['Boundary map', 'https://www.columbus.in.gov/wp-content/uploads/2025/05/Dora-District-05.12.2025.png'],
    ['Map of designated businesses', 'https://www.columbus.in.gov/wp-content/uploads/2025/08/Dora-Business-Designees-08.12.2025.jpg'],
  ],
  facts: [
    f('Open every day, 10 AM to midnight.', SRC.dora),
    f('If you are 21 or older, you can carry a drink from a designated business in a clear, branded Social District cup and walk with it inside the district.', SRC.dora),
    f('Each business can send a person out with no more than two open drinks.', SRC.dora),
    f('Cup limits: beer up to 16 ounces; wine, cider or a premixed cocktail up to 12 ounces; a liquor drink up to 10 ounces with no more than 2 ounces of liquor.', SRC.dora),
    f('Drinks bought outside the district can’t be carried in it, and any business can ask you not to bring a drink inside.', SRC.dora),
    f('The city lists 17 designated businesses.', SRC.dora),
  ],
};

export const VISIT_SECTIONS = [VISITORS_CENTER, TOURS, GETTING_HERE, GETTING_AROUND, SOCIAL_DISTRICT];
