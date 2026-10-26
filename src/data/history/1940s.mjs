// Columbus in the 1940s. Each article is written only from the sources
// listed with it; see src/data/history/index.mjs for the rules.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const ATTERBURY = ['Camp Atterbury, Wikipedia', WP + 'Camp_Atterbury'];
const AIRPORT = ['Airport history, City of Columbus', 'https://www.columbus.in.gov/airport/about/history'];
const MARKER = ['Atterbury Army Air Field historical marker, Indiana Historical Bureau', 'https://www.in.gov/history/markers/528.htm'];
const FCC = ['First Christian Church (Columbus, Indiana), Wikipedia', WP + 'First_Christian_Church_(Columbus,_Indiana)'];
const ARVIN = ['Arvin Industries, Inc. (company history), Encyclopedia.com', 'https://encyclopedia.com/books/politics-and-business-magazines/arvin-industries-inc'];
const CLESSIE_WAR = ['The people who built Cummins: Clessie and the War, Cummins Inc. (2026)', 'https://cummins.com/en-na/news/2026/04/15/people-who-built-cummins-clessie-and-war'];

const x = (o) => ({ checked: CHECKED, ...o });

export const A1940s = [
  x({ slug: 'columbus-specialty-becomes-cosco', when: '1941', section: 'industry',
    title: 'A matchbox company becomes Cosco',
    dek: 'Columbus Specialty Company started with a tin matchbox in 1935. In 1941 it shortened its name to Cosco, and after the war it filled American kitchens with metal stools.',
    body: [
      'Some Columbus companies began with a big engine or a famous inventor. Cosco began with a matchbox.',
      'According to the company’s own history, it was founded in Columbus in 1935 as the Columbus Specialty Company, around the invention of a tin matchbox for the kitchen that dispensed new matches and held the used ones. In 1941 it began using the brand name Cosco, a contraction of COlumbus Specialty COmpany.',
      'Then the war came. Like most American factories, the company history says, it turned to making military equipment during World War II.',
      'When the war ended, Cosco went back to the kitchen. It introduced what it describes as the first full line of all metal household stools. A history of the brand published by CNHI newspapers adds that its later products included high chairs with metal trays, and credits a man named Hamilton with the idea of a knock down stool that could ship flat. The company later traded as Hamilton Cosco, the name collectors of its midcentury chairs still use.',
      'Cosco’s path after that ran through larger owners. The company’s site says Dorel acquired Cosco in 1988 and made it part of Dorel Juvenile; the CNHI history gives the year as 1998. The two sources disagree, and we have not found a record that settles it.',
      'What both agree on is where it all started, and where part of it still is. The company says its headquarters is still in Columbus, Indiana, on the same campus as a Dorel Juvenile manufacturing plant. It started with a tin matchbox in 1935.',
    ],
    sources: [['About Us, Cosco', 'https://www.coscoproducts.com/pages/about-us'], ['History of Cosco household products in America, CNHI via Effingham Daily News', 'https://www.effinghamdailynews.com/news/history/history-of-cosco-household-products-in-america/article_57334b98-c975-4b61-87b3-a10d3e8eb62b.html'], ['Hamilton Cosco seating, 1stDibs', 'https://www.1stdibs.com/creators/hamilton-cosco/furniture/seating']] }),

  x({ slug: 'camp-atterbury-is-built', when: '1942', section: 'service',
    title: 'Forty thousand acres become an Army camp',
    dek: 'Weeks after Pearl Harbor, the Army decided to build a training camp for 30,000 soldiers just northwest of Columbus. It was up and running by summer.',
    body: [
      'The War Department started looking at Indiana for a new training camp in January 1941, almost a year before the United States entered World War II. On April 28, 1941, it announced plans for a camp that could house 30,000 soldiers. On January 6, 1942, about a month after Pearl Harbor, it decided to go ahead.',
      'The site took in about 40,350 acres in 643 tracts across the farm country northwest of Columbus, where Bartholomew, Johnson and Brown counties meet. Wikipedia’s history puts the estimated land cost at $3.8 million. On February 6, 1942, the camp was named for Brigadier General William Wallace Atterbury. Civilian contractors built it between February and August at a total cost of roughly $35 million.',
      'On August 15, 1942, the 83rd Infantry Division was activated there, and nearly 25,000 people came to the opening ceremonies. That summer the camp also set up a medical training school, and its hospital grew to train field hospital units.',
      'Over the next four years the camp became one of the busiest places in Indiana. The first Women’s Army Corps personnel arrived on March 6, 1943. A prisoner of war camp received its first prisoners, mostly Italian, on April 30, 1943, and German prisoners followed in 1944. In 1944 the camp took over the Army’s reception center from Fort Benjamin Harrison, and in October its separation center, where soldiers came home and were discharged. On December 12, 1945, it discharged 2,971 soldiers in a single day.',
      'The Army suspended operations on August 4, 1946. The Indiana National Guard made the camp its headquarters, and on September 14, 1950, it was reactivated when the 28th Infantry Division arrived to train for Korea.',
      'For Columbus, Atterbury was a neighbor that never fully went away. The post, now Camp Atterbury, is still a working Indiana National Guard training center.',
    ],
    sources: [ATTERBURY, ['Camp Atterbury-Muscatatuck, Wikipedia', WP + 'Camp_Atterbury-Muscatatuck']] }),

  x({ slug: 'first-christian-church-dedicated', when: '1942', section: 'architecture', landmark: 'firstchristian',
    title: 'The church that started it all',
    dek: 'On May 31, 1942, the Tabernacle Church of Christ dedicated a building unlike anything else in town. Columbus’s modern architecture begins here.',
    body: [
      'Work on the Tabernacle Church of Christ started in July 1940 with site clearing. By November the foundation and courtyard were underway, and the cornerstone ceremony was held on April 20, 1941. The facade was largely done by September 1941.',
      'On May 4, 1942, Eliel Saarinen inspected the finished church and handed it over to the building committee. The first meetings were held two days later. One of the first baptisms followed on May 11, and the church was dedicated on May 31, 1942. The organ, built by Aeolian-Skinner with 4,695 pipes, was dedicated on June 21.',
      'The building is a plain rectangle of buff brick and limestone with a large stone cross on its face. Beside it stands a freestanding bell tower 166 feet tall. Visit Columbus calls the tower the city’s iconic symbol of modern architecture. When it opened, the church filled a whole city block and had a sunken garden with a reflecting pool. The pool was later removed because it was hard to maintain.',
      'Inside, the cross is set off center above a wooden screen wall, the pulpit is shaped like a piano and the organ sits behind a skewed wooden screen. Eliel and his wife, Loja Saarinen, designed the chancel tapestry, “The Sermon on the Mount.” Their son, Eero, worked on the design, and a young Charles Eames designed details including the oak sanctuary chairs. The sanctuary seats 580, with a 180 seat gallery and 40 choir seats.',
      'The cost was reported at $700,000 to $750,000. The magazine Christian Standard ran an editorial on May 23, 1942, in which its editor admitted his first misgivings and wrote that “the reality . . . has caught me and thrilled me with the glories of the faith.”',
      'The church was named a National Historic Landmark in 2001. More important for Columbus, it showed J. Irwin Miller and the town what a building could do. Twenty two years later Eero Saarinen would design North Christian Church across town, and the Cummins Foundation would spend decades paying architects to build schools, firehouses and libraries here.',
    ],
    sources: [FCC, ['First Christian Church, Visit Columbus Indiana', 'https://columbus.in.us/first-christian-church/'], ['First Christian: A Modern Masterwork, Christian Standard', 'https://christianstandard.com/first-christian-a-modern-masterwork']] }),

  x({ slug: 'atterbury-army-air-field', when: '1943', section: 'service',
    title: 'An air base north of town',
    dek: 'In 1942 the Army poured runways on farmland north of Columbus. The field trained bomber and glider crews, flew in the wounded, and became today’s Columbus Municipal Airport.',
    body: [
      'Army engineers from Louisville began surveying the site north of Columbus on June 1, 1942. According to the city’s airport history, construction started on August 13, 1942, and the first runway concrete was poured that September. On September 17 a Navy plane making an emergency landing became the first aircraft to use the field, before it was even finished.',
      'The Indiana Historical Bureau marker that stands at the base chapel says construction was run by Captain Stratton O. Hammon, that more than 1,000 workers helped build it, and that the base covered more than 2,000 acres with more than 100 buildings at a cost of over $4 million. Planners meant most of the buildings to be temporary.',
      'Atterbury Army Air Field opened in February 1943. It trained crews for B-25 and B-26 medium bombers and for gliders. Cadets from Freeman Field in Seymour practiced takeoffs and landings there that spring.',
      'By 1944 the field had another job. Hospital planes landed with wounded soldiers from Europe, bound for Wakeman General Hospital at Camp Atterbury, about twelve miles away.',
      'After the war the base was shut down. It reopened in 1949 for Air Force Reserve training, with the 434th Troop Carrier Wing, and its units were called up for Korea. On November 13, 1954, it was renamed Bakalar Air Force Base for First Lieutenant John Edmond Bakalar of Hammond, Indiana, who was killed in action over France on September 1, 1944.',
      'The marker says the base closed in 1970 and was given to the City of Columbus in 1972. It is now Columbus Municipal Airport. One original building was turned into a chapel and, in 1998, dedicated to Jean Lewellen Norbeck, a Women Airforce Service Pilot killed testing aircraft in 1944. The Atterbury Bakalar Air Museum sits beside the control tower.',
    ],
    sources: [AIRPORT, MARKER, ['Columbus Municipal Airport (Indiana), Wikipedia', WP + 'Columbus_Municipal_Airport_(Indiana)']] }),

  x({ slug: 'cummins-goes-to-war', when: '1943', section: 'industry',
    title: 'Engines for the Army and the Navy',
    dek: 'After Pearl Harbor every engine Cummins built went to the war. The company earned three Army and Navy E awards before it was over.',
    body: [
      'When the United States entered World War II on December 7, 1941, Cummins Engine Company turned overnight into a defense plant. A 2026 company history puts it plainly: all of Cummins’ production was devoted to the war effort.',
      'At first that did not mean tanks or trucks. Early in the war, the government preferred gasoline engines for land vehicles, so Cummins mostly built generator sets for Navy ships and the Army Signal Corps. Its Model K diesels powered generators on YMS minesweepers, according to a history of the auto industry in the war, which counts 561 of those small wooden ships built by 35 shipyards.',
      'Later, the government came around to diesel for heavy trucks. The company history credits Clessie Cummins, who joined the War Production Board’s automotive division to represent the diesel industry and traveled back and forth between Columbus and Washington, with helping make that case. Cummins was assigned engines for heavy Army equipment, including the HB600 truck engine. By the end of the war it had built more than 4,500 of them, plus Model A and Model K generator sets.',
      'The work was recognized three times. Cummins received its first Army and Navy E award for production on January 28, 1943, accepted by C. L. Cummins. A second was announced on March 10, 1944, and a third on July 17, 1945.',
      'The war changed the company. The Wikipedia history of Clessie Cummins says the military bought every diesel engine Cummins could make. After the war, company histories say, sales reached $20 million in 1946. Clessie, whose health was failing, moved to California in July 1945. In 1947 J. Irwin Miller became president, on the condition that Clessie stay on as chairman.',
      'The trucks that came home from the war, and the highways the country built for them, would make Cummins one of the biggest diesel makers in the world.',
    ],
    sources: [CLESSIE_WAR, ['Cummins in World War II, U.S. Automotive Industry in World War Two', 'https://www.usautoindustryworldwartwo.com/cummins.htm'], ['Clessie Cummins, Wikipedia', WP + 'Clessie_Cummins'], ['Cummins Engine Company, Inc. (company history), Encyclopedia.com', 'https://www.encyclopedia.com/books/politics-and-business-magazines/cummins-engine-company-inc']] }),

  x({ slug: 'chapel-in-the-meadow', when: '1943', section: 'faith',
    title: 'The chapel the prisoners built',
    dek: 'In the summer of 1943, Italian prisoners of war at Camp Atterbury built themselves a tiny Catholic chapel out of Army scraps. It is still standing.',
    body: [
      'Camp Atterbury’s prisoner of war compound received its first prisoners on April 30, 1943. The Indiana Historical Society says about 3,000 Italian prisoners were held there that year.',
      'Many of them were craftsmen and artists, and they wanted a place to pray. According to the Archdiocese of Indianapolis newspaper, The Criterion, they had to ask permission from the compound’s commander, Lieutenant Colonel John Gammell. The Army gave them no building materials, so they used what the Army left lying around.',
      'Researcher Angela Wolfgram, who studied the chapel for the Indiana Historical Society, believes the work started in July 1943 and took about six weeks. The result is small, 11 feet by 16 feet. The prisoners painted frescoes on the walls and finished the altar to look like marble. By late August 1943 they were using it, and by early October a delegate from the Vatican had celebrated Mass there. Wolfgram told The Criterion that the care the men put into it “really speaks to the great importance they were putting on this chapel.”',
      'The Italian prisoners left Atterbury in May 1944, and German prisoners took their place. The chapel stayed.',
      'Today the Chapel in the Meadow stands on the far west side of Johnson County Park near Edinburgh, a short drive north of Columbus. The Criterion reports that every August the Italian Heritage Society of Indiana holds a Mass, a rosary and a picnic there. In 2017 the Indiana Historical Society recreated its interior for an exhibit, “You Are There 1943: Italian POWs at Atterbury,” and descendants of the prisoners still gather in Indianapolis.',
      'It is one of the smallest churches in the region and one of the most remarkable: a house of worship built by men far from home, in a country they had been fighting, with whatever they could find.',
    ],
    sources: [['Chapel in the Meadow, The Criterion (Archdiocese of Indianapolis), March 24, 2017', 'https://archindy.org/CRITERION/LOCAL/2017/03-24/chapel.html'], ['You Are There 1943: Italian POWs at Atterbury, Indiana Historical Society', 'https://indianahistory.org/stories/you-are-there-1943-italian-pows-at-atterbury/'], ATTERBURY] }),

  x({ slug: 'a-death-and-a-wedding', when: '1943', section: 'civic',
    title: 'A banker dies and a partnership begins',
    dek: 'In 1943 Columbus lost William G. Irwin, the banker behind Cummins. The same year, J. Irwin Miller married Xenia Simons, who would shape the town as much as he did.',
    body: [
      'William G. Irwin ran the family bank in Columbus for 33 years. He became president of Irwin’s Bank when his father died in 1910, merged it with Union Trust in 1928, and, according to a company history, kept it solvent through the Depression by moving its investments into cash. He was also the man who had paid for Clessie Cummins’s diesel experiments since 1919. He died in 1943, and Hugh Th. Miller took over the bank.',
      'That February, Hugh Miller’s son, J. Irwin Miller, married Xenia Simons in Washington, D.C. Sources give the date as February 3 or February 5. Wikipedia says the two met while working at Cummins.',
      'Xenia Simons was born in Morgantown, Indiana, on July 9, 1917, and graduated from high school in Columbus in 1934. She would become as important to the look of Columbus as her husband. Wikipedia’s biography says that about ten years before the Miller House was built, she wrote to him describing the kind of modern house she imagined. Eero Saarinen designed that house, finished in 1957.',
      'In 1955 the Millers were among the founding members of North Christian Church. Xenia launched the Indianapolis Museum of Art Columbus Gallery in 1974, helped restore Franklin Square and the Storey House downtown, helped form the Columbus Visitors Center and, in 1993, gave money for a gallery attached to The Commons. The Indianapolis Star named her one of the most influential women in Indiana in 1974, and Indianapolis Monthly did the same in 1984.',
      'She died on February 21, 2008. The next year her family gave the Miller House and garden to the Indianapolis Museum of Art.',
      'In 1943, all of that was still ahead. What happened that year was a handoff: the generation that built the money stepped aside, and the couple who would spend it on the town got married.',
    ],
    sources: [['Xenia Miller, Wikipedia', WP + 'Xenia_Miller'], ['J. Irwin Miller, Wikipedia', WP + 'J._Irwin_Miller'], ['History of Irwin Union Bank and Trust Company, Bartholomew County Public Library archives', 'https://bcplarchives.omeka.net/items/show/160'], ['Irwin Financial Corporation (company history), ReferenceForBusiness', 'https://www.referenceforbusiness.com/history2/52/Irwin-Financial-Corporation.html']] }),

  x({ slug: 'wakeman-general-hospital', when: '1944', section: 'service',
    title: 'The hospital up the road',
    dek: 'Wakeman General Hospital at Camp Atterbury treated tens of thousands of wounded soldiers, and it hired people from Columbus and the farm towns around it to do it.',
    body: [
      'Camp Atterbury’s hospital started as an ordinary station hospital for soldiers hurt in training. By 1944 it was something much bigger. In April 1944 the Army designated it a specialized general hospital for soldiers wounded in combat, and on May 8 it was renamed Wakeman General Hospital. On April 20, 1945, it became the Wakeman Hospital Center.',
      'The first casualties from England and France arrived in August 1944. They came by train and by air, landing at Atterbury Army Air Field near Columbus, about twelve miles away, and riding the rest of the way.',
      'Indiana Military, a volunteer history site, says the hospital specialized in neurosurgery, plastic surgery and bone reconstruction, and that Ward 2B handled facial plastic surgery. It reports that more than 85,000 patients were treated in 1945 and 1946, and calls Wakeman the largest hospital in the nation during the war; we have not been able to confirm that ranking elsewhere. Among the patients, the site notes, was the baseball star Hank Greenberg.',
      'The hospital needed civilians, and it found them nearby. The same history describes an urgent call for workers across the surrounding counties. June De’Spain, from the Hope and Hartsville area, took a food service job there at 16 and later worked on Ward 2B. Workers rode to the camp on Tree City Bus Lines.',
      'The last German prisoners working at Wakeman left on June 28, 1946, and the hospital closed at the end of that year. Its remaining facial surgery patients were moved to Valley Forge, Pennsylvania. The hospital grounds are now part of Johnson County Park, near the Chapel in the Meadow.',
      'For many families in and around Columbus, Wakeman was the closest the war came to home: a place to work, and a place where the wounded came back.',
    ],
    sources: [ATTERBURY, ['Civilians at Wakeman General Hospital, Indiana Military', 'https://www.indianamilitary.org/WakemanHospital/Civilians/Civilian.htm'], AIRPORT] }),

  x({ slug: 'miller-takes-the-helm', when: '1947', section: 'industry',
    title: 'One year, two presidencies',
    dek: 'In 1947 J. Irwin Miller became president of both Cummins Engine Company and the family bank. He was 37.',
    body: [
      'The war years were hard on the people who had built Columbus’s two biggest family enterprises. William G. Irwin died in 1943. Clessie Cummins, worn down by the war, moved to California in July 1945. And in 1947 Hugh Th. Miller, who had run the bank since Irwin’s death, died too.',
      'That left J. Irwin Miller, Hugh’s son and W. G. Irwin’s great nephew, holding both jobs. According to the Bartholomew County Public Library’s history of the bank, he became president of Irwin Union Trust Company in 1947, after his father’s death. The same year he became president of Cummins Engine Company. A 2026 Cummins history says he took the job on the condition that Clessie Cummins become chairman of the board.',
      'Miller had come a long way since 1934, when he arrived as general manager of a company that had never made money. He had been executive vice president since 1944. Now he ran a company whose sales, company histories say, had reached $20 million in 1946, and which was about to ride the postwar boom in trucking.',
      'The bank was growing too. In 1947 the library timeline lists loans of $3,053,000 and net earnings of $105,000, more than double the $40,000 the bank had earned in 1937.',
      'Miller served as Cummins president until 1951, when he became chairman, a post he held until 1977. At the bank he became board chairman in 1953. By the mid 1950s, Cummins sales topped $100 million.',
      'Miller would use both positions, and the foundation he set up in 1954, to change what Columbus looked like. In 1947 he was a 37 year old with two new jobs.',
    ],
    sources: [['J. Irwin Miller, Wikipedia', WP + 'J._Irwin_Miller'], ['Timeline history of Irwin Union Bank, Bartholomew County Public Library archives', 'https://bcplarchives.omeka.net/items/show/159'], CLESSIE_WAR, ['Cummins Engine Company, Inc. (company history), Encyclopedia.com', 'https://www.encyclopedia.com/books/politics-and-business-magazines/cummins-engine-company-inc']] }),

  x({ slug: 'arvin-from-war-to-television', when: '1949', section: 'industry',
    title: 'From war work to the first Arvin TV',
    dek: 'Noblitt-Sparks stopped making consumer goods for the war, then came back with a three year expansion. Late in 1949 it built its first television set.',
    body: [
      'In 1941 Noblitt-Sparks Industries, the Columbus maker of Arvin heaters and radios, began producing its first private brand merchandise. It did not get far. Production of consumer goods stopped after the United States entered the war late that year, and by 1942, the company history says, all production was geared to the war effort.',
      'The company grew during the war. In 1944 it bought a former furniture plant in North Vernon, Indiana. In December 1945, with the war over, founder Quintin G. Noblitt became chairman and Glenn W. Thompson became president.',
      'In 1946 the company started a three year expansion of its factories and moved into consumer and electrical appliances. Late in 1949 it produced its first television set. Columbus, which had built car heaters in the 1920s and radios in the 1930s, was now building TVs.',
      'Television did not last long at the company. In 1950 Noblitt-Sparks took the name of its best known brand and became Arvin Industries, Inc. When Noblitt died in 1954, annual sales were better than $50 million. The next year Arvin left the television business and set up a research and engineering department.',
      'From there it went where the car industry went. It began selling Arvinyl in 1956, entered the replacement exhaust market in 1959 and built its first catalytic converter in 1974. The heater that had started it all went out of production in 1963.',
      'The first Arvin TV is a small part of that long story. But it marks the moment Columbus’s second big manufacturer came out of the war and tried, for a few years, to put its name in every American living room.',
    ],
    sources: [ARVIN, ['ArvinMeritor, Inc. History, FundingUniverse', 'https://www.fundinguniverse.com/company-histories/arvinmeritor-inc-history/']] }),
];
