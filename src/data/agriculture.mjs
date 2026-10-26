// "Farm country" (/agriculture/): 4-H, the county fair, where to buy from
// local growers, people doing the work, and grain prices. Every fact names
// its source and the day it was checked; tests/agriculture.test.mjs fails if
// either is missing. Quotes appear only when a cited article printed them.
// The page lays this out; a print edition can read the same data.

const CHECKED = '2026-10-25';
const EXTENSION = 'https://extension.purdue.edu/county/bartholomew/';
const FAIR = 'https://bartholomewcountyfair.com/';
const FAIR_2026_OPEN = 'https://www.korncountry.com/news/latest-news-test/9-day-bartholomew-county-fair-kicks-off-on-friday/';
const FAIR_2026_CLOSE = 'https://www.mojo1029.com/news/bartholomew-county-news/2026-bartholomew-county-fair-wraps-up-this-weekend/';
const FAIR_PREVIEW = 'https://www.therepublic.com/?p=573310';
const MARKET = 'https://columbusfarmersmarket.org/about/';
const MARKET_SCHEDULE = 'https://columbusfarmersmarket.org/schedule/';
const MARKET_VENDORS = 'https://columbusfarmersmarket.org/market-connection/';
const POLLINATOR_PARK = 'https://www.therepublic.com/2022/02/19/state-partners-with-local-groups-for-pollinator-park/';
const PATH_2022 = 'https://www.sierraclub.org/indiana/blog/2022/10/successful-pollinator-path-campaign-columbus-blog-eric-riddle-volunteer-leader';
const PATH_2024 = 'https://www.sierraclub.org/indiana/blog/2024/07/national-pollinator-week-columbus-blog-eric-riddle-volunteer-leader';
const PODCAST = 'https://podcasts.apple.com/us/podcast/eric-riddle/id1566617721?i=1000556717003';

const x = (o) => ({ checked: CHECKED, ...o });

export const AG = [
  { id: '4-h', title: '4-H', emoji: '🍀',
    lead: 'Plenty of us grew up in 4-H, including the person who makes this site. Clubs, projects, the fair and the friends you keep. If you have a kid who likes animals, sewing, rockets or cooking, this is where it starts.',
    items: [
      x({ slug: 'extension', name: 'Purdue Extension Bartholomew County', address: '783 S. Marr Road, Columbus', phone: '(812) 379-1665',
        what: 'The county Extension office runs 4-H Youth Development: community clubs, afterschool programs, SPARK Clubs, camps, workshops and the 4-H Fair.', source: EXTENSION,
        more: [['The same office covers Agriculture and Natural Resources: farming, the environment and wildlife.', EXTENSION]],
        link: [EXTENSION, 'Join 4-H or find a club'] }),
      x({ slug: '4-h-members', name: 'Bartholomew County 4-H', what: 'The Republic counted 611 members ahead of the 2023 fair, a dip its 4-H director put down to a big class finishing their final year in 2022.', source: FAIR_PREVIEW }),
    ] },
  { id: 'fair', title: 'The county fair', emoji: '🎡',
    lead: 'Nine days every summer at the fairgrounds on State Road 11. Livestock barns, the Parade of Champions, a midway and the grandstand. Give it a big shout.',
    items: [
      x({ slug: 'fair-2026', name: 'Bartholomew County 4-H Fair', address: 'Fairgrounds on State Road 11, Columbus',
        what: 'The 2026 fair opened Friday, June 19 at 5 PM and wrapped up Saturday night, June 27.', source: FAIR_2026_OPEN,
        more: [
          ['The last days had the Parade of Champions, an antique tractor pull, the livestock sale in the Pavilion and a demolition derby in the grandstand.', FAIR_2026_CLOSE],
          ['Past fairs have also had a rodeo, truck and tractor pulls, a 4-H Fashion Review, local bands and dirt track racing.', FAIR_PREVIEW],
        ],
        link: [FAIR, 'Fair schedule and 2027 dates'] }),
      x({ slug: 'fairgrounds', name: 'The fairgrounds, the rest of the year', what: 'The county spent $629,180 in federal COVID-19 relief money on fairgrounds upgrades ahead of the 2023 fair.', source: FAIR_PREVIEW,
        more: [['That year the fair also expanded RV camping with new hookups.', FAIR_PREVIEW]],
        link: [FAIR, 'What’s on at the fairgrounds'] }),
    ] },
  { id: 'buy-local', title: 'Buy from local growers', emoji: '🧺',
    lead: 'The farmers market, and farm markets, greenhouses and a butcher that are in our directory.',
    items: [
      x({ slug: 'farmers-market', name: 'Columbus Farmers Market', what: 'Run by the Columbus Parks and Recreation Department as “an annual seasonal event designed to bring our farm and city communities together.”', source: MARKET,
        more: [['Dates change each year, so check the market’s schedule.', MARKET_SCHEDULE], ['Many vendors sell between markets; the market lists them.', MARKET_VENDORS]],
        link: [MARKET_SCHEDULE, 'Market schedule'] }),
    ],
    // Directory slugs; their facts come from the directory, not from here.
    businesses: ['bushs-market', 'whipkers-market-and-greenhouses', 'farmhouse-favorites', 'white-star-meat-market-and-deli', 'simmons-winery-450-north-brewery', 'wolf-creek-market-and-botanicals', 'copper-creek-coatings-and-farm-toys'] },
  { id: 'people', title: 'People doing the work', emoji: '🐝',
    lead: 'Growing things in Columbus is not only row crops. These are people and groups planting and tending it in town.',
    items: [
      x({ slug: 'eric-riddle', name: 'Eric Riddle', what: 'Chair of the Columbus Pollinator Committee. “In 2021, Columbus became the first Bee City USA affiliate in Indiana,” he told The Republic.', source: POLLINATOR_PARK,
        more: [
          ['Secretary and program co-chair of the Sierra Club’s Winding Waters Group, which helped Columbus become a Bee City USA affiliate.', PATH_2022],
          ['His nonprofit work started with the 2008 flood. He now works on pollinator habitat, native plants and clearing invasive species.', PODCAST],
        ] }),
      x({ slug: 'pollinator-path', name: 'The AirPark Pollinator Path', what: 'Begun in spring 2022 along the People Trail in north Columbus, it links Blackwell Park and the Columbus Community Garden, with more than 30 native flower and grass species planted at each end.', source: PATH_2024,
        more: [
          ['A $15,000 crowdfunding campaign paid for it, along with a one-acre native meadow seeded next to the Community Garden. Volunteers sold native plants at the Farmers Market to help.', PATH_2022],
          ['The Indiana Wildlife Federation dedicated it as an Indiana Sustainable Trail in September 2023.', PATH_2024],
        ] }),
    ] },
];

// Grain prices from the USDA's Indiana Grain Bids report, entered by hand
// from the report named here. Cash prices are the Central Indiana country
// elevator average, the region nearest us. Update `asOf` and the numbers
// together; the page shows the date next to them.
export const GRAIN = {
  asOf: '2026-10-22',
  report: 'Indiana Grain Bids, USDA AMS and Indiana State Department of Agriculture Market News',
  source: 'https://www.ams.usda.gov/mnreports/ams_3463.pdf',
  region: 'Central Indiana country elevators',
  cash: [
    { crop: 'Corn', emoji: '🌽', grade: 'US #2 yellow', delivery: 'now', avg: 4.2779, low: 4.115, high: 4.405, yearAgo: 3.9671 },
    { crop: 'Soybeans', emoji: '🫘', grade: 'US #1', delivery: 'now', avg: 12.0586, low: 11.83, high: 12.23, yearAgo: 10.1618 },
    { crop: 'Wheat', emoji: '🌾', grade: 'US #1 soft red winter', delivery: 'next June and July', avg: 6.19, low: 5.89, high: 6.49, yearAgo: 5.445 },
  ],
  // Chicago Board of Trade settlements, cents per bushel, nearest contract.
  futures: [
    { crop: 'Corn', month: 'December 2026', cents: 460.5 },
    { crop: 'Soybeans', month: 'November 2026', cents: 1253 },
    { crop: 'Wheat', month: 'December 2026', cents: 624.75 },
  ],
};
