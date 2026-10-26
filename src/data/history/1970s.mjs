// Columbus in the 1970s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const IPM = 'https://indianapublicmedia.org/columbus/';

const x = (o) => ({ checked: CHECKED, ...o });

export const A1970s = [
  x({ slug: 'kevin-roche-post-office', when: '1970', section: 'architecture',
    title: 'A post office with a private architect',
    dek: 'Columbus needed a new post office by the mid 1960s. When it opened in 1970, Indiana Public Media says, it made Columbus the first American city with a post office designed by a privately paid architect.',
    body: [
      'According to Indiana Public Media’s history of the town’s architecture, the city needed a new post office by the middle of the decade, and the design went to Kevin Roche, with his fee paid privately rather than by the government.',
      'Roche knew Columbus well. He had been Eero Saarinen’s principal design associate from 1954, worked on Saarinen’s projects until Saarinen died in 1961, and with John Dinkeloo finished North Christian Church after his death. Wikipedia’s list of his works dates the Columbus post office to 1969.',
      'Construction took about three years. The building, at Fourth and Jackson streets, was dedicated on July 19, 1970. Indiana Public Media writes that with it, Columbus became the first American city with a post office designed by a privately paid architect.',
      'It was the start of a long run of Roche buildings in town. The Republic’s list of his Columbus work includes the office building added to the Irwin Union bank in the early 1970s, the Cummins Midrange Engine Plant in Walesboro in 1973 and the Cummins corporate headquarters at Fifth and Jackson. The Republic summed it up this way: “Although Roche didn’t live here, he had a significant impact on the city’s built environment.” In 1982 Roche won the Pritzker Prize, architecture’s highest honor.',
      'Columbus counted 26,457 people at the 1970 census, more than two and a half times its population in 1930. A first class stamp cost six cents. The post office Roche designed still handles the town’s mail.',
    ],
    sources: [['Columbus, Indiana: Different by Design, 1970, Indiana Public Media', IPM + 'text1970.html'], ['Kevin Roche, Wikipedia', WP + 'Kevin_Roche'], ['Roche’s spirit endures in Columbus with designs, The Republic', 'https://www.therepublic.com/?p=394138']] }),

  x({ slug: 'iupuc-opens', when: '1970', section: 'schools',
    title: 'College comes to Columbus',
    dek: 'On August 17, 1970, Indiana University and Purdue opened a Columbus center. A year later it moved into an old Air Force building at the airport.',
    body: [
      'On August 17, 1970, according to the campus’s own history, the Columbus Center of Indiana University Purdue University Indianapolis opened its offices and classrooms as an extension of IUPUI. In its first year, classes met in various places around Columbus. Later in 1971 they all moved to 4601 Central Avenue, the former Civilian Personnel Building at what was then Bakalar Municipal Airport, the old air base north of town.',
      'Dr. Emerson Gilbert led the center from 1970 to 1977. Dr. Paul Bippen followed and stayed until 2003, a 26 year run, with his title changing from director to dean in 1994.',
      'The campus grew in steps. In 1984 the Indiana General Assembly put $2.5 million toward science and technology labs and a new exterior. A $3.55 million expansion finished in 1985 added more than 60 percent to the building’s floor space. In 1987 the city deeded 11 more acres to Indiana University.',
      'In 1994 IUPUI chancellor Gerald Bepko announced the campus would be called Indiana University Purdue University Columbus, or IUPUC.',
      'The biggest change came half a century in. On August 12, 2022, Wikipedia records, the IU and Purdue boards announced that IUPUI would be split into two universities. The split took effect on July 1, 2024. IUPUC became Indiana University Columbus, and Purdue’s programs there withdrew; Purdue’s Polytechnic Institute keeps a separate Columbus campus run from West Lafayette. IU Columbus had 1,051 students in the fall of 2022, and its teams compete in the NAIA’s River States Conference.',
      'The history counts more than 250 faculty and staff today and an average class size of 15.',
    ],
    sources: [['IU Columbus history, Indiana University Columbus', 'https://columbus.iu.edu/about/history/index.html'], ['Indiana University Columbus, Wikipedia', WP + 'Indiana_University_Columbus']] }),

  x({ slug: 'the-republic-glass-newsroom', when: '1971', section: 'media',
    title: 'A newspaper you could watch being printed',
    dek: 'In July 1971 The Republic moved into a glass and steel building by Myron Goldsmith, where people walking by could see the presses run. It is now a National Historic Landmark.',
    body: [
      'Robert N. Brown, owner of The Republic, picked his architect in 1959: Myron Goldsmith of Skidmore, Owings and Merrill in Chicago, according to Wikipedia. Then he put the project on hold to start a second paper, the Daily Journal in Franklin, which opened in 1963.',
      'In 1967 Goldsmith suggested an urban renewal site just south of the Bartholomew County Courthouse. The city block went on sale in December 1968, and Brown’s was the only bid. He showed the plans to the public in February 1969, and ground was broken on November 7, 1969.',
      'The newspaper moved in on July 17 and 18, 1971, and printed its first issue in the new building on July 19. It came in under budget, at $1,104,425. The building is one story, a steel frame wrapped in glass. The best part was the press: the glass let people on the sidewalk watch the yellow printing press at work.',
      'The American Institute of Architects gave it an Honor Award in 1975. The press was removed in 1997, and printing moved elsewhere. In October 2012 the building was added to the National Register of Historic Places and named a National Historic Landmark.',
      'The Republic moved out in December 2016, after the building was sold that May. In 2018 Indiana University bought it, and it now houses IU’s J. Irwin Miller Architecture Program, formally dedicated on January 31, 2019. Architect magazine noted the fitting second life for a building that was designed to celebrate the press.',
      'The building appears throughout the 2017 film Columbus. For anyone who grew up here, though, it will always be the place you could stop on Second Street and watch tomorrow’s paper roll off the press. Hats off to The Republic for building it.',
    ],
    sources: [['The Republic Newspaper Office, Wikipedia', WP + 'The_Republic_Newspaper_Office'], ['Designed to Celebrate the Press, a 1970s SOM Building Will Now House an Architecture Program, Architect magazine', 'https://www.architectmagazine.com/practice/designed-to-celebrate-the-press-a-1970s-som-building-will-become-an-architecture-school_o'], ['The Republic (Columbus, Indiana), Wikipedia', WP + 'The_Republic_(Columbus,_Indiana)']] }),

  x({ slug: 'columbus-east-high-school', when: '1972', section: 'schools',
    title: 'One high school becomes two',
    dek: 'In 1972 Columbus opened a second high school. Columbus High became Columbus North, the new school became the East Olympians, and seven years later East won a state football title.',
    body: [
      'For most of its history Columbus had one public high school. By the early 1970s that was no longer enough. Wikipedia’s history says Columbus East High School was founded in 1972 because the city’s population was growing and Columbus High School could no longer hold all of its students.',
      'Opening East changed the old school’s name. Columbus High School became Columbus North High School, the Bulldogs who still play in Memorial Gym. The new school chose the Olympians as its mascot and orange and brown as its colors.',
      'It did not take long for East to make a name in sports. In 1979 Columbus East won the Indiana state football championship in Class 3A, according to the Indiana High School Athletic Association. It was the first of three. East won again in 2013 and in 2017, when coach Bob Gaddis’s team beat Kokomo 42 to 28 at Lucas Oil Stadium to finish 14 and 1.',
      'Wikipedia lists other state titles too: girls swimming in 1983 and both golf and gymnastics in 1990. Among the school’s alumni it lists NFL players Stevie Brown, Harry Crider and Blair Kiel, Major League pitcher Peyton Gray and actress Jill Tasker.',
      'It all started in 1972, with a town that had grown too big for one high school.',
    ],
    sources: [['Columbus East High School, Wikipedia', WP + 'Columbus_East_High_School'], ['Columbus East lands third football crown, IHSAA', 'https://www.ihsaa.org/media/news/columbus-east-lands-third-football-crown'], ['Indiana big school football champions, Wikipedia', WP + 'Indiana_big_school_football_champions']] }),

  x({ slug: 'sandy-hook-moves-to-taylor-road', when: '1972', section: 'faith',
    title: 'A congregation moves by caravan',
    dek: 'On November 24, 1972, the people of Sandy Hook United Methodist Church drove together from their old church on 17th Street to a new one on Taylor Road. The congregation traces its roots to 1892.',
    note: 'Disclosure: Jacob Kennedy, the publisher of Heart of Columbus, volunteers at this church, which he tells us now goes by Haven United Methodist Church, and is joining its staff as music director.',
    body: [
      'The congregation began in a living room. In 1892, according to a history by Brian Blair in The Republic, the United Brethren Church of Columbus was organized at the home of Daniel and Rachel Lambert, 1468 Union Street, with 12 charter members. The first church was built that same year at 19th and Elm streets, with Rev. J. F. Reynolds as minister.',
      'In 1923 the congregation moved to 17th Street and Home Avenue and named its building Wertz Memorial United Brethren Church, after Professor Samuel Wertz.',
      'Then the denomination changed around it. In 1951, The Republic’s history notes, the United Brethren in Christ merged with the Evangelical Church to form the Evangelical United Brethren Church. In 1968 that church voted to unite with the Methodists, creating the United Methodist Church.',
      'The Columbus congregation was ready for a new home too. Ground was broken on Taylor Road on September 12, 1971. On November 24, 1972, the members moved by caravan to 1610 Taylor Road, where the church has worshiped since, and where The Republic says the current building opened that day.',
      'The church buried a time capsule in 1992 to be opened 25 years later. At its 125th anniversary in 2017, Brian Blair talked with longtime members. Patty Nichalson, then 86, told him, “I am so glad to have been a part of this.” Clarice Joslin, then 80, had attended since she was 2 and described the members as her family.',
      'Whatever the reasons for the move, the way they made it says something. They went together.',
    ],
    sources: [['One church, many friends: Congregation members look forward to 125th anniversary, by Brian Blair, The Republic (2017)', 'https://www.therepublic.com/2017/09/23/one_church_many_friends/'], ['Religion news, September 16, The Republic', 'https://www.therepublic.com/?p=374291']] }),

  x({ slug: 'air-base-becomes-airport', when: '1972', section: 'civic',
    title: 'The Air Force leaves and the city gets an airport',
    dek: 'Bakalar Air Force Base closed in 1970. Two years later it belonged to Columbus, and the barracks town north of the city began a second life.',
    body: [
      'Bakalar Air Force Base had been part of Columbus since 1942, first as Atterbury Army Air Field and, from 1954, under the name of Lieutenant John Bakalar. Its last big mission came in 1968 and 1969, when reservists from the base flew AC-119G gunships in Vietnam. They came home to Bakalar on June 18, 1969.',
      'Soon afterward, the city’s airport history says, the base was declared surplus and deeded to the City of Columbus. The Indiana Historical Bureau marker on the grounds gives 1970 as the year the base closed and 1972 as the year it was given to the city.',
      'The city made it Columbus Municipal Airport. Today it covers about 2,000 acres, with two concrete runways of 6,400 and 5,000 feet, according to Wikipedia. In 2005 it handled about 39,155 takeoffs and landings, about 91 percent general aviation and 9 percent military.',
      'The old base buildings found new uses too. In 1971 the brand new Indiana University and Purdue center in Columbus moved all its classes into the former Civilian Personnel Building at 4601 Central Avenue on the old base, where it grew into today’s IU Columbus.',
      'History stayed on the grounds. In 1995 the local aviation board began restoring parts of the base. A former base building was turned into a chapel and, on May 29, 1998, dedicated to Jean Lewellen Norbeck, a Women Airforce Service Pilot killed testing aircraft in 1944. The Atterbury Bakalar Air Museum sits near the control tower.',
      'In 1972 the Air Force was gone. What it left behind became one of the city’s front doors.',
    ],
    sources: [['Airport history, City of Columbus', 'https://www.columbus.in.gov/airport/about/history'], ['Atterbury Army Air Field historical marker, Indiana Historical Bureau', 'https://www.in.gov/history/markers/528.htm'], ['Columbus Municipal Airport (Indiana), Wikipedia', WP + 'Columbus_Municipal_Airport_(Indiana)'], ['IU Columbus history, Indiana University Columbus', 'https://columbus.iu.edu/about/history/index.html']] }),

  x({ slug: 'arts-council-begins', when: '1972', section: 'culture',
    title: 'An arts council for the Driftwood Valley',
    dek: 'In 1972 a group formed the Driftwood Valley Arts Council. It became today’s Columbus Area Arts Council, which says its mission is “to strengthen the community through arts and culture.”',
    body: [
      'By the early 1970s Columbus had world famous buildings. It did not yet have an organization whose job was the arts themselves: concerts, exhibits, festivals and classes.',
      'According to the Columbus Area Arts Council’s own history, that organization began in 1972 as the Driftwood Valley Arts Council, Federal nonprofit records list the council’s tax exempt ruling year as 1973.',
      'The arts got a big new stage soon after. The Commons, the indoor public space and shopping center by Cesar Pelli downtown, was dedicated in 1974, and it had its own staff running programs. In 1989, the council’s history says, the Driftwood Valley Arts Council and The Commons staff were combined into one organization under one board: the Columbus Area Arts Council.',
      'The council’s calendar today includes the Mill Race Monster Festival, a Battle of the Bands, First Fridays for Families, the 50/50 Exhibit and Uncommon Cause. Its stated mission is short: “To strengthen the community through arts and culture.”',
      'Xenia Miller played a part in the arts scene of those years as well. Her Wikipedia biography says she launched the Indianapolis Museum of Art Columbus Gallery in 1974.',
      'Columbus is known around the world for what its architects built. The arts council was started by people who wanted to make sure there was something happening inside.',
    ],
    sources: [['About the Columbus Area Arts Council', 'https://artsincolumbus.org/about'], ['Columbus Area Arts Council, GuideStar (Candid)', 'https://www.guidestar.org/profile/35-1303466'], ['Xenia Miller, Wikipedia', WP + 'Xenia_Miller']] }),

  x({ slug: 'the-commons-and-chaos', when: '1974', section: 'culture', landmark: 'commons',
    title: 'A mall, a playground and a machine called Chaos',
    dek: 'The Commons opened downtown in 1974 with Jean Tinguely’s Chaos I clanking away inside. The sculpture is still running. The building around it has been replaced.',
    body: [
      'In 1971 the plans for a new downtown center were shown to the public as a model. The Commons, designed by Cesar Pelli, then a partner at Gruen Associates, was an indoor mall and public space downtown. Pelli also recommended an artist for its centerpiece: the Swiss sculptor Jean Tinguely.',
      'Visit Columbus tells the story. Tinguely was asked in 1971. He first came to Indiana in May 1972 and toured the building site with Pelli. In October 1972 he came back for a day, met the Civic Mall board and the Millers, and looked at the old Columbus Pump House as a studio. In March 1973 he and his assistant, Josef “Seppi” Imhof, started building there.',
      'On February 5 and 6, 1974, a moving company carried the pieces to The Commons. The building was dedicated at the end of May 1974, and Tinguely kept adjusting his machine afterward. Chaos I stands 30 feet tall and originally had 12 electric motors, most modified to run at the speeds Tinguely wanted. Visit Columbus gives its weight as 7 tons; Wikipedia says 3. It was given to the city, along with The Commons, by J. Irwin Miller, Xenia Miller and Clementine Tangeman.',
      'In winter 2008 much of Pelli’s building was demolished, and a new Commons by Koetter Kim and Associates went up on the site. Chaos I never moved; it stayed in place during construction and was switched back on on June 4, 2011.',
      'Today the new Commons, at 300 Washington Street, is open every day and has an indoor playground that the visitors bureau says is free and open to the public, with a 35 foot climber. Chaos I still runs in the middle of it, for kids who were not born when it was built.',
    ],
    sources: [['The back story of Jean Tinguely’s Chaos I and the Columbus Pump House, Visit Columbus Indiana', 'https://columbus.in.us/chaos-story/'], ['Chaos I, Wikipedia', WP + 'Chaos_I'], ['The Commons Columbus', 'https://thecommonscolumbus.com/?p=29'], ['Family fun in Columbus, Visit Columbus Indiana', 'https://columbus.in.us/family-fun-in-columbus/']] }),

  x({ slug: 'indiana-bell-switching-center', when: '1976', section: 'architecture',
    title: 'A telephone building with nine colored pipes',
    dek: 'Indiana Bell needed to add on to an equipment building in a neighborhood. Paul Kennon wrapped it in mirror glass, covered it in vines and lined up bright ducts out back.',
    body: [
      'Telephone switching buildings are full of equipment and need few windows. In the 1970s, Indiana Bell finished an addition to its Columbus switching center that made people stop and look. Architect magazine dates it to 1976; a Bluffton University guide to Columbus architecture gives 1978.',
      'Architect magazine describes the project. The architect was Paul Kennon of Caudill Rowlett Scott, the Houston firm, which HOK later acquired in 1994. Kennon designed a one story addition to a three story telephone equipment building and wrapped it in reflective glass so it would sit better among the houses around it.',
      'In front he added a vertical space frame trellis to hold climbing vines, with pear trees and narrow brick plazas shaded by the trellis. Behind, along an alley, he lined up nine brightly colored mechanical ducts that Architect magazine says stand “sentinel-like as if guarding the all-glass building.”',
      'The building won a 1976 Progressive Architecture award citation, from a jury that included Cesar Pelli, who had just finished The Commons downtown.',
      'Over the years the vines and trees grew into a green wall, and also, Architect magazine reports, attracted birds that caused maintenance problems. AT&T, which now owns it, removed the trees and vines and most of the trellis over objections from local preservationists and the architect’s son, Kevin Kennon. The glass was cleaned, the ducts repainted and the plazas repaired. The magazine says the building now “looks sadly naked.”',
      'The Bluffton guide explains what the colorful pipes are for: they hold the heating and air conditioning equipment, turned into decoration. They are still there.',
    ],
    sources: [['Indiana Bell (now AT&T) Switching Center, Architect magazine', 'https://www.architectmagazine.com/project-gallery/indiana-bell-now-at-t-switching-center-6450'], ['Indiana Bell Telephone Company Switching Station, Bluffton University Columbus architecture guide', 'https://homepages.bluffton.edu/~SULLIVANM/colscaudill/caudill.html']] }),

  x({ slug: 'cummins-billion-dollar-year', when: '1976', section: 'industry',
    title: 'A billion dollar year, and Miller steps back',
    dek: 'In 1976 Cummins sales reached $1 billion for the first time. The next year J. Irwin Miller retired as chairman after 26 years.',
    body: [
      'The 1970s were not easy for Cummins. Truck News puts its share of the diesel engine market at about 50 percent by 1967. A company history on Encyclopedia.com says its share of the heavy truck market fell below 45 percent that year, when earnings dropped 78 percent, and below 40 percent in the early 1970s. When the company introduced a 450 horsepower engine in 1975, the truck market slumped 40 percent.',
      'And still the company grew. In 1976 Cummins sales reached $1 billion, with earnings of $59 million, Encyclopedia.com reports. Thirty years earlier, in 1946, sales had been $20 million.',
      'The company had new leadership by then. Wikipedia lists Henry Schacht as the company’s chairman and chief executive from 1973 to 1994. J. Irwin Miller, who had come to Cummins as general manager in 1934, retired as chairman in 1977. The trucking magazine Truck News, writing when he died, noted that he stayed on the board until 1997, one of the longest board tenures in Fortune 500 history, and then served as honorary chairman.',
      'Truck News also listed the three priorities Miller set in the 1940s and 1950s: research into new diesel technology even if it made Cummins’s own products obsolete; cutting costs without lowering standards; and a national network of independent distributors.',
      'The hard years were not over. Encyclopedia.com reports that Cummins cut its employment by 22 percent between 1979 and 1986. But 1976 was the year the engine shop W. G. Irwin had bankrolled became a billion dollar company.',
    ],
    sources: [['Cummins Engine Company, Inc. (company history), Encyclopedia.com', 'https://www.encyclopedia.com/books/politics-and-business-magazines/cummins-engine-company-inc'], ['Henry Schacht, Wikipedia', WP + 'Henry_Schacht'], ['Cummins Says Farewell to a Legend, Truck News', 'https://www.trucknews.com/features/cummins-says-farewell-to-a-legend/']] }),
];
