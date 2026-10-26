// "From the publisher": opinion and essays by Jacob Kennedy, in his words.
// These are drafts for Jacob to read and approve; `note` marks what he still
// needs to check. Facts about other people and papers link their sources.
const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const BY = 'Jacob Kennedy';

export const PUBLISHER = [
  { slug: 'the-heart-of-columbus', when: '2026', section: 'media', kind: 'opinion', byline: BY, checked: CHECKED,
    title: 'Why we’re called the Heart of Columbus',
    dek: 'The Republic has covered this town since 1872. We admire it, we wish it well, and we intend to give it some friendly competition.',
    body: [
      'Let me start with a thank you. The Republic has covered Columbus since Isaac T. Brown printed the first Columbus Republican on April 4, 1872. For 143 of those years one family ran it. It has outlasted the Democrat papers, the Herald, the Times and every Star that ever rose over this town. Anyone who puts out a newspaper for that long has earned respect, and The Republic has ours.',
      'In August, HD Media agreed to buy the paper. We wish the paper and everyone who works there well. We mean that.',
      '## So why start something new?',
      'Because I think a town this size deserves more than one voice, and I think a lot of people here are not hearing their own. That is my opinion, and I want to label it plainly as mine: I think The Republic leans further left than many of its readers do, especially readers 60 and up who tell me they want news that is balanced, or that sees the world the way they do. You may disagree, and if you do, I would like to hear from you.',
      'Heart of Columbus is my answer. We will keep news and opinion apart and label every piece. Our history pages cite their sources, and our opinion pages carry a name. We will cover the businesses, churches, schools and teams that make this place what it is, and we will bring back the faith coverage that so many readers missed.',
      'Columbus has argued with itself in print since 1839. That is a healthy thing. We just want to make sure the heart of the town gets its say.',
      'To our friends at The Republic: may the best paper win. We plan to be very, very nice about it.',
    ],
    sources: [['The Republic (Columbus, Indiana), Wikipedia', WP + 'The_Republic_(Columbus,_Indiana)'], ['HD Media to acquire 25 publications from AIM Media Management, Editor and Publisher (August 19, 2026)', 'https://www.editorandpublisher.com/stories/hd-media-to-acquire-25-publications-from-aim-media-management,263132']] },

  { slug: 'my-first-paper-route', when: '2026', section: 'media', kind: 'essay', byline: BY,
    note: 'Draft for Jacob to check: we have written the Grand Forks Herald and Grand Forks Air Force Base. Correct anything we got wrong.',
    title: 'I’ve been making things work since I was 8',
    dek: 'My first job was a paper route on an Air Force base in North Dakota, from age 8 to 12. It is the reason I am doing this.',
    body: [
      'My first job ever was a paper route. I was 8 years old, and I delivered the Grand Forks Herald on Grand Forks Air Force Base in North Dakota.',
      'I kept that route from age 8 to 12. It was not much money, but it was mine and I earned every dollar of it.',
      '## My dad’s route',
      'I did not get the idea on my own. My father was enlisted in the Air Force, and on top of that full time job he ran a rural paper route. He did it to make things work for our family. I watched him do it, and then I did it too.',
      'That is what a paper route teaches you. Somebody is counting on you to show up, every day, before they wake up. The paper has to be there. Nobody thanks you when it is, and everybody notices when it is not.',
      '## Why it matters now',
      'I have been making things work since I was 8. Heart of Columbus is the next route. It is a lot more work than one route on one base, and I would not trade it.',
      'A newspaper, at its best, is a promise kept every morning: here is what happened in your town, from people who live here too. I learned that promise from the bottom up, one porch at a time. I intend to keep it in Columbus.',
    ],
    sources: [] },

  { slug: 'bringing-faith-back', when: '2026', section: 'faith', kind: 'opinion', byline: BY,
    note: 'Draft for Jacob to check: we have not found when The Republic stopped its faith section, so this piece gives no date. Jacob volunteers at Haven United Methodist Church and is joining its staff as music director.',
    title: 'We’re bringing the faith section back',
    dek: 'When The Republic stopped its faith coverage, nobody I know was happy about it. Heart of Columbus is giving it back to you.',
    body: [
      'For years, The Republic had a faith section, and people read it. Brian Blair, a friend of mine, covered churches, pastors, congregations and the people in the pews for a long time, and he did it with care. You can read some of his best work, retold in short with credit and links, in our archive of his faith beat.',
      'Then the faith section went away. I have not met a single person who was happy about that.',
      '## Here is our promise',
      'Heart of Columbus is giving it back. We will run a faith section with news from congregations of every kind across Bartholomew County: new pastors, anniversaries, building projects, mission trips, concerts and the quiet stories of people who serve.',
      'We will report what people here actually want to read about, because this is the heart of Columbus and the backbone of Indiana, and faith is a big part of who we are. We will keep it fair, we will spell your names right, and we will never pretend that a community’s faith is not news.',
      'If your church, temple, mosque or ministry has something going on, tell us. The faith section is open again.',
      'A note in the interest of honesty: I volunteer at Haven United Methodist Church, formerly Sandy Hook United Methodist, and I am joining its staff as music director. We will say so any time Haven appears in our pages.',
    ],
    sources: [] },
];
