// Local sponsors. EMPTY until the publisher signs one. A sponsor shows only in
// marked slots, always labeled "Sponsored", never inside a story, and gets no
// say in coverage. Any story tagged with a sponsor's slug carries a
// disclosure line automatically (src/news/disclosure.mjs).
//
//   'some-business-slug': {
//     name: 'Business name as it should appear',
//     since: '2027-01-15',            // date the agreement started
//     until: '2027-12-31',            // optional end date
//     slots: ['front', 'newsletter'], // where it may appear
//     line: 'One sentence the sponsor supplied.',
//     url: 'https://their-own-site.example',
//   },
export const SPONSORS = {};
