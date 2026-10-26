// Columbus in the 1960s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const IPM = 'https://indianapublicmedia.org/columbus/';
const WEESE = ['The Harry Weese Legacy in Columbus, Visit Columbus Indiana', 'https://columbus.in.us/harry-weese-legacy'];

const x = (o) => ({ checked: CHECKED, ...o });

export const A1960s = [
  x({ slug: 'mabel-mcdowell-school', when: '1960', section: 'schools',
    title: 'A school by the architect of a president’s grave',
    dek: 'Mabel McDowell School, by John Carl Warnecke, was built around 1960 as a cluster of small pavilions around courtyards. It is now a National Historic Landmark and the county’s adult education center.',
    body: [
      'The Cummins Foundation’s offer to pay architects’ fees for Columbus schools began with Lillian C. Schmitt Elementary in 1957. The National Park Service, in the nomination that made Mabel McDowell School a National Historic Landmark, calls McDowell the second school built with the program’s support.',
      'The nomination describes how the architect was chosen. The foundation gave the school board a list of recommended architects, compiled by an independent panel that included Eero Saarinen. The board interviewed them and picked John Carl Warnecke of California. Warnecke, Wikipedia notes, would later design the Hawaii State Capitol and, after the assassination of President Kennedy, the Eternal Flame grave site at Arlington National Cemetery.',
      'His Columbus school was built around 1960 at 2700 McKinley Avenue; a 1967 city plan cited in the nomination says it opened in 1961. It is not one building but five, all one story, linked by landscaped courtyards and covered, trellised walkways. Four clusters of classroom pavilions surround a central common building. Each cluster has three L shaped classrooms, and each classroom has its own pyramid shaped roof. The materials are plain: an exposed welded steel frame, red brick, big steel windows with enamel panels below, and wood trellis sunshades.',
      'The school corporation’s building page says Warnecke wanted open space that recalled an Indiana farm landscape, and that he took the region’s flat terrain as a horizontal theme. The critic Peter Blake, the nomination says, described it in 1975 as a conscious attempt to relate to the Midwestern landscape. The school superintendent of the day, Clarence Robbins, is quoted as saying, “There has been an uplift in property pride in the area.”',
      'The building is named for Mabel McDowell, a Columbus elementary school teacher, according to the nomination.',
      'In 1982 McDowell was converted to an adult education center. It is now the Mabel McDowell Adult Education Center, run by the Bartholomew Consolidated School Corporation, which also houses alternative high school programs there. In 2001 the National Park Service named it a National Historic Landmark, calling it “significant as an early example of modern architecture in Columbus.”',
    ],
    sources: [['Mabel McDowell School, National Historic Landmark nomination, National Park Service', 'https://npgallery.nps.gov/NRHP/GetAsset/NHLS/01000068_text'], ['Building information, Mabel McDowell (BCSC)', 'https://mcdowell.bcscschools.org/about/building-information'], ['Mabel McDowell Elementary School, Wikipedia', WP + 'Mabel_McDowell_Elementary_School'], ['John Carl Warnecke, Wikipedia', WP + 'John_Carl_Warnecke']] }),

  x({ slug: 'north-christian-church-dedicated', when: '1964', section: 'architecture', landmark: 'northchristian',
    title: 'Saarinen’s last building',
    dek: 'Eero Saarinen finished the design for North Christian Church in July 1961 and died that September. His associates built it. It was dedicated in April 1964.',
    body: [
      'North Christian Church hired Eero Saarinen in February 1959, four years after its 43 founding members left First Christian. He spent about two years on the design. On July 28, 1961, he wrote, as Wikipedia records, “We have finally solved the Columbus church.” He died that September, before construction started, and his associate Kevin Roche saw it through. Indiana Public Media calls it Saarinen’s last project.',
      'Ground was broken on September 2, 1962. In May 1963 the spire was hoisted into place in three 44 foot sections. The finished spire, copper clad, rises 192 feet. The first service was held on March 8, 1964, and the building was formally dedicated on April 19, 1964.',
      'The plan is a hexagon, 210 feet from west to east and 106 feet from north to south. The slate roof is divided into six sections. The structural engineer, Henry Pfisterer, described the building as a “steel hat sitting over a concrete bowl.” The sanctuary seats about 445 to 470. Dan Kiley landscaped the 13.5 acre site with a six foot berm, and the Holtkamp organ was the last of its kind designed by Walter Holtkamp Sr.',
      'The church was named a National Historic Landmark on May 16, 2000. Keeping it up was always hard. The spire needed repairs in 2002 and 2003, and a $650,000 roof renovation in 2007 to 2009 was paid for partly with a $300,000 Save America’s Treasures grant. In 2018 Indiana Landmarks put it on its list of the state’s ten most endangered places, and in 2019 the Getty Foundation gave $150,000 toward a conservation plan.',
      'The congregation held its last service on July 16, 2022. The Bartholomew County Public Library accepted the building as a gift in 2024, and in 2025 named it The LEX, the Library of Experience.',
      'Saarinen never saw the spire go up. Columbus has been looking at it for more than 60 years.',
    ],
    sources: [['North Christian Church, Wikipedia', WP + 'North_Christian_Church'], ['Columbus, Indiana: Different by Design, 1964, Indiana Public Media', IPM + 'text1964.html']] }),

  x({ slug: 'otter-creek-golf-course', when: '1964', section: 'sports',
    title: 'Cummins builds the town a golf course',
    dek: 'Cummins hired Robert Trent Jones Sr. to design a public course and gave it to the city. It hosted the Indiana State Amateur for 26 straight years.',
    body: [
      'In 1956 Cummins Engine Company started planning a golf course, according to The Republic, and Robert Trent Jones Sr. was at the top of its list of designers. He got the job.',
      'Cummins built the course and gave it to the City of Columbus. The Republic dates the gift to 1964 and the opening of the original 18 holes to June 1965. AmateurGolf.com gives 1964 as the opening year. Harry Weese, who designed so many of the town’s schools, designed the clubhouse restaurant, which opened with the course.',
      'Otter Creek quickly became one of the state’s important courses. AmateurGolf.com reports that the Indiana State Amateur was played there every year from 1965 through 1990, and came back on later occasions. The course hosted the 1991 U.S. Amateur Public Links Championship.',
      'In June 1995 a third nine, the East Course, opened. It was designed by Rees Jones, Robert Trent Jones Sr.’s son, and brought the total to 27 holes. The Republic notes that Golf Digest regularly ranks Otter Creek among its top 100 places to play.',
      'The clubhouse restaurant closed in 1998 and reopened in September 2015 after a yearlong renovation, in time for the course’s 50th birthday.',
      'The Chronicle of Philanthropy lists a golf course among the public facilities the Cummins architecture program came to include, alongside schools, fire stations and libraries. It may be the only one where the main design work happened outdoors.',
    ],
    sources: [['Otter Creek golf course history, The Republic', 'https://www.therepublic.com/?p=354106'], ['Indiana’s Otter Creek Golf Course, AmateurGolf.com', 'https://www.amateurgolf.com/golf-tournament-news/indiana%27s-otter-creek-golf-course-cbe4cf'], ['How 70 years of design philanthropy transformed a Midwestern city, The Chronicle of Philanthropy', 'https://www.philanthropy.com/news/how-70-years-of-design-philanthropy-transformed-a-midwestern-city/']] }),

  x({ slug: 'first-baptist-church', when: '1965', section: 'faith',
    title: 'A Baptist church with a pyramid bell tower',
    dek: 'One of Columbus’s early congregations moved to Fairlawn Drive in 1965, into a red brick church by Harry Weese.',
    body: [
      'First Baptist Church is, in Wikipedia’s words, “one of Columbus’s early congregations.” Its earlier home has not survived.',
      'Docomomo US, which documents modern architecture, dates the commission to April 14, 1962. The architect was Harry Weese, who had already designed Lillian C. Schmitt Elementary and what is now Northside Middle School. Docomomo notes that Weese was strongly influenced by the Finnish architect Alvar Aalto and by Eero Saarinen, and that he had studied at Cranbrook during what it calls its golden age.',
      'The church was completed in September 1965 at 3300 Fairlawn Drive. It is red brick, with five sections arranged around a central courtyard and tall, narrow windows. Its most striking feature is a central bell tower shaped like a pyramid, and the building mixes rounded and triangular forms in a way that looks nothing like the box shaped First Christian or the hexagonal North Christian.',
      'With three modern churches finished between 1942 and 1965, Columbus had become a place where congregations, not just companies and school boards, hired major architects. On May 16, 2000, First Baptist was added to the National Register of Historic Places and named a National Historic Landmark on the same day as North Christian.',
      'Docomomo rates the building’s condition as excellent and lists it as open to the public.',
      'One count published by The Republic credits Harry Weese with 16 structures in Columbus; The Chronicle of Philanthropy counts 14. Either way, this is one of the few Weese buildings in town people can visit on a Sunday morning.',
    ],
    sources: [['First Baptist Church (Columbus, Indiana), Wikipedia', WP + 'First_Baptist_Church_(Columbus,_Indiana)'], ['First Baptist Church, Docomomo US', 'https://www.docomomo-us.org/register/first-baptist-church'], WEESE] }),

  x({ slug: 'lincoln-elementary-and-lady-bird', when: '1967', section: 'schools',
    title: 'The First Lady comes to Lincoln School',
    dek: 'In September 1967 Lady Bird Johnson came to Columbus to dedicate a new elementary school by Gunnar Birkerts. She called architecture “frozen music.”',
    body: [
      'Lincoln Elementary School opened in 1967 at 750 Fifth Street. Its architect was Gunnar Birkerts, who would later design St. Peter’s Lutheran Church across the street.',
      'The Republic, writing about the school’s 50th anniversary, describes a building known for natural light, a central multipurpose room and the way it settles into its landscape. It also reports a claim the school was proud of: that Lincoln was the first school building in the United States to offer access to both levels by ramps, elevators and extra wide doors.',
      'A few days after the school opened, First Lady Lady Bird Johnson came to Columbus. Indiana Public Media’s history says she dedicated a plaque at the entrance dated September 21, 1967, bearing the name of Mayor Eret Kline. The Republic reports that she called architecture “frozen music.” The Bartholomew County Public Library archives hold a sound recording of her speech at the school.',
      'In 1970 the American Institute of Architects gave Lincoln an Honor Award. Indiana Public Media’s 1967 entry notes that it had been 25 years since First Christian Church opened, and that a new generation was now sending its children to the schools the Cummins Foundation had helped pay for.',
      'The school is now Columbus Signature Academy, Lincoln Campus. For its 50th anniversary, students led the public on tours.',
      'A visit from the First Lady was a big day for any town. For a school built to be easy for every child to get around in, it was a fitting one to remember.',
    ],
    sources: [['Lincoln’s 5 decades of history worth celebrating, The Republic', 'https://www.therepublic.com/?p=374360'], ['Columbus, Indiana: Different by Design, 1967, Indiana Public Media', IPM + 'text1967.html'], ['Lady Bird Johnson speaks at Lincoln Elementary School (sound recording), Bartholomew County Public Library archives', 'https://bcplarchives.omeka.net/items/show/482']] }),

  x({ slug: 'fire-station-4', when: '1967', section: 'civic', landmark: 'firestation',
    title: 'An ordinary building with a big number 4',
    dek: 'The fire department asked for a plain, easy to maintain station. Robert Venturi gave it one, with a giant numeral on the tower, and helped start postmodern architecture.',
    body: [
      'In 1967, according to Wikipedia, the fire department asked architect Robert Venturi for an “ordinary building that was easy to maintain.”',
      'Visit Columbus calls Fire Station 4 his fourth completed project. The station went up at 4730 East 25th Street, started in 1967 and finished in 1968.',
      'What he designed was ordinary on purpose. It is a low building on a trapezoid shaped plan, made of cinderblock, white glazed and red brick, and glass. The one thing that stands up is a tower, which Visit Columbus describes as the hose drying tower, and at its top a large number 4. Wikipedia says the semicircular tower also serves as the main entrance.',
      'Wikipedia counts Fire Station 4 as an early example of postmodern architecture.',
      'It also started a Columbus tradition of interesting firehouses. Fire Station 3 by William Burd followed in 1983, with a glass tower showing off its fire pole. Fire Station 5 by Susana Torre came in 1987, and Visit Columbus says it was the first firehouse designed to include women firefighters. Fire Station 6 by William Rawn followed in 1998 and won design awards.',
      'Fire Station 4 is still a working firehouse. It is on the city’s architecture tour, and you can see it from the street any day.',
    ],
    sources: [['Fire Station Number 4 (Columbus, Indiana), Wikipedia', WP + 'Fire_Station_Number_4_(Columbus,_Indiana)'], ['Fire stations, Visit Columbus Indiana', 'https://columbus.in.us/art-architecture/fire-stations']] }),

  x({ slug: 'evening-republican-becomes-the-republic', when: '1967', section: 'media',
    title: 'The Evening Republican becomes The Republic',
    dek: 'For 84 years the town’s daily was the Evening Republican. In January 1967 it shortened its name to the one it still has.',
    body: [
      'Columbus’s daily newspaper started as a weekly. Isaac T. Brown published the first issue of The Columbus Republican on Thursday, April 4, 1872, according to Wikipedia. On November 12, 1877, it became a daily as the Daily Evening Republican, and genealogy listings of Indiana papers show it running as the Evening Republican from 1883.',
      'The name told readers where the paper stood, and Columbus had papers named for both parties: the same listings include a Weekly Indiana Democrat, a Bartholomew Democrat and a Daily Evening Democrat. The Republican outlasted them all.',
      'The Brown family kept it. Isaac Brown died in 1917 and his son Raymond took sole control. In 1963 Raymond’s son Robert N. Brown started a second daily, the Daily Journal in Johnson County. And in January 1967, Wikipedia says, the Evening Republican shortened its name to The Republic.',
      'The paper itself has said its mission is to advocate for the good of the community “irrespective of political considerations,” in the words of the history it published on its 150th anniversary. Four years after the new name, it moved into a new home: a glass and steel plant and newsroom on Second Street by architect Myron Goldsmith, finished in 1971 and later named a National Historic Landmark.',
      'Plenty of things in Columbus changed in the 1960s. The newspaper on the porch got a shorter name, and kept the job of telling the town about all of it.',
      'Heart of Columbus tips its cap here. For more than 150 years, through six generations of the Brown family and several owners since, The Republic has covered this town every day. We hope to be a good neighbor to it.',
    ],
    sources: [['The Republic (Columbus, Indiana), Wikipedia', WP + 'The_Republic_(Columbus,_Indiana)'], ['A history of The Republic: 1872 to today, The Republic', 'https://www.therepublic.com/?p=482537'], ['Bartholomew County, Indiana newspapers, Linkpendium / ldsgenealogy.com', 'https://ldsgenealogy.com/IN/Bartholomew-County-Newspapers-and-Obituaries.htm']] }),

  x({ slug: 'cummins-technical-center', when: '1967', section: 'industry',
    title: 'Where Cummins designs the next engine',
    dek: 'Built from 1964 to 1967 on McKinley Avenue, the Cummins Technical Center gave the company its own research campus in Columbus. Harry Weese designed it.',
    body: [
      'By the 1960s Cummins was selling engines in dozens of countries, and J. Irwin Miller’s answer, according to The Republic, was research. He envisioned a technical center that would help Cummins stay independent and competitive as an engine maker.',
      'Construction ran from 1964 to 1967 at 1900 McKinley Avenue, and the building was occupied in 1967. Harry Weese designed it; HOK, which renovated it decades later, dates his six story tower to 1968. The center covers about 500,000 square feet.',
      'It was busy in the 1960s and it is busy now. The Republic, marking the center’s 50th year in 2017, reported about 1,200 employees, 89 engine test cells handling from 500 to 3,000 horsepower, 16 emissions test cells, and about 350,000 hours of testing a year. A 2015 and 2016 upgrade put $5 million into materials labs, including a tomography scanner and a 3D printer.',
      'The center has had its scares. The June 7, 2008, flood closed it for a month.',
      'HOK’s later renovation of the tower kept Weese’s exterior while opening up the inside, with more than 90 meeting rooms and plus signs in key spaces that nod to Paul Rand’s Cummins logo. It now holds about 500 engineers and researchers in that part of the campus alone.',
      'Engines designed and tested on McKinley Avenue go all over the world. The work still starts here.',
    ],
    sources: [['Cummins Technical Center at 50, The Republic', 'https://www.therepublic.com/?p=375160'], ['Cummins Technical Center, HOK', 'https://hok.com/projects/view/cummins-technical-center'], WEESE] }),

  x({ slug: 'bakalar-reservists-go-to-vietnam', when: '1968', section: 'service',
    title: 'Reservists from Bakalar fly gunships in Vietnam',
    dek: 'In 1968 an Air Force Reserve group based north of Columbus was called up, retrained on AC-119 gunships and sent to Vietnam. It came home in June 1969.',
    body: [
      'Bakalar Air Force Base, north of Columbus, had trained reservists since the Korean War. In the spring of 1968 some of them were called to active duty.',
      'According to Wikipedia’s history of the unit, the 930th Tactical Airlift Group was mobilized at Bakalar about a month before June 15, 1968. Its squadron moved that day to Lockbourne Air Force Base in Ohio and began converting to the AC-119G gunship. The conversion took each crew from five people to eight. On July 8, 1968, the squadron was redesignated the 71st Special Operations Squadron.',
      'The City of Columbus’s airport history says the unit moved with 18 C-119s, later modified into AC-119Gs, and calls it the only Air Force Reserve unit to serve in Vietnam.',
      'The aircrews left for South Vietnam on December 5, 1968, with the rest of the unit following four days later. In six months in the combat zone the squadron flew more than 6,000 hours. Wikipedia’s account says it “lost no aircraft, and only six received any kind of battle damage in the air.” In the most serious incident, a plane took about 26 rounds of heavy machine gun fire, and a gunner, an active duty airman flying with the reserve crew, was wounded. He was the first combat casualty aboard an Air Force Reserve aircraft since Korea.',
      'The squadron earned a Presidential Unit Citation for its service from December 19, 1968, to May 31, 1969. It was released from active duty and returned to Bakalar on June 18, 1969.',
      'Within a year, the base itself was closed. The Indiana Historical Bureau marker at the old base chapel gives 1970 as the closing date. The airfield those crews came home to is now Columbus Municipal Airport.',
    ],
    sources: [['71st Special Operations Squadron, Wikipedia', WP + '71st_Special_Operations_Squadron'], ['Airport history, City of Columbus', 'https://www.columbus.in.gov/airport/about/history'], ['Atterbury Army Air Field historical marker, Indiana Historical Bureau', 'https://www.in.gov/history/markers/528.htm']] }),

  x({ slug: 'cleo-rogers-library', when: '1969', section: 'architecture', landmark: 'library',
    title: 'I. M. Pei builds the library, and a street disappears',
    dek: 'To build its new library, Columbus closed a block of Lafayette Avenue and hired I. M. Pei. The library opened in 1969; Henry Moore’s Large Arch arrived in 1971.',
    body: [
      'Columbus has had a public library since 1899, when a county library opened in two rooms of the original City Hall. A Carnegie library followed, dedicated on June 1, 1903, and built for $19,200, with $15,000 from Andrew Carnegie. By the late 1950s the county had outgrown it.',
      'The new library was paid for with a $1 million bond issue, community donations and an $800,000 grant from the Cummins Engine Foundation, according to Wikipedia. The architect was I. M. Pei and Partners. Construction by Dunlap and Company began in late 1966. Indiana Public Media’s history says the building opened to the public in October 1969; Wikipedia gives December 1969 as the end of construction.',
      'Pei did something bold with the site. The old library was torn down, and Lafayette Avenue between Fifth and Sixth streets was closed, making room for the library and a plaza. The library was named for Cleo Rogers, who worked for the county library for 37 years, 28 of them as head librarian, and who died in 1964.',
      'Two years later the plaza got its centerpiece. Xenia and J. Irwin Miller commissioned Henry Moore’s Large Arch, a five ton bronze, and gave it to the library. It was installed in 1971, and the library was dedicated that May with Pei speaking at the ceremony.',
      'The building has been expanded and renovated since, with an addition by James K. Paris and a renovation in 1989. It holds the Columbus Indiana Architectural Archives. It also appeared in the 2017 film Columbus.',
      'Indiana Public Media notes that the plaza around the arch has hosted outdoor concerts, art shows and community events for decades.',
    ],
    sources: [['Cleo Rogers Memorial Library, Wikipedia', WP + 'Cleo_Rogers_Memorial_Library'], ['Columbus, Indiana: Different by Design, 1969, Indiana Public Media', IPM + 'text1969.html']] }),
];
