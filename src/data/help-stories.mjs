// Stories that go with /help/: a practical guide, a report on the
// transitional housing gap, and Jacob's own account. Every fact in a
// paragraph cites the page it came from (src); a paragraph with no src only
// frames or explains. Quotes are copied from the source, never made up.
// tests/help.test.mjs checks the sources and the dashes. Each story is a
// draft until a person signs off; once the newspaper framework lands they
// move to content/stories/ with draft: true.
import { HELP_SRC as S } from './help.mjs';

export const R = {
  commonsProtest: 'https://www.therepublic.com/2023/07/21/pushing-back-group-protests-proposed-commons-rules-calling-them-anti-homeless/',
  commonsRules: 'https://www.therepublic.com/?p=579670',
  publicSpaces: 'https://www.therepublic.com/?p=577863',
  count2024: 'https://www.therepublic.com/?p=710426',
  thrive128: 'https://www.therepublic.com/?p=681078',
  sea285: 'https://indianacapitalchronicle.com/2026/06/25/public-camping-ban-national-guard-military-police-and-other-laws-go-into-effect-july-1/',
};

// Readable names for the source list at the bottom of each story.
export const SOURCE_NAMES = {
  [R.commonsProtest]: 'The Republic, “Pushing back: Group protests proposed Commons rules, calling them anti homeless” (July 21, 2023)',
  [R.commonsRules]: 'The Republic, “Commons Board establishes visitor rules prohibiting panhandling, open alcohol containers and sleeping, among other violations” (2023)',
  [R.publicSpaces]: 'The Republic, “The homeless and ‘rules’: Some public spaces establishing boundaries as homeless increase their visits” (2023)',
  [R.count2024]: 'The Republic, “The latest count: Number of homeless residents declines in latest count, but those avoiding shelters slightly increased” (2024)',
  [R.thrive128]: 'The Republic, “Editorial: Thrive Alliance affordable housing plan promising”',
  [R.sea285]: 'Indiana Capital Chronicle, “Public camping ban, military police and other laws go into effect July 1” (June 25, 2026)',
  [S.needIn2023]: 'The Republic, “A desperate need: Columbus lacks permanent supportive housing as homelessness rises” (April 16, 2023)',
  [S.brighterDays2016]: 'The Republic, “Brighter days ahead” (2016)',
  [S.guide]: 'United Way of Bartholomew County, “United We Help” local services guide (updated May 2026)',
  [S.housingList]: 'United Way of Bartholomew County, 2024 Bartholomew County Housing List',
  [S.cha]: 'Columbus Housing Authority',
  [S.in211]: 'Indiana FSSA, Indiana 211 info card',
  [S.dfr]: 'Indiana FSSA Division of Family Resources, Contact DFR',
  [S.eap]: 'Indiana Housing and Community Development Authority, Energy Assistance Program',
  [S.bmvId]: 'Indiana BMV, Identification cards',
  [S.vitalFees]: 'Indiana Department of Health, Vital records fee schedule',
  [S.stride]: 'Centerstone, Stride Crisis Center',
  [S.vim]: 'Columbus Regional Health, VIMCare Clinic',
  [S.workone]: 'Indiana DWD, WorkOne Region 9',
  [S.turningPoint]: 'Turning Point Domestic Violence Services',
};

const p = (text, ...src) => ({ p: text, src });
const h = (text) => ({ h: text });

export const STORIES = [
  {
    slug: 'transitional-housing',
    kicker: 'Report',
    draft: 'Draft. Researched and written for Heart of Columbus from the sources below; it runs once an editor signs off.',
    title: 'Columbus has a shelter. It doesn’t have the next step.',
    dek: 'A shelter bed gets you through tonight and a lease gets you the rest of your life. The rung in between is where people in Columbus keep falling. Here is what the public record says about it.',
    byline: 'Heart of Columbus',
    date: '2026-10-26',
    body: [
      p('Columbus has one emergency shelter for single adults. Brighter Days Housing, a Love Chapel program, opened in 2016 in a former Columbus Township firetruck building on South Mapleton Street, with room for 36 people. It was built as an overnight shelter: check in in the evening, out the next morning.', S.brighterDays2016, S.needIn2023),
      p('It fills. In the winter of 2022 into 2023, The Republic reported, the shelter’s 28 bed men’s dorm was full all winter, and staff opened a spill over area on some nights. From December to February it averaged about 30 people a night, up from about 26 the winter before, its second busiest winter since it opened.', S.needIn2023),
      p('The January 2024 count found 75 people homeless in Bartholomew County. Eighteen of them, nearly one in four, were unsheltered on the night of the count.', R.count2024),
      h('The missing rung'),
      p('A shelter bed solves tonight. In between a cot and a lease is the hard part: somewhere to stay for months, not nights, while you save a deposit, replace an ID, hold down a job or wait for a voucher. That middle rung is transitional housing. Its long term cousin, permanent supportive housing, pairs a home with the services some people need to stay housed.'),
      p('Columbus is short on both. In 2023 The Republic found six beds in the whole county that met the criteria for permanent supportive housing, about five times fewer than the average winter night at Brighter Days.', S.needIn2023),
      p('The math doesn’t close. Love Chapel, Centerstone and the Columbus Township Trustee’s office helped 49 homeless people find housing over a year, officials told The Republic, and more than 49 people became homeless in the same stretch.', S.needIn2023),
      p('Every step up the ladder has a gap of its own. Township trustee vouchers cover current rent or utilities, not a deposit or the first month’s rent. And when we checked in October 2026, the Columbus Housing Authority’s public housing and Section 8 waiting lists were both closed to new applications.', S.housingList, S.cha),
      h('It has been tried'),
      p('In 2017 a plan for the Victory Apartments, 20 to 25 units at 1703 Home Avenue, was meant to start closing the gap. By the middle of 2018 it had been dropped, after opposition from neighbors and without enough funding.', S.needIn2023),
      p('Thrive Alliance has proposed up to 128 affordable units at the former Columbus Transitional Care and Rehabilitation property, 2100 Midway Street: 64 for families and 64 for seniors. More affordable housing helps everyone near the edge. As The Republic described it, though, the plan is Section 8 family and senior housing, not transitional beds.', R.thrive128),
      h('Where people go in the daytime'),
      p('When the shelter empties in the morning, people go where it is warm and free. Columbus’s public spaces, the library among them, have been setting rules as more homeless residents spend their days there.', R.publicSpaces),
      p('In 2023 The Commons Board took up visitor rules, and a group of residents protested them as anti homeless. The rules the board approved prohibit panhandling, sleeping or lying down, and leaving belongings unattended, among other things. A violation can bring a trespass notice and removal from the building, though the manager said staff would talk with a person first.', R.commonsProtest, R.commonsRules),
      p('Jacob Kennedy, who now publishes Heart of Columbus, spoke at that meeting. “This was the only place I had to bring my daughters, you understand?” he said, as The Republic reported it. “So it’s pretty personal to me. And there really aren’t a lot of great spots to be in Columbus.”', R.commonsProtest),
      h('And now, a state law'),
      p('Since July 1, 2026, Indiana’s Senate Enrolled Act 285 makes camping, sleeping or long term shelter on unauthorized public land a Class C misdemeanor, with up to 60 days in jail and a $500 fine. Officers have to warn a person first and give them information about services; someone still within 300 feet of the spot 48 hours later can be charged. Nobody can be prosecuted when there is no open shelter or mental health bed within five miles.', R.sea285),
      p('That last line brings the question right back to Columbus. The law’s own exemption is counted in beds, and beds are what the county is short of.'),
      h('What would help'),
      p('The people who run the shelter, the pantry and the trustee’s office told The Republic in 2023 what was missing: permanent supportive housing, and somewhere between a cot and a lease.', S.needIn2023),
      p('Heart of Columbus isn’t an agency and isn’t raising money for one. What we can do is keep everything that does exist on one page, on a phone and on a card you can hand to someone, and keep asking for the rest.'),
    ],
  },
  {
    slug: 'where-to-start',
    kicker: 'Guide',
    draft: 'Draft. Compiled from the sources below; it runs once an editor signs off.',
    title: 'Need help in Columbus? Start here.',
    dek: 'Food tonight, a bed, the light bill, your ID, a doctor, a job. Who to call first, and what to bring.',
    byline: 'Heart of Columbus',
    date: '2026-10-26',
    body: [
      p('If you only remember one number, make it 211. Indiana 211 is free, confidential and open 24/7, and it connects you to food, housing and utility help, health care, mental health and more. You can also text your ZIP code to 898-211.', S.in211),
      p('If you are thinking about suicide or are in a crisis, call 988, any hour. In Columbus, the Stride Crisis Center at 1075 Second Street is open 24 hours for adults in a mental health or substance use crisis; call 877-463-6512. If someone is in danger, call 911.', S.guide, S.stride),
      h('A bed tonight'),
      p('Shelters here start with a phone call. Single adults call Brighter Days Housing at 812-344-4512. Families with children call Horizon House at 812-799-1062. If you are leaving someone who hurts you, Turning Point’s 24 hour helpline is 800-221-6311, and they run a 40 bed emergency shelter.', S.guide, S.turningPoint),
      h('Food today'),
      p('Somebody serves a free hot meal almost every day of the week, open to anyone, no questions asked. The full list, by day, is on the resource page. For groceries, Love Chapel’s pantry at 292 Center Street is open Monday to Saturday, 9 to 11:45 AM.', S.guide),
      p('To apply for SNAP, Medicaid or HIP, use the state’s FSSA Benefits Portal online, call 800-403-0864, or go to the Division of Family Resources office at 2330 Poshard Drive, Monday to Friday, 8 AM to 4:30 PM.', S.dfr, S.guide),
      h('Keeping your place'),
      p('Behind on rent or a utility bill? Call your township trustee first; in Columbus Township it is 812-372-8249. Bring proof of your income and expenses. Love Chapel can help with rent, deposits or utilities after you have checked with the trustee: 812-372-9421, Monday to Friday, 9 to 11 AM.', S.guide, S.housingList),
      p('For heating and power bills, Indiana’s Energy Assistance Program takes applications from October 1, 2026 to April 30, 2027, online or through Human Services, Inc. at 812-372-8407.', S.eap, S.guide),
      h('Getting your papers back'),
      p('So much depends on an ID. An Indiana ID card costs $9 at the BMV, and is free if you are 18 or older, a U.S. citizen and eligible to vote. You’ll need proof of identity, lawful status, your Social Security number and two proofs of Indiana residency. A state birth certificate costs $10.', S.bmvId, S.vitalFees),
      h('A doctor, and recovery'),
      p('VIMCare Clinic, now at CRH NexusPark, 2100 25th Street, sees patients on Medicaid or HIP and uninsured patients who meet income guidelines. Call 812-375-3660 for an appointment. For recovery, ASAP’s Recovery Resource Center is at 812-418-8705.', S.vim, S.guide),
      h('Work, and getting there'),
      p('WorkOne Columbus, 1531 13th Street, Suite 2220, helps with job listings and the search itself: 812-376-3351. And the city bus, ColumBUS, is free to ride.', S.workone, S.guide),
      h('One page, one card'),
      p('Every number here, and dozens more, is on one page at Heart of Columbus, with links to the online applications. There is a wallet card with a QR code too. Print a stack and keep them in your car. The next time you hand somebody a few dollars, hand them a card.'),
    ],
  },
  {
    slug: 'making-it-back',
    kicker: 'First person',
    draft: 'Draft. Written from Jacob’s own words and The Republic’s reporting; Jacob is still editing it.',
    title: 'The Republic said I’d been homeless. Here’s the rest of it.',
    dek: 'Nobody asked me before it ran. I’m not ashamed of it now.',
    byline: 'Jacob Kennedy',
    date: '2026-10-26',
    body: [
      p('In the summer of 2023 I went to a meeting of The Commons Board. They were working on visitor rules for the building, and a lot of us thought the rules were written to push homeless people out of the one indoor public place in town where you can just be.', R.commonsProtest),
      p('I spoke. I got things going, and then I left, because I had to get back to work.'),
      p('The Republic quoted me. “This was the only place I had to bring my daughters, you understand?” I said. “So it’s pretty personal to me. And there really aren’t a lot of great spots to be in Columbus.”', R.commonsProtest),
      p('The story also said I had been homeless off and on, as recently as six months before. That was true. But nobody asked me if I wanted that in the paper, and seeing it there was a little embarrassing.', R.commonsProtest),
      p('Only a little, though. Mostly I’m kind of proud. I made it back up. And I’m grateful my parents were there to be my advocates.'),
      p('Not everybody has parents who can do that. The lack of transitional housing is a huge hot button issue in this town.'),
      p('So we built one page with every resource in Columbus, real links, real phone numbers and the actual applications, and a card with a QR code that goes straight to it. Hand them out. Anytime you give somebody a few bucks at the gas station, hand them a card too.'),
    ],
  },
];

export const storyBySlug = Object.fromEntries(STORIES.map((s) => [s.slug, s]));
