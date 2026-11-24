// node scripts/chatgpt-crawl-brief.mjs
// Writes docs/research/chatgpt-crawl-brief.md: specific pages for ChatGPT (or
// Claude in Chrome) to read and bring back facts from, for the things this
// build environment cannot fetch (The Republic refuses automated reads; some
// organizations' sites refuse our proxy). Part A is the shortest history
// articles with what each one still needs; Part B is directory checks; Part C
// is where restaurant menus live. Regenerate it when articles grow or the
// asks change (edit ASKS below).
import { writeFileSync } from 'node:fs';
import { ARTICLES } from '../src/data/history/index.mjs';

const SITE = 'https://heartofcolumbus.netlify.app';
const N = 24;

// What each article still needs, written after reading it and its sources on
// 2026-11-24. Anything not listed gets the general ask.
const ASKS = {
  'the-republic-new-owners': 'HD Media took over on September 1, 2026. Find The Republic’s own announcement and any later coverage: who is publisher and editor now, any changes to print days, staff, website or ownership of the building. Also The Republic’s 2015 story on the Brown family sale (canonical URL).',
  'rumsey-leads-cummins': 'Cummins’ own news releases and bios for Jennifer Rumsey: where she went to high school in Columbus, her Purdue degree and year, her MIT degree if any, roles at Cummins by year, and anything Cummins has said about her tenure since 2022.',
  'arts-council-begins': 'artsincolumbus.org (About, History): the year and month the Columbus Area Arts Council was founded, who founded it, its first programs, when it took over the 411 Gallery and the Commons events, its directors over the years. GuideStar/Candid profile 35-1303466: founding year and mission statement.',
  'columbus-specialty-becomes-cosco': 'Cosco’s own history page (coscoproducts.com), the Effingham Daily News article cited, and any Hamilton Cosco history: when Columbus Specialty became Cosco, what it made in Columbus (step stools, high chairs), employment numbers, when manufacturing left Columbus.',
  'memorial-for-veterans': 'The Charles Rose Architects data pages PDF for the Bartholomew County Memorial for Veterans: dedication date, number and height of the limestone columns, how many names and letters are carved, the design competition, cost. Also the American Legion and Clio pages cited.',
  'indiana-sentinels': 'The Indiana Sentinels’ own site and league pages: founding announcement date, owners, arena and capacity, league, first game date and result, first season record, coach. Only the team’s and the league’s own pages.',
  'indiana-bell-switching-center': 'The Architect magazine article on the Indiana Bell Switching Center: architect (Paul Kennon of Caudill Rowlett Scott), year completed, awards (AIA honor award year), the colored mechanical systems on the facade, any later changes.',
  'arvin-meritor-merger': 'The Christian Science Monitor, May 11, 1987 article cited: what it says about Columbus, Arvin and Cummins (employment, Fortune 500 status, the architecture program).',
  'atterbury-goes-back-to-war': 'The army.mil and nationalguard.mil articles cited: when Camp Atterbury became a mobilization site after 2001, how many soldiers it trained or mobilized, the Muscatatuck connection, dates.',
  'second-street-bridge': 'Architecture Indiana’s article on the Second Street (Robert N. Stewart) Bridge (architectureindiana.com/?p=46150): who designed the lighting, the span length, height of the pylons, the Front Door Project dates and cost.',
  'columbus-learning-center': 'The IUPUC 2010 to 2012 bulletin overview (bulletins.iu.edu/iupuc/2010-2012w/overview/) and Fink Roberts and Petrie’s project page: opening date, cost, who paid for what (Lilly Endowment, the state), square footage, design awards.',
  'toyota-forklifts': 'Toyota’s 1990 release (global.toyota/detail/7864000) and the MHEDA milestone story: plant opening date, first forklift date, investment, jobs then and now, expansions by year.',
  'yes-and': 'Landmark Columbus Foundation news about Yes And (2025): attendance numbers, the full list of installations and teams, which installations stay and where, quotes from Richard McCoy.',
  'north-swimming-three-straight': 'The IHSAA and Indiana High School Swimming and Diving Hall of Fame (ihssdhof.org) pages cited: the three straight titles’ years and scores, the coach, swimmers who set records.',
  'visitors-center-chandelier': 'The Republic’s story cited, and the Visitors Center’s own pages: when Dale Chihuly’s Yellow Neon Chandelier was installed (1995?), who paid for it, its size and number of pieces.',
  'the-eclipse': 'nationaleclipse.com’s Indiana page and The Republic’s BCSC calendar story: the exact time and length of totality in Columbus on April 8, 2024, and what the schools did that day.',
  'ethnic-expo-begins': 'The Republic’s story on the 33rd Ethnic Expo, and ethnicexpo.org (if it exists): founding year and founders, attendance by year, which countries were co hosts in which years.',
  'north-cross-country': 'The IHSAA pages and The Republic’s story cited: the state title year, team score, coach, runners.',
  'atterbury-welcomes-afghans': 'The army.mil and WRTV stories cited: dates Afghans arrived and left Camp Atterbury (Operation Allies Welcome), how many, what Columbus groups did.',
};
const GENERAL = 'Read the listed sources, and find one or two more good ones (the organization’s own site, a city, county or school page, a library or museum archive, Wikipedia). Bring back facts this article does not have yet: dates, names, numbers, places, firsts, what happened next.';

const eligible = ARTICLES.filter((a) => a.group !== 'blair' && a.group !== 'publisher' && a.slug !== 'pence-vice-president')
  .sort((a, b) => a.words - b.words).slice(0, N);

const L = [];
const P = (s = '') => L.push(s);
P('# Things to crawl for Heart of Columbus');
P();
P(`For ChatGPT (or Claude in Chrome). Written ${new Date().toISOString().slice(0, 10)} by scripts/chatgpt-crawl-brief.mjs; regenerate it, don’t hand edit.`);
P();
P('Heart of Columbus is a local news and directory site for Columbus, Indiana. Its history section has short articles that need more facts, and some of their sources refuse automated reads from our build machine, especially The Republic (therepublic.com). You can read them. Please do.');
P();
P('## How to bring things back (important)');
P();
P('- **One block per article**, headed with the article’s slug, in the order below.');
P('- For each page you read: the **canonical URL** as loaded (not a redirect or a tracking link), the **date you read it**, and the **facts it states, in your own words**, one per line.');
P('- **Exact quotes** only when worth quoting, short (one or two sentences), in quotation marks, copied character for character, with who said it.');
P('- **Never paste whole articles**, especially The Republic’s. We cite and link; the text is the publisher’s.');
P('- If two sources disagree (a date, a number, a spelling), **say so** and give both.');
P('- If a page has moved, give the new address. If it is gone, say so.');
P('- Don’t add facts from memory or from pages you didn’t read. "Not found" is a fine answer.');
P('- Skip national politics. We want Columbus history: places, people, companies, schools, churches, sports, events.');
P();
P('## Part A: history articles that need more');
P();
P(`The ${N} shortest history articles (Brian Blair’s faith summaries, the publisher’s columns and the Pence piece are left out on purpose).`);
for (const a of eligible) {
  P();
  P(`### ${a.slug} (${a.words} words)`);
  P();
  P(`- Page: ${SITE}${a.path}`);
  P(`- What it is: ${a.title}. ${a.dek || ''}`.trim());
  P(`- Its sources now: ${a.sources.map(([label, url]) => `[${label}](${url})`).join('; ')}`);
  P(`- **What to find:** ${ASKS[a.slug] || GENERAL}`);
}
P();
P('## Part B: directory checks');
P();
P('Each is a Columbus business we may list. For each, find its own website or social page and a second public listing, and bring back: current street address, phone, hours, what it sells, and whether it is open (look for recent posts or reviews). Note anything that suggests it is a chain or franchise.');
P();
P('- **Blessing International Market** (African, Caribbean and Spanish groceries; site bim-shop.com did not answer us).');
P('- **High Heat Cards & Collectibles** (highheatcardsandcollectibles.com returns not found).');
P('- **Apna Bazaar**, 1609 Cottage Ave: is it a separate grocery from Apna Kitchen at the same address, or the same business?');
P('- **M&M Sportscards & Collectibles**, 3003 25th Street: Google marks it permanently closed; Visit Columbus still lists it. Which is right today?');
P();
P('## Part C: where restaurant menus live');
P();
P('Our crawler can read stores but not most restaurant menus. For each Columbus restaurant you can find, give the **URL of its current menu** on its own website and the **format**: plain web page, PDF, image, or an ordering system (Toast, Square, Clover, ChowNow, Popmenu, BentoBox, other). Don’t copy the menu itself. Start with the restaurants in docs/research/scraping-brief.md (Restaurants and Coffee & Sweets sections).');
P();
writeFileSync(new URL('../docs/research/chatgpt-crawl-brief.md', import.meta.url), L.join('\n'));
console.log('docs/research/chatgpt-crawl-brief.md:', eligible.length, 'articles');
