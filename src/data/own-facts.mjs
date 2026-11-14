// Facts a business publishes about itself on its own website. They beat the
// listings we swept (Chamber, Google) because the owner wrote them, so a
// business that keeps its own site current is shown the way it says it is.
// Same rule as every data file: only what that page says, with the page and
// the date we checked it. directory.mjs applies these after the sweep.
//
// Cookie Paradise (checked 2026-11-13):
//   - https://cookieparadise.co/pages/contact : "Address: 3950 25th St,
//     Columbus, IN 47203" and the hours (Tuesday to Friday 10 AM to 6 PM,
//     Saturday 10 AM to 8 PM, Sunday and Monday closed).
//   - https://cookieparadise.co/ : "Find our trailer in the Holiday Center
//     parking lot, 3950 25th St."
//   The Chamber row had 3346 Cox Ln; Google's listing pins 3950 25th St with
//   shorter hours (Tuesday to Friday 11 AM to 5:30 PM). The owner's own page wins.
export const OWN_FACTS = {
  'cookie-paradise-llc': {
    address: '3950 25th St',
    where: 'Trailer in the Holiday Center parking lot',
    // [day (0 is Sunday), opens, closes] in minutes after midnight, like hours.mjs.
    hours: [[2, 600, 1080], [3, 600, 1080], [4, 600, 1080], [5, 600, 1080], [6, 600, 1200]],
    source: 'https://cookieparadise.co/pages/contact',
    checked: '2026-11-13',
  },
};
