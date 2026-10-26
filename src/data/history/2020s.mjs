// Columbus in the 2020s, through October 2026. Each article is written only
// from the sources listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const HS = 'https://indianasentinels.hockeyshift.com/news/';

const x = (o) => ({ checked: CHECKED, ...o });

export const A2020s = [
  x({ slug: 'columbus-passes-fifty-thousand', when: '2020', section: 'civic',
    title: 'A city of fifty thousand',
    dek: 'The 2020 census counted 50,474 people in Columbus, five times the town of 1930. It also showed a city more connected to the rest of the world than ever.',
    body: [
      'When the 2020 census was counted, Columbus had 50,474 residents, according to Wikipedia. That made it the 20th largest city in Indiana. Ten years earlier the count had been 44,061.',
      'The long view is even more striking. At the 1930 census, where this history begins, Columbus had 9,935 people. The town grew in every census after that: past 18,000 by 1950, past 30,000 by 1980, and past 39,000 by 2000. In ninety years it multiplied about five times over.',
      '## Who lives here',
      'The 2020 count also showed how the town is changing. Wikipedia’s summary of the census records that the share of residents who are Asian rose from 5.6 percent in 2010 to 10.4 percent in 2020, and the share who are Hispanic or Latino rose from 5.8 percent to 9.6 percent.',
      'Those numbers have a history. As earlier articles in this series tell, Columbus began courting companies from Japan in the 1980s, and Site Selection magazine later counted 28 Japanese firms in Columbus employing more than 5,800 people, along with engineering firms from India and others from Europe and China. Cummins, headquartered downtown, does business around the world. Ethnic Expo, which began in 1984, now celebrates the traditions of more than 30 countries represented by Columbus residents, The Republic says.',
      'The town of 1930 was a county seat with a young diesel engine company. The city of 2020 was still a county seat, still home to that company, and now home to families from around the world.',
    ],
    sources: [['Columbus, Indiana, Wikipedia', WP + 'Columbus,_Indiana'], ['Around the world in 59 counties, Site Selection', 'https://siteselection.com/around-the-world-in-59-counties/'], ['Story on the 33rd Ethnic Expo, The Republic', 'https://www.therepublic.com/?p=351137']] }),

  x({ slug: 'atterbury-welcomes-afghans', when: '2021', section: 'service',
    title: 'Camp Atterbury takes in Afghan families',
    dek: 'From September 2021 to January 2022, Camp Atterbury housed 7,201 Afghan evacuees, evacuated after the Taliban took control of their country, on their way to new homes in 45 states.',
    body: [
      'In August 2021 the Taliban took control of Afghanistan, and the United States began evacuating tens of thousands of Afghans. The Department of Defense set up eight temporary sites across the country to receive them under Operation Allies Welcome. One of them was Camp Atterbury, the post north of Columbus that had trained soldiers since 1942.',
      'The first guests arrived on September 1, 2021, WRTV reported, and the Indiana National Guard reported more arrivals the next day. Atterbury could house about 2,500 people at a time. Task Force Atterbury, the Indiana National Guard and soldiers of the 1st Cavalry Division handled transportation, housing, medical screening and supplies. “I could not be more proud of our troops,” said Brig. Gen. Dale Lyles, Indiana’s adjutant general.',
      '## 7,201 guests',
      'By the time the operation closed in January 2022, WRTV reported, 7,201 guests had stayed at Atterbury before resettling in 45 states. They received 69,000 vaccinations and 60,000 COVID tests, and the post served at least 1.3 million meals. Indiana was among the top ten destinations for resettlement, with about 700 evacuees settling in the state.',
      'At the closing on January 24, 2022, with fewer than 15 guests left, the camp unveiled a mural called “August 15,” for the day the Taliban took control. Zainab Ahmadi, Fawzia Abdaly, Tiffany Black and 57 Afghan adults and children made it together. “I do deeply miss seeing these people every day,” Black said. Governor Eric Holcomb said the state’s response spoke “not just about our generosity, but our heart.”',
      'Atterbury was built to send people to war. For five months, it was where thousands of people coming out of one began new lives.',
    ],
    sources: [['Afghan evacuees arrive in Indiana, head to Camp Atterbury, U.S. Army (September 3, 2021)', 'https://www.army.mil/article/250010/afghan_evacuees_arrive_in_indiana_head_to_camp_atterbury'], ['Operation Allies Welcome closes at Camp Atterbury, mural unveiled, WRTV (January 2022)', 'https://wrtv.com/news/local-news/johnson-county/operation-allies-welcome-comes-closes-at-camp-atterbury-mural-unveiled']] }),

  x({ slug: 'sri-ganesh-mandir', when: '2022', section: 'faith',
    title: 'A temple of their own',
    dek: 'Hindu families in Columbus prayed in churches, schools and apartment clubhouses for decades. On August 28, 2022, about 1,000 people came to dedicate Sri Ganesh Mandir on Goeller Boulevard.',
    body: [
      'For a long time, Hindus in Columbus had nowhere of their own to worship. The Republic reported that in the 1980s they met for prayer at the Briarwood Apartments clubhouse, and that the nearest temple was in Louisville, about 75 miles away. Over the years they also worshiped in Christian churches and schools. A 1987 picnic at what was then Ceraland Park started them talking about a place of their own.',
      'By the 1990s, a past president of the Hindu Society of Southern Indiana recalled, 25 to 50 Hindu families in Columbus “had a dream.” In 2019, three years before the dedication, more than 1,000 people came to the groundbreaking for Sri Ganesh Mandir, a $1.2 million temple on Goeller Boulevard next to the Unitarian Universalist Congregation of Columbus. The Rev. Nic Cable, the Unitarian minister, said the temple would be part of a Columbus Interfaith Campus.',
      '## The dedication',
      'After a soft opening in April 2022, the temple was dedicated on Sunday, August 28, 2022, The Republic reported, and an estimated 1,000 people visited during the day. The 10,000 square foot building sits on two acres. Its name roughly means holy Ganesh’s temple, for the elephant headed god of intelligence, wisdom and prosperity.',
      '“This is indeed a big day,” said Algy Ramasamy, vice president of the society. Mayor Jim Lienhoop called it a “once in a lifetime opportunity” and compared it to the faith that had brought his own ancestors to start St. Peter’s Lutheran Church. At the groundbreaking he had called it a very American thing: people who came from far away for work, bringing their faith with them. Representative Greg Pence closed with a blessing for unity and harmony.',
      'Columbus has spent a century building beautiful places to worship. Now one more congregation has its own.',
    ],
    sources: [['New Hindu temple dedication brings together community to celebrate, The Republic (August 2022)', 'https://www.therepublic.com/?p=543919'], ['That dream is finally coming true, The Republic', 'https://www.therepublic.com/?p=399735']] }),

  x({ slug: 'north-christian-becomes-the-lex', when: '2022', section: 'architecture', landmark: 'northchristian',
    title: 'North Christian’s last service, and a new life',
    dek: 'The congregation that built Eero Saarinen’s last Columbus building held its final service on July 16, 2022. In 2024 it gave the church to the public library, which named it The LEX.',
    body: [
      'North Christian Church was born in 1955, when members left the Tabernacle Church of Christ, now First Christian, to start a new congregation, and it moved into Eero Saarinen’s six sided church with its 192 foot spire in 1964, as earlier articles in this series tell. The Cultural Landscape Foundation notes that it was Saarinen’s last building in Columbus, set on 13 acres of former cornfield in a landscape by Dan Kiley.',
      'Keeping a landmark is expensive. According to Wikipedia, the original air conditioning failed in 2017 and cost about $500,000 to rebuild. In 2018 Indiana Landmarks put the church on its list of the state’s 10 most endangered places. The Getty Foundation gave a $150,000 preservation grant in 2019. By early 2022, partly because of the pandemic, fewer than 30 people were attending.',
      '## A celebration of life',
      'On July 16, 2022, the congregation held a service it called a Celebration of Life and formally disbanded. The building closed, and Columbus Capital took over as caretaker.',
      'In 2023 former members offered the building to the Bartholomew County Public Library. On April 15, 2024, the library board voted to accept it as a gift for a new branch, and the Plan Commission approved the site plan that June. In August 2024 the cross was taken down from the spire and moved to Camp Bedford, and the spire was covered with a protective copper sheath. On April 8, 2025, the library board named the building The LEX, the Library of Experience, with plans to turn the sanctuary into a space for many kinds of events.',
      'A church that was built to gather people will keep doing that in a new way. The Cultural Landscape Foundation describes the building where Xenia and J. Irwin Miller once worshiped as a “community hub for lifelong learning and civic engagement.”',
    ],
    sources: [['North Christian Church, Wikipedia', WP + 'North_Christian_Church'], ['North Christian Church, Columbus, IN, The Cultural Landscape Foundation', 'https://www.tclf.org/lex-library-experience'], ['Xenia Miller, Wikipedia', WP + 'Xenia_Miller']] }),

  x({ slug: 'rumsey-leads-cummins', when: '2022', section: 'industry',
    title: 'A Columbus native takes the wheel at Cummins',
    dek: 'On August 1, 2022, Jennifer Rumsey, born and raised in Columbus, became the first woman to lead Cummins. Days later the company closed its $3.7 billion purchase of Meritor.',
    body: [
      'Cummins has had only a handful of chief executives in more than a century. On August 1, 2022, it got its seventh, and its first woman. FreightWaves reported that Jennifer Rumsey, then 48, was born and raised in Columbus, where Cummins has its headquarters. She studied at Purdue University and worked at a fuel cell startup before joining Cummins about 21 years earlier. She had been president and chief operating officer since March 2021.',
      'She succeeded Tom Linebarger, who stayed on as executive chairman. “She is a once in a generation talent,” Linebarger said. Rumsey said simply, “I am the right leader for Cummins at this time.”',
      '## Meritor comes home',
      'Her first big task was already in motion. In February 2022 Cummins had agreed to buy Meritor, the commercial vehicle parts maker based in Troy, Michigan. Meritor was the company that had merged with Columbus’s Arvin Industries in 2000 and carried Arvin’s business away from Columbus, as another article in this series tells. The purchase closed on August 3, 2022, according to Wikipedia, at a total value of about $3.7 billion, Cummins said.',
      '“We are excited to welcome Meritor’s employees into Cummins,” Rumsey said. Linebarger called it “an important step in executing on our strategy.”',
      'It is a neat bit of local history. Columbus’s two big homegrown manufacturers of the 20th century, Cummins and Arvin, ended up under one roof, and the person in charge of it grew up here.',
    ],
    sources: [['Rumsey succeeds Linebarger as CEO at Cummins, FreightWaves (July 14, 2022)', 'https://freightwaves.com/news/rumsey-succeeds-linebarger-as-ceo-at-cummins'], ['Cummins completes acquisition of Meritor, Cummins', 'https://selfscreening.cummins.com/de-eu/news/releases/2022/08/03/cummins-completes-acquisition-meritor'], ['Meritor, Inc., Wikipedia', WP + 'Arvin_Industries'], ['Arvin merger a disaster, mistake, experts say, Indianapolis Business Journal (2007)', 'https://www.ibj.com/articles/7757-arvin-merger-a-disaster-mistake-experts-say']] }),

  x({ slug: 'the-eclipse', when: '2024', section: 'river',
    title: 'Three and a half minutes of night',
    dek: 'On April 8, 2024, the moon covered the sun over Columbus for nearly four minutes. Schools moved a day off to keep the roads clear for the visitors.',
    body: [
      'On Monday, April 8, 2024, the path of a total solar eclipse crossed Indiana, and Columbus was inside it. According to NationalEclipse.com, totality in Columbus began at 3:05:57 in the afternoon and lasted 3 minutes and 44 seconds. The Republic, citing the Great American Eclipse, put it at about 3 minutes and 50 seconds. Times vary across a city, the site notes.',
      'The shadow raced across the state. NationalEclipse.com says the eclipse entered Indiana at the Wabash River, crossed about 183 miles of the state in 5 minutes and 24 seconds of shadow travel, and moved at an average of 2,038 miles an hour.',
      '## Planning for a crowd',
      'Totality in Columbus fell close to the end of the school day, and city and county officials worried that eclipse visitors could stop traffic. So the Bartholomew Consolidated School Corporation board moved a staff professional development day from March 28 to April 8, The Republic reported, giving students the day off.',
      '“It is something that people want to come and be part of,” Gina Pleak, the district’s assistant superintendent of human resources, told the paper. “And we’ll be welcoming many guests to our community on that day.”',
      'Weather is part of many Columbus stories, from the flood of 2008 on. This was a gentler one: a few minutes of darkness in the middle of an April afternoon, in a town known for looking at its buildings, with everyone looking up instead.',
    ],
    sources: [['2024 total solar eclipse in Indiana, NationalEclipse.com', 'https://nationaleclipse.com/states/2024-total-solar-eclipse-indiana.html'], ['BCSC approves calendar change for solar eclipse, The Republic', 'https://www.therepublic.com/?p=567638']] }),

  x({ slug: 'iu-columbus', when: '2024', section: 'schools',
    title: 'IUPUC becomes IU Columbus',
    dek: 'On July 1, 2024, the split of IUPUI turned the Columbus campus into Indiana University Columbus, ending more than fifty years of a shared IU and Purdue name.',
    body: [
      'College classes came to Columbus in 1970 as an extension of Indiana University Purdue University Indianapolis. The campus moved into an old Air Force building at the airport in 1971, took the name IUPUC in 1994, and in 2005 moved into the Columbus Learning Center, as earlier articles in this series tell.',
      'Then the parent changed. On August 12, 2022, according to Wikipedia, the IU and Purdue boards announced that IUPUI would be split into two universities. The split took effect on July 1, 2024. In Columbus, IUPUC became Indiana University Columbus, and Purdue’s programs there withdrew. Purdue’s Polytechnic Institute keeps a separate Columbus campus, run from West Lafayette.',
      '## The campus today',
      'Wikipedia counted 1,051 students at IU Columbus in the fall of 2022. The campus history counts more than 250 faculty and staff and an average class size of 15. Its teams compete in the NAIA’s River States Conference. The Columbus Learning Center library still serves students of IU Columbus, Ivy Tech Community College and Purdue Polytechnic, and is open to the public.',
      'The campus has had a steady line of leaders. Dr. Reinhold Hill has served as vice chancellor and dean since 2016, according to the campus history, following Dr. Marwan Wafa, who led it from 2009 to 2015.',
      'The new name is simpler, and in a town that cares about names, it matters. IU Columbus also became a partner of the city’s new professional hockey team, the Indiana Sentinels, the team announced. Fifty four years after the first classes, Columbus has a university with its own name on the door.',
    ],
    sources: [['Indiana University Columbus, Wikipedia', WP + 'Indiana_University_Columbus'], ['IU Columbus history, Indiana University Columbus', 'https://columbus.iu.edu/about/history/index.html'], ['About the library, Indiana University Columbus', 'https://columbus.iu.edu/library/about.html'], ['IU Columbus partners with Indiana Sentinels, Indiana Sentinels', HS + 'iu-columbus-partners-with-indiana-sentinels-to-str']] }),

  x({ slug: 'indiana-sentinels', when: '2025', section: 'sports',
    title: 'Professional hockey comes to The Ham',
    dek: 'In May 2025 the Federal Prospects Hockey League announced the Indiana Sentinels, a minor pro team for Columbus. They play at a rink Harry Weese designed in 1958.',
    body: [
      'Columbus got its own professional hockey team in 2025. The Indiana Sentinels play in the Federal Prospects Hockey League, a Single A minor professional league, and the league’s announcement came in May 2025, according to Wikipedia’s article on their arena.',
      'Their home is the Hamilton Community Center and Ice Arena at Lincoln Park, which the team calls “The Ham.” It has its own architecture story, as almost everything in Columbus does. Harry Weese, the architect of First Baptist Church, designed it as an outdoor rink in 1958. It was enclosed in 1975, the city owns it, and it seats 1,150, Wikipedia says. The team plans to move to a newer, larger arena within a few years.',
      '## Year two',
      'The Sentinels played their first season in 2025 to 2026. Their second season is 56 games, 28 at home, with Everett Thompson coaching, WISH TV and the league report. It began at The Ham on October 9 and 10, 2026, with two wins over the Minnesota Northern Lights, 4 to 2 and 5 to 2, according to the league’s results.',
      'The team has tied itself to the town. IU Columbus became a partner, the team announced. The arena still runs public skating and youth programs on the days the Sentinels are not playing, Mojo 102.9 reported.',
      'A city of 50,000 with its own pro hockey team, playing in a rink by one of the architects who made Columbus famous: it is a very Columbus way to spend a Friday night in winter. This site keeps the season’s schedule and scores on its sports page.',
    ],
    sources: [['Hamilton Community Center and Ice Arena, Wikipedia', WP + 'Hamilton_Community_Center_%26_Ice_Arena'], ['IU Columbus partners with Indiana Sentinels, Indiana Sentinels', HS + 'iu-columbus-partners-with-indiana-sentinels-to-str'], ['2026 to 2027 Sentinels season opener announced, Indiana Sentinels', HS + '2026-2027-sentinels-season-opener-announced'], ['Indiana Sentinels ready for year two, WISH TV', 'https://www.wishtv.com/news/indiana-sentinels-ready-for-year-two/'], ['Indiana Sentinels schedule and results, OurSports Central', 'https://www.oursportscentral.com/services/schedule/indiana-sentinels/t-4765'], ['Indiana Sentinels return for second season at Hamilton Center, Mojo 102.9', 'https://www.mojo1029.com/news/latest-news-test/indiana-sentinels-return-for-second-season-at-hamilton-center-in-columbus/']] }),

  x({ slug: 'yes-and', when: '2025', section: 'culture',
    title: 'Yes, and',
    dek: 'Exhibit Columbus’s 2025 exhibition, Yes And, filled downtown with 13 installations from August to November. Its organizers called it the most successful yet, and several pieces are staying.',
    body: [
      'Every two years since 2017, Exhibit Columbus has filled the city with temporary architecture, as an earlier article in this series tells. Its 2025 exhibition was called Yes And. It opened on August 15 and 16, 2025, and ran until Sunday, November 30, with 13 outdoor installations across downtown, according to the Landmark Columbus Foundation.',
      'A team of curatorial partners shaped the theme; the foundation names Could Be Design, Mila Lipinski, Rasul Mowatt, Preservation Futures and Too Black among them. Four teams won the J. Irwin and Xenia S. Miller Prize and built at sites around downtown: AD-WO’s Ellipsis at the former Irwin Block building, Adaptive Operations’ Accessing Nostalgia at the Crump Theatre, Studio Cooke John’s Lift in the courtyard of First Christian Church and Studio Barnes’ Joy Riding at the Jackson Street parking garage.',
      '## What stays',
      'Temporary does not always mean gone. The foundation says Apart, Together, by Michael Jefferson and Suzanne Lettieri, will stay as a permanent part of the downtown plaza where it was built. Ellipsis stays at the Irwin Block until the property is redeveloped. Accessing Nostalgia continues as an outdoor gathering space at the Crump. Lift is to be reinstalled at Columbus Youth Camp, and Inside Out moves to the Visitors Center. Students at the Columbus Area Career Connection are refinishing PUBLIC/SCHOOL/GROUNDS for indoor play.',
      'The opening weekend drew record crowds, the foundation reported, and thousands of residents and visitors toured the installations. “This was our most successful cycle of Exhibit Columbus,” said Richard McCoy, the foundation’s executive director.',
      'The name fits the town. For seventy years Columbus has said yes to new buildings and then asked what else. Some of the answers from 2025 are still standing.',
    ],
    sources: [['Yes And, celebrated as the most successful to date, Landmark Columbus Foundation (December 2025)', 'https://landmarkcolumbusfoundation.org/news/yes-and-celebrated-as-the-most-successful-to-date-for-its-ability-to-create-shared-civic-experiences-and-lasting-value'], ['Exhibit Columbus, Wikipedia', WP + 'Exhibit_Columbus'], ['Landmark Columbus Foundation, Wikipedia', WP + 'Landmark_Columbus_Foundation']] }),

  x({ slug: 'the-republic-new-owners', when: '2026', section: 'media',
    title: 'The Republic starts a new chapter',
    dek: 'In August 2026 HD Media of West Virginia agreed to buy The Republic and five other Indiana papers. The town’s paper of record turned 154 under its third owner.',
    body: [
      'The Republic has been publishing since April 4, 1872. For 143 years the Brown family owned it, through six generations, and in November 2015 it was sold to AIM Media Indiana, as another article in this series tells.',
      'In August 2026 the paper changed hands again. Editor and Publisher reported on August 19, 2026, that HD Media would buy 25 publications from AIM Media Management, including six in Indiana: The Republic in Columbus, the Daily Journal in Franklin, the Daily Reporter in Greenfield, The Tribune in Seymour, the Brown County Democrat in Nashville and The Times-Post in Pendleton. HD Media, based in Charleston, West Virginia, already ran 10 papers in West Virginia and Ohio. The new owners were to take over on September 1, 2026.',
      '## Believers in local papers',
      'HD Media’s managing partner, Doug Reynolds, explained the purchase in one line: “We’re buying them because we believe community newspapers have a future.” Phil Perry is the company’s president.',
      'For 154 years The Republic has covered the school boards, city councils, high school games and church anniversaries of Columbus, and many of the articles in this history lean on its reporting.',
      'Its new owners have said they believe in that work. That is good news for anyone who cares about local news in Bartholomew County, and we wish the paper and its staff well in the new chapter.',
    ],
    sources: [['HD Media to acquire 25 publications from AIM Media Management, Editor and Publisher (August 19, 2026)', 'https://www.editorandpublisher.com/stories/hd-media-to-acquire-25-publications-from-aim-media-management,263132'], ['The Republic (Columbus, Indiana), Wikipedia', WP + 'The_Republic_(Columbus,_Indiana)'], ['Sale of Home News publications closes six generation ownership by Brown family, The Republic', 'https://www.therepublic.com/?p=350633']] }),
];
