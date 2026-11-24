// Fact briefs for the December 2026 print edition's news stories, copied from
// docs/paper/december-2026-prototype.md. Claude does not write news (see
// CLAUDE.md), so each news slot in the paper shows its brief until a named
// writer files the story in content/print/2026-12/<slot>.md. A brief is a
// reporter's starting point: what the sources say, what to verify, who to ask.
// `verify` marks a fact with one source or a secondhand summary.

export const BRIEFS = {
  A: {
    title: 'The river comes back',
    facts: [
      ['The city’s “Our River, Our Riverfront” project removed the failing low head dam in September 2026.'],
      ['The Republic reported on November 18, 2026, that most construction would wrap up by the end of November. Still open: a commemorative plaque waiting on state historic preservation approval, and gates that close the riverfront trail along Water Street when the river is too high.'],
      ['The ribbon cutting, once set for October 23, moved to next year.'],
      ['The project was scaled back when costs rose, to focus on safety and the environment. Planned pieces include a trail link to the 1821 Trail and Mill Race Park, overlooks and gathering spaces.'],
      ['Funding: about $18.9 million approved, including about $11.5 million in TIF money and $5.6 million from the state’s READI program.', 'verify: sources differ slightly'],
    ],
    ask: 'The city’s redevelopment office: the final cost, what was cut, the ribbon cutting date and when the trail fully opens. A walk along the river with a photographer.',
    sources: [
      ['City project page', 'https://www.columbus.in.gov/redevelopment/riverfront-reimagine-project/'],
      ['The Republic, November 18, 2026', 'https://www.therepublic.com/2026/11/18/most-columbus-riverfront-construction-set-to-wrap-up-by-months-end/'],
      ['Indiana READI project', 'https://www.indianareadi.com/project/00130'],
      ['Dirt Americana feature, July 2026', 'https://dirtamericana.com/2026/07/columbus-riverfront-guidebook-2026-article/'],
    ],
  },
  B: {
    title: 'What the “Vote yes” signs were about',
    facts: [
      ['It was a renewal, not a new tax: BCSC asked voters to continue its operating referendum, first passed in 2020, for up to eight more years.'],
      ['It keeps the existing rate, reported as $0.156, and can raise no more than about $10.1 million a year.', 'verify: the unit, per $100 of assessed value'],
      ['In 2026 the 2020 referendum was expected to bring in about $10.5 million, with about $9.3 million for teacher salaries and $750,000 for school security staff.'],
      ['Only voters inside the BCSC district voted on it; the Flat Rock Hawcreek district is separate.'],
      ['It passed on November 3, 2026. Reported margins differ: 63 percent (White River Broadcasting) and 61 percent (The Republic’s roundup, as summarized).', 'verify: use the county’s certified number'],
      ['Before the vote, a man lost a court challenge over a district message about the referendum (The Republic, October 31, 2026).'],
      ['“Yes for BCSC” was the campaign behind the signs. It is a campaign site, not a neutral source.'],
    ],
    ask: 'BCSC’s finance office: what the renewal pays for year by year, and what would have been cut if it failed. The state’s determination document for the exact rate and cap.',
    sources: [
      ['BCSC referendum page', 'https://www.bcscschools.org/referendum-2026'],
      ['State DLGF determination (PDF)', 'https://www.in.gov/dlgf/files/referendum-documentation2/2026-november-referendum-documents/26-013-Bartholomew-Consolidated-School-Corporation-Operating-Determination.pdf'],
      ['The Republic, October 14', 'https://www.therepublic.com/2026/10/14/voters-to-decide-future-of-bcsc-operating-referendum/'],
      ['The Republic, October 31', 'https://www.therepublic.com/2026/10/31/man-loses-court-bid-over-bcsc-referendum-message/'],
      ['The Republic, April 29', 'https://www.therepublic.com/2026/04/29/bcsc-begins-discussions-to-seek-referendum-renewal/'],
      ['White River Broadcasting, November 4', 'https://updates.whiteriverbroadcasting.com/2026/11/04/voters-approve-bcsc-referendum/'],
      ['Yes for BCSC (campaign)', 'https://www.yesforbcsc.org/'],
    ],
  },
  C: {
    title: 'Election results, November 3, 2026',
    facts: [
      ['Recorder: Debra K. Beck Settle (R) over Nancy Merbitz (D), about 55.9 to 44.1 percent.', 'unofficial'],
      ['County Commissioner, District 2: Carl Lienhoop (R) won a seventh term over Hale (D), about 56.6 to 43.4 percent.', 'unofficial'],
      ['Treasurer: Sandy Beatty (R) over Elizabeth Cleland, about 56 to 44.', 'unofficial'],
      ['Clerk: Shari Lentz reelected in a rematch.', 'unofficial'],
      ['Auditor and County Council: names and districts must come from the certified results. One summary reported an upset in Council District 3.', 'verify'],
      ['Congress: Shreve reelected (6th District), Houchin reelected (9th).', 'unofficial'],
      ['WKKG reported Republicans won every countywide race.', 'unofficial'],
    ],
    ask: 'The county clerk’s certified canvass, race by race, with vote totals. Print only certified numbers.',
    sources: [
      ['The Republic roundup, November 4', 'https://www.therepublic.com/2026/11/04/a-roundup-of-2026-bartholomew-county-election-results/'],
      ['The Republic: Recorder', 'https://www.therepublic.com/2026/11/03/beck-settle-wins-race-for-bartholomew-county-recorder/'],
      ['The Republic: Commissioner', 'https://www.therepublic.com/2026/11/03/lienhoop-wins-seventh-term-as-bartholomew-county-commissioner/'],
      ['WKKG', 'https://wkkg.com/local-news/bartholomew-dems-holding-leads-in-many-races-as-early-votes-counted/'],
    ],
  },
  D: {
    title: 'Sleeping outside is now a crime in Indiana',
    facts: [
      ['Senate Enrolled Act 285 was signed by Gov. Mike Braun on March 5, 2026, and took effect July 1, 2026. It makes camping on state or local public property (parks, sidewalks, underpasses) without permission a Class C misdemeanor: up to 60 days in jail and a $500 fine.'],
      ['Police must warn first, and the warning must say where to find shelter and services. Reported details: 48 hours to move at least 300 feet.', 'verify: in the enacted text'],
      ['The bill bars cities and counties from passing their own rules on public camping.', 'verify: in the enacted text; it matters for what Columbus can do'],
      ['Columbus began its homelessness work in 2024 with $500,000 in federal American Rescue Plan money; officials have said permanent supportive housing is the missing piece.'],
      ['The city’s Encampment Task Force was named the United Way of Bartholomew County’s 2026 Advocate of the Year (city announcement, April 29, 2026).'],
      ['Advocates in southern Indiana have criticized the law.'],
    ],
    ask: 'The city’s task force, Brighter Days Housing and Horizon House: how the law has changed things since July (arrests or citations, shelter numbers, what people need). Keep it about people and services, not only the law.',
    sources: [
      ['Indiana Capital Chronicle, February 27', 'https://indianacapitalchronicle.com/2026/02/27/indiana-senate-concurs-with-houses-public-camping-ban-edits-sends-bill-to-governors-desk/'],
      ['WFYI, April 22', 'https://www.wfyi.org/statewide/2026-04-22/homeless-people-camping-on-public-property-could-face-criminal-charges-under-new-law'],
      ['WLKY', 'https://www.wlky.com/article/indiana-ban-public-camping-statewide/71088352'],
      ['Bill text', 'https://iga.in.gov/pdf-documents/124/2026/senate/bills/SB0285/SB0285.02.COMS.pdf'],
      ['City: Encampment Task Force', 'https://www.columbus.in.gov/columbus-encampment-task-force-honored-as-united-way-of-bartholomew-countys-advocate-of-the-year/'],
      ['News and Tribune', 'https://www.newsandtribune.com/news/discrimination-on-every-level-southern-indiana-advocates-react-to-homeless-camping-ban/article_4529653d-573f-4aac-af98-6cd98e232dc9.html'],
    ],
  },
};
