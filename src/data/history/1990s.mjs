// Columbus in the 1990s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const VC = 'https://columbus.in.us/';

const x = (o) => ({ checked: CHECKED, ...o });

export const A1990s = [
  x({ slug: 'toyota-forklifts', when: '1990', section: 'industry',
    title: 'The first Toyota forklift built in America',
    dek: 'On May 10, 1990, the first American made Toyota forklift rolled off a new line in Columbus. The plant has since grown six times over.',
    body: [
      'Toyota announced it on May 11, 1990: the day before, the first Toyota forklift ever built in the United States had come off the line at a new plant in Columbus. The company was Toyota Industrial Equipment Mfg., Inc., a joint venture of Toyota Motor Corporation and Toyoda Automatic Loom Works.',
      'Toyota’s announcement described an 80 acre site and a plant patterned after the company’s Takahama plant near Nagoya. It was Toyota’s first industrial vehicle plant built outside Japan. About 180 people worked there, and the plant was set to build about 5,000 forklifts a year, sold through 78 Toyota dealers in 125 locations across the country.',
      '## Six times bigger',
      'The plant kept growing. By 2002, according to the Material Handling and Equipment Distributors Association, it had become North America’s largest forklift manufacturer, a position it still held when the group reported its 750,000th forklift about 31 years after opening. Its building had grown to 1.5 million square feet, six times its 1990 size. The first 250,000 forklifts took 16 years to build, the next 250,000 took nine years and the next 250,000 took six.',
      '“Our incredibly talented and dedicated team is committed to producing our next 250,000 units even faster,” Tony Miller, a Toyota Material Handling senior vice president, said at the milestone.',
      'The forklift plant came out of the city’s long courtship of Japanese companies that began in the 1980s, which another article in this series tells. Indiana Commerce Secretary Jim Schellinger named Toyota Material Handling and Toyota Industrial Equipment Manufacturing among the Japanese companies the state supports in Bartholomew County, Site Selection reported. Since 2002 the plant has been the largest forklift maker on the continent, and it is still in Columbus.',
    ],
    sources: [['Toyota’s first American built forklift, Toyota (May 11, 1990)', 'https://global.toyota/detail/7864000'], ['Toyota Material Handling milestone in North America, MHEDA', 'https://www.mheda.org/news/toyota-material-handling-milestone-in-north-america/'], ['Around the world in 59 counties, Site Selection', 'https://siteselection.com/around-the-world-in-59-counties/']] }),

  x({ slug: 'cummins-in-the-nineties', when: '1990', section: 'industry',
    title: 'Cummins brings in partners and stays in Columbus',
    dek: 'In 1990 Ford, Tenneco and Kubota bought a 27 percent stake in Cummins for $250 million. Through the decade the company changed leaders and kept its headquarters at home.',
    body: [
      'Cummins entered the 1990s after a hard decade. Reference for Business records that Japanese competition had cost it market share and millions of dollars in the early 1980s, and that it had cut employment by 22 percent from 1979 to 1986 while it restructured.',
      'In 1990 chief executive Henry Schacht found new money. He persuaded Ford Motor Company, Tenneco and Kubota to invest “a combined total of $250 million in a 27 percent stake in Cummins.” The company used the money to pay down debt and grow in Europe.',
      '## New leaders',
      'Schacht had joined Cummins out of Harvard Business School and served as chairman and chief executive from 1973 to 1994, according to Wikipedia. In 1995 he went to lead Lucent Technologies, the new company spun off from AT&T. James A. Henderson, a graduate of Princeton and Harvard Business School, became chief executive in 1994 and chairman in 1995, and retired in December 1999. Tim Solso followed as chief executive from 2000 to 2011.',
      'The company kept buying. Wikipedia records that Cummins finished its purchase of Onan, the generator maker, in 1992, and in 1999 bought Nelson Industries, whose exhaust business became Cummins Emission Solutions. In 1996 it closed the Shotts plant in Scotland that it had opened in the 1960s.',
      'Not all of the decade’s news was good. In 1998, Wikipedia notes, the Environmental Protection Agency announced $83.4 million in fines against Cummins and six other diesel makers for engines that turned off emissions controls during highway driving, and the companies agreed to spend more than $1 billion to fix the problem.',
      'Through all of it the headquarters stayed on Jackson Street, which mattered to a town where Cummins was the biggest employer.',
    ],
    sources: [['Cummins Engine Co Inc, Reference for Business', 'https://www.referenceforbusiness.com/history2/41/Cummins-Engine-Co-Inc.html'], ['Cummins, Wikipedia', WP + 'Cummins'], ['Henry Schacht, Wikipedia', WP + 'Henry_Schacht'], ['James A. Henderson, Wikipedia', WP + 'James_A._Henderson'], ['Tim Solso, Wikipedia', WP + 'Tim_Solso']] }),

  x({ slug: 'columbus-regional-hospital', when: '1992', section: 'civic',
    title: 'The county hospital takes a new name',
    dek: 'A $40 million expansion began in 1990, and in 1992 Bartholomew County Hospital became Columbus Regional Hospital. A free clinic for people without insurance followed in 1996.',
    body: [
      'The county hospital opened in 1917 as a three story building with 32 beds and 25 employees, according to The Republic’s timeline of its first hundred years. It grew in steps for seven decades. By 1984 it had become a regional referral center and started a paramedic program.',
      'In 1990 work began on a $40 million expansion and renovation. In 1991 the hospital went smoke free. Then came the new name. Wikipedia dates it to 1992, and The Republic’s timeline lists it in the years 1992 to 1994: Bartholomew County Hospital became Columbus Regional Hospital. The Cancer Center opened in the same years.',
      '## Care for those without insurance',
      'The decade brought new services too. In 1995 the Breast Health Center and the PromptMed Immediate Care Center opened. In 1996, The Republic’s timeline says, a Volunteers in Medicine clinic opened to serve residents without health insurance or with too little. Two decades later, in 2016, it was renamed the VIMCare Clinic.',
      'Michael Van Valkenburgh, the landscape architect behind Mill Race Park, also counts Columbus Regional Hospital among his Columbus projects, Visit Columbus notes.',
      'The hospital’s hardest day was still ahead. On June 7, 2008, Wikipedia records, a flood of “historic magnitude” forced the evacuation of 157 patients and caused more than $180 million in damage. That story belongs to another decade in this series. The name chosen in 1992 lasted until 2011, when the system became Columbus Regional Health.',
    ],
    sources: [['Tracing 100 years of history for Columbus Regional Hospital, The Republic', 'https://www.therepublic.com/?p=366731'], ['Columbus Regional Health, Wikipedia', WP + 'Columbus_Regional_Health'], ['The landscape architects of Columbus, Indiana, Visit Columbus', VC + 'art-architecture/columbus/art-architecture/landscape-architect-dan-kiley']] }),

  x({ slug: 'first-christian-turns-fifty', when: '1992', section: 'faith', landmark: 'firstchristian',
    title: 'Saarinen’s church turns fifty',
    dek: 'In 1992 First Christian Church celebrated half a century in the building that started Columbus architecture. The decade ended with plans to grow and, soon after, a national landmark listing.',
    body: [
      'First Christian Church was dedicated in 1942, the work of Eliel Saarinen, and its congregation was still worshiping there fifty years later. According to Wikipedia’s history of the church, the congregation celebrated the building’s semicentennial in 1992.',
      'The church took care of what it had. In 1991 the large tapestry behind the chancel was taken down for a time to be restored. In 1995 the church started a family Bible school. In 1996 senior pastor Harold T. Armstrong, who had served since 1978, left, and Mark Jones succeeded him.',
      '## Room to grow',
      'By the end of the decade the congregation needed more space. In February 1999, Wikipedia records, the church asked to close a block of Fourth Street to connect the church to its youth center. The Plan Commission turned the request down, and the congregation withdrew it. Instead, late in 1999, architect Nolan Bingham finished plans for an expansion that included a three story classroom building. Visit Columbus describes what was built: a two story classroom wing on the south side, finished in 2002 in a slightly contrasting brick, designed by Bingham of the Paris Bingham Partnership in Columbus. An art show in September 2002 celebrated the finished work.',
      'Recognition followed. Wikipedia says the church was added to the National Register of Historic Places and named a National Historic Landmark on January 3, 2001; Visit Columbus gives the year as 2000.',
      'It has kept caring for the building since. Cracks in the tall bell tower reappeared in 2018. Restoration began in 2022, and in 2023 the congregation celebrated a restored tower after about eight months of work. More than eighty years after it was built, the church that began the town’s architecture story is still home to a working congregation.',
    ],
    sources: [['First Christian Church (Columbus, Indiana), Wikipedia', WP + 'First_Christian_Church_(Columbus,_Indiana)'], ['First Christian Church, Visit Columbus Indiana', VC + 'first-christian-church/']] }),

  x({ slug: 'mill-race-park', when: '1993', section: 'river',
    title: 'A park built to flood',
    dek: 'Mill Race Park opened in its present form in 1993 on land once called Death Valley. Michael Van Valkenburgh designed it to go underwater and come back.',
    body: [
      'The land beside downtown, where two rivers meet, floods. From the 1930s to the early 1960s, Wikipedia says, it was a poor neighborhood of substandard housing, prone to flooding, and it became known as “Death Valley.” In 1963 the city bought the site, cleared it and made a first park there, called Tipton Park.',
      'The idea for something better came at a birthday party. Visit Columbus says J. Irwin Miller’s 75th birthday celebration was held in the park in 1984 and drew more than 5,000 people, and those who came suggested that a master planner could make it something special. In the late 1980s the city hired the landscape architect Michael Van Valkenburgh, with the architect Stanley Saitowitz designing the park’s structures in red painted metal. The current design was completed in 1993.',
      '## Working with the water',
      'Instead of fighting floods, the design expects them. Wikipedia notes that about 60 percent of the park is underwater in a flood. Visit Columbus describes how paths are concrete rather than asphalt, which floods can peel up; restroom walls are raised so water can pass through; and the playground sits on a raised earth platform. Plants were chosen for both drought and soaked soil. The earth dug to make the round lake was used to build the crescent shaped amphitheater, whose crest stays dry in high water.',
      'There is an 84 foot observation tower, a covered bridge moved to the park, a boathouse and a fishing pier. Wikipedia gives the park’s size as 83 acres and Visit Columbus as 85.',
      'The park won a 1993 Boston Society of Landscape Architects Honor Award and a 1994 ASLA Design Merit Award, and Architectural Record named it an outstanding new park. Today it hosts the town’s biggest outdoor concerts, and whenever the river rises, it does exactly what it was designed to do.',
    ],
    sources: [['Mill Race Park, Wikipedia', WP + 'Mill_Race_Park'], ['Mill Race Park, Visit Columbus', VC + 'see-do/mill-race-park'], ['The landscape architects of Columbus, Indiana, Visit Columbus', VC + 'art-architecture/columbus/art-architecture/landscape-architect-dan-kiley']] }),

  x({ slug: 'visitors-center-chandelier', when: '1995', section: 'culture',
    title: 'Nine hundred pieces of yellow glass',
    dek: 'In 1995 Xenia Miller dedicated the Columbus Visitors Center in an 1864 house on Fifth Street, and staff switched on a Dale Chihuly chandelier for the first time.',
    body: [
      'The building at 506 Fifth Street began as a home. The Republic reports that John V. Storey built it in 1864, and that over the years it served as a furniture store and as newspaper offices, among other uses. Wikipedia credits Xenia Miller with helping restore the Storey House as part of her work reviving downtown, and with helping to form the Visitors Center.',
      'In 1995 Miller dedicated the Visitors Center from its west steps, The Republic says, and staff lit the chandelier for the first time during the ceremony. It was designed by the glass artist Dale Chihuly. “It is 900 individual, hand blown pieces of glass that make up the chandelier,” Erin Hawkins, the center’s director of partnerships and communications, told the paper. Wikipedia’s list of Chihuly’s works names the piece Yellow Chandelier and Persians and dates it to 1995.',
      '## Where the tours begin',
      'The Visitors Center is where architecture tours of Columbus start. Miller’s ties to the Visitors Center went back further. Wikipedia says she launched a Columbus gallery of the Indianapolis Museum of Art in 1974, housed at the Visitors Center, and in 1993 gave money for a new gallery space at The Commons.',
      'Miller was born in Morgantown, Indiana, in 1917, graduated from high school in Columbus in 1934 and married J. Irwin Miller in 1943. She died in 2008.',
      'In 2025 the center marked its 30th anniversary on the same west steps, with a new plaque and a video of the 1995 dedication. “It’s really just a celebration of 30 years of welcoming people into our building,” Hawkins said. A second Chihuly work, Sun Garden Panels in Suspended Circle, was installed at the Columbus Learning Center in 2007.',
    ],
    sources: [['Columbus Visitors Center to celebrate 30th anniversary, The Republic', 'https://www.therepublic.com/?p=833009'], ['Xenia Miller, Wikipedia', WP + 'Xenia_Miller'], ['List of works by Dale Chihuly, Wikipedia', WP + 'List_of_works_by_Dale_Chihuly']] }),

  x({ slug: 'memorial-for-veterans', when: '1997', section: 'service',
    title: 'Twenty five pillars and the letters home',
    dek: 'Dedicated in 1997, the Bartholomew County Memorial for Veterans is a grove of 25 limestone pillars carved with the names of the county’s war dead and the words they wrote home.',
    body: [
      'The Bartholomew County Memorial for Veterans stands on the courthouse square at 234 Washington Street. The American Legion’s memorial registry gives its installation date as May 30, 1997.',
      'It came out of a national design competition, won by Thompson and Rose Architects, according to the firm’s project notes and The Clio. Like many public projects in Columbus, it was supported by the Cummins Foundation Architecture Program. Charles Rose’s firm puts the cost at $1.5 million.',
      '## A grove of stone',
      'The memorial is 25 pillars of Indiana limestone, set in five rows of five. The Legion’s registry gives their height as 40 feet. From a distance the group looks like one rough block of stone; as you walk around it, the firm says, it shifts “from solid to transparent.” Inside, the smooth faces of the pillars carry the names of the county’s dead from the wars of the 20th century, and, among them, excerpts from letters and diaries those soldiers wrote. The Clio lists World War I, World War II, Korea and Vietnam.',
      'Architecture magazine’s critic wrote in September 1997, as quoted by the firm, that “from the inside, the memorial forms an intimate, roofless hypostyle hall that immerses the visitor in a field of stone and sentiment.” At night, lights in the base throw shadows up the stone.',
      'The memorial won a Boston Society of Architects Design Honor Award and a Tucker Award from the Building Stone Institute. But its real work is quieter. You read a soldier’s words about home, then look up and find the names.',
    ],
    sources: [['Bartholomew County Memorial for Veterans, Charles Rose Architects project data', 'https://archive.charlesrosearchitects.com/wp-content/uploads/2012/06/Memorial_Columbus_Data_Pages.pdf'], ['Bartholomew County Memorial for Veterans, The Clio', 'https://theclio.com/entry/115101'], ['The Bartholomew County Memorial for Veterans, The American Legion', 'https://www.legion.org/memorials/united-states/indiana/united-states-indiana-the-bartholomew-county-memorial-for-veterans/']] }),

  x({ slug: 'kidscommons-opens', when: '1998', section: 'schools',
    title: 'A children’s museum in the mall',
    dek: 'After about three years of planning, a group of citizens opened kidscommons in The Commons in 1998. In 2005 it moved into the old J.C. Penney store on Washington Street.',
    body: [
      'Columbus had architecture tours for grownups. In the 1990s a group of citizens set out to build something for children. The kidscommons history says they met to discuss whether a children’s museum was possible, under the leadership of founding member Lynne Maguire. After nearly three years of study and planning, according to the Kid at Art pages that document the museum, kidscommons opened in 1998.',
      'Its first home was a pilot museum in The Commons Centre, the downtown mall, a short walk from Jean Tinguely’s sculpture Chaos I. Kid at Art lists some of what children found there: a laser harp, a robotic arm, an overhead electric train, a resident dinosaur named Indiana Bones and yo-yos made in Columbus hanging from the ceiling.',
      '## Moving up Washington Street',
      'It outgrew the space. On October 1, 2005, kidscommons opened at 309 Washington Street, in a building once occupied by the J.C. Penney department store, with about five times the room of the original. Local architect Louis Joyner led the design, with help from Quatrefoil Exhibit Designers of Maryland and people from the Cincinnati Children’s Museum. The museum is made for children from infancy through age twelve.',
      'The Republic later reported plans for a party marking 20 years in the downtown building.',
      'A generation of Columbus kids has now learned about bubbles, robots and buildings there.',
    ],
    sources: [['Mission and history, kidscommons', 'https://www.kidscommons.org/about-us/mission-and-history/'], ['kidscommons, Kid at Art', 'https://www.kid-at-art.com/htdoc/kidscomm.html'], ['kidscommons to celebrate 20 years of fun with anniversary party, The Republic', 'https://www.therepublic.com/?p=829248']] }),

  x({ slug: 'north-swimming-three-straight', when: '1999', section: 'sports',
    title: 'A swimming town',
    dek: 'Columbus North won three straight boys swimming state titles from 1998 to 2000 under coach Jim Sheridan, in a pool named for one of the school’s earlier champions.',
    body: [
      'Columbus has long been a swimming town. The Indiana High School Athletic Association’s championship history shows Columbus High winning boys swimming and diving state titles in 1959, 1960, 1961, 1963, 1964 and 1965. One of the stars of those teams was Charles “Chick” Newell, who, according to the Indiana High School Swimming and Diving Hall of Fame, won the state 100 yard breaststroke in 1963, 1964 and 1965 and set a state record in it in 1964.',
      'Newell went on to coach swimming for 31 years. The pool at Columbus North is now the Charles (Chick) Newell Natatorium, named in his honor. He died in 2003.',
      '## Three in a row',
      'At the end of the 1990s North’s boys did it again. The IHSAA history shows Columbus North winning the boys swimming and diving state championship in the seasons ending in 1998, 1999 and 2000. The Hall of Fame credits coach Jim Sheridan with leading North to all three.',
      'Sheridan had won a state title in town before. The Hall of Fame says he coached Columbus East from 1980 to 1984 and won his first state championship there with the girls team; the IHSAA lists East’s girls title in the 1982 to 1983 season. That made him one of very few coaches with state titles at more than one school. He was named Indiana coach of the year nine times and also coached the Donner Swim Club.',
      'North’s girls added state cross country titles later, and its boys cross country teams won seven, starting in 2002. But for three straight winters at the turn of the century, the best high school boys swimming team in Indiana trained in Columbus.',
    ],
    sources: [['State Championship History, Indiana High School Athletic Association', 'https://www.ihsaa.org/sites/default/files/documents/State%20Championship%20History.pdf'], ['Jim Sheridan, Indiana High School Swimming and Diving Hall of Fame', 'https://ihssdhof.org/?p=634'], ['Charles “Chick” Newell, Indiana High School Swimming and Diving Hall of Fame', 'https://ihssdhof.org/?p=396']] }),

  x({ slug: 'second-street-bridge', when: '1999', section: 'civic', landmark: 'bridge',
    title: 'An orange front door for the town',
    dek: 'In 1999 a cable stayed bridge carried State Road 46 over the river into downtown. In 2013 it was named for Bob Stewart, the mayor who led Columbus through the 1980s and 1990s.',
    body: [
      'For many people driving in from the interstate, Columbus begins at the river. In the 1990s, according to Architecture Indiana, the city built a new bridge on Second Street as part of the Front Door Project, which aimed to connect downtown to the interstate along State Road 46. Visit Columbus lists the Front Door Project among the Columbus works of Michael Van Valkenburgh, the landscape architect who also designed Mill Race Park next to it.',
      'The bridge was finished in 1999. It was designed by J. Muller International. The City of Columbus calls it a cable stayed bridge, fully suspended, with 40 cables fanning out to its sides. Architecture Indiana notes its four A shaped pylon legs painted bright orange and calls it an early example of a cable stayed bridge in the United States.',
      '## Lights and a name',
      'In 2012, the city says, City Engineer Dave Hayward worked with two Indianapolis companies to add colored lights to the bridge, so it would be something to see at night as well as by day.',
      'In 2013 Governor Mike Pence, a Columbus native, declared that the Second Street Bridge would be named the Robert N. Stewart Bridge, in honor of the former three term mayor. Stewart was elected in 1984 and served until 1995, WISH TV reported, and he is remembered for drawing new businesses to Columbus and helping revive downtown. He died in 2015 at 86.',
      'Today the bridge is one of the first things people see as they drive into town, and it does what its planners hoped, announcing that this is a place where even the bridges are designed.',
    ],
    sources: [['About the bridge, City of Columbus', 'https://www.columbus.in.gov/engineering/news/about-the-bridge/'], ['Robert N. Stewart (Second Street) Bridge, 1999, Architecture Indiana', 'https://www.architectureindiana.com/?p=46150'], ['The landscape architects of Columbus, Indiana, Visit Columbus', VC + 'art-architecture/columbus/art-architecture/landscape-architect-dan-kiley'], ['Iconic former mayor of Columbus dies at 86, WISH TV', 'https://wishtv.com/news/iconic-former-mayor-of-columbus-dies-at-86']] }),
];
