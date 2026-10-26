// Columbus in the 1950s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const CRH_100 = ['Tracing 100 years of history for Columbus Regional Hospital, The Republic', 'https://www.therepublic.com/?p=366731'];
const PHIL = ['How 70 years of design philanthropy transformed a Midwestern city, The Chronicle of Philanthropy', 'https://www.philanthropy.com/news/how-70-years-of-design-philanthropy-transformed-a-midwestern-city/'];

const x = (o) => ({ checked: CHECKED, ...o });

export const A1950s = [
  x({ slug: 'columbus-drive-in-opens', when: '1950', section: 'culture',
    title: 'Movies under the stars on Indianapolis Road',
    dek: 'On a summer evening in 1950, the Columbus Drive-In switched on its screen a mile north of town. It ran for 42 years.',
    body: [
      'The Columbus Drive-In opened on Thursday, August 3, 1950, at 7 p.m. A local history site, Historic Columbus Indiana, places it one mile north of town on what was then Highway 31A and is now Indianapolis Road, also State Road 11. Cinema Treasures, a national theater database, lists its address as 3800 Indianapolis Road, with room for 500 cars in front of a single screen.',
      'Cinema Treasures records the opening feature as “So Dear to My Heart,” the Walt Disney film starring Burl Ives. The drive-in was run by Trueman T. Rembusch’s Syndicate Theatres, part of the same family business that ran the Crump downtown. Historic Columbus Indiana says the Rembusch family owned the drive-in and the other movie theaters in Columbus.',
      'At first the drive-in opened only on warm weekends. By 1956, the same history says, it was operating year round, and on busy nights cars were sometimes turned away when the lot filled. Cinema Treasures also holds a 1957 photograph of a Sunday morning church service held on the lot.',
      'One commenter on Cinema Treasures, Rick Thompson, wrote in 2017 that his father managed the drive-in along with the Crump and Rio theaters.',
      'The Columbus Drive-In closed after 42 years. In 1992 the owners sold the property and the screen came down. Commenters on Cinema Treasures say the site is now a large pond with Omega Drive circling it.',
      'For 42 summers, it was part of growing up in Columbus.',
    ],
    sources: [['Columbus Drive-In, Cinema Treasures', 'https://www.cinematreasures.org/theaters/48928'], ['History of the Columbus Drive In, Historic Columbus Indiana', 'https://www.historiccolumbusindiana.org/drivein/drivein.html']] }),

  x({ slug: 'korea-brings-soldiers-back', when: '1950', section: 'service',
    title: 'Korea fills the camp and the air base again',
    dek: 'Four years after the Army shut down Camp Atterbury, the Korean War brought it back. The reserve airmen at the base north of town were called up too.',
    body: [
      'When World War II ended, Columbus’s two military neighbors went quiet. The Army suspended operations at Camp Atterbury on August 4, 1946, and the Indiana National Guard made it a headquarters. The air field north of Columbus was deactivated and closed.',
      'The air field came back first. According to the city’s airport history, the Air Force tasked a reserve training center from Stout Field in Indianapolis with reopening it in 1948. Work was finished in June 1949, and the 434th Troop Carrier Wing began training there.',
      'Then war broke out in Korea in June 1950. On September 14, 1950, Camp Atterbury was reactivated when the 28th Infantry Division arrived to train.',
      'The 434th was called to active duty too. The airport history says it trained at Atterbury, moved to Lawson Air Force Base in Georgia, and served 21 months before returning to reserve status in Indiana. Wikipedia’s history of the airport lists the wing at the base from 1949 to 1952 and again from 1953 to 1969. The Indiana Historical Bureau marker at the old base chapel notes that, as in World War II, the field received wounded soldiers during the Korean War.',
      'On November 13, 1954, the air field was renamed Bakalar Air Force Base, honoring First Lieutenant John Edmond Bakalar of Hammond, Indiana, who was killed in action over France on September 1, 1944. Air Force reservists kept training there until the late 1960s.',
      'The base closed in 1970 and was given to the City of Columbus in 1972, according to the marker. It became Columbus Municipal Airport. Camp Atterbury remains a National Guard training post.',
    ],
    sources: [['Camp Atterbury, Wikipedia', WP + 'Camp_Atterbury'], ['Airport history, City of Columbus', 'https://www.columbus.in.gov/airport/about/history'], ['Columbus Municipal Airport (Indiana), Wikipedia', WP + 'Columbus_Municipal_Airport_(Indiana)'], ['Atterbury Army Air Field historical marker, Indiana Historical Bureau', 'https://www.in.gov/history/markers/528.htm']] }),

  x({ slug: 'a-diesel-on-the-pole', when: '1952', section: 'sports',
    title: 'A diesel on the pole at Indianapolis',
    dek: 'In 1952 a turbocharged Cummins Diesel Special qualified first for the Indianapolis 500. No diesel has done it since.',
    body: [
      'Cummins had first taken a diesel to the Indianapolis 500 in 1931, when Dave Evans drove all 500 miles without a pit stop and finished 13th. The company came back in 1934 with two cars, and a history of the Cummins racers on Old Machine Press says the two stroke car driven by Stubby Stubblefield finished 12th, the best finish a diesel ever had at Indianapolis. A 1950 entry, nicknamed the Green Hornet, was the slowest qualifier and dropped out on lap 52.',
      'The 1952 car was different. Car No. 28, the Cummins Diesel Special, carried a turbocharged diesel, with up to 20 pounds of boost. Old Machine Press calls the turbocharger a first at Indianapolis.',
      'Freddie Agabashian drove it, and he put it on the pole. He set a one lap qualifying record of 139.104 miles an hour and a four lap record of 138.010. The one lap mark did not last long, since two cars later qualified faster, but the pole position stood. Transport Topics, the trucking industry newspaper, has called it the only diesel powered car ever to take the pole at the 500.',
      'The race did not go as well. Rubber debris from the track built up and clogged the turbocharger intake. Agabashian was running fifth when the car retired on lap 71, credited with 27th place.',
      'Old Machine Press reports that it was the last diesel to race in the Indianapolis 500; the rules changed soon afterward.',
      'The car itself stayed with the company. Transport Topics reports that it spent most of the next three decades on display at Cummins headquarters in Columbus. Volunteers led by Bruce Watson, the company’s retired curator of historical artifacts, restored it, and in May 2016 it was started for the first time in 17 years.',
    ],
    sources: [['Cummins Diesel Indy 500 Racers, Old Machine Press (2019)', 'https://oldmachinepress.com/2019/01/20/cummins-diesel-indy-500-racers/'], ['Cummins Starts Up History With 1952 Indy Car, Transport Topics (2016)', 'https://www.ttnews.com/articles/cummins-starts-history-1952-indy-car']] }),

  x({ slug: 'county-hospital-grows', when: '1953', section: 'civic',
    title: 'The county hospital keeps adding wings',
    dek: 'Bartholomew County Hospital opened with 32 beds in 1917. As Columbus grew after the war, the county kept building on.',
    body: [
      'Bartholomew County Hospital opened in 1917 as a three story building with 32 beds and 25 employees. The first patients were admitted on February 6, according to a 100 year history published by The Republic. In 1930 the Hattie S. Kirkpatrick Memorial Nurses Home was set up on the northwest side to house the nursing staff.',
      'Then the town started to grow. Columbus counted 11,738 people in the 1940 census and 18,370 in 1950, an increase of more than half in ten years. The hospital grew with it.',
      'A south wing in 1945 raised capacity to 75 beds. In 1949 the county commissioners approved a $780,000 expansion that brought the hospital to 129 beds. In 1953 a $1.7 million project added two three story wings and raised the count to 142. In 1959 another 39 beds were added, along with remodeling of the second floor and the emergency room, at a cost of $911,000.',
      'Wikipedia notes one birth in that era that later made national news: Mike Pence, who would become governor of Indiana and vice president of the United States, was born at Bartholomew County Hospital on June 7, 1959.',
      'The building kept changing. In 1968, $3.7 million in bonds paid for the five story, 108 bed Murphy Pavilion, named for administrator Olive Murphy. The hospital was renamed Columbus Regional Hospital in 1992. In June 2008 a record flood closed it for months, and the system that runs it took the name Columbus Regional Health in 2011.',
      'In the 1950s, though, the story was simpler. A growing factory town needed more hospital beds, and the county kept pouring concrete to provide them.',
    ],
    sources: [CRH_100, ['Columbus Regional Health, Wikipedia', WP + 'Columbus_Regional_Health'], ['Columbus, Indiana (census figures), Wikipedia', WP + 'Columbus,_Indiana']] }),

  x({ slug: 'memorial-gym', when: '1954', section: 'sports',
    title: 'Nearly $1 million in two weeks for a gym',
    dek: 'In December 1952 Columbus set out to build a new gym for its high school with no government money and no professional fundraisers. It opened in 1954 with more than 7,000 seats.',
    body: [
      'Indiana in the 1950s was in the middle of what everyone called Hoosier Hysteria, and towns all over the state were building big gyms for high school basketball. Columbus wanted one too.',
      'Stadium Journey, which reviews sports venues, tells the story of how it was paid for. In December 1952, Columbus began raising money for a new physical education building for its high school, without outside organizations, professional fundraisers or government aid. Within two weeks, nearly $1 million had been pledged, more than half of it in cash. In the words Stadium Journey quotes, “a total of 6,952 individuals, firms, and civic organizations” responded.',
      'The building used 173,000 face bricks and 50,000 other masonry units, steel roof trusses and 116 tons of reinforcing steel in its concrete bleachers. Its stage door is a folding door 72 feet long and 24 feet high.',
      'Columbus Memorial Gymnasium was dedicated on November 23, 1954, with 7,046 unobstructed seats. Its arrival brought the high school basketball sectional and regional back to Columbus for the first time since 1926.',
      'Visit Indiana, the state tourism office, lists the gym on its trail of historic Indiana basketball venues. It is now home to the Columbus North High School Bulldogs. The original playing floor lasted 60 years and was not replaced until 2014, and the listed capacity today is 6,547.',
      'Plenty of Indiana towns built big gyms in the 1950s. Few can say that nearly 7,000 people and businesses chipped in to build theirs in two weeks.',
    ],
    sources: [['Columbus Memorial Gymnasium, Stadium Journey', 'https://stadiumjourney.com/stadiums/columbus-memorial-gymnasium-columbus-north-hs-bulldogs'], ['Columbus Memorial Gymnasium, Visit Indiana basketball trail', 'https://www.visitindiana.com/basketball/locations/columbus-memorial-gymnasium/']] }),

  x({ slug: 'irwin-union-bank-opens', when: '1955', section: 'architecture', landmark: 'irwin',
    title: 'A bank with no bars',
    dek: 'In March 1955 the Irwin family’s bank moved into a glass pavilion by Eero Saarinen, with no teller cages and nine shallow domes on the roof.',
    body: [
      'Most banks in 1950 were built to look like vaults: heavy stone, small windows, tellers behind bars. J. Irwin Miller wanted the opposite. According to Wikipedia, he commissioned Eero Saarinen in 1950, the bank acquired the site in 1951, and construction began in 1953, with most of the work done in 1954.',
      'Saarinen designed a one story banking hall walled in glass, with a concrete roof set with nine small domes, and a small three story office wing. The hall is one open room. Instead of barred teller windows, the counters had movable plastic hoods. Landscape architect Dan Kiley planted the grounds with littleleaf linden trees.',
      'The bank moved in on March 9, 1955, and opened the next day. The bank’s own timeline, held by the Bartholomew County Public Library archives, records the Eero Saarinen designed office opening that March, a year after the institution took the name Irwin Union Bank and Trust Company. Architectural Forum called it “a building that belongs to its time and to the people of Columbus.”',
      'The bank grew around it. In 1973 Kevin Roche and John Dinkeloo finished a three story office annex. The building was named a National Historic Landmark in 2000.',
      'The bank did not survive. In September 2009 Irwin Financial went into receivership and First Financial Bank took over Irwin Union’s deposits. Cummins bought the building in October 2010 for $5.25 million and used it as offices. Wikipedia reports that it was fully vacant by October 2022, and that in 2024 Cummins put it up for sale, with Toyota Material Handling in talks to buy it.',
      'The domes are still there on Washington Street, and so is the glass. In 1955 it was the first time many people in Columbus had walked into a bank and seen straight through it.',
    ],
    sources: [['Irwin Union Bank and Trust, Wikipedia', WP + 'Irwin_Union_Bank_and_Trust'], ['Timeline history of Irwin Union Bank, Bartholomew County Public Library archives', 'https://bcplarchives.omeka.net/items/show/159']] }),

  x({ slug: 'north-christian-congregation-founded', when: '1955', section: 'faith', landmark: 'northchristian',
    title: 'Forty three members start a new church',
    dek: 'In April 1955 a group from First Christian Church met in a living room to start a new congregation. One reason, Wikipedia says, was that women could not hold leadership roles where they came from.',
    body: [
      'North Christian Church is famous for its building, the hexagon with a copper spire that Eero Saarinen designed. The congregation came first, and it began with a disagreement.',
      'On April 24, 1955, 43 former members of the downtown Tabernacle Church of Christ, soon to be renamed First Christian Church, held their first meeting in a house. Wikipedia’s history says they had left over disagreements, particularly the church’s refusal to let women hold leadership roles. Among the founding members, according to Xenia Miller’s biography, were J. Irwin and Xenia Miller, whose family had been at the center of First Christian’s new building only 13 years earlier.',
      'The new church needed a place to meet. In October 1955 it acquired the George Caldwell mansion on 25th Street as a temporary home and moved in that February. In May 1956 James L. Stoner became its first full time pastor. On March 18, 1958, with help from J. Irwin Miller, the church completed the purchase of land on the north side of town.',
      'In January 1959 the building committee interviewed Eero Saarinen, and in February it hired him. Saarinen wrote in July 1961 that “we have finally solved the Columbus church,” and died that September. His associate Kevin Roche finished the project. The building was dedicated on April 19, 1964.',
      'The congregation lasted 67 years. It disbanded after a “Celebration of Life” service on July 16, 2022. In 2024 the Bartholomew County Public Library board accepted the building as a gift, and in 2025 the library renamed it The LEX, the Library of Experience.',
      'Long before it was a landmark, North Christian was a small group of people who wanted a church where everyone could lead. That is how it started.',
    ],
    sources: [['North Christian Church, Wikipedia', WP + 'North_Christian_Church'], ['Xenia Miller, Wikipedia', WP + 'Xenia_Miller'], ['First Christian Church (Columbus, Indiana), Wikipedia', WP + 'First_Christian_Church_(Columbus,_Indiana)']] }),

  x({ slug: 'cummins-goes-global', when: '1956', section: 'industry',
    title: 'Clessie steps down and Cummins goes abroad',
    dek: 'In the mid 1950s Cummins sales passed $100 million, its founder retired, and the company opened its first factory overseas, in Scotland.',
    body: [
      'By the middle of the 1950s Cummins Engine Company had come a long way from its money losing early years. Company histories say sales reached $20 million in 1946 and topped $100 million about a decade later.',
      'The company had a new kind of engine to sell. In 1952, a company history says, Cummins unveiled a turbocharged diesel that raised horsepower by 50 percent without burning more fuel. The same idea had been tested at the Indianapolis 500 that year.',
      'Then the founder left. In 1955 Clessie Cummins retired as chairman of the company he had started in 1919. Wikipedia’s biography says he formed Cummins Enterprises Company later that year and went to work with the Allison Engine Company in California. He kept inventing. A compression release engine brake he patented went on sale in 1960 under the Jake Brake name, from Jacobs Vehicle Systems. He died on August 17, 1968, at 79.',
      'With Clessie gone, the company looked outward. In 1956, according to a Cummins history published by Visit Columbus, Cummins opened a manufacturing plant in Scotland. By the 1960s, the same history says, Cummins had a presence in 98 countries.',
      'That growth paid for a great deal back home. In 1954 J. Irwin Miller had set up the Cummins Foundation, and in 1957 it would make its first architectural grant. The money that built Columbus’s modern schools came from engines sold all over the world.',
    ],
    sources: [['Clessie Cummins, Wikipedia', WP + 'Clessie_Cummins'], ['A Quick History of Cummins, Visit Columbus Indiana', 'https://columbus.in.us/cummins-history/'], ['Cummins Engine Company, Inc. (company history), Encyclopedia.com', 'https://www.encyclopedia.com/books/politics-and-business-magazines/cummins-engine-company-inc']] }),

  x({ slug: 'lillian-schmitt-school', when: '1957', section: 'schools',
    title: 'The first school the foundation paid for',
    dek: 'Lillian C. Schmitt Elementary, by Harry Weese, opened in 1957. It was the first building in the Cummins Foundation’s offer to pay architects’ fees, and it is still a school.',
    body: [
      'In the 1950s Columbus needed new schools. The Chronicle of Philanthropy, writing about 70 years of the program, says J. Irwin Miller wanted good schools partly to attract engineering talent to Cummins, and came up with what Miller’s son Will called “a response to a community problem with a creative solution in the moment.”',
      'Here is how it worked. The Cummins Foundation, set up in 1954, offered to pay the design fees for new public buildings, starting with schools, as long as the architect came from a list the foundation provided. The school board chose from the list. The school’s own history says the Cummins Foundation paid the design fees and that the board picked the architect from Cummins’s list.',
      'The first grant went to Lillian C. Schmitt Elementary School, completed in 1957. Its architect was Harry Weese, working closely with Brewster Adams. The school is named for Lillian C. Schmitt, who taught in the Columbus school system for 43 years.',
      'Weese became something like the town’s house architect. The Chronicle of Philanthropy counts 14 of his buildings in Columbus, and Visit Columbus quotes historian Robert Bruegmann: “He was treated like a lion in Columbus.” Weese himself described Miller’s care not to dictate the outcome in an oral history quoted by the Chronicle: “Irwin knew he had so much influence that he always wanted to protect himself from exerting it.” After presenting a few names, the foundation stepped back and let the community decide.',
      'The program spread from schools to fire stations, libraries, public housing, a golf course and the county jail. The Chronicle puts the total investment at “just north of $20 million.” It is still going, nearly 70 years after Schmitt opened.',
      'And Schmitt is still a school, which may be the best compliment a school building can get.',
    ],
    sources: [PHIL, ['School information, Lillian C. Schmitt Elementary (BCSC)', 'https://schmitt.bcscschools.org/about/school-information'], ['The Harry Weese Legacy in Columbus, Visit Columbus Indiana', 'https://columbus.in.us/harry-weese-legacy'], ['J. Irwin Miller, Wikipedia', WP + 'J._Irwin_Miller']] }),

  x({ slug: 'miller-house-and-garden', when: '1957', section: 'architecture', landmark: 'miller',
    title: 'A house that started with a letter',
    dek: 'In March 1957 the Miller family moved into a house by Eero Saarinen, with interiors by Alexander Girard and a garden by Dan Kiley.',
    body: [
      'The Miller House began, according to Xenia Miller’s biography, with a letter she wrote to her husband about ten years before it was built, describing the kind of modern house she had in mind.',
      'J. Irwin Miller bought the site in September 1953. Eero Saarinen designed the house, with Kevin Roche as his associate, in a process Wikipedia says took about two years. Taylor Brothers Construction Company got the contract on April 18, 1955, and the family began moving in on March 15, 1957.',
      'Alexander Girard designed the furnishings and worked closely with the Millers. His best known touch is the conversation pit, a sunken square in the living room about 15 feet on a side and a foot and a half below the floor. Dan Kiley, who had worked with Saarinen on the Gateway Arch, designed the landscape around it.',
      'It was a family home for half a century. On May 16, 2000, it was added to the National Register of Historic Places and designated a National Historic Landmark on the same day. Xenia Miller died in 2008. That November the family agreed to give the house to the Indianapolis Museum of Art, which formally took ownership in May 2009. The house opened to the public on May 12, 2011.',
      'The house cannot be seen from the street. Visitors go by tour from the Columbus Visitors Center.',
      'In 1957, it was simply where the Millers lived.',
    ],
    sources: [['Miller House (Columbus, Indiana), Wikipedia', WP + 'Miller_House_(Columbus,_Indiana)'], ['Xenia Miller, Wikipedia', WP + 'Xenia_Miller']] }),
];
