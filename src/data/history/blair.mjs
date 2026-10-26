// "Brian Blair's faith beat": short summaries, in our own words, of faith
// stories first published in The Republic. Each links the original, credits
// Blair and the paper, and quotes only a line or two that the original prints.
// `seen` is true only where we read Blair's credit line on the original page;
// the rest show a note until he confirms the story is his.
const CHECKED = '2026-10-26';
const R = 'https://www.therepublic.com/';
const HAVEN = 'Disclosure: Jacob Kennedy, the publisher of Heart of Columbus, volunteers at this church, which he tells us now goes by Haven United Methodist Church, and is joining its staff as music director.';
const UNSEEN = 'We are confirming with Brian Blair that this story is his before it runs. The original page we read did not show its byline.';

const x = ({ date, headline, path, seen, note, ...o }) => ({
  checked: CHECKED, section: 'faith', kind: 'tribute', when: date.slice(0, 4),
  original: { by: 'Brian Blair, The Republic', date, headline, seen },
  note: [note, seen ? '' : UNSEEN].filter(Boolean).join(' ') || undefined,
  sources: [[`${headline}, by Brian Blair, The Republic`, R + path]],
  ...o,
});

export const BLAIR = [
  x({ slug: 'faith-ministries-new-shepherd', date: '2015-02-28', seen: false,
    headline: '‘The Lord prepares you’', path: '2015/02/28/the_lord_prepares_you/',
    title: 'A new shepherd at Faith Ministries',
    dek: 'When the founder of a small nondenominational church stepped down, his associate of seven years stepped up. Blair’s People of Faith profile of Rev. Tony McClendon.',
    body: [
      'Faith Ministries was 15 years old when Blair visited. The nondenominational Columbus church supported the Love Chapel food pantry and visited residents of GreenTree at Columbus, an assisted living home nearby.',
      'Its founder, Rev. Jarvis Cooper, had stepped down at the end of the previous year. The new part time pastor, Rev. Tony McClendon, 62, had been associate pastor for seven years. He also worked as diversity coordinator for Bartholomew Consolidated School Corp., held an economics degree from Dartmouth, grew up in Atlanta and had coached football at Central Middle School.',
      'McClendon told Blair the church wanted to love its neighbors, including people of other faiths, people with no faith and people of different sexual orientations, and to reach younger people on social media as well as on Sunday. “Christ is the shepherd of this church,” he said.',
      'His favorite verse was John 3:17. The profile was part of The Republic’s People of Faith series, which introduced readers to the people leading the county’s congregations.',
    ] }),

  x({ slug: 'not-representatives-of-islam', date: '2015-12-23', seen: false,
    headline: '‘These people are not representatives of Islam’', path: '2015/12/23/these_people_are_not_representatives_of_islam/',
    title: 'Columbus Muslims answer San Bernardino',
    dek: 'After the Paris and San Bernardino attacks, Blair went to the mosque on Chestnut Street. Members said the attackers did not speak for their faith, and neighbors came to listen.',
    body: [
      'In late 2015 the news was full of terror: 130 people killed in Paris on November 13, and 14 killed in San Bernardino, California, on December 2. Blair asked the Islamic Society of Columbus, Indiana, how its members were living with it.',
      'The society formed in January 2006 and had about 150 members from five continents and 25 nations, many working for companies such as Cummins. Its mosque at 2310 Chestnut Street opened its Friday noon prayers to visitors.',
      'Zulkifly Yusuf, a Malaysian native and former president of the society, led those prayers and was planning a public forum on Islam. “There is nothing in our religion and teaching that prescribes violence,” he told Blair. Hanna Omar, a spokesperson born in New York City, had just spoken to a religion class at IUPUC.',
      'Christians came too. Rev. Wayne Hanrattie, a retired Presbyterian minister, attended a Friday gathering to show support. Arleen Keele of First United Methodist had started a Sunday school class in 2011 that drew up to 60 people a week and led church groups to the mosque for questions and answers. The society told Blair there had been no local incidents of vandalism.',
    ] }),

  x({ slug: 'sandy-hook-at-125', date: '2017-09-23', seen: true, note: HAVEN,
    headline: 'One church, many friends', path: '2017/09/23/one_church_many_friends/',
    title: 'Sandy Hook at 125',
    dek: 'For the 125th anniversary of Sandy Hook United Methodist Church, Blair sat down with members whose family stories and church stories had become the same story.',
    body: [
      '“Personal history lives and breathes all around the octogenarian woman,” Blair began. The woman was Patty Nichalson, 86, a lifelong member of Sandy Hook United Methodist Church, and she could hardly tell her family’s history apart from her congregation’s.',
      'The church traces its start to 1892, when 12 charter members organized a United Brethren church in a Columbus living room. It moved to 17th Street in 1923 and, after two denominational mergers, to Taylor Road by caravan in 1972. In 1992 members buried a time capsule to open 25 years later, which brought them to the anniversary.',
      'Blair let the longtime members tell it. Nichalson said, “I am so glad to have been a part of this.” Clarice Joslin, 80, had attended since she was 2 and called the members her family.',
      'It is the kind of story a faith page exists for: no scandal and no controversy, just people who kept showing up for one another for 125 years.',
    ] }),

  x({ slug: 'gospel-goodbyes', date: '2017-12-30', seen: true,
    headline: 'Columbus missionary couple off to Appalachian outreach', path: '2017/12/30/people_of_faith_helping_the_least_of_these_b1_sat_faith_cover_centerpiece/',
    title: 'Gospel goodbyes',
    dek: 'George and Jodie Cockrell left their ministry work in Columbus to lead an outreach in Leslie County, Kentucky. Blair’s year end faith cover sent them off.',
    body: [
      'George Cockrell, 39, taught the Bible at Columbus Christian School and had been a street preacher. Jodie Cockrell, 40, was a lay counselor for women. Together they had worked with the college ministry Cru, hosted a weekly worship gathering in their home and spent summers at a camp in Bagdad, Kentucky.',
      'At the end of 2017 they told Blair they were leaving to lead Big Creek Missions 2 in Leslie County, in southeastern Kentucky near the Virginia line. The original Big Creek Missions, in Bear Branch, had long drawn money and volunteers from Bartholomew County churches.',
      'The plan was volunteer weeks in summer and over spring break: roofs, wheelchair ramps, help for local schools and sharing the Gospel. A trip cost $29 a person a day with meals and lodging, and the early goal was 50 volunteers a week for at least half the year.',
      '“Gospel goodbyes are never easy,” George Cockrell said. He also called Appalachia “our modern-day Samaria.”',
    ] }),

  x({ slug: 'thy-kingdom-come-in-columbus', date: '2020-09-26', seen: false, note: HAVEN,
    headline: 'People of Faith: New Sandy Hook pastor passionate as a teacher and equipper', path: '2020/09/26/people_of_faith_new_sandy_hook_pastor_passionate_as_a_teacher_and_equipper/',
    title: 'In Columbus as it is in heaven',
    dek: 'Paul Dazet came to Sandy Hook United Methodist from Muncie with damaged lungs, a stack of books and a new line in the Lord’s Prayer. Blair’s People of Faith profile.',
    body: [
      'Paul Dazet was 51 when he became pastor of Sandy Hook United Methodist Church, 1610 Taylor Road. He grew up in Cincinnati, was ordained in the Nazarene church and had been lead pastor of South Side Church of the Nazarene in Muncie. He left corporate training for ministry nearly 20 years before.',
      'Blair found a pastor shaped by illness. Treatment for lymphoma 12 years earlier had left Dazet’s lungs working at 53 percent, and he napped on Sunday afternoons after two services. He said his focus had moved from church growth to faithfulness. “We all suffer in some way,” he told Blair.',
      'He had read more than 200 books that year, favoring writers such as Henri Nouwen and Eugene Peterson. His theme was the kingdom of God, and he prayed the Lord’s Prayer with a local twist: “in Columbus as it is in heaven.”',
      'His daughter Rebecca Milne had just become pastor of Petersville United Methodist Church nearby.',
    ] }),

  x({ slug: 'st-bartholomew-comes-down', date: '2020-12-13', seen: false,
    headline: 'A service concluded: Vacant former Catholic church ends lengthy life of faith', path: '2020/12/13/a_service_concluded_vacant_former_catholic_church_ends_lengthy_life_of_faith/',
    title: 'A service concluded',
    dek: 'The old St. Bartholomew Catholic Church on Eighth Street held its first service in 1891 and came down in December 2020. Blair gathered the people who remembered it.',
    body: [
      'The Gothic Revival church at 845 Eighth Street had a 127 foot tower and a school beside it. Its first service was June 8, 1891, and it was dedicated in 1892 at a cost of $30,000. The parish left in 2002 for a new 900 seat church, taking the marble altar along. In December 2020, after 129 years, the old building was demolished for apartments.',
      'Blair wrote it as a farewell. Rev. Clem Davis, a former pastor, said, “It really is like a death.” Tom Lawler had married there in 1976 and later cared for the parish buildings. Jan Banister remembered a folk worship group called Giggin’ Fer God. Kevin Powell of Rubicon Development, the developer, said the structure was too far gone to save.',
      'Pieces of it went on. Stained glass went to the parish and a donor family, and some was kept for display. John Dorenbusch, who attended in the 1960s, offered the line that held it together: a faith community “is more important than its structure.”',
    ] }),

  x({ slug: 'north-christian-last-service', date: '2022-07-16', seen: false, landmark: 'northchristian',
    headline: '‘It’s bittersweet’: North Christian Church congregation hosts final worship service today', path: '2022/07/16/its-bittersweet-north-christian-church-congregation-hosts-final-worship-service-today/',
    title: 'Bittersweet at North Christian',
    dek: 'Founded in 1955 by 43 members who left First Christian, the congregation under Eero Saarinen’s spire held its last service in July 2022.',
    body: [
      'North Christian Church began in October 1955, when 43 members left First Christian downtown to start a congregation they hoped would be more open and ecumenical. In 1964 they moved into Eero Saarinen’s building on Tipton Lane, with its 192 foot spire.',
      'By 2022 the members were few. Nance Aurand-Humpf, chair of the board, joined in 2002 when about 115 people came each week. Attendance had fallen below 30, and in February the congregation voted to disband. “I think that we’ve all been grieving since February,” she told Blair.',
      'Rev. Lanny Lawler, pastor from 2004 to 2015, spoke at the last service. He counted the church’s 2014 decision to become open and affirming as the high point of his ministry. “But it’s always sad when a congregation closes its visible ministry,” he said.',
      'The public library was already considering the building. In 2024 the congregation gave it to the library, which named it The LEX, a story told elsewhere in this history.',
    ] }),

  x({ slug: 'second-baptist-plans-ahead', date: '2023-07-22', seen: false,
    headline: 'Columbus’ historic Second Baptist Church launching Phase 2 of renovation plan', path: '2023/07/22/columbus-historic-second-baptist-church-launching-phase-2-of-renovation-plan/',
    title: 'Second Baptist plans ahead',
    dek: 'A congregation that gave Black families in Columbus a church home just 14 years after slavery ended was fixing its roof and foundation, and opening its doors wider.',
    body: [
      'Second Baptist Church is 144 years old, Blair wrote, and began as a sanctuary for African Americans in Columbus when many white churches shut them out, 14 years after slavery ended.',
      'Pastor Larry Rowe had led it since 2005 and wanted it ready for the future. The first phase of repairs, a $30,000 heating and cooling system, was paid for. The second would replace a roof at least 20 years old, fix the foundation and resurface the parking lot. Member Roxanne Stallworth was chasing a grant.',
      'Sunday worship drew fewer than 20 people most weeks, but the church stayed busy: weekend tutoring, a summer Sidewalk Sunday School with First Christian, help for Love Chapel’s free meals, neighborhood watch meetings. Rowe said it was open to all.',
      'Richard McCoy of Landmark Columbus Foundation, which advised the church, was hopeful. “I think that Second Baptist is on a great path,” he said.',
    ] }),

  x({ slug: 'first-presbyterian-at-200', date: '2024-02-17', seen: false,
    headline: 'First Presbyterian prepping to celebrate its 200th anniversary throughout the year', path: '2024/02/17/first-presbyterian-prepping-to-celebrate-its-200th-anniversary-throughout-the-year/',
    title: 'First Presbyterian turns 200',
    dek: 'Chartered on July 3, 1824, and on Seventh Street since 1885, First Presbyterian marked its bicentennial by starting a fund to help people start small businesses.',
    body: [
      'First Presbyterian Church, 512 Seventh Street, received its charter on July 3, 1824. Blair previewed a year of celebration with Pastor Felipe Martinez, who wanted the anniversary to look ahead to the next 200 years as much as back.',
      'The congregation’s history is one of speaking up. Rev. William Laws and his wife, Ellen, were local voices for civil rights in the 1960s and 1970s, and member Sarah Hunt founded the Columbus Peace Fellowship. The church helped start Housing Partnerships and Turning Point Domestic Violence Services and supported Su Casa’s Latino outreach. “It’s very much a part of who we are,” Martinez said.',
      'For its birthday the church started the First Presbyterian Bicentennial Legacy Fund with The Heritage Fund and Lincoln-Central Neighborhood Family Center, offering small grants to help people who are struggling start a business.',
      'The year’s plans included history moments in Sunday services, an ice cream social in July and a celebration at Donner Park on September 15.',
    ] }),

  x({ slug: 'called-to-come-home', date: '2024-03-30', seen: false,
    headline: 'A native son ‘called to come home’', path: '2024/03/30/a-native-son-called-to-come-home-pastor-evan-guse-looks-to-the-future-of-an-older-congregation-seeking-new-growth/',
    title: 'Called to come home',
    dek: 'At 32, Evan Guse became the youngest senior pastor in the history of First Baptist Church, the Harry Weese landmark on Fairlawn Drive, in the town where he grew up.',
    body: [
      'Evan Guse grew up in Columbus and married his Columbus East sweetheart, Emma. After Purdue and Asbury Theological Seminary, hospital chaplaincy in Kentucky and a pastorate at Pierce Church in Upland, he came back in late 2023 to lead First Baptist Church, the Harry Weese building on Fairlawn Drive.',
      'He was 32, the youngest senior pastor in the church’s history, leading a congregation of about 150 on a Sunday where about 77 percent of members were over 60. Jeff Caldwell, who chaired the search committee, was not worried. “In my mind, Evan is actually an old soul, anyway,” he told Blair.',
      'Guse said he hoped to bring in young families while caring for the members who were already there. He pointed to three couples in the congregation with 175 years of marriage among them as wisdom he wanted younger people to see up close.',
      'He described the move in four words that gave Blair a headline: he was “called to come home.”',
    ] }),
];
