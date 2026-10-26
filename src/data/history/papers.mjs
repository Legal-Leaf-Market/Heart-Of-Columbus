// "The Republican and the Democrats": a short series on the newspapers of
// Columbus. Titles and dates come from the U.S. Newspaper Directory (Library
// of Congress) as listed by Bartholomew County genealogy indexes, and from
// the digitized runs at Hoosier State Chronicles. Where those lists disagree,
// the article says so. We do not say which party a paper backed unless a
// source says it.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const LDS = ['Bartholomew County, Indiana newspapers and obituaries, LDS Genealogy (listing the U.S. Newspaper Directory and digitized runs)', 'https://ldsgenealogy.com/IN/Bartholomew-County-Newspapers-and-Obituaries.htm'];
const HSC = ['Browse by title, Hoosier State Chronicles, Indiana State Library', 'https://newspapers.library.in.gov/?a=cl&cl=CL1&e=-------en-20--1--txt-txIN-------'];

const x = (o) => ({ checked: CHECKED, section: 'media', ...o });

export const PAPERS = [
  x({ slug: 'columbus-argues-in-print', when: '1839',
    title: 'Before the Republican: the first Columbus papers',
    dek: 'Columbus had newspapers decades before The Republic. From the Columbus Advocate of 1839 to the Weekly Indiana Democrat and the wartime Union, here is what the record shows.',
    body: [
      'The Republic is the paper most people in Columbus know, but it was far from the first. The U.S. Newspaper Directory, kept by the Library of Congress and listed for Bartholomew County by genealogy indexes, names a string of earlier titles.',
      'The oldest is the Columbus Advocate, dated 1839 to 1842. (The directory files it under “Columbus, Ia.,” with a correction noting that Indiana is meant.) In the 1840s came the Weekly Ledger and a Semi Weekly Ledger, and the Columbus Gazette, dated 1844 to 1848.',
      '## Democrats, news and the Union',
      'In 1856 the Weekly Indiana Democrat appeared, and the directory dates it to 1867, so it published through the whole Civil War. The Columbus Weekly News ran from 1859 to 1861. A Columbus Weekly Union is listed from 1863, and Hoosier State Chronicles, the Indiana State Library’s digital newspaper program, has issues from December 7, 1867, to February 27, 1869. The Columbus Bulletin followed, dated 1867 to 1870, with digitized issues from September 1868 to October 1870.',
      'In that era a paper’s name often told readers which side it was on, and in Columbus at least one said so in plain words: Democrat. We have not found a source that says what the Advocate, the Ledger or the Gazette stood for, so we will not guess.',
      'What the list does show is a small county seat that wanted news badly enough to support paper after paper, most of them gone within a few years. Several of these runs can still be read for free at Hoosier State Chronicles, and they are worth a look for anyone curious about what Columbus was arguing about before the Civil War.',
      'The next article in this series picks up in 1872, when a new weekly called the Columbus Republican arrived and stayed.',
    ],
    sources: [LDS, HSC] }),

  x({ slug: 'the-republican-arrives', when: '1872',
    title: 'The Republican arrives, and stays',
    dek: 'On April 4, 1872, Isaac T. Brown published the first Columbus Republican. It became a daily in 1877, the Evening Republican in 1883 and The Republic in 1967, with a Brown in charge for 143 years.',
    body: [
      'Isaac T. Brown founded The Columbus Republican as a weekly, and its first issue came out on Thursday, April 4, 1872, according to Wikipedia. His father, Isaac M. Brown, served as editor in some of those early years. The paper’s first home was a downtown building with a later fame of its own: Wikipedia’s history of the Crump Theatre says the paper started in April 1872 in Keith’s Arcade, the building on the site where the Crump was later built.',
      'Hoosier State Chronicles has digitized the weekly Columbus Republican from August 1, 1872, to September 3, 1874. On November 12, 1877, the Browns made it a daily, the Daily Evening Republican. From 1883 it was the Evening Republican, a name it kept until 1966, and in January 1967 it became The Republic.',
      '## Six generations',
      'The paper stayed in one family. When Isaac T. Brown died in 1917, his son Raymond took sole control. Raymond’s son Robert N. Brown started a sister paper, the Daily Journal in Johnson County, in 1963, and built the glass newspaper office on Second Street that opened in 1971. In 1994 the family formed Home News Enterprises to own the papers. Jeffrey N. Brown and his father Robert, The Republic says, grew the business into a company that published in other Indiana towns and added printing, magazine and digital work.',
      'The name was Republican, but The Republic’s own statement of mission, quoted in its history of itself, says the paper advocates for the good of the community “irrespective of political considerations.”',
      'In November 2015 the family sold to AIM Media Indiana, ending six generations and more than 140 years of Brown ownership. In August 2026 HD Media agreed to buy the paper. Through 154 years and three owners, the Republican has outlasted every rival on this series’ list.',
    ],
    sources: [['The Republic (Columbus, Indiana), Wikipedia', WP + 'The_Republic_(Columbus,_Indiana)'], ['A history of The Republic: 1872 to today, The Republic', 'https://www.therepublic.com/?p=482537'], ['The Crump Theatre, Wikipedia', WP + 'The_Crump_Theatre'], HSC, LDS] }),

  x({ slug: 'the-democrats', when: '1870',
    title: 'The Democrats answer',
    dek: 'Columbus had Democrat papers before and after the Republican arrived: the Weekly Indiana Democrat, the Bartholomew Democrat, the Columbus Democrat and the Daily Evening Democrat. None of them lasted.',
    body: [
      'The first Columbus paper to carry the word Democrat in its name was the Weekly Indiana Democrat, dated 1856 to 1867 in the U.S. Newspaper Directory. It was gone before the Republican arrived. But the name came back quickly.',
      'The Bartholomew Democrat is dated 1870 to 1876, and Hoosier State Chronicles has digitized issues from September 29, 1871, to April 14, 1876. That means for its last four years it shared the town with the new Columbus Republican, which began in April 1872.',
      '## The busy year of 1876',
      'In 1876 the Democrat side of the newsstand changed fast. The directory lists a Columbus Democrat for 1876 to 1877 and a Daily Evening Democrat starting in 1876 and running into the 1880s. A short lived title called Monroe’s Legal Tender Issue also appeared that year; Hoosier State Chronicles has it from August 30 to October 11, 1876.',
      'Then, in November 1877, the Republican turned daily as the Daily Evening Republican. For a few years, if the directory’s dates are right, Columbus had two evening dailies, one named for each party.',
      'The Democrat titles end there. The directory gives no Columbus Democrat after the 1880s. We have not found a source that explains why, so we leave that question open for a future article and for anyone with a box of old papers in the attic.',
      'There is a postscript. In 2002, Wikipedia records, the company that owned The Republic bought the Brown County Democrat in Nashville. And when HD Media agreed to buy The Republic in 2026, Editor and Publisher reported, the Brown County Democrat was on the same list. After 150 years, the Republican and a Democrat ended up under one roof.',
    ],
    sources: [LDS, HSC, ['The Republic (Columbus, Indiana), Wikipedia', WP + 'The_Republic_(Columbus,_Indiana)'], ['HD Media to acquire 25 publications from AIM Media Management, Editor and Publisher (August 19, 2026)', 'https://www.editorandpublisher.com/stories/hd-media-to-acquire-25-publications-from-aim-media-management,263132']] }),

  x({ slug: 'the-herald', when: '1881',
    title: 'The Herald, the Times and the Stars',
    dek: 'From 1881 the Columbus Herald gave the Republican a long running rival, daily until 1942 and weekly until 1994. In the 1890s the town briefly had a Times and three Stars as well.',
    body: [
      'The longest running rival to the Republican was the Herald. The U.S. Newspaper Directory lists a Columbus Herald starting in 1881, a Columbus Herald from 1882 to 1887, and a Columbus Daily Herald from 1887 to 1942. A separate Library of Congress record dates the Daily Herald from 1897 to 1942, one of several places where the records disagree.',
      'Hoosier State Chronicles has digitized the weekly Columbus Herald from December 11, 1896, to June 24, 1910. Newspaper archive listings show the weekly Columbus Herald continuing from 1942 to 1994, after the daily ended.',
      '## A crowded decade',
      'The 1890s were the busiest years for Columbus papers. The directory lists the Daily Times from 1892 to 1906 and the Weekly Times from 1895 to 1906. There was a Columbus Star in 1896 and 1897, a Morning Star and an Evening Star in the same years. At one point in the late 1890s, Columbus readers could choose among the Evening Republican, the Daily Herald, the Daily Times and a Star.',
      'Most of them did not last. The Times titles end in 1906. The Stars burned out before 1900. The Herald lasted the longest, more than a century counting its weekly years.',
      'Which side was the Herald on? We have looked, and we have not found a source that says. If you know, or if you have old copies, we would like to hear from you.',
      'One more title appears in the directory from the late 1960s: People, Yes!, dated 1969 into the 1980s. Beyond its name and dates, we know nothing about it yet.',
      'By the end of the twentieth century, the Republic was the paper left standing. A town that once supported half a dozen newspapers had one daily. That is the history Heart of Columbus steps into.',
    ],
    sources: [LDS, HSC, ['The Columbus Herald (Columbus, Ind.) 1881 to current, Library of Congress', 'https://www.loc.gov/item/sn85047947'], ['Columbus Daily Herald (Columbus, Ind.) 1887 to 1942, Library of Congress', 'https://www.loc.gov/item/sn85047946/'], ['Columbus Daily Herald (Columbus, Ind.) 1897 to 1942, Library of Congress', 'https://www.loc.gov/item/2017238416']] }),
];
