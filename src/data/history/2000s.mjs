// Columbus in the 2000s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';

const x = (o) => ({ checked: CHECKED, ...o });

export const A2000s = [
  x({ slug: 'four-landmarks-in-a-day', when: '2000', section: 'architecture', landmark: 'northchristian',
    title: 'Four national landmarks in one day',
    dek: 'On May 16, 2000, the federal government named four Columbus buildings National Historic Landmarks at once. Three more followed, for seven in all.',
    body: [
      'National Historic Landmarks are the buildings and places the federal government judges most important to American history. On a single day, May 16, 2000, four in Columbus joined the list, according to Wikipedia’s list of landmarks in Indiana.',
      'They were First Baptist Church, finished in 1965 to Harry Weese’s design; Irwin Union Bank and Trust, Eero Saarinen’s glass walled bank of 1954, which the list calls the first open bank of its kind; the Miller House, Saarinen’s house for J. Irwin Miller and his family, with a landscape by Dan Kiley; and North Christian Church, Saarinen’s six sided church of 1964 with its 192 foot spire.',
      '## Three more',
      'Less than a year later, on January 3, 2001, two more were added: First Christian Church, Eliel Saarinen’s church of 1942, which the list calls one of the earliest modern style churches in the United States, and Mabel McDowell Elementary School, John Carl Warnecke’s school of five one story buildings joined by courtyards and covered walks.',
      'The seventh came on October 16, 2012, when The Republic’s glass newspaper building by Myron Goldsmith of Skidmore, Owings and Merrill was designated. The list notes it is the youngest architectural National Historic Landmark ever named.',
      'That is seven landmarks in one small city, every one of them in Bartholomew County, and every one built after 1940. Several of them have their own stories in this series, from the day First Christian was dedicated to the day the Millers moved into their house.',
      'The landmarks did not freeze the buildings in place. The Miller House went to the Indianapolis Museum of Art and opened for tours in 2011. North Christian’s congregation disbanded in 2022, and the county library accepted the building in 2024 and renamed it The LEX in 2025. A landmark, it turns out, is a promise to take care of something, not a promise that nothing will change.',
    ],
    sources: [['List of National Historic Landmarks in Indiana, Wikipedia', WP + 'List_of_National_Historic_Landmarks_in_Indiana'], ['First Baptist Church (Columbus, Indiana), Wikipedia', WP + 'First_Baptist_Church_(Columbus,_Indiana)'], ['Miller House (Columbus, Indiana), Wikipedia', WP + 'Miller_House_(Columbus,_Indiana)'], ['North Christian Church, Wikipedia', WP + 'North_Christian_Church']] }),

  x({ slug: 'arvin-meritor-merger', when: '2000', section: 'industry',
    title: 'Arvin merges and leaves home',
    dek: 'In 2000 Arvin Industries, born in Columbus as Noblitt Sparks, merged with Meritor Automotive of Troy, Michigan. Seven years later a Columbus leader called it a disaster for the town.',
    body: [
      'For most of the century Columbus had two big homegrown manufacturers. One was Cummins. The other started as Noblitt Sparks Industries, which moved to Columbus in 1931 and later took the name of its Arvin brand, as earlier articles in this series tell. By the 1980s, The Christian Science Monitor reported, Arvin and Cummins were the city’s two Fortune 500 companies.',
      'In 2000 Arvin Industries merged with Meritor Automotive, based in Troy, Michigan. Meritor had been spun off from Rockwell International’s automotive business in 1997, Wikipedia records. The deal was called a “merger of equals,” and the new company was named ArvinMeritor. Its headquarters were in Troy.',
      '## A mistake, some said',
      'In February 2007 the Indianapolis Business Journal asked what the merger had meant. Citing The Republic, it reported that the deal pulled Arvin away from its focus on exhaust and suspension parts, and that the combined company had not matched Arvin’s profit margins before the merger. Arvin’s former chairman and chief executive, Bill Hunt, received $12.4 million in severance in 2001.',
      'Brooke Tuttle, who had led the Columbus Economic Development Board, did not mince words. “I believe the merger … was a mistake for Meritor and a disaster for both Arvin and Columbus,” Tuttle told the paper.',
      'The story has a twist ending. ArvinMeritor went back to the name Meritor in 2011. In February 2022 Cummins announced it would buy Meritor for $3.7 billion, and the purchase closed in August 2022, according to Wikipedia. The company that had carried Arvin’s business out of Columbus ended up owned by its old Columbus neighbor.',
    ],
    sources: [['Arvin merger a disaster, mistake, experts say, Indianapolis Business Journal (February 26, 2007)', 'https://www.ibj.com/articles/7757-arvin-merger-a-disaster-mistake-experts-say'], ['Meritor, Inc., Wikipedia', WP + 'Arvin_Industries'], ['The second wave: Small towns think Japan, The Christian Science Monitor (1987)', 'https://www.csmonitor.com/1987/0511/findy.html']] }),

  x({ slug: 'philharmonic-salute', when: '2000', section: 'culture',
    title: 'An orchestra plays at the memorial',
    dek: 'In 2000 the Columbus Indiana Philharmonic played its first Salute! concert at the Memorial for Veterans. The orchestra had come a long way from Columbus Pro Musica.',
    body: [
      'The orchestra began in 1970 as Columbus Pro Musica, incorporated to build community interest in music and to revive the Columbus Symphony Orchestra, according to its history on the Bach Cantatas site. In 1987 it hired a conductor named David Bowden as music director and became the Pro Musica Orchestra, with its first concert under him on September 19, 1987. In 1995 it took the name Columbus Indiana Philharmonic, because the old name confused people.',
      'Bowden told The Republic that J. Irwin Miller, who played a Stradivarius violin, shaped those early years. In 1988, after Bowden conducted a chamber concert at First Christian Church, Miller led a standing ovation. The next day he asked Bowden to commit to Columbus for ten years. “So I took some time (to think),” Bowden said. “And then I made a commitment.” The Republic later marked Bowden’s 30th season as music director, and called it the city’s first fully professional orchestra.',
      '## Salute!',
      'In 2000 the Philharmonic held the first Salute! concert over Memorial Day weekend, staged at the Bartholomew County Memorial for Veterans on the courthouse lawn, among the limestone pillars dedicated three years earlier.',
      'It built more than concerts. A Philharmonic Chorus began in 1987, Adventure Concerts for third and fourth graders in 1988, the Music for Youth Strings program in 1989 and a youth orchestra in 1993. In 1996 it recorded a CD for the Naxos label with the Aeolian Skinner organ at First Christian Church. In 2003 its office moved from The Commons to a 5,000 square foot building at 315 Franklin Street.',
      '“Mr. Miller had a profound influence on me,” Bowden said. Much of what the orchestra built, from the youth strings to the children’s choir, began in the ten years Bowden promised.',
    ],
    sources: [['Columbus Indiana Philharmonic, Bach Cantatas Website', 'https://bach-cantatas.com/Bio/CIP.htm'], ['Conductor embarks on 30th season with the Philharmonic, The Republic', 'https://www.therepublic.com/?p=360985']] }),

  x({ slug: 'st-bartholomew-new-church', when: '2002', section: 'faith',
    title: 'Two parishes, one new church',
    dek: 'On March 5, 2002, St. Bartholomew Catholic Church dedicated a new 900 seat church on 27th Street, uniting the old downtown parish with St. Columba and bringing the old altar and bell along.',
    body: [
      'St. Bartholomew is one of the oldest congregations in town. The Republic says the parish is nearly as old as Columbus and Bartholomew County, which were founded in 1821, and that it has run a Catholic school for more than 150 years. Its downtown church at 845 Eighth Street was built in 1891, held its first service on June 8, 1891, and was dedicated in 1892 at a cost of $30,000. It was Gothic Revival brick and limestone with a 127 foot tower.',
      'The parish joined with St. Columba Catholic Church, which had stood on 27th Street since 1963. Ricky Berkey’s 52 Weeks of Columbus project explains that the merged congregation chose the St. Columba site for its modern school and its room to grow.',
      '## The new church',
      'The new St. Bartholomew at 1306 27th Street was dedicated on March 5, 2002. RATIO Architects of Indianapolis won an invited design competition, with Steven Risting as design principal, and Dunlap and Company of Columbus built it. The sanctuary is shaped like a nautilus shell, with fan shaped seating around the altar, a wood ceiling and copper on the roof and spire. The bell tower was designed for three bells, but one hangs there: the bell that had hung in the downtown church since 1935.',
      'Other pieces came too. The marble altar, built in the 1970s from older side altars, was moved from Eighth Street, along with the Good Shepherd stained glass window. The Rev. Clem Davis locked the doors of the old church at its final service in 2002, The Republic recalled.',
      'The Republic later described St. Bartholomew as the county’s largest house of worship, with about 2,000 people at four weekly services and a Hispanic ministry of about 450 people at a weekly Spanish service. The old downtown church stood empty until it was torn down around 2020 for apartments, with some of its stained glass saved for display.',
    ],
    sources: [['Week 41: St. Bartholomew Catholic Church, 52 Weeks of Columbus, Indiana', 'https://52weeks.rickyberkey.org/2011/11/26/week-41/'], ['Story on the demolition of the old St. Bartholomew church, The Republic', 'https://www.therepublic.com/?p=417838'], ['Story on St. Bartholomew’s 175th anniversary, The Republic', 'https://www.therepublic.com/?p=360597']] }),

  x({ slug: 'north-cross-country', when: '2002', section: 'sports',
    title: 'The Bull Dogs learn to run',
    dek: 'On November 2, 2002, Columbus North won its first state cross country title. Under coach Rick Weinheimer, the boys added four more by 2011, and in 2009 the girls won too.',
    body: [
      'On November 2, 2002, in Bloomington, Columbus North won the Indiana boys cross country championship with 79 points, ahead of Carmel at 120, according to the IHSAA’s yearbook for that season. It was the school’s first state title in the sport. Christian Wagner finished second overall. The coach was Rick Weinheimer.',
      'North won again in 2003. Then, on a soggy Saturday at the end of October 2009, on the LaVern Gibson course in Terre Haute, the Bull Dogs scored 63 points, 68 ahead of Chesterton. Sophomore Andrew Diehn led them in ninth place. The IHSAA noted that Weinheimer coached both the boys and the girls, and that the Columbus North girls won their state title the same day.',
      '## A rare sweep',
      'That made 2009 only the eighth time, the IHSAA said, that one school had won both the boys and girls state cross country titles in the same year. The boys won again in 2010 and 2011, for five titles in ten seasons.',
      'The program kept going after Weinheimer. In 2020, The Republic reported, North won its sixth boys title under coach Danny Fisher, after a summer in which the spring track season had been canceled and the runners trained on their own. Senior Austin Pulkowski, who has autism, finished 16th. “Honestly, whenever I joined cross-country, I didn’t think we’d ever win the state championship,” Pulkowski said. The girls won again in 2021, and the boys in 2025, according to the IHSAA.',
      'Cross country is a quiet sport. There are no scoreboards on a 5,000 meter course. But by the IHSAA’s count, Columbus North teams have won the state title nine times since 2002.',
    ],
    sources: [['2002 Boys Cross Country State Finals yearbook, IHSAA', 'https://ihsaa.org/sites/default/files/documents/02BCCYearbook.pdf'], ['Columbus North, North Central sophomore win boys cross country titles, IHSAA (2009)', 'https://www.ihsaa.org/media/news/columbus-north-north-central-sophomore-win-boys-cross-country-titles'], ['North wins state cross-country title, The Republic', 'https://www.therepublic.com/?p=416228'], ['State Championship History, IHSAA', 'https://www.ihsaa.org/sites/default/files/documents/State%20Championship%20History.pdf']] }),

  x({ slug: 'atterbury-goes-back-to-war', when: '2003', section: 'service',
    title: 'Camp Atterbury goes back to war',
    dek: 'In 2003 the old World War II camp north of Columbus became a mobilization center for Iraq and Afghanistan. In ten years more than 175,000 people deployed through it.',
    body: [
      'Camp Atterbury was built in 1942 near Edinburgh, just north of Columbus, to train soldiers for World War II, as another article in this series tells. The Indiana National Guard says it trained hundreds of thousands of soldiers in that war and was refurbished to do it again for Korea. In 2003, in response to the September 11 attacks, with American troops headed to Iraq and Afghanistan, it was activated again, this time as a mobilization station for reserve and National Guard troops, according to the Army.',
      'It happened fast. By May 2003 more than 600 soldiers had been assigned or attached to the post to run mobilization. Ron Morris, deputy commander for mobilization operations, remembered the early days for the Army News Service: “it was a lot of chaos.”',
      '## Ten years',
      'By February 2013, the Army reported, more than 175,000 military and civilian personnel had deployed through Atterbury since 2003. The staff had grown to more than 1,300 soldiers and civilians, and the post had completed 740 improvement projects. Three years after activation it was named one of six “power generation platforms” in the country.',
      'In 2005 it took over Muscatatuck in North Vernon, the former Muscatatuck State Development Center, and opened the Joint Simulations Training and Exercise Center there. The post hosted big exercises, including NATO’s Bold Quest and U.S. Northern Command’s Vibrant Response.',
      'Its motto is “Preparamus,” or “We are ready.” For many soldiers from Indiana and beyond, Atterbury was the last stop before a deployment. Sixty years after the first troops trained there for World War II, the same ground was preparing soldiers for war again.',
    ],
    sources: [['Camp Atterbury JMTC marks 10 years of Soldier training, mobilization, U.S. Army (February 2013)', 'https://www.army.mil/article/95863/camp_atterbury_jmtc_marks_10_years_of_soldier_training_mobilization'], ['Historic Indiana military posts continue growth, stability, National Guard', 'https://www.nationalguard.mil/News/Article-View/Article/587586/historic-indiana-military-posts-continue-growth-stability']] }),

  x({ slug: 'j-irwin-miller-dies', when: '2004', section: 'civic',
    title: 'J. Irwin Miller, 1909 to 2004',
    dek: 'J. Irwin Miller died in Columbus on August 16, 2004, at 95. He built Cummins into a global company, marched for civil rights and paid for the architecture that made his town famous.',
    body: [
      'Joseph Irwin Miller was born in Columbus on May 26, 1909, and died there on August 16, 2004, at age 95, according to Wikipedia. Fleet Owner, reporting his death the next day, summed up his business life: he built Cummins “from a family business into a Fortune 500 company.”',
      'He graduated from Yale in 1931 and studied at Oxford until 1933, then joined Cummins in 1934. In World War II he served as a Navy officer aboard the carrier Langley and saw action in the Marshall Islands, Truk and New Guinea before he was called home to the company. Wikipedia dates his presidency from 1947 and Fleet Owner from 1945; he was chairman from 1951 to 1977. Fleet Owner reported that annual sales rose from $20 million in 1946 to more than $100 million within about a decade, and that by his death Cummins had more than 25,000 employees and over $6 billion in yearly sales.',
      '## Church and civil rights',
      'Miller was also a churchman. He helped establish the National Council of Churches in 1950 and was its first lay president, from 1960 to 1963. He chaired its Commission on Religion and Race, which pushed for civil rights laws; helped sponsor the 1963 March on Washington; and led church delegations to Presidents Kennedy and Johnson in support of what became the Civil Rights Act of 1964.',
      'At home, his Cummins Foundation began paying architects’ fees for public buildings in 1957. The result was a town of buildings by Eero Saarinen, I.M. Pei and many others. In 1991, Wikipedia notes, the American Institute of Architects ranked Columbus sixth among American cities for architecture.',
      'A Columbus resident named William Beaver wrote what may be the best epitaph: “Mr. Miller had the whole town as a monument.” His wife, Xenia, died in 2008.',
    ],
    sources: [['J. Irwin Miller, Wikipedia', WP + 'J._Irwin_Miller'], ['J. Irwin Miller, Cummins entrepreneur, dies at 95, Fleet Owner (August 17, 2004)', 'https://www.fleetowner.com/news/0817043'], ['Xenia Miller, Wikipedia', WP + 'Xenia_Miller']] }),

  x({ slug: 'columbus-learning-center', when: '2005', section: 'schools',
    title: 'One building for three colleges',
    dek: 'In the fall of 2005 IUPUC moved into the Columbus Learning Center, a glass spined building that joins its campus to Ivy Tech’s and shares one library.',
    body: [
      'The idea had money behind it early. According to the IUPUC bulletin, the Lilly Endowment gave a $5 million grant in 2000 for a Columbus Learning Center. The design went to Kohn Pedersen Fox of New York, with Kevin Kennon as design principal; Wikipedia notes that the project won a design award from the New York chapter of the American Institute of Architects in 2001, before it was built. In February 2003 the State Budget Committee released the state money the legislature had approved for construction.',
      'The building is about 130,000 square feet, according to Fink Roberts and Petrie, which worked on the project and lists it as completed in 2003. It sits between the existing Ivy Tech and IUPUC buildings and connects them with a curved, glass enclosed spine that works as an indoor street. Inside are high tech classrooms, a library, food service, an auditorium and offices.',
      '## Moving in',
      'The bulletin says the center has housed IUPUC’s faculty, staff and programs since the fall of 2005. Today its library serves students and staff of IU Columbus, Ivy Tech Community College and Purdue Polytechnic, and it is open to local residents too. The library describes the building as a community center for education, economic development and quality of life in Bartholomew and surrounding counties.',
      'It has art as well. In 2007 Dale Chihuly’s Sun Garden Panels in Suspended Circle was installed there, according to Wikipedia’s list of his works.',
      'The campus has changed names since. On July 1, 2024, IUPUC became Indiana University Columbus. The Learning Center still joins the colleges under one roof, not far from the old Air Force building the college moved into in 1971.',
    ],
    sources: [['IUPUC overview, Indiana University bulletin 2010 to 2012', 'https://bulletins.iu.edu/iupuc/2010-2012w/overview/index.shtml'], ['Columbus Learning Center, Fink Roberts and Petrie', 'https://frpinc.com/projects/columbus-learning-center/'], ['Kevin Kennon, Wikipedia', WP + 'Kevin_Kennon'], ['About the library, Indiana University Columbus', 'https://columbus.iu.edu/library/about.html'], ['List of works by Dale Chihuly, Wikipedia', WP + 'List_of_works_by_Dale_Chihuly'], ['Indiana University Columbus, Wikipedia', WP + 'Indiana_University_Columbus']] }),

  x({ slug: 'flood-of-2008', when: '2008', section: 'river',
    title: 'The day Haw Creek came through town',
    dek: 'On June 7, 2008, more than 10 inches of rain fell on the watersheds above Columbus. Haw Creek flooded the hospital, every patient was evacuated, and the town changed how it plans for water.',
    body: [
      'It had been a wet spring. On Saturday, June 7, 2008, after days of rain upstream, more than 10 inches fell on the watersheds that feed Bartholomew County, The Republic recalled fifteen years later. The first flash flood alert went out at 9:40 a.m. Within an hour the county’s emergency center took its first call for a water rescue. By mid afternoon Interstate 65 and US 31 were closed, and floodwaters had cut off nearly every road into and out of Columbus.',
      '“I don’t think any of us quite expected what we got. It was catastrophic,” emergency management director Shannon Cooke told the paper.',
      '## The hospital',
      'Haw Creek, the small stream that runs through the middle of town, was at the center of it; The Republic says its flooding was worse than federal flood maps had predicted. The U.S. Geological Survey notes that the flash flood hit central Columbus after heavy rain upstream. Columbus Regional Hospital lost power, and water filled its first floor. All 157 patients were evacuated, with help from the Indiana National Guard. Wikipedia puts the hospital’s damage at more than $180 million; the USGS cites $125 million. The hospital opened an interim emergency department in August and reopened on October 27, 2008.',
      'The Republic counted about 2,800 damaged homes, 15 percent of the buildings in Columbus, more than 70 damaged businesses, about 1,000 people in shelters, three deaths and more than $500 million in damage overall.',
      'The town rebuilt and planned. The city, the hospital and Cummins paid for a local study of the Haw Creek floodplain, and local floodplain rules were tightened. The county added stream gauges, for eight in all, and adopted a flood response plan in 2012. The hospital built a $4.7 million floodwall with 15 floodgates. Dave Lenart of the hospital’s operations staff called the flood “the worst of the worst,” the day people thought would never come.',
    ],
    sources: [['Hectic, fast-paced and chaotic: Officials recall 2008 flood, The Republic', 'https://www.therepublic.com/?p=572192'], ['June 2008 flooding in Columbus, IN, U.S. Geological Survey', 'https://www.usgs.gov/media/images/june-2008-flooding-columbus'], ['Columbus Regional Health, Wikipedia', WP + 'Columbus_Regional_Health']] }),

  x({ slug: 'irwin-union-fails', when: '2009', section: 'industry', landmark: 'irwin',
    title: 'The end of Irwin Union Bank',
    dek: 'On September 18, 2009, state regulators closed Irwin Union Bank and Trust, a Columbus bank founded in 1871. First Financial Bank of Ohio took over its deposits and branches.',
    body: [
      'Irwin Union was one of the oldest banks in Indiana. The Indianapolis Business Journal dated its founding to 1871, and for generations it was the Miller family’s bank, the one whose glass branch by Eero Saarinen became a National Historic Landmark.',
      'Its last years were hard. The IBJ reported that Irwin Financial had been declining for more than a year, largely because of steep losses on home equity loans, and had lost more than $450 million in six quarters. Chairman and chief executive Will Miller said in August 2009 that the company still expected help from the federal TARP program. Without it, the IBJ said, Irwin could not collect a $25 million pledge from Cummins or $9 million from other investors. An analyst told the paper Irwin had fallen through the cracks of a program not built for community banks.',
      '## September 18, 2009',
      'On Friday, September 18, 2009, the Indiana Department of Financial Institutions closed Irwin Union Bank and Trust, and the FDIC was named receiver. First Financial Bank of Hamilton, Ohio, took over all deposits, and the old Irwin Union branches reopened as First Financial branches. The IBJ reported that Irwin Union had $2.7 billion in assets and $2.1 billion in deposits, and that a second unit, Irwin Bank FSB, closed the same day. They were the 93rd and 94th federally insured banks to fail in 2009.',
      'Because First Financial took over every deposit account, customers kept their money. The FDIC’s receivership was finally closed on September 1, 2023.',
      'The analyst Mark Foster told the IBJ the loss would be felt in Columbus civic life, since Cummins and Irwin had long supplied the town’s leaders and the money behind its causes. The bank is gone, but its Saarinen building still stands on Washington Street.',
    ],
    sources: [['Irwin Union Bank and Trust Company, FDIC failed bank list', 'https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/irwin-in.html'], ['Unfinished federal bailout sealed Irwin’s failure, Indianapolis Business Journal (September 21, 2009)', 'https://www.ibj.com/articles/7164-unfinished-federal-bailout-sealed-irwin-s-failure'], ['List of National Historic Landmarks in Indiana, Wikipedia', WP + 'List_of_National_Historic_Landmarks_in_Indiana']] }),
];
