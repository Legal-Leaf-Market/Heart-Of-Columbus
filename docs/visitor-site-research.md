# Visitor-site research: improvements for Heart of Columbus

A brief for Claude Code working in `Legal-Leaf-Market/Heart-Of-Columbus`.
Suggested home in the repo: `docs/visitor-site-research.md`.

Research date: October 25, 2026. I reviewed about 30 official visitor-bureau
(DMO) websites across the U.S., from big cities to towns Columbus's size,
plus the official Visit Columbus Indiana site, and compared what they offer
with what this repo builds today. Every site is listed with its URL at the end.

## How to use this brief

- Work top to bottom. P1 items are the biggest gain for the least risk. One PR
  per numbered item is a good size.
- Every rule in `CLAUDE.md` still applies. In particular: no em dashes in
  anything a person reads, never invent facts about a real business, demos
  stay demos, pages stay `noindex`, and `npm test` must pass.
- New rule for this work: **every new fact gets a source URL and a "checked"
  date in the data file**, the same way hours say "from their Google listing,
  October 2026." Facts in the "Columbus facts" section below were checked on
  October 25, 2026, but recheck anything before it ships.
- Add a test for each new data file that fails if an entry is missing
  `source` or `checked`.

## The gap in one paragraph

Heart of Columbus is already a better *resident* directory than any visitor
site I looked at: it lists every independent (DMO directories usually list
only paying members), knows who is open right now, sorts by distance, and
sends orders straight to the business. What visitor sites do that this repo
doesn't is organize around **a trip**: when you're coming, how long you have,
who's with you, where to start, how to get around, and what's on this
weekend. The improvements below add that visitor layer on top of the data
the site already has, without breaking the "no invented facts" rule.

## What already exists (don't rebuild)

Open-now badges and the "Open right now" rail, the hours tables, "nearest to
me" sort, the Leaflet map with clustering on `/explore/`, Saved places (the
heart button, kept in `localStorage`), neighborhood pages with counts, Spin,
the architecture strip and landmark photos (`PHOTOS` in `src/site.mjs`),
"Close by" rails, Share, and the direct order / book / shop links. Several
items below extend these rather than adding new systems.

---

## P1: highest value, lowest risk

### 1. A "Plan your visit" page (`/visit/`)

**Seen on:** Visit Philadelphia (Getting Here, Getting Around, Parking,
Independence Visitor Center), Choose Chicago (Plan menu with getting here,
getting around, accessibility, weather, visitor resources), Travel Portland
(Plan Your Trip: maps, visitor center, transportation, accessible Portland,
weather, safety), Visit Palm Springs (Visitor Center & Info, Maps, Visitor
FAQ, Transportation), Visit Seattle, Visit Savannah, Visit Fredericksburg TX.
This is the most consistent feature across every site reviewed.

**Build:**
- New page `/visit/`, linked from the header nav ("Visit") and footer.
- Data in `src/data/visit.mjs`, one object per fact with `source` and
  `checked`. Render in `src/pages/visit-pages.mjs`, plain CSS in `hoc.css`
  like the other directory pages.
- Sections: the official Visitors Center (address, phone, hours, free
  parking), architecture tours (link to the official tour page and calendar;
  don't copy prices, or show them with "as of" and the source), getting
  here (I-65, Exit 76), getting around (ColumBUS, the People Trail, walking
  downtown), the downtown Social District (see item 7), and "call ahead"
  guidance.
- Make clear Heart of Columbus is not the visitors bureau and link to Visit
  Columbus Indiana for official information.

### 2. Landmarks as data, with independents within walking distance

**Seen on:** Visit Palm Springs (Midcentury Architecture Self-Guided Tour),
Visit Columbus Indiana (architecture tours, Notable Architects, National
Historic Landmarks, Avenue of the Architects), Visit Greenville SC
(neighborhood cards with counts of cafes, shops and things to do).

**Why this one matters:** no visitor site I found pairs each landmark with
every independent business a short walk away. That's the thing only this
site can do, and it's the most natural bridge between "Athens of the
Prairie" and "Run by neighbors."

**Build:**
- `src/data/landmarks.mjs`: move the 10 landmarks out of `PHOTOS` into a
  dataset with `slug`, `name`, `architect`, `year`, `ll` (from Wikipedia or
  the NRHP record, cited), photo (keep the existing Commons credit fields),
  `free` (can you see it from outside for free), `source`, `checked`. Leave
  `PHOTOS` as a thin view over it so nothing else breaks.
- New page per landmark, e.g. `/l/<slug>/`: photo and credit, one or two
  factual lines (architect, year, what the building is), a link to the
  official tour if one includes it, a small map, and rails "Coffee within a
  5-minute walk," "Lunch nearby," "Shops on the way," built with the
  existing `km()` helper and geo data.
- Show walking time as an estimate (about 80 m per minute) and label it as
  one.
- Link each card in the home page architecture strip to its landmark page.
  (The strip's keyboard fix from the accessibility scan should land first.)
- Add landmarks to the `/explore/` map as a separate layer (see item 9).

### 3. "This weekend in Columbus," done honestly

**Seen on:** nearly every site. Visit Philadelphia (This Week & Weekend),
Choose Chicago ("This weekend" and "Next week" tabs), Travel Portland
(This Weekend plus the Tuesday "Weekender" email), Visit Indy (Weekend Five
email every Thursday), Experience Columbus OH (Events This Weekend), Visit
Palm Springs, Explore Asheville, Visit Austin, Visit Hamilton County, Traverse
City, Brown County (Happening This Week), Paducah (This Week in Paducah).

**Caution from the research:** Noble Studios' 2026 trends report says
auto-filled, scraped calendars show stale festivals, duplicates and
out-of-town events, and that curated pages for signature events earn more
trust. That fits this repo's rules.

**Build:**
- `src/data/events.mjs`: hand-entered signature events only. Fields:
  `name`, `start`, `end`, `venue`, `ll`, `url` (the official page), `source`,
  `checked`. No copied descriptions; one plain line in our own words.
- Example to start with: the Mill Race Monster Festival, October 23 to 25,
  2026, in Mill Race Park (listed on Visit Columbus Indiana's events page).
- Home page rail "This weekend" that shows only events overlapping the coming
  Friday to Sunday. Because the site is static, decide visibility in the
  browser at load time (the same way open-now works) so the page is never
  stale between builds.
- Each event card shows "Open near the venue during the event," built from
  hours plus distance. That's the part no events calendar offers.
- For everything else, link out to Visit Columbus Indiana's calendar and the
  Bartholomew County Public Library events. Ask Visit Columbus for a feed or
  permission before importing anything from their calendar.
- Add `/events.ics` so people can subscribe. It's static and cheap, and it
  stands in for the weekend emails other sites send.
- Test: fail the build if an event has no source, and warn if an event
  ended more than 30 days before the build date.

### 4. Turn Saved into a trip you can share and print

**Seen on:** Visit Indy (Build My Trip plus a saved counter), Brown County
(Your Trip: save with a heart, share trip ideas), Experience Grand Rapids
(My Trip), Visit Palm Springs and Visit Hamilton County (Trip Builder),
Travel Nevada (My Visit, My Favorites), Visit Columbus Indiana and Visit
Detroit (saved counters). Every site also offers a printable or PDF guide.

**Build (no server needed):**
- Share link: `/saved/?ids=slug-a,slug-b,...` opens a read-only list with an
  "Add these to my saved places" button. Use Web Share where available,
  copy link otherwise.
- Let landmarks and events be saved too (store items with a type prefix,
  e.g. `l:irwin`, `e:mill-race-monster-2026`) and keep old saves working.
- "When are you going?" day picker that flags saved places closed at that
  time, from hours data. Optional Morning / Afternoon / Evening buckets.
- "Map my list" on the saved page, with a simple nearest-next walking order.
- A print stylesheet (`@media print`) so the saved list prints as a clean
  one-page guide with addresses, hours for the chosen day, and a QR code back
  to the share link. This is our version of the visitor guide.

### 5. "Columbus your way": trip ideas built only from real data

**Seen on:** Visit Philadelphia (Philly Your Way), Choose Chicago (Find your
Chicago style: first-time, on a budget, families, couples, weekend), Visit
Indy (Trip Ideas by traveler type), Traverse City (1-, 2- and 3-day plans),
Visit Palm Springs (two- and three-day itineraries), Visit Austin (3 Day
Weekend Itinerary), Visit Detroit (72 Hours in Detroit), and Visit Columbus
Indiana's own 48-hour fall getaway.

**Build:**
- `src/data/trips.mjs`: each trip is an ordered list of stops (business
  slugs, landmark slugs, maybe an event) with a day of week and a time slot.
  Page per trip at `/trips/<slug>/`, plus a "Columbus your way" section on
  `/visit/` and the home page.
- Reasons shown for each stop must come from data, never from opinion:
  "open by 7 AM," "a 4-minute walk from Irwin Union Bank," "orders pickup
  online," "Columbus original." No "best," "favorite," or "must-try."
- Starter set:
  - Architecture morning and a downtown lunch
  - Passing through on I-65 (Exit 76): an hour, food that's open now near
    the interchange, one landmark
  - With kids (Kids & Learning, Things to Do, parks)
  - Date night (open past 9 PM, bars, the Social District)
  - Ride the People Trail, with stops near the trail
  - Early bird and late night (the home page already has both rules)
- **Test: every stop must be open during its slot on the stated day,** using
  `src/hours.mjs`. If a business changes its hours, the build tells you the
  trip is wrong instead of a visitor finding out at a locked door.
- Bonus, later: a short quiz ("How long do you have? Who's with you? Food,
  shops or buildings?") that assembles one of these from the same data.
  Travel Nevada's Trip Planning Quiz is the model.

### 6. Visitor filters from listing attributes

**Seen on:** accessibility hubs at Visit Philadelphia (Accessible Philly),
Experience Grand Rapids (Accessibility Verified status with Wheel the World,
plus an AI accessibility agent launched February 2026), Visit Mesa (Autism
Certified City, accessibility guides, accessible itineraries), Traverse City
(Destination Autism Certification), Visit Seattle (Accessible Travel Guide),
Visit Detroit (Wheel the World partner). Pet pages at Visit Greenville SC
and Visit Savannah.

**Build:**
- Collect the "About" attributes from each business's Google listing, the
  same way hours were collected: dog-friendly, outdoor seating, wheelchair-
  accessible entrance, restroom, good for kids, vegetarian options, live
  music, parking. If you use the Places API (New), the field names are
  `allowsDogs`, `outdoorSeating`, `goodForChildren`, `servesVegetarianFood`,
  `liveMusic`, `restroom`, `parkingOptions` and `paymentOptions` (Enterprise
  + Atmosphere SKU), and `accessibilityOptions` (Pro SKU). Check the terms of
  whatever source you use.
- Raw pull in `scripts/data/maps-attrs.json`, new `scripts/import-attrs.mjs`,
  generated `src/data/attrs.mjs`, merged in `directory.mjs` like hours.
- Show them as chips on `/explore/` and the category refine bar, and as a
  short list on each business page labeled "Per their Google listing,
  <month year>." Only show what the listing says; don't infer.
- New page `/visit/accessibility/`: places whose listing reports a
  wheelchair-accessible entrance, plus links to official resources. Don't
  claim any certification Columbus doesn't hold.
- Owners can correct attributes through the claim flow.

### 7. Social District (DORA) tags

The City of Columbus runs a Designated Outdoor Refreshment Area downtown,
the Downtown Columbus Social District. Its page lists 17 designated
permittees and links to a boundary map, a permittee map and a vendor map.
No visitor site I reviewed does this well, and it's very useful on a
downtown evening.

**Build:**
- `src/data/dora.mjs`: the permittee list from the city page, each mapped to
  a directory slug, with `source` and `checked`.
- Match by **address**, not name, and list anything uncertain for a human.
  From a quick look at `landscape.mjs`: most permittees are already in the
  directory. "The Forge on 4th" on the city list may be "The Forge English
  Pub" at 418 4th St; "ZwanzigZ Production Brewery Co." needs checking
  against the tap room at 315 12th Street; the Fraternal Order of Eagles
  #741 and The Gallery Bar & Bistro (inside Hotel Indigo) may not belong in
  an independents directory at all.
- Tag on cards and business pages: "Social District: drinks to go." A rail on
  the Downtown neighborhood page, and a section on `/visit/` with the rules
  in plain words. Link to the city's maps instead of redrawing the boundary,
  unless the city can share it as GeoJSON.

---

## P2: worth doing next

### 8. Trails and passports, without an app

**Seen on:** Visit Indy (Indy Craft Pass, Indy Attraction Pass), Experience
Columbus OH (Columbus-Style Pizza Trail, Coffee Trail, Buckeye Treat Trail,
Distillery Trail), Experience Grand Rapids (Beer City Brewsader passport,
Flights of Flavor digital pass with check-in prizes), Visit Bentonville
(Coffee Crawl passport), Traverse City (A Very Cherry Passport), Visit Mesa
(Fresh Foodie Trail), Visit Hamilton County IN (Tenderloin Trail), Visit
Sarasota (Beach Pass in their app), Visit Tucson (check in, earn points, win
prizes). Most run on platforms like Bandwango, which deliver passes by text
or email and send branded prizes.

**Build:**
- Start with the rails that already exist ("The taco trail," coffee, pints)
  and an architecture trail from item 2. Each gets a trail page with a
  stamp card.
- Phase 1: stamps are honor-system and stored in the browser. No prizes, no
  claims about participation.
- Phase 2, partners only: a QR code at the counter for businesses listed in
  `src/data/partners.mjs`, verified by a Netlify function with a signed code
  (same idea as the pickup board keys). Prizes only when a business or
  sponsor has agreed in writing.
- Never imply a business takes part in a trail unless it's in `partners.mjs`.
  Until then the page says "a route through places on our list," not "a
  program they joined."

### 9. A richer map: landmarks, events, and "near me now"

**Seen on:** Discover Puerto Rico (an interactive map with custom landmark
illustrations; the site won industry recognition in January 2026), Travel
Nevada (a zooming interactive map), Visit Savannah (Interactive Map by
region), Visit Austin ("Select a Neighborhood" map), Travel Portland's Near
Me Now app (map-based, filter to open now, filter by category, save
favorites, includes today's events and public art).

**Build on the existing Leaflet map:**
- Layer toggles: Businesses, Landmarks, This weekend, Social District, and
  the People Trail if a route can be sourced (city GIS or OpenStreetMap, with
  ODbL attribution).
- Use the existing art as landmark pins (`float-arch`, `float-bridge`,
  `float-courthouse`, `float-firestation`, `float-spire`). That gets the
  illustrated feel Discover Puerto Rico has without new artwork.
- A "Near me now" view at `/explore/?view=map&now=1`: location, open-now
  only, one-tap category chips. Every piece already exists; this combines
  them for a phone on a sidewalk.

### 10. Spanish first, then decide on Japanese

**Seen on:** Visit Philadelphia (7 language options), Travel Portland (7),
Visit Seattle (8), Visit Savannah (9), Visit Austin (8), NYC Tourism (5),
Visit Tucson (a separate Spanish site, Vamos a Tucson). Visit Columbus
Indiana itself offers English and Spanish.

**Build:**
- Static `/es/` pages generated from the same templates, with UI strings in
  `src/i18n/es.mjs`. Business names stay as they are. Add `hreflang` links
  and a language switcher.
- Translate the chrome first (header, filters, hours, buttons, `/visit/`),
  then trips and landmark pages. Have a fluent speaker review before launch.
- Columbus has a notable Japanese community (WBOI reported in 2016 on
  schools adapting as more Japanese families moved in). Japanese may be
  worth it later; check demand with the owner first.

### 11. Structured data so AI tools and search read us correctly

**Seen in:** Simpleview's 2026 trends guide ("high-quality, structured, and
comprehensive data is the fuel for AI") and Noble Studios' 2026 report
(travelers now start in AI tools, so the official site needs to be the
machine-readable source of truth; "structured content and schema" now shows
up in website RFPs).

**Build:**
- JSON-LD on each business page: the most specific schema.org type that
  fits (`Restaurant`, `BarOrPub`, `HairSalon`, `AutoRepair`, otherwise
  `LocalBusiness`), with name, address, `geo`, telephone, `url`, `sameAs`
  (their website), and `openingHoursSpecification` from hours data.
- `LandmarksOrHistoricalBuildings` or `TouristAttraction` on landmark pages,
  `Event` on events, `ItemList` on trips and rails, `BreadcrumbList` where
  breadcrumbs already render.
- Pages stay `noindex` for now. This is groundwork, so it's ready the day a
  business signs on. Build a sitemap behind a flag that stays off until then.
- Test: every JSON-LD block parses, and nothing in it is missing from the
  page's own data.

### 12. Seasonal pages and "Give local" for the holidays

**Seen on:** Explore Asheville (Fall, Holidays, Winter, Spring, Summer),
Experience Grand Rapids (By Season), Visit Bloomington, Visit Hamilton
County, Traverse City, Brown County (seasonal getaways).

**Build:**
- Data-driven seasonal pages, e.g. "Patio season" (outdoor seating from
  item 6) and "Shop small for the holidays." Small Business Saturday is
  November 28, 2026, so the holiday page is the timely one.
- "Give local": extend `/api/probe` and `scripts/import-commerce.mjs` to
  detect gift-card pages on the providers already recognized in
  `src/commerce-core.mjs` (Toast, Square, Clover, Shopify and so on). List
  businesses that sell their own gift cards online and link to those pages.
  Same rule as ordering: we link to theirs and take nothing.

### 13. Free in Columbus

**Seen on:** NYC Tourism (Find Your Next Budget Activity), Experience
Columbus OH and Visit Greenville SC (Free Things to Do), Visit Palm Springs
and Choose Chicago (budget travel). Noble Studios also reports cost is now
travelers' top decision factor.

**Build:** a page from the landmarks data (`free: true`), parks, public art,
the People Trail, and free transit, each sourced. Pair it with cheap eats
using whatever price signal is defensible (only if the listing shows one).

---

## P3: later, or once owners sign on

14. **Weekend email.** Visit Indy, Travel Portland and Experience Columbus OH
    all send a weekly "five things this weekend" email. It needs a mail
    service and consent handling, so ship `/events.ics` and the weekend rail
    first.
15. **The *Columbus* (2017) film trail.** Travel Portland has a film-location
    guide, and Visit Columbus Indiana sells the film at its Visitors Center.
    Only include locations confirmed by reputable sources, cite each one, and
    show only landmarks or public places.
16. **"In their words" owner stories.** Choose Chicago (Chicago Like a Local),
    Visit Indy (Indy Stories), Visit Bentonville (a podcast). Here, only
    owner-submitted through the claim flow and labeled as theirs, since the
    rules forbid invented owner names or history.
17. **Owner-submitted deals.** Visit Palm Springs has "Submit a Deal." Only
    from claimed listings, with an end date.
18. **Visitor photos.** Experience Columbus OH (#yesColumbus) and Brown County
    (#ILoveBrownCounty) feature social photos. Only with clear permission,
    and never photos that could be mistaken for a business's own.

## Seen elsewhere, not recommended here

- **A general AI chat trip planner.** Mindtrip powers AI on Visit Greenville
  SC and Visit Savannah, and runs Visit Anaheim's planner; Travel Nevada and
  NYC Tourism have AI tools; Experience Grand Rapids has its accessibility
  agent. An open-ended chatbot would break "never invent facts" the first
  time it guesses. The data-driven trips and quiz in item 5 get most of the
  value. If one is ever added, it should answer only from this site's data,
  link every claim to a listing page, and say "I don't know" otherwise.
- **Hotel booking widgets** (Choose Chicago and Travel Portland use Expedia).
  Most lodging here is chains, which the site doesn't list. Independent stays
  already show up under Things to Do.
- **Scraping Visit Columbus's calendar.** Ask them for a feed instead.
- **Paid placement or "featured partner" sorting.** DMO directories are
  often member lists. Listing every independent equally is what sets this
  site apart.
- **Live cams and 360° tours** (Brown County's Leaf Cam; Visit Fort Worth and
  Visit Hamilton County 360° tours). Fun, not core.

## Suggested PR order

1. `/visit/` page and `src/data/visit.mjs` (item 1)
2. Social District tags (item 7), small and self-contained
3. Landmarks dataset and landmark pages (item 2)
4. Events data, weekend rail and `/events.ics` (item 3)
5. Saved trips: share, day check, map, print (item 4)
6. Trips data with the open-during-slot test (item 5)
7. Listing attributes and filters (item 6)
8. Then P2 in any order; structured data (item 11) is a good quiet-week task.

## Done means

- `npm test` passes, including new tests for `source`/`checked` fields, the
  trip-hours check, event dates, and JSON-LD.
- Layout checked in headless Chromium at 390 and 1280 px, no sideways scroll,
  no failed local requests. Rerun the axe scan on new pages.
- No em dashes in anything a person reads. Pages stay `noindex`.
- Nothing on a new page states a fact about a business that isn't in a
  source file.

---

## Columbus facts gathered (checked October 25, 2026; recheck before shipping)

| Fact | Source |
| --- | --- |
| Columbus Visitors Center: 506 Fifth Street, 812-378-2622, free parking. Open Monday to Saturday, 10 a.m. to 5 p.m.; closed Mondays in January and February; holiday hours listed separately. Maps, brochures, a self-guided architecture tour, free videos, a Chihuly chandelier, a gift shop. | [Visitors Center page](https://columbus.in.us/visitors-center) (columbus.in.us now redirects to visitcolumbusindiana.com) |
| Official tours: Architectural Highlights by shuttle (2 hours), Miller House and Garden (90 minutes, ages 10+), Iconic Columbus Walking Tour (90 minutes). Reservations recommended; tours often sell out. Self-guided: 82 stops on Downtown and City loops, with a paid stop guide; free bike-route maps. | [Tour info](https://columbus.in.us/see-do/tour-info) |
| Visit Columbus Indiana offers English and Spanish, a saved-items counter, itineraries, signature events, and a "Submit An Event" form. | [visitcolumbusindiana.com](https://visitcolumbusindiana.com/) |
| Mill Race Monster Festival, October 23 to 25, 2026, Mill Race Park. | [Visit Columbus Indiana events](https://visitcolumbusindiana.com/events/) |
| Downtown Columbus Social District (DORA): every day, 10 a.m. to midnight; 21+; branded clear cups; up to two drinks per person leaving a permittee; fill limits by drink type; 17 designated permittees; boundary, permittee and vendor maps. | [City of Columbus DORA page](https://www.columbus.in.gov/community-development/dora) |
| ColumBUS: free fares (suspended indefinitely as of 2023), five weekday routes pulsing from Mill Race Station (850 Lindsey Street), weekdays 6 a.m. to 8 p.m., Saturdays 8 a.m. to 5 p.m., no Sunday service. Confirm with the city before publishing. | [Wikipedia: ColumBUS](https://en.wikipedia.org/wiki/ColumBUS) |
| People Trail: 15.7 miles per TrailLink, asphalt and concrete, linking Lincoln, Blackwell, Mill Race and Noblitt parks. Other sources give different lengths; prefer the city's figure. | [TrailLink](https://www.traillink.com/trail/columbus-people-trail/) |
| Exhibit Columbus (Landmark Columbus Foundation): 2026 is a "Fieldwork" year without new installations; the next cycle begins in 2027; five permanent works downtown. | [exhibitcolumbus.org](https://exhibitcolumbus.org/) |
| Small Business Saturday 2026 falls on November 28 (the Saturday after Thanksgiving, November 26). | Calendar |

## Sites reviewed

| Site | Where | What's worth borrowing |
| --- | --- | --- |
| [Visit Philadelphia](https://www.visitphilly.com/) | PA | Philly Your Way, This Week & Weekend, Accessible Philly, Philly 101, 7 languages, Getting Here / Parking |
| [NYC Tourism](https://www.nyctourism.com/) | NY | Budget activity finder, borough pages, AI discovery tool, 5 languages |
| [Choose Chicago](https://www.choosechicago.com/) | IL | "Find your Chicago style," This weekend / Next week tabs, Chicago Like a Local, Chicago Greeter |
| [Travel Portland](https://www.travelportland.com/) | OR | Near Me Now app (open now, map, favorites), Food Cart Finder, the Weekender email, 7 languages |
| [Visit Seattle](https://visitseattle.org/) | WA | Accessible Travel Guide, Seattle Localist email, 8 languages |
| [Visit Austin](https://www.austintexas.org/) | TX | Live music calendar, neighborhood map, 3 Day Weekend Itinerary, 8 languages |
| [Visit Savannah](https://www.visitsavannah.com/) | GA | Interactive map by region, self-guided walking route, 9 languages, Mindtrip AI |
| [Visit Indy](https://www.visitindy.com/) | IN | Build My Trip, saved counter, Indy Craft Pass, Weekend Five, accessibility guide |
| [Experience Columbus](https://www.experiencecolumbus.com/) | OH | Pizza, Coffee and Treat trails, Events This Weekend, neighborhood guides, Free Things To Do |
| [Experience Grand Rapids](https://www.experiencegr.com/) | MI | AI accessibility agent with Wheel the World, My Trip, Brewsader passport, Flights of Flavor, By Season |
| [Visit Bloomington](https://www.visitbloomington.com/) | IN | Itineraries by experience, seasonal planning, area guides |
| [Brown County](https://www.browncounty.com/) | IN | "Your Trip" save-and-share, Happening This Week, Leaf Cam, #ILoveBrownCounty |
| [Visit Hamilton County](https://www.visithamiltoncounty.com/) | IN | Trip Builder, Tenderloin Trail, HamCo Hubway trail guide, Shop Local, seasons |
| [Visit Columbus Indiana](https://visitcolumbusindiana.com/) | IN | Official tours, Visitors Center, EN/ES, saved items, signature events |
| [Visit Palm Springs](https://visitpalmsprings.com/) | CA | Midcentury Architecture Self-Guided Tour, Trip Builder, 2- and 3-day itineraries, Submit a Deal |
| [Visit Bentonville](https://www.visitbentonville.com/) | AR | Coffee Crawl passport, two visitor centers, a local podcast |
| [Visit Greenville SC](https://www.visitgreenvillesc.com/) | SC | Neighborhood cards with counts, interactive map, Free Things to Do, pets, Mindtrip AI |
| [Traverse City](https://www.traversecity.com/) | MI | 1-, 2-, 3-day plans, A Very Cherry Passport, Destination Autism Certification, gift certificates |
| [Visit Fredericksburg TX](https://www.visitfredericksburgtx.com/) | TX | Today's Events filter, saved items, itinerary ideas |
| [Paducah](https://www.paducah.travel/) | KY | UNESCO Creative City content, This Week in Paducah, Shop Local Art |
| [Visit Lake Charles](https://www.visitlakecharles.org/) | LA | Boudin Trail, Accessibility Certified badge, biweekly events email |
| [Travel Nevada](https://travelnevada.com/) | NV | Zooming interactive map, Trip Planning Quiz, AI Trip Planner, road trips |
| [Visit Mesa](https://www.visitmesa.com/) | AZ | Autism Certified City, accessible itineraries, Fresh Foodie Trail |
| [Explore Asheville](https://www.exploreasheville.com/) | NC | Seasonal hubs, This Weekend, an app |
| [Visit Detroit](https://visitdetroit.com/) | MI | 72-hour itinerary, digital passes, Wheel the World, saved items |
| [Visit Fort Worth](https://www.fortworth.com/) | TX | District guides, 360° tour |
| [TravelOK](https://www.travelok.com/) | OK | Trip Planner app, Music and Fishing trails, Deals & Coupons |
| [Visit Sarasota County](https://www.visitsarasota.com/) | FL | Beach Pass and Seasons of Sunshine Pass, themed itineraries |
| [Visit Tucson](https://www.visittucson.org/) | AZ | City of Gastronomy, Vamos a Tucson (Spanish site), check-in rewards |
| [Discover Puerto Rico](https://www.discoverpuertorico.com/) | PR | Illustrated interactive map, bilingual content, AI chatbot |

## Other sources

- Noble Studios, [Travel and Tourism Marketing Trends for 2026](https://noblestudios.com/travel-tourism/travel-tourism-marketing-trends-2026/) (AI search, curated events, cost as top factor)
- Simpleview, [Transformative travel and tourism trends: a 2026 guide for DMOs](https://www.simpleviewinc.com/blog/stories/post/transformative-travel-and-tourism-trends-a-2026-guide-for-future-focused-dmos/)
- Casual Astronaut, [3 Takeaways From the Best DMO Websites](https://www.casualastronaut.com/3-takeaways-from-the-best-dmo-websites)
- Evolve Creative, [What Makes a Great DMO Website?](https://www.evolvecreative.com/industries/tourism/what-makes-a-great-dmo-website/)
- Discover Puerto Rico, [website industry recognition](https://www.discoverpuertorico.com/industry/article/discover-puerto-rico-website-receives-industry-recognition-excellence/2026-01-08) (January 2026)
- Experience Grand Rapids, [AI accessibility travel tool launch](https://www.experiencegr.com/media-articles/post/first-in-the-world-to-launch-ai-accessibility-travel-tool/) (February 2026)
- Visit Anaheim, [Mindtrip AI planning tool](https://www.visitanaheim.org/articles/post/visit-anaheim-leverages-mindtrips-ai-powered-planning-tool-to-elevate-the-visitor-journey)
- Bandwango, [pass features](https://bandwango.com/resources/bandwango-pass-features-you-may-not-know-about)
- Travel Portland, [Near Me Now](https://www.travelportland.com/plan/near-me-now/)
- Google, [Place Data Fields (New)](https://developers.google.com/maps/documentation/places/web-service/data-fields)
- WBOI, [As more Japanese move to Columbus, schools seek to adapt](https://www.wboi.org/education/2016-05-05/as-more-japanese-move-to-columbus-schools-seek-to-adapt) (2016)

## Rechecked while building /visit/ (October 25, 2026)

Corrections to the facts table above, from the official pages. The data in
`src/data/visit.mjs` uses the corrected versions.

- **I-65 exit:** the Visitors Center's directions say exit **68** (State
  Road 46 east into Columbus), not exit 76.
  [Getting to Columbus](https://columbus.in.us/getting-to-columbus/)
- **ColumBUS fares:** the city's transit page says "There is no fee to ride."
  Hours match (weekdays 6 a.m. to 8 p.m., Saturdays 8 a.m. to 5 p.m.). The
  city calls the building the Columbus Transit Depot, 850 Lindsey St.
  [Hours and contact](https://www.columbus.in.gov/columbus-transit/?p=14500)
- **People Trail length:** the parks department says "over 23 miles of People
  Trails"; the visitor site says "more than 27 miles"; TrailLink says 15.7.
  /visit/ uses the parks department's figure.
  [Columbus Parks and Recreation](https://columbusparksandrec.com/?p=3858)
- **Tours:** the shuttle tour does not allow children under 6; Miller House is
  ages 10 and up with no public access at the house outside the tour. The
  self-guided stop guide is sold at the Visitors Center, Viewpoint Books and
  Hotel Indigo. /visit/ links to the tour page for prices instead of copying them.
