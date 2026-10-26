// Get help in Columbus (/help/): the self-service resource center, and the
// wallet card that points to it. Every entry names the page it came from and
// the day it was checked; tests/help.test.mjs fails if either is missing.
// Most phone numbers and hours come from United Way of Bartholomew County's
// "United We Help" guide (updated May 2026). Nothing here is a referral or an
// endorsement, and Heart of Columbus is not affiliated with any of these
// agencies. Times are written "9 to 11:45 AM", never with a dash.
import { SRC } from './visit.mjs';

export const CHECKED = '2026-10-26';

export const HELP_SRC = {
  guide: 'https://www.unitedwehelp.org/_files/ugd/aa66bf_4e89fca836ec4d79b9f4ccddb0c4387d.pdf',
  guideEs: 'https://www.unitedwehelp.org/_files/ugd/aa66bf_da471dc26eee4cee862e90edfed04aca.pdf',
  unitedWeHelp: 'https://www.unitedwehelp.org/',
  housingList: 'https://www.columbus.in.gov/wp-content/uploads/2024/03/2024-Bartholomew-Housing-List-English.pdf',
  housingListBoth: 'https://static.libnet.info/frontend-images/pdfs/mybcpl/Housing_List_2024_Eng-Span.pdf',
  in211: 'https://secure.in.gov/fssa/files/In211InfoCard_En.pdf',
  in211Site: 'https://in211.org/',
  dfr: 'https://www.in.gov/fssa/dfr/4727.htm',
  benefits: 'https://fssabenefits.in.gov/bp/#/',
  dfrOffice: 'https://www.in.gov/fssa/dfr/ebt-hoosier-works-card/find-my-local-dfr-office',
  stride: 'https://centerstone.org/stride/',
  vim: 'https://www.crh.org/service-centers/vimcare-clinic',
  turningPoint: 'https://www.turningpointdv.org/',
  cha: 'https://columbushome.net/',
  chaApply: 'https://columbushome.net/how-to-apply/',
  ils: 'https://www.indianalegalservices.org/ILRC',
  ilsApply: 'https://ilsoi.legalserver.org/modules/matter/extern_intake.php?pid=129&h=daa817&',
  ilsRent: 'https://indianalegalservices.org/behind-on-my-rent',
  eap: 'https://www.in.gov/ihcda/4067.htm',
  eapApply: 'https://eap.mylitt.com/',
  workone: 'https://www.in.gov/dwd/workone/region-9',
  bmvId: 'https://in.gov/bmv/2530.htm',
  vitalFees: 'https://www.in.gov/health/vital-records/fee-schedule/',
  vitalOrder: 'https://www.in.gov/health/vital-records/order-now',
  library: 'https://mybcpl.org/local-resources',
  seniorMeals: 'https://static.libnet.info/frontend-images/pdfs/mybcpl/Meal_Site_Flyer_update_January_2026.pdf',
  mentalHealth: 'https://mhmbc.crediblemind.com/',
  asap: 'https://www.guidestar.org/Profile/83-3373292',
  brighterDays2016: 'https://www.therepublic.com/?p=361884',
  needIn2023: 'https://www.therepublic.com/2023/04/16/a-desperate-need-columbus-lacks-permanent-supportive-housing-as-homelessness-rises/',
};
const S = HELP_SRC;

const x = (o) => ({ checked: CHECKED, ...o });

// The short list on the wallet card and at the top of the page. Keep it to
// numbers a person can call from any phone, tonight.
export const FIRST = [
  { label: 'Emergency', number: '911', note: 'Police, fire, ambulance' },
  { label: 'Any kind of help', number: '211', note: 'Indiana 211, free, 24/7. Or text your ZIP code to 898-211', source: S.in211 },
  { label: 'Crisis or thoughts of suicide', number: '988', note: 'Free, 24/7', source: S.guide },
  { label: 'Shelter, single adults', number: '812-344-4512', note: 'Brighter Days Housing', source: S.guide },
  { label: 'Shelter, families with kids', number: '812-799-1062', note: 'Horizon House', source: S.guide },
  { label: 'Domestic violence', number: '800-221-6311', note: 'Turning Point, 24 hours', source: S.turningPoint },
];

export const HELP = [
  { id: 'right-now', emoji: '🆘', title: 'Help right now', lead: 'If someone is in danger, call 911. These lines answer day and night.', items: [
    x({ slug: 'indiana-211', name: 'Indiana 211', what: 'Free, confidential help finding food, housing, utility help, health care, mental health and more, from the state.',
      phones: [['Call', '211'], ['Or', '866-211-9966']], text: ['Text your ZIP code to', '898-211'], hours: 'Open 24/7',
      links: [['Search in211.org', S.in211Site]], source: S.in211 }),
    x({ slug: '988', name: '988 Suicide and Crisis Lifeline', what: 'Confidential support, any hour, for anyone in emotional distress or a mental health or substance use crisis.',
      phones: [['Call', '988']], hours: 'Open 24/7', source: S.guide }),
    x({ slug: 'stride', name: 'Stride Crisis Center (Centerstone)', what: 'A crisis center for adults 18 and older in a mental health or substance use crisis. First responders, social workers and neighbors can call for someone too.',
      address: '1075 Second Street, Suite C', phones: [['Call', '877-463-6512'], ['Local line', '812-669-3100']], hours: 'Open 24 hours, 7 days',
      links: [['Stride Center page', S.stride]], source: S.stride, more: [['United Way lists the local line as a 24 hour adult crisis diversion center.', S.guide]] }),
    x({ slug: 'centerstone-crisis', name: 'Centerstone crisis line', what: '24 hour mental health crisis help.', phones: [['Call', '800-832-5442']], hours: 'Open 24 hours', source: S.guide }),
    x({ slug: 'turning-point', name: 'Turning Point Domestic Violence Services', what: 'A 24 hour helpline and a 40 bed emergency shelter for adult survivors of domestic violence or sexual assault and their children. Serves Bartholomew, Brown, Jackson, Jennings, Johnson and Shelby counties.',
      phones: [['24 hour helpline', '800-221-6311'], ['Office', '812-379-5575']], links: [['turningpointdv.org', S.turningPoint]], source: S.turningPoint }),
  ] },
  { id: 'shelter', emoji: '🛏️', title: 'A place to sleep tonight', lead: 'Each shelter starts with a phone assessment, so call first. United Way also suggests asking family or friends first if that is safe.', items: [
    x({ slug: 'brighter-days', name: 'Brighter Days Housing', what: 'The point of entry for any homeless individual in the county. Call for an assessment.',
      phones: [['Assessment', '812-344-4512']], source: S.guide,
      more: [['A Love Chapel program at 421 South Mapleton Street, in the old Columbus Township firetruck building. When it opened in 2016 it was overnight only, for men and women 18 and older; call for today’s check in time.', S.brighterDays2016]] }),
    x({ slug: 'horizon-house', name: 'Horizon House', what: 'The point of entry for any homeless family with children. Call for an assessment.', phones: [['Assessment', '812-799-1062']], source: S.guide }),
    x({ slug: 'turning-point-shelter', name: 'Turning Point emergency shelter', what: 'For survivors of domestic violence or sexual assault and their children. Call the helpline to get in.', phones: [['24 hour helpline', '800-221-6311']], source: S.turningPoint }),
    x({ slug: 'trustee-shelter', name: 'Your township trustee', what: 'Township assistance can cover limited emergency shelter, along with rent, utilities and some other basics. Bring proof of income and expenses.',
      phones: [['Columbus Township', '812-372-8249']], source: S.guide, jump: 'trustees' }),
  ] },
  { id: 'food', emoji: '🥫', title: 'Food', lead: 'Hot meals are open to anyone who comes, no questions asked. Pantries give groceries to take home.', items: [
    x({ slug: 'love-chapel-pantry', name: 'Love Chapel food pantry', what: 'Food pantry.',
      address: '292 Center Street', hours: 'Monday to Saturday, 9 to 11:45 AM. First Monday of the month also 3 to 6 PM (second Monday in September).', source: S.guide,
      more: [['Love Chapel’s offices are at 311 Center Street, (812) 372-9421.', S.housingList]] }),
    x({ slug: 'love-chapel-outreach', name: 'Love Chapel outreach pantries', what: 'Pop up pantries around the county.', source: S.guide,
      list: ['Elizabethtown UMC, 200 Washington Street: first Tuesday, 4 to 6 PM', 'Taylorsville UMC, 1361 Tannehill Road: second Wednesday, 2 to 4 PM', 'Bethel Baptist Church, 142 Deaver Road: third Tuesday, 4 to 6 PM', 'Hope Town Square, 625 Main Street: fourth Tuesday, 3 to 5 PM'] }),
    x({ slug: 'salvation-army-pantry', name: 'Salvation Army pantry', address: '2525 Illinois Street', what: 'Food pantry.', phones: [['Call', '812-372-7118']],
      hours: 'Monday 10 AM to noon. Tuesday 1 to 5 PM. Wednesday and Thursday 9 AM to noon.', source: S.guide }),
    x({ slug: 'hope-pantry', name: 'Community Center of Hope pantry', address: '543 Washington Street, Hope', what: 'Food pantry.', phones: [['Call', '812-546-4499']], hours: 'Tuesday, 8:30 AM to noon', source: S.guide }),
    x({ slug: 'snap', name: 'SNAP food benefits', what: 'Apply online on the state’s FSSA Benefits Portal, by phone, or in person at the county Division of Family Resources office, 2330 Poshard Drive.',
      phones: [['Benefits line', '800-403-0864']], hours: 'Office: Monday to Friday, 8 AM to 4:30 PM', links: [['Apply online', S.benefits], ['Find your DFR office', S.dfrOffice]], source: S.dfr, form: true }),
    x({ slug: 'wic', name: 'WIC', address: '1531 13th Street, Suite G450', what: 'WIC (Women, Infants and Children) services.', phones: [['Call', '812-379-1557']], source: S.guide }),
    x({ slug: 'senior-meals', name: 'Thrive Alliance senior meals', what: 'Weekday lunch, 10 AM to 1 PM, at Armory Apartments (646 Franklin Street) and 421 McClure Road. Free for anyone 60 and older; $7 under 60.',
      phones: [['Thrive Alliance', '812-372-6918']], source: S.seniorMeals }),
  ] },
  { id: 'keep-your-home', emoji: '🔑', title: 'Rent, utilities and keeping your home', lead: 'Start with your township trustee. Love Chapel can help after you have checked with the trustee.', items: [
    x({ slug: 'trustees', name: 'Township trustees (basic assistance)', what: 'Limited help with rent (not deposits), utilities, emergency shelter, transportation, personal supplies and funeral costs. You will need proof of income and expenses. Call the trustee for the township you live in.',
      source: S.guide, list: ['Columbus: 812-372-8249', 'Clay: 812-378-4834', 'Clifty: 812-546-5587', 'Flatrock: 812-344-8896', 'German: 812-526-5505', 'Harrison: 812-343-0662', 'Hawcreek: 812-546-5947', 'Jackson: 812-342-3212', 'Ohio: 812-603-2993', 'Rockcreek: 812-343-2598', 'Sandcreek: 812-579-2001', 'Wayne: 812-342-5080'],
      more: [['Trustee vouchers cover current rent or utilities only, not deposits or first month’s rent.', S.housingList]] }),
    x({ slug: 'love-chapel-help', name: 'Love Chapel financial help', what: 'Vouchers for rent, deposits or utilities, after you check with your trustee.', phones: [['Call', '812-372-9421']], hours: 'Monday to Friday, 9 to 11 AM', source: S.housingList }),
    x({ slug: 'energy-assistance', name: 'Energy Assistance Program', what: 'Help with heating and power bills. This season’s applications open October 1, 2026 and close April 30, 2027. Human Services, Inc. runs it locally.',
      phones: [['Human Services, Inc.', '812-372-8407']], links: [['Apply online', S.eapApply], ['Program page', S.eap]], source: S.eap, form: true,
      more: [['United Way lists Human Services, Inc. for the Energy Assistance Program.', S.guide]] }),
    x({ slug: 'behind-on-rent', name: 'Behind on rent or facing eviction', what: 'Indiana Legal Services explains your rights and options. Apply for free legal help below.', links: [['Behind on my rent', S.ilsRent]], source: S.ilsRent, jump: 'legal-aid' }),
  ] },
  { id: 'find-housing', emoji: '🏠', title: 'Finding a place to live', lead: 'Waiting lists are usual for subsidized housing. Get on more than one.', items: [
    x({ slug: 'housing-authority', name: 'Columbus Housing Authority', address: '799 McClure Road', what: 'Public housing and Section 8 vouchers for Columbus and five miles around it. Rent is 30% of adjusted income. When we checked, both waiting lists were closed to new applications; check the site for when they open.',
      phones: [['Call', '812-378-0005']], links: [['How to apply', S.chaApply]], source: S.cha, form: true, more: [['Public housing rent is 30% of adjusted income.', S.housingList]] }),
    x({ slug: 'human-services-section-8', name: 'Human Services, Inc. (Section 8 outside the city)', what: 'Section 8 for homes more than five miles outside Columbus city limits.', phones: [['Call', '812-372-8407']], source: S.guide }),
    x({ slug: 'housing-list', name: 'United Way housing list', what: 'Apartments in the county with phone, rent range, waiting list, and which accept trustee, Love Chapel or HUD vouchers. English and Spanish.',
      links: [['Housing list (PDF)', S.housingListBoth]], source: S.housingList, more: [['Pick up a printed copy at the United Way front desk, 1531 13th Street.', S.guide]] }),
    x({ slug: 'indiana-housing-now', name: 'Indiana Housing Now', what: 'A housing search and housing locator.', phones: [['Call', '877-428-8844']], links: [['indianahousingnow.org', 'https://www.indianahousingnow.org/']], source: S.guide }),
    x({ slug: 'landlord-association', name: 'Landlord Association rental referrals', what: 'Referrals to local landlords.', phones: [['Call', '812-376-3500']], source: S.housingList }),
  ] },
  { id: 'health', emoji: '🩺', title: 'Health care and medicine', items: [
    x({ slug: 'vimcare', name: 'VIMCare Clinic', address: '2100 25th Street, Suite H (CRH at NexusPark, entrance 3)', what: 'Sick visits, physicals, chronic care like diabetes and blood pressure, behavioral health and help getting medicine, for patients on Medicaid or HIP and uninsured patients who meet income guidelines. By appointment.',
      phones: [['Clinic', '812-375-3660'], ['Medicine help', '812-375-3662']], hours: 'Monday to Wednesday, 8 AM to 4:30 PM. Thursday, 9 AM to 5 PM.', links: [['Clinic page', S.vim]], source: S.vim }),
    x({ slug: 'medicaid', name: 'Medicaid, HIP and Hoosier Healthwise', what: 'Apply on the FSSA Benefits Portal or by phone. Covering Kids and Families helps people sign up.',
      phones: [['Benefits line', '800-403-0864'], ['Sign up help', '812-418-3573']], links: [['Apply online', S.benefits]], source: S.dfr, form: true, more: [['Covering Kids and Families helps with Medicaid, HIP, Healthwise and CHIP.', S.guide]] }),
    x({ slug: 'health-department', name: 'Bartholomew County Health Department', what: 'Free immunizations and health screenings.', phones: [['Call', '812-379-1555']], source: S.guide }),
    x({ slug: 'centerstone', name: 'Centerstone', what: 'Mental health and substance use care.', phones: [['Call', '800-344-8802']], links: [['Mental health resources for the county', S.mentalHealth]], source: S.guide }),
  ] },
  { id: 'recovery', emoji: '🌱', title: 'Recovery', items: [
    x({ slug: 'asap', name: 'ASAP Recovery Resource Center', what: 'The Alliance for Substance Abuse Progress runs the county’s recovery resource center, for referrals and support.', address: '1531 13th Street, Suite 1102',
      phones: [['Call', '812-418-8705']], links: [['asapbc.org', 'https://www.asapbc.org/']], source: S.guide, more: [['Address and website from the group’s nonprofit profile.', S.asap]] }),
    x({ slug: 'samhsa', name: 'National treatment referral line', what: 'Free referrals to treatment, any hour.', phones: [['Call', '800-662-4357']], hours: 'Open 24 hours', source: S.guide }),
    x({ slug: 'treatment-support-center', name: 'Treatment and Support Center', what: 'An outpatient therapeutic community.', phones: [['Call', '812-375-3784']], source: S.guide }),
    x({ slug: 'meetings', name: 'NA and AA meetings', what: 'Twelve step meetings in the area.', links: [['Narcotics Anonymous', 'https://southcentralna.org/'], ['Alcoholics Anonymous', 'https://seigaa.org/']], source: S.guide }),
  ] },
  { id: 'work', emoji: '🧰', title: 'Jobs and school', items: [
    x({ slug: 'workone', name: 'WorkOne Columbus', address: '1531 13th Street, Suite 2220', what: 'Job listings, skill assessments and help looking for work.', phones: [['Call', '812-376-3351']],
      hours: 'Monday to Wednesday and Friday, 8 AM to 4:30 PM. Thursday, 10 AM to 4:30 PM.', links: [['WorkOne page', S.workone]], source: S.workone }),
    x({ slug: 'bartholomew-county-works', name: 'Bartholomew County Works', what: 'A workshop to learn the skills for full time work.', phones: [['Call', '812-379-1630']], source: S.guide }),
    x({ slug: 'vocational-rehab', name: 'Vocational Rehabilitation', what: 'Retraining and job help for people who are injured or disabled.', phones: [['Call', '812-376-9935']], source: S.guide }),
    x({ slug: 'mcdowell', name: 'McDowell Adult Education Center', what: 'Free classes: high school equivalency, English and career training.', phones: [['Call', '812-376-4451']], source: S.guide }),
    x({ slug: 'excel-center', name: 'The Excel Center', what: 'Free high school for adults.', phones: [['Call', '812-353-8100']], source: S.guide }),
    x({ slug: 'library', name: 'Bartholomew County Public Library', address: '536 Fifth Street', what: 'The library keeps a list of local services, the housing list and the hot meal list on one page.', phones: [['Call', '812-379-1255']], links: [['Local resources', S.library]], source: S.library }),
  ] },
  { id: 'legal-id', emoji: '⚖️', title: 'Legal help and ID', items: [
    x({ slug: 'legal-aid', name: 'Indiana Legal Services', what: 'Free civil legal help if you qualify. The online application takes about 20 minutes and asks about income, assets and household size; expect to hear back in about 14 days.',
      phones: [['Call', '844-243-8570']], hours: 'Phone: Monday to Thursday, 10 AM to 2 PM', links: [['Apply online', S.ilsApply]], source: S.ils, form: true }),
    x({ slug: 'river-valley', name: 'River Valley Legal Aid (Pro Bono Indiana)', what: 'Civil and family matters for people with low income. No criminal cases.', phones: [['Call', '812-378-0358']], source: S.guide }),
    x({ slug: 'turning-point-legal', name: 'Turning Point legal advocate', what: 'Guidance on domestic violence legal issues.', phones: [['Call', '800-221-6311']], source: S.guide }),
    x({ slug: 'state-id', name: 'Indiana state ID card', what: 'An ID card costs $9 at the BMV, and is free if you are 18 or older, a U.S. citizen and eligible to vote. Bring proof of identity, lawful status, Social Security number and two proofs of Indiana residency.',
      links: [['BMV ID card page', S.bmvId]], source: S.bmvId }),
    x({ slug: 'birth-certificate', name: 'Indiana birth certificate', what: 'A birth certificate from the state costs $10, and $4 for each extra copy in the same order. Mail orders take a check or money order, not cash.',
      links: [['Order a birth certificate', S.vitalOrder], ['Fees', S.vitalFees]], source: S.vitalFees, form: true }),
    x({ slug: 'child-support', name: 'Child support', what: 'The Bartholomew County Prosecutor’s Office child support division.', phones: [['Call', '812-379-1674']], source: S.guide }),
  ] },
  { id: 'getting-around', emoji: '🚌', title: 'Getting around', items: [
    x({ slug: 'columbus-bus', name: 'ColumBUS', what: 'The city bus is free to ride. Five routes, Monday to Saturday.', phones: [['Call', '812-376-2506']], links: [['Routes and times', SRC.routes]], source: SRC.transit }),
    x({ slug: 'bike-coop', name: 'Columbus Bike Co-Op', address: '1531 13th Street', what: 'An earn a bike program, and used and kids’ bikes for sale.', hours: 'March to December: Sunday 2 to 5 PM, Tuesday 5 to 8 PM', source: S.guide }),
    x({ slug: 'verida', name: 'Verida medical rides', what: 'Non emergency rides to medical care for fee for service Medicaid members.', phones: [['Call', '855-325-7586']], source: S.guide }),
  ] },
  { id: 'more', emoji: '🤝', title: 'Veterans, seniors, families and neighbors', items: [
    x({ slug: 'veterans', name: 'Bartholomew County Veteran Services', what: 'Help for veterans and their families, including rides to VA medical care.', phones: [['Call', '812-379-1540']], source: S.guide }),
    x({ slug: 'thrive', name: 'Thrive Alliance', what: 'Services for seniors and people with disabilities.', phones: [['Call', '812-372-6918']], source: S.guide }),
    x({ slug: 'su-casa', name: 'Su Casa Indiana', what: 'A cross cultural bridge connecting the Latino community to services.', phones: [['Call', '812-375-9370']], links: [['Guía en español (PDF)', S.guideEs]], source: S.guide }),
    x({ slug: 'mill-race-center', name: 'Mill Race Center', what: 'A community center for people 50 and older.', phones: [['Call', '812-376-9241']], source: S.guide }),
    x({ slug: 'child-care', name: 'Child care', what: 'Brighter Futures Indiana finds child care (press 3); Firefly Children and Family Alliance handles child care vouchers (press 2).', phones: [['Child care finder', '800-299-1627'], ['Vouchers', '317-545-5281']], source: S.guide }),
    x({ slug: 'adult-protective', name: 'Adult Protective Services', what: 'Report abuse or neglect of a senior or an adult with a disability.', phones: [['Call', '800-992-6978']], source: S.guide }),
    x({ slug: 'child-abuse-hotline', name: 'Indiana Child Abuse and Neglect Hotline', what: 'Report suspected abuse or neglect of a child.', phones: [['Call', '800-800-5556']], source: S.guide }),
  ] },
  { id: 'clothing', emoji: '🧥', title: 'Clothing and household goods', items: [
    x({ slug: 'sans-souci', name: 'Sans Souci clothing vouchers', what: 'Clothing vouchers, with a referral from an agency.', phones: [['Call', '812-372-3419']], source: S.guide }),
    x({ slug: 'orphan-grain-train', name: 'Orphan Grain Train', what: 'Household goods, with a referral from a social service agency or church.', phones: [['Call', '812-405-2045']], source: S.guide }),
    x({ slug: 'psi-iota-xi', name: 'Psi Iota Xi Thrift Shop', address: '935 Eighth Street', what: 'Thrift shop.', hours: 'Friday and Saturday, 10 AM to 1 PM, every other week', source: S.guide }),
  ] },
];

// Free hot meals by day, from the same guide. "Anyone who attends."
export const MEALS = [
  ['Sunday', 'Food Not Bombs, Pence Park, 443 Pence Avenue', '2 to 4 PM'],
  ['Sunday', 'St. Bartholomew Catholic Church, 1306 27th Street', '5 to 5:50 PM'],
  ['Sunday', 'Manasseh Ministries, 6719 Base Road', '5 to 6:30 PM, first Sunday'],
  ['Sunday', 'East Columbus United Methodist, 2439 Indiana Avenue', '5 to 5:30 PM, second Sunday'],
  ['Monday', 'First United Methodist Church, 618 Eighth Street', '5 to 6 PM'],
  ['Monday', 'Hope Moravian Church, 202 Main Street, Hope', '5 to 6 PM (closed July, December and when schools are closed)'],
  ['Tuesday', 'Memorial Baptist Church, 2320 Seventh Street', '5 to 5:45 PM'],
  ['Wednesday', 'Columbus Free Methodist Church, 1511 22nd Street', '5 to 5:45 PM'],
  ['Thursday', 'Salvation Army, 2525 Illinois Street', '4 to 4:45 PM (closed December)'],
  ['Friday', 'First Presbyterian Church, 512 Seventh Street', '4:30 to 5:30 PM'],
  ['Friday', 'Columbus Baptist Church, 4821 North US 31', '6 to 7 PM, fourth Friday (closed November and December)'],
  ['Saturday', 'First Christian Church, 531 Fifth Street', '4 to 5 PM, first, second and fourth Saturdays'],
  ['Saturday', 'Ogilville Christian Church, 7891 West 450 South', '11:30 AM to 12:30 PM, second Saturday'],
  ['Saturday', 'Second Baptist Church, 1325 10th Street', '4 to 5 PM, third Saturday'],
];

export const helpItems = HELP.flatMap((g) => g.items);
