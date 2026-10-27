// "In their words" and owner deals, shown on a business's own page. Both come
// only from the business, through the claim form (/owners/#claim), and go in
// here by hand once someone has confirmed the sender speaks for the business.
// We never write, edit for meaning, or invent either one.
//
// WORDS: { slug, text, by: 'the owner' (a role, unless they asked for a name),
//          sent: 'YYYY-MM-DD', confirmed: 'YYYY-MM-DD' }
// DEALS: { slug, text, ends: 'YYYY-MM-DD', sent, confirmed }
// A deal with no end date is refused by the tests; an expired one is left out
// of the build and hidden in the browser the day after it ends.
export const WORDS = [];
export const DEALS = [];

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Indiana/Indianapolis' });
export const wordsFor = (slug) => WORDS.filter((w) => w.slug === slug && w.confirmed);
export const dealsFor = (slug, on = today()) => DEALS.filter((d) => d.slug === slug && d.confirmed && d.ends >= on);
