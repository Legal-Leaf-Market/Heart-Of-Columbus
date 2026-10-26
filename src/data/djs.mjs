// "Columbus DJs" (/djs/). Each DJ is listed only with what a public page says,
// with that page and the day we checked it; tests/djs.test.mjs fails if either
// is missing. `listing` links the DJ's own page in the directory when it has
// one. Crossroads Wedding Co. leads (it is on the spotlight list).
//
// Asked for but not listed yet, because we could not find a public page that
// places them in Columbus (checked 2026-10-26): DJ Edder (said to play Cozy
// Lounge often) and a DJ whose name came to us as "Pyrex Bika". Add them the
// day we have their own page or a venue's post naming them.
const CHECKED = '2026-10-26';
const BUREAU = 'https://comeseecolumbus.com/planners/meetings-events/event-planner-resources';
const MATTY = 'https://www.mattyoentertainment.com/';

const x = (o) => ({ checked: CHECKED, ...o });

export const DJS = [
  { id: 'featured', title: 'Featured', items: [
    x({ slug: 'crossroads-wedding-co', emoji: '💍', name: 'Crossroads Wedding Co.', listing: 'crossroads-wedding-co',
      what: 'Wedding DJ and MC, live solo acoustic sets, bar service and coordination on the day. Its site says it is based in Columbus, Indiana.',
      source: 'https://crossroadsweddingco.shop/',
      more: [['Dates are booked from its own booking page.', 'https://crossroadsweddingco.shop/book']],
      website: 'https://crossroadsweddingco.shop/', book: 'https://crossroadsweddingco.shop/book' }),
  ] },
  { id: 'event-djs', title: 'Wedding and event DJs', items: [
    x({ slug: 'matty-o-entertainment', emoji: '🎧', name: 'Matty O Entertainment', listing: 'matty-o-entertainment', phone: '(812) 344-3598',
      what: 'Weddings, school dances and proms, corporate events, karaoke, a 360 video booth and staging. Its site covers Central and South Central Indiana.',
      source: MATTY,
      more: [['Its team page says the founder started out as a DJ assistant for local DJs in and around the Columbus area.', 'https://www.mattyoentertainment.com/team-1']],
      website: MATTY }),
    x({ slug: 'audio-magic-entertainment', emoji: '✨', name: 'Audio Magic Entertainment', listing: 'audio-magic-entertainment', phone: '(812) 343-2742',
      what: 'Wedding DJ, uplighting, corporate events and a photo booth. Its contact section says Columbus, Indiana.',
      source: 'https://audiomagicentertainment.com/', website: 'https://audiomagicentertainment.com/' }),
    x({ slug: 'maddox-entertainment', emoji: '🎤', name: 'Maddox Entertainment', phone: '(812) 343-7085',
      what: 'Emcee, DJ, and wedding reception planner and coordinator.',
      source: 'https://www.keithmaddox.net/', more: [['On the visitors bureau’s list of music and DJs for events.', BUREAU]],
      website: 'https://www.keithmaddox.net/' }),
    x({ slug: 'dj-smooth-g', emoji: '🎶', name: 'D.J. Smooth G', listing: 'd-j-smooth-g', address: '3019 25th Street', phone: '(317) 643-2447',
      what: 'D&G Entertainment: professional DJ services, as listed with the Columbus Area Chamber of Commerce.',
      source: 'https://business.columbusareachamber.com/list/member/d-j-smooth-g-6424' }),
  ] },
  { id: 'bureau', title: 'On the visitors bureau’s list', lead: 'The Columbus Area Visitors Center lists these for event planners with a phone number only. Call to check they still take bookings.', items: [
    x({ slug: 'midnight-express', emoji: '🌙', name: 'Midnight Express Mobile DJ & KJ', phone: '(812) 378-4364', what: 'Mobile DJ and karaoke.', source: BUREAU }),
    x({ slug: 'kingen', emoji: '💃', name: 'Don and Jean Kingen', phone: '(812) 371-1462', what: 'Mobile disc jockey, MC and coordinator.', source: BUREAU }),
    x({ slug: 'dj-master-mix', emoji: '🎚️', name: 'DJ Master Mix', phone: '(812) 376-6760', what: 'DJ for events. Toll free at (877) 376-6760.', source: BUREAU }),
    x({ slug: 'rich-anthony', emoji: '🎵', name: 'Rich Anthony', phone: '(812) 371-4432', what: 'Music for events.', source: BUREAU }),
  ] },
];

export const DJ_ITEMS = DJS.flatMap((g) => g.items);
