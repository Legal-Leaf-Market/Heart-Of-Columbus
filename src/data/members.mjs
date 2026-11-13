// Founding Members: businesses that pay Heart of Columbus $20 a month for a
// website we build and keep current, and a featured, labeled spot here. EMPTY
// ON PURPOSE: a business goes in only after its owner has agreed and paid. A
// badge on someone who has not signed is a false claim about a real business.
//
//   'tjs-chopshop': {
//     since: '2026-11-20',           // date the owner agreed
//     contact: 'owner name or role', // who we answer to
//   },
//
// What membership changes, and nothing else: a "Founding Member" tag on the
// card and the business page, first place in its category list, and a
// disclosure line on the business page and on any story that tags it. Search
// ranking never changes (search ranks by relevance, never by who pays), and
// the free listing never depends on joining.
export const MEMBERS = {};

export const PRICE = 20; // dollars a month, locked for founding members
export const SPOTS = 10; // size of the founding pilot group

export const isMember = (slug, members = MEMBERS) => Object.hasOwn(members, slug);
