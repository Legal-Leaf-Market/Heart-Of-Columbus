// Columbus in the 1930s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const ARVIN = ['Arvin Industries, Inc. (company history), Encyclopedia.com', 'https://encyclopedia.com/books/politics-and-business-magazines/arvin-industries-inc'];
const CUMMINS_CO = ['Cummins Engine Company, Inc. (company history), Encyclopedia.com', 'https://www.encyclopedia.com/books/politics-and-business-magazines/cummins-engine-company-inc'];
const CLESSIE = ['Clessie Cummins, Wikipedia', WP + 'Clessie_Cummins'];
const FCC = ['First Christian Church (Columbus, Indiana), Wikipedia', WP + 'First_Christian_Church_(Columbus,_Indiana)'];
const CITY = ['Columbus, Indiana, Wikipedia', WP + 'Columbus,_Indiana'];

const x = (o) => ({ checked: CHECKED, ...o });

export const A1930s = [
  x({ slug: 'noblitt-sparks-moves-to-columbus', when: '1931', section: 'industry',
    title: 'The heater company comes to town',
    dek: 'In the worst year of the Depression, Noblitt-Sparks Industries moved its headquarters from Indianapolis to Columbus. It became Arvin, one of the two companies that would shape the city.',
    body: [
      'The company that Columbus would later know as Arvin did not start here. It began in 1919 as an Indianapolis partnership making tire pumps. Quintin G. Noblitt, Frank H. Sparks and Albert G. Redmond each put in $1,000 and rented space for $10 a month. In 1920 an inventor named Richard Hood Arvin gave the young company the rights to sell his car heater, and the Arvin name was attached to the product long before it was attached to the company.',
      'Columbus entered the story in 1925, when the heater business was split off and moved to a plant here. In 1927 the company renamed itself Noblitt-Sparks Industries, and in 1928 it went public on the Chicago Stock Exchange with sales approaching $3 million.',
      'Then came 1931. That year Noblitt-Sparks moved its headquarters from Indianapolis to Columbus and closed its plant in Seymour. It also posted its first loss, about $100,000. The company history notes that 1932 was the last unprofitable year it would ever have.',
      'For a town of under 10,000 people (the 1930 census counted 9,935), a growing manufacturer setting up its head office was a big change. Columbus was already home to the Cummins Engine Company, which was still years away from its first profit. Now it had a second industrial company with its leadership in town.',
      'The heater that carried Richard Arvin’s name kept selling for decades; production of the Arvin heater did not end until 1963. In 1950 the company took the name of its best known product and became Arvin Industries, Inc. By then it was making radios, televisions, metal furniture and parts for the car industry.',
      'Arvin stayed headquartered in Columbus until its 2000 merger with Meritor Automotive, when the new ArvinMeritor set its headquarters in Troy, Michigan. That move is a story for another decade. In 1931, the news was simpler: in a year when companies across the country were closing doors, one moved its front door to Columbus.',
    ],
    sources: [ARVIN, CITY, ['ArvinMeritor, Inc. History, FundingUniverse', 'https://www.fundinguniverse.com/company-histories/arvinmeritor-inc-history/']] }),

  x({ slug: 'diesel-at-the-indianapolis-500', when: '1931', section: 'sports',
    title: 'Five hundred miles without a pit stop',
    dek: 'In 1931 a Columbus engine company sent a diesel to the Indianapolis 500. It did not win. It never stopped, either.',
    body: [
      'Clessie Cummins had been around the Indianapolis 500 since the beginning. A Visit Columbus history notes that in 1911 Ray Harroun invited him onto his pit crew, and that car won the first race. Twenty years later Cummins came back with a car of his own and an argument to make.',
      'The argument was the diesel engine. In 1931 most people thought of diesels as heavy, slow machines for boats and farms. Cummins Engine Company, which Clessie founded in Columbus in 1919 with backing from banker William G. Irwin, was trying to prove they could move a vehicle on the road. Clessie had already driven a diesel powered Packard to the New York auto show on a few dollars of fuel. The 500 was a bigger stage.',
      'According to Wikipedia’s account, the race car carried an 85 horsepower Cummins Model U marine diesel in a Model A Duesenberg chassis. Sports Illustrated, looking back in 1970, reported that the driver was Dave Evans, a 28 year old Texan, with Thane Houser riding along as mechanic. The minimum qualifying speed that year was 70 miles an hour.',
      'The car finished 13th. Louis Schneider won the race. But the Cummins Diesel Special ran all 500 miles without a single pit stop. Wikipedia’s entry on Thane Houser adds that it was the slowest qualifier and started 17th of 40 cars. Sports Illustrated printed what Clessie told reporters: “I don’t claim to have the fastest car in the race, but I do have the sturdiest, most reliable engine.”',
      'That was the point. The same Sports Illustrated piece reports that the car also set a diesel speed record of 100.75 miles an hour in 1931. For a company that had not yet turned a profit, the publicity mattered as much as the result.',
      'Cummins would return to Indianapolis with diesels in later years, and Clessie would retire as chairman in 1955. The 1931 run is still the moment most people point to when they explain how a small engine shop in Columbus got the trucking industry to take the diesel seriously.',
    ],
    sources: [CLESSIE, ['Thane Houser, Wikipedia', WP + 'Thane_Houser'], ['500 miles without a pit stop, Sports Illustrated Vault (June 8, 1970)', 'https://vault.si.com/vault/1970/06/08/500-miles-without-a-pit-stop'], ['A Quick History of Cummins, Visit Columbus Indiana', 'https://columbus.in.us/cummins-history/']] }),

  x({ slug: 'diesel-truck-crosses-the-country', when: '1931', section: 'industry',
    title: 'New York to Los Angeles on $11.22 of fuel',
    dek: 'Months after the 500, Cummins sent a diesel truck across the country. The numbers it brought home were a sales pitch to every fleet owner in America.',
    body: [
      'The race at Indianapolis showed a diesel could run all day. The next question was whether it could earn a living. In August 1931 Cummins answered with a truck.',
      'As Construction Equipment magazine retold the story in 2010, the truck left New York in early August 1931, bound for Los Angeles. It was a special truck built in Indianapolis around a Cummins diesel. Three driver mechanics took turns at the wheel, Clessie Cummins among them, and Continental Oil Co. supplied the fuel oil along the way.',
      'The route crossed the Allegheny Mountains, ran through southern Illinois and St. Louis, passed near Amarillo, Texas, and climbed through the Cajon Pass near Barstow, California. The trip was not smooth. The article lists weakened brakes, a leak in the cooling system, a failed rocker arm, a fire in the cab and detours around washed out bridges. At one point a new fuel pump had to be shipped from the Cummins factory in Columbus.',
      'The truck covered 3,214 miles. Total time was 125 hours and 52 minutes, with 97 hours and 20 minutes of actual running. It averaged 33.03 miles an hour and 15.75 miles a gallon, and the fuel for the whole trip cost $11.22. The running time beat the gasoline truck record of 103 hours and 59 minutes that General Motors had set earlier.',
      'Those are the figures a trucking company cares about, and fleet owners noticed. Wikipedia’s account of Clessie Cummins adds that W. G. Irwin’s Purity Stores in California switched its delivery trucks to diesel in the 1930s, and that the success helped build the over the road diesel truck business.',
      'The road from publicity to profit was still long. Company histories date Cummins Engine Company’s first profitable year to 1937. But the cross country run of 1931 set the pattern the company followed for the rest of the century: prove the engine on the road, then sell it to the people who drive for a living.',
    ],
    sources: [['The Great Truck Run of 1931, Construction Equipment (2010)', 'https://www.constructionequipment.com/great-truck-run-1931'], CLESSIE, CUMMINS_CO] }),

  x({ slug: 'arvin-radios', when: '1935', section: 'industry',
    title: 'Columbus builds the radio',
    dek: 'In the middle of the Depression, the Columbus heater company went into radios, first for cars and then for living rooms.',
    body: [
      'By the early 1930s Noblitt-Sparks Industries had moved its headquarters to Columbus and was known for the Arvin car heater. It did not stay a heater company for long.',
      'In 1933 the company entered the car radio business. Two years later, in 1935, it introduced its first Arvin radio for the home. Wikipedia’s history of Columbus notes that in the 1930s Noblitt-Sparks built radios under the Arvin brand, the same name it had long used on its heaters.',
      'The move paid off. In 1937, the company history says, annual sales passed $10 million for the first time. That same year Frank Sparks, one of the three men who had started the business with a tire pump in 1919, left the company. In the late 1930s it was listed on the New York Stock Exchange.',
      'In 1940 it began supplying Sears, Roebuck and Co. with home radios and opened a Columbus factory for metal outdoor furniture and dinette sets. The habit of making whatever American households wanted next would carry it through the war years and into television; the company made its first TV set late in 1949.',
      'In 1950 the company renamed itself after its best known brand and became Arvin Industries, Inc. It left the television business in 1955 and turned its attention back to the car, with exhaust systems from 1959 and its first catalytic converter in 1974.',
      'In the 1930s, though, it was a company that had come to Columbus only a few years before and was still deciding what it wanted to be.',
    ],
    sources: [ARVIN, CITY] }),

  x({ slug: 'j-irwin-miller-joins-cummins', when: '1934', section: 'industry',
    title: 'A 25 year old takes over the engine shop',
    dek: 'J. Irwin Miller came home from Yale and Oxford in 1934 to run a family investment that had never made money. Three years later it did.',
    body: [
      'J. Irwin Miller was born in Columbus on May 26, 1909. He graduated from Yale in 1931 and studied philosophy, politics and economics at Balliol College, Oxford, from 1931 to 1933. In 1934 he joined Cummins Engine Company, the business his great uncle William G. Irwin had been backing since 1919. A history published by Visit Columbus says he became general manager that year.',
      'He took charge of a company that had a famous engine and a poor balance sheet. W. G. Irwin had invested more than $2.5 million in the engine business, according to one company history, and the Depression had wiped out its early market for yacht engines. The diesel publicity runs of 1930 and 1931 had earned headlines and the interest of truck fleets, but not yet profits.',
      'In 1937, company histories say, Cummins posted its first profit. Not every account agrees on the date: the Visit Columbus history places a first profit about three years after the 1919 founding. The 1937 date is the one used in most published company histories.',
      'Miller’s rise from there was steady. He served as executive vice president from 1944 to 1947, president from 1947 to 1951, and chairman from 1951 to 1977. In 1954 he set up the Cummins Foundation, and in 1957 the foundation offered to pay architects’ fees for new public buildings in Columbus. That offer is why visitors come to see the town today.',
      'He was also a churchman. He helped establish the National Council of Churches in 1950 and became its first lay president in 1960. When he died on August 16, 2004, at 95, a writer quoted on Wikipedia summed up his life in one line: “Mr. Miller had the whole town as a monument.”',
      'All of that began in 1934, with a young man walking into an engine plant his family owned and trying to make it pay.',
    ],
    sources: [['J. Irwin Miller, Wikipedia', WP + 'J._Irwin_Miller'], CUMMINS_CO, ['A Quick History of Cummins, Visit Columbus Indiana', 'https://columbus.in.us/cummins-history/']] }),

  x({ slug: 'the-crump-gets-sound', when: '1934', section: 'culture',
    title: 'New owners and new sound at the Crump',
    dek: 'Columbus’s old opera house changed hands in 1931 and got a new sound system in 1934. It kept the town at the movies through the Depression.',
    body: [
      'The Crump Theatre was already more than 40 years old when the Depression hit. John Smith Crump had bought the Keith’s Arcade property at auction on January 28, 1889, for $6,000, hired architect Charles Sparrell, and opened Crump’s New Theatre on October 30, 1889. Wikipedia calls it the oldest theater in Indiana.',
      'It had been a stage house first. The first motion pictures were shown there on September 12, 1905, and the theater counts November 26, 1914, as the official start of its life as a movie house. After Crump died, his heirs paid for a major remodeling in 1920 that joined the building’s two sections into one, and in 1923 Frank Rembusch leased it.',
      'The 1930s brought two changes. On December 30, 1931, the Crump heirs sold the theater to Louis Holwager of Madison, Indiana, for $50,000. Then, in 1934, the lease passed to Truman Rembusch’s Syndicated Theaters, and a second remodeling finished on July 13, 1934, with a new sound system and an updated interior. Sound films had swept the country in the late 1920s, and a theater that wanted to stay in business needed to be heard as well as seen.',
      'One more remodel followed in 1941, when Alden Meranda gave the building the Art Deco look it still has. That front, with its curved lines and marquee, is what most people in Columbus picture when they think of the Crump.',
      'The theater stayed a movie house for decades. Competition came with Columbus Cinemas in 1968, and the Crump stopped showing films in 1997. It was placed on Indiana Landmarks’ list of the ten most endangered places in April 2019, and efforts to bring it back have continued since. In the 1930s, though, it was simply where Columbus went to the movies.',
    ],
    sources: [['The Crump Theatre, Wikipedia', WP + 'The_Crump_Theatre'], ['Crump Theatre, Discover Indiana', 'https://discoverindianahistory.org/items/show/390']] }),

  x({ slug: 'tabernacle-church-chooses-saarinen', when: '1936', section: 'faith', landmark: 'firstchristian',
    title: 'A congregation asks for something new',
    dek: 'In 1936 the Tabernacle Church of Christ decided it needed a new home. The choice it made next put Columbus on the architectural map.',
    body: [
      'The congregation that became First Christian Church is much older than its famous building. Wikipedia’s history traces it to 1855, when the Christian Congregation in Columbus split from New Hope Church. By 1878 or 1879 it had moved and taken the name Tabernacle Church of Christ, which it kept until 1957.',
      'In 1930 Thomas K. Smith became senior pastor. In his annual report for 1936 he called for a new building. On May 31, 1936, William G. Irwin and his sister Linnie I. Sweeney offered the congregation a site on Railroad Square.',
      'What happened next is the part of the story people still argue over. According to the Wikipedia account, the first architect, E. B. Gilchrist, withdrew, and the church elders chose Eliel Saarinen, over Frank Lloyd Wright. Nettie Sweeney Miller chaired the building committee. Her son, J. Irwin Miller, was involved in the design, and sources disagree on whether he or his mother first suggested the Saarinens. Saarinen was reluctant at first and agreed on the condition that he have a free hand with the style.',
      'Rev. Smith explained the decision in 1943, in words Visit Columbus summarizes: no traditional architectural style could express what the church was for, so the commission went to Saarinen. The Royal Institute of British Architects holds an interior design drawing for the Tabernacle Church dated 1936, the year the project began.',
      'The building took several more years. Site clearing started in July 1940, the cornerstone was laid on April 20, 1941, and the church was dedicated on May 31, 1942, six years to the day after the land was offered. It cost about $750,000. Its 166 foot bell tower, Visit Columbus says, became the city’s iconic symbol of modern architecture.',
      'Visit Columbus calls it the first contemporary building in Columbus and one of the first contemporary churches in the United States. It became a National Historic Landmark in 2001. It began with a pastor’s annual report and a congregation willing to try something no one in town had seen.',
    ],
    sources: [FCC, ['First Christian Church, Visit Columbus Indiana', 'https://columbus.in.us/first-christian-church/'], ['Design for the Tabernacle Church of Christ, RIBApix', 'https://www.architecture.com/image-library/ribapix/image-information/poster/design-for-the-tabernacle-church-of-christ-columbus-indiana/posterid/RIBA20613.html']] }),

  x({ slug: 'irwin-union-trust-through-the-depression', when: '1937', section: 'industry', landmark: 'irwin',
    title: 'The bank that stayed open',
    dek: 'While banks failed across the country, the Irwin family’s bank in Columbus came through the Depression. Its own records show how.',
    body: [
      'Irwin’s Bank started in 1871 as a department of Joseph I. Irwin’s dry goods store in Columbus. A company history on ReferenceForBusiness says Irwin opened it after a local bank failed. By 1895 the family had left the dry goods trade to focus on banking, and when Joseph Irwin died in 1910 his son William G. Irwin became president. He held the job for 33 years.',
      'In 1928, a year before the stock market crash, W. G. Irwin merged his private bank with the Union Trust Company to form the Irwin Union Trust Company. A timeline held by the Bartholomew County Public Library archives describes the merger as coming ahead of the economic downturn. Union Trust itself had been formed in 1922 from the merger of People’s Savings and Trust Company and Farmers Trust Company.',
      'The same company history says the Columbus bank stayed solvent after the 1929 crash while others around it failed, because W. G. Irwin had moved its investments into cash. The library timeline gives the numbers for 1937: loans of $1,809,000, deposits of $4,173,000 and net earnings of $40,000.',
      'That stability mattered beyond the bank. W. G. Irwin was also the man who had been paying for Clessie Cummins’s diesel experiments since 1919, and he and his sister Linnie Sweeney offered the land for the new Tabernacle Church in 1936. Much of what Columbus built in the next half century traces back to money that came through the 1930s intact.',
      'When W. G. Irwin died in 1943, Hugh Th. Miller became president, and in 1947 his son J. Irwin Miller followed. In 1954 the bank took the name Irwin Union Bank and Trust Company, and in March 1955 it opened its glass walled downtown office by Eero Saarinen, now a National Historic Landmark.',
      'The bank did not last forever. That is a story for a later decade. In the 1930s, the important fact was that it was still open.',
    ],
    sources: [['Timeline history of Irwin Union Bank, Bartholomew County Public Library archives', 'https://bcplarchives.omeka.net/items/show/159'], ['History of Irwin Union Bank and Trust Company, Bartholomew County Public Library archives', 'https://bcplarchives.omeka.net/items/show/160'], ['Irwin Financial Corporation (company history), ReferenceForBusiness', 'https://www.referenceforbusiness.com/history2/52/Irwin-Financial-Corporation.html']] }),

  x({ slug: 'remc-brings-power-to-the-farms', when: '1937', section: 'civic',
    title: 'The farmers who wired the county',
    dek: 'In 1937 a group of Bartholomew County farmers formed their own electric cooperative. A year later the lights came on.',
    body: [
      'In the 1930s, electricity stopped where the town did. Columbus had power. Most farms around it did not, because private utilities did not think it paid to run lines down long country roads to a few customers at a time.',
      'The federal Rural Electrification Act of 1936 made loans available to cooperatives that would build those lines themselves. In Bartholomew County, a small group of farmers led by Fred Suhre took up the offer. According to the cooperative’s own history in Indiana Connection magazine, Bartholomew County REMC was incorporated on May 19, 1937.',
      'The first pole went in on the Frank Schuder property near Taylorsville in July 1938. By early October 1938 the cooperative had energized 284 miles of line and connected 121 members. Members paid about 11 cents a kilowatt hour, which came to an average bill of about $2.50 a month. In 1939 the average member used about 40 kilowatt hours a month, enough for lights, a radio and perhaps an iron.',
      'It is hard to overstate what that meant on a farm. Electric light replaced kerosene lamps. Pumps replaced hand pumping. In time came refrigerators, milking machines and freezers.',
      'The cooperative is still at work. In 2022, the same history reported 1,235 miles of line, 11,925 metered accounts and an average home using about 1,180 kilowatt hours a month, around 30 times what a 1939 member used. The rate was still about 11 cents.',
      'The REMC is owned by the people it serves, the same way it was in 1937. It began because farmers decided not to wait for someone else to bring them the future.',
    ],
    sources: [['Celebrating 85 years, Bartholomew County REMC in Indiana Connection', 'https://www.indianaconnection.org/celebrating-85-years-3/'], ['Rural Electrification Act, Wikipedia', WP + 'Rural_Electrification_Act']] }),

  x({ slug: 'fire-department-diesel-pumper', when: '1939', section: 'civic',
    title: 'A Cummins diesel on the fire truck',
    dek: 'The Columbus Fire Department ended the 1930s with a chief, 13 firefighters, five motorized rigs and a new pumper powered by a hometown engine.',
    body: [
      'The Columbus Fire Department’s own history begins in 1835, when the town incorporated and formed a volunteer brigade. For years firefighters brought their own buckets. The city bought its first real equipment in 1852, built No. 1 Fire House next to City Hall in 1895, and opened No. 2 at Thirteenth Street and Hutchins Avenue in January 1909.',
      'The horses went away after World War I. In 1918 No. 1 Company switched to two American LaFrance fire trucks, and the volunteer company was disbanded. No. 2 got its own truck about two years later.',
      'The 1930s were lean years, and the department grew slowly. The city bought a car for the chief in 1931. In 1934 it added one more man, bringing the department to a chief and thirteen firefighters.',
      'Then, in 1939, the city bought a new pumper with a Cummins Diesel motor. It gave the department five pieces of motorized equipment. For a town whose largest employer was trying to convince the world that diesels were dependable, putting one on the fire truck made a point of its own.',
      'The decade ended with the department’s home falling apart. In 1940 old No. 1 was condemned as unsafe and the company moved to temporary quarters. The old building came down in February 1941. A new Central Fire Station, designed by Indianapolis architect Leighton Bowers and built by Dunlap and Company of Columbus, went up at Eleventh and Washington streets that year, and No. 1 Company moved in on August 9, 1941.',
      'Today, the city says, the department has 95 career firefighters in six firehouses covering about 28 square miles. One of those firehouses, Fire Station 4 by Robert Venturi, is itself on the architecture tour.',
    ],
    sources: [['History of the Columbus Fire Department, City of Columbus', 'https://www.columbus.in.gov/fire/about/history-of-the-columbus-fire-department/'], ['City Fire Department History, 1835 to 1941, Historic Columbus Indiana', 'https://www.historiccolumbusindiana.org/firedept/cover.html']] }),
];
