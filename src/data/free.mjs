// "Free in Columbus" (/free/). Each entry says what is free in the words of
// its source, with the page and the day it was checked; tests/free.test.mjs
// fails if either is missing. Landmarks seen from the street come from
// src/data/landmarks.mjs, not from here. No price signal for restaurants is
// shown, because the public listings we use don't carry one.
import { SRC } from './visit.mjs';

const CHECKED = '2026-10-25';
const FAMILY = 'https://columbus.in.us/family-fun-in-columbus/';
const COMMONS = 'https://thecommonscolumbus.com/?p=29';
const PARKS = 'https://columbusparksandrec.com/facilities-parks-trails/';
const LIBRARY = 'https://mybcpl.org/locations';
const MILL_RACE_WIKI = 'https://en.wikipedia.org/wiki/Mill_Race_Park';

const x = (o) => ({ checked: CHECKED, ...o });

export const FREE = [
  { id: 'inside', title: 'Inside, out of the weather', items: [
    x({ slug: 'commons-playground', emoji: '🧗', name: 'Indoor playground at The Commons', address: '300 Washington Street', ll: [39.20189, -85.92178],
      what: 'The James A. Henderson Playground. The visitors bureau says it is free and open to the public.', source: FAMILY,
      more: [['The Commons is open every day, 8 AM to 9 PM, and its playground has a 35-foot Luckey Climber.', COMMONS]], landmark: 'commons' }),
    x({ slug: 'library', emoji: '📚', name: 'Bartholomew County Public Library', address: '536 Fifth Street', ll: [39.20395, -85.91889],
      what: 'The public library, designed by I. M. Pei and completed in 1969. It also holds the Columbus Indiana Architectural Archives.', source: LIBRARY,
      more: [['Hours change, so check the library’s page before you go.', LIBRARY]], landmark: 'library' }),
    x({ slug: 'visitors-center', emoji: '🏛️', name: 'Columbus Visitors Center', address: '506 Fifth Street', ll: [39.20359, -85.91966],
      what: 'Free videos about Columbus, shown any time, and a Dale Chihuly yellow neon chandelier. Maps, brochures and city guides are free to take.', source: SRC.visitors,
      more: [['Free parking in the lot just past the building on Franklin Street.', SRC.gettingHere]], business: 'columbus-visitors-center-gift-shop' }),
  ] },
  { id: 'outside', title: 'Outdoors', items: [
    x({ slug: 'people-trail', emoji: '🚲', name: 'The People Trail', what: 'Over 23 miles of trail, according to the parks department.', source: SRC.parks,
      more: [['Any people-powered way of getting around is welcome.', SRC.hike], ['Trailheads have a kiosk with a map and the trail rules.', PARKS]] }),
    x({ slug: 'mill-race-park', emoji: '🌳', name: 'Mill Race Park', address: '50 Carl Miske Drive (Fifth and Lindsey Streets)', ll: [39.204569, -85.926671],
      what: 'A city park with the Mill Race Tower, the Custer-Nugent Amphitheater, a playground and fishing areas.', source: PARKS,
      more: [['It sits where the Flat Rock and Driftwood rivers meet. Redesigned by Michael Van Valkenburgh Associates and completed in 1993; the observation tower is 84 feet tall.', MILL_RACE_WIKI], ['The city lists shelter rentals but no admission fee. Restrooms close in winter.', PARKS]] }),
    x({ slug: 'zinn', emoji: '🐸', name: 'David Zinn street art', what: 'Street art by David Zinn around town. Pick up a free search-and-find guide to the locations at the Visitors Center.', source: FAMILY }),
    x({ slug: 'bike-maps', emoji: '🗺️', name: 'Self-guided bike tour maps', what: 'Free maps for seeing the architecture by bike, from the Visitors Center.', source: SRC.tours }),
  ] },
  { id: 'getting-around', title: 'Getting around', items: [
    x({ slug: 'columbus-bus', emoji: '🚌', name: 'ColumBUS', what: 'The city bus is free to ride. Five routes run Monday to Saturday; no Sunday service is listed.', source: SRC.transit,
      more: [['Routes and times.', SRC.routes]] }),
  ] },
];
