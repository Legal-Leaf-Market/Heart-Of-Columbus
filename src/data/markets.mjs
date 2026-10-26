// Markets (/markets/): public companies headquartered in Columbus or
// elsewhere in Indiana. Each line is a fact from the company's own site,
// linked as `source`; checked 2026-10-26. Quotes are never stored here: the
// page reads them from /api/markets (netlify/functions/markets.mjs), which
// asks Twelve Data and shows its attribution next to the table.
//
// Keep this at 8 symbols or fewer. Twelve Data's free plan allows 8 credits
// a minute and one quote costs one credit, so the whole board is one call.
export const QUOTE_SOURCE = { name: 'Twelve Data', url: 'https://twelvedata.com/' };
export const REFRESH_MINUTES = 20;

export const COMPANIES = [
  { symbol: 'CMI', name: 'Cummins Inc.', home: 'Columbus', local: true, what: 'Engines, power systems and filtration. Headquartered in Columbus.', source: 'https://www.cummins.com/' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', home: 'Indianapolis', what: 'Medicines. Headquartered in Indianapolis.', source: 'https://www.lilly.com/' },
  { symbol: 'ELV', name: 'Elevance Health', home: 'Indianapolis', what: 'Health insurance. Headquartered in Indianapolis.', source: 'https://www.elevancehealth.com/' },
  { symbol: 'ALSN', name: 'Allison Transmission', home: 'Indianapolis', what: 'Commercial vehicle transmissions. Headquartered in Indianapolis.', source: 'https://www.allisontransmission.com/' },
  { symbol: 'SPG', name: 'Simon Property Group', home: 'Indianapolis', what: 'Shopping centers and outlets. Headquartered in Indianapolis.', source: 'https://www.simon.com/' },
  { symbol: 'STLD', name: 'Steel Dynamics', home: 'Fort Wayne', what: 'Steel and metals recycling. Headquartered in Fort Wayne.', source: 'https://stld.steeldynamics.com/' },
  { symbol: 'ZBH', name: 'Zimmer Biomet', home: 'Warsaw', what: 'Joint replacements and medical devices. Headquartered in Warsaw, Indiana.', source: 'https://www.zimmerbiomet.com/' },
  { symbol: 'ONB', name: 'Old National Bancorp', home: 'Evansville', what: 'Banking. Founded in Evansville.', source: 'https://www.oldnational.com/' },
];
