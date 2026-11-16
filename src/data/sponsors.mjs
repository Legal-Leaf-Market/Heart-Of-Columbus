// Local sponsors. EMPTY until the publisher signs one. A sponsor shows only in
// marked slots, always labeled "Sponsored", never inside a story, and gets no
// say in coverage. Any story tagged with a sponsor's slug carries a
// disclosure line automatically (src/news/disclosure.mjs).
//
//   'some-business-slug': {
//     name: 'Business name as it should appear',
//     since: '2027-01-15',            // date the agreement started
//     until: '2027-12-31',            // end date (required for directory slots)
//     slots: ['front', 'newsletter'], // newspaper slots: front, newsletter, section
//                                     // directory slots (src/promotions.mjs):
//                                     //   home, category, neighborhood, events
//     line: 'One sentence the sponsor supplied.',
//     offer: 'Optional offer in their words', offerEnds: '2027-02-01',
//     url: 'https://their-own-site.example',
//     confirmed: '2027-01-14',        // date we confirmed payment (directory slots)
//     by: 'Jake, invoice #12',        // who confirmed it and how
//   },
//
// A directory slot needs a directory slug, `confirmed`, `by` and `until`;
// without any of them the business is not shown. Max three per slot.
export const SPONSORS = {};
