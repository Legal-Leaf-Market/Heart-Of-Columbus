# Heart of Columbus in print: the December 2026 prototype

A plan for a first printed edition: a soft launch to friends and family, a
prototype of the newspaper. Written 2026-11-24. Research links are at the end
of each brief; anything marked **verify** has only one source or a
summary, so check it before it goes to print.

**House rule that shapes this plan** (CLAUDE.md): Claude drafts history and
guide pieces from sources; news about real people and current events is
written by a named person and approved by an editor. So the history pages
below are ready to lay out (they are approved articles from the site), and
each news story comes with a sourced fact brief for its writer, not a
finished story.

## The format

- **Newspaper, tabloid size** (about 11 by 17 inches, folded once), not
  broadsheet. Easier to hold, cheaper, and what most community papers and
  short-run printers do well. Pages come in multiples of four.
- **16 pages, full color, on newsprint.** Enough for a real front page, a
  history centerspread and the regular sections, small enough to finish in
  two weeks.
- **Masthead:** "Heart of Columbus", Volume 1, Number 1, December 2026,
  with a small line: *Friends and family edition. A prototype.*
- **Every story ends with a QR code** to its online version, where the
  sources are listed. That is the paper's promise in print: every fact can
  be checked.

## Page by page (16 pages)

| Page | What | Who writes it | Notes |
|---|---|---|---|
| 1 | **Front.** Lead: the river comes back (riverfront and the dam). Second: the referendum explained. Teasers for the history spread and Back YOUR Blue. Weather box. | Jake (news) | Brief A and B below. One big photo of the riverfront. |
| 2 | **From the publisher** ("Why a paper?"), staff box, how to reach us, standards in brief (sources, corrections, AI policy). | Jake | His own column; the AI and corrections policies already exist on /about/standards/. |
| 3 | **What "Vote yes" was about:** the BCSC operating referendum. | Jake or a reporter | Brief B. A small "what it costs, what it pays for" box. |
| 4 | **Election results,** Bartholomew County, November 3, 2026. Table of races plus a short summary. | Reporter | Brief C. Use certified numbers from the county clerk. |
| 5 | **Sleeping outside is now a crime in Indiana:** the state camping law and what Columbus is doing. Plus the **Help in Columbus** box (911, 211, 988, shelters). | Reporter | Brief D. The help box comes from the site's sourced Help data. |
| 6 to 7 | **History centerspread: Columbus in print.** "Before the Republican: the first Columbus papers" (papers/columbus-argues-in-print, about 10 column inches) and "A newspaper you could watch being printed" (1970s/the-republic-glass-newsroom, about 10). Plus "The day Haw Creek came through town" (2000s/flood-of-2008, about 12), which ties to the riverfront. | Approved history (Claude drafted, Jake approved) | Ready now. Check `signoff.mjs` before print. |
| 8 to 9 | **Back YOUR Blue:** Jake's tribute to his father, laid out big, and the call for readers' stories (mail-in coupon and QR). | Jake (already published, edited by Adelaide Kennedy) | Reuse as published. |
| 10 | **Jake Takes the Town:** a December column on the events he goes to. | Jake | His series. |
| 11 | **What's on in December:** library, parks, Arts Council and signature events. | Generated from the site's events data, then checked | Every listing links to its organizer. |
| 12 | **Shop small, order direct:** how to buy from local shops without the app fees; the "Keep it in Columbus" math; gift cards. | Guide copy (Claude can draft) | No business pictured without its own approved photo. |
| 13 | **Sports:** North and East winter sports; Indiana Sentinels history piece (2020s/indiana-sentinels). | Reporter plus approved history | |
| 14 | **Faith and community:** December services and community dinners (each confirmed with the church), one Brian Blair retelling with credit. | Reporter | Blair pieces are summaries of his Republic work, credited. |
| 15 | **Games:** a Columbus crossword or word search (architects, buildings, streets) and "Where in Columbus?" photo puzzle. | Claude can build | Answers on page 16. |
| 16 | **Back page:** tear-out Help in Columbus wallet card, newsletter sign-up QR, letters and tips invitation, puzzle answers, Founders Club house ad (labeled as ours). | Mixed | The wallet card already exists at /help/card/. |

## Five things to add

1. **Then and now on the riverfront.** An archive photo of the old dam and
   riverbank next to this winter's view. Archive photos need permission
   (the Bartholomew County Public Library archives are the first ask).
2. **"Read the sources" QR on every story.** No other paper in town shows its
   work this way; it is the habit that makes readers trust the rest.
3. **A tear-out Help in Columbus wallet card.** Already designed on the site;
   useful in December, and something people keep in a wallet for a year.
4. **A downtown shop-small gift map.** Independent shops that sell gift cards
   or online, marked on a simple downtown map, from the directory. Lists only
   what each shop's own listing says.
5. **A Columbus puzzle page.** A crossword built on local architects,
   buildings and streets. Puzzles are why many people pick up a paper, and
   family members will pass it around.

## A thread through the decades (one theme a month)

Each edition carries one theme from the 1930s to now, like a motif or a
sermon: ten short pieces, one per decade, on the same idea, with a short
opening note tying them together. The pieces already exist as approved
history articles; the opening note is new writing for the editor to approve.

**December 2026: Where Columbus gathers.** In winter a town shows where it
comes together. One stop per decade:

| Decade | Article | The gathering place |
|---|---|---|
| 1930s | the-crump-gets-sound | The Crump Theatre |
| 1940s | first-christian-church-dedicated | First Christian Church |
| 1950s | memorial-gym | Memorial Gym |
| 1960s | north-christian-church-dedicated | North Christian Church |
| 1970s | the-commons-and-chaos | The Commons |
| 1980s | city-hall-triangle | City Hall |
| 1990s | mill-race-park | Mill Race Park (ties to the riverfront lead) |
| 2000s | st-bartholomew-new-church | St. Bartholomew Church |
| 2010s | columbus-the-movie | The film that gathered the town's buildings |
| 2020s | yes-and | Yes And, the exhibition downtown |

Ideas for later months: **January,** the river (floods, the dam, Mill Race
Park, the riverfront); **February,** people who came from elsewhere
(Atterbury soldiers, Afghan families, the Ethnic Expo); **March,**
schools; **April,** work (Cummins, Arvin, Cosco, Toyota). Each one is a
query over the history data, so it is easy to pull the list for a month.
Before a theme runs, check that every article in it is approved in
`signoff.mjs`.

## News briefs for the writers

### Brief A: The river comes back (front page)

What the sources say:
- The city's "Our River, Our Riverfront" project removed the failing low head
  dam in September 2026.
- The Republic reported on November 18, 2026 that most construction would
  wrap up by the end of November. Still open: a commemorative plaque waiting
  on state historic preservation approval, and gates that close the
  riverfront trail along Water Street when the river is too high.
- The ribbon cutting, once set for October 23, moved to next year.
- The project was scaled back when costs rose, to focus on safety and the
  environment. Planned pieces include a trail link to the 1821 Trail and Mill
  Race Park, overlooks and gathering spaces.
- Funding: about $18.9 million approved, including about $11.5 million in TIF
  money and $5.6 million from the state's READI program (**verify**; sources
  differ slightly).

Ask: the city's redevelopment office for the final cost, what was cut, the
ribbon cutting date, and when the trail fully opens. A walk along the river
with a photographer.

Sources: [City project page](https://www.columbus.in.gov/redevelopment/riverfront-reimagine-project/) · [The Republic, Nov 18, 2026](https://www.therepublic.com/2026/11/18/most-columbus-riverfront-construction-set-to-wrap-up-by-months-end/) · [Indiana READI project](https://www.indianareadi.com/project/00130) · [Dirt Americana feature, July 2026](https://dirtamericana.com/2026/07/columbus-riverfront-guidebook-2026-article/)

### Brief B: What the "Vote yes" signs were about

What the sources say:
- It was a **renewal**, not a new tax: BCSC asked voters to continue its
  operating referendum, first passed in 2020, for up to eight more years.
- It keeps the existing rate (reported as $0.156; **verify** the unit, per
  $100 of assessed value) and can raise no more than about $10.1 million a
  year.
- Where the money goes: in 2026 the 2020 referendum was expected to bring in
  about $10.5 million, with about $9.3 million for teacher salaries and
  $750,000 for school security staff.
- Only voters inside the BCSC district voted on it; the Flat Rock Hawcreek
  district is separate.
- It **passed on November 3, 2026.** Reported margins differ: 63 percent
  (106.1 The River / White River Broadcasting) and 61 percent (The Republic's
  roundup, as summarized). Use the county's certified number.
- Before the vote, a man lost a court challenge over a district message
  about the referendum (The Republic, Oct 31, 2026).
- "Yes for BCSC" was the campaign behind the signs (a campaign site, not a
  neutral source).

Ask: BCSC's finance office for what the renewal pays for year by year and
what would have been cut if it failed; the state's determination document
for the exact rate and cap.

Sources: [BCSC referendum page](https://www.bcscschools.org/referendum-2026) · [State DLGF determination (PDF)](https://www.in.gov/dlgf/files/referendum-documentation2/2026-november-referendum-documents/26-013-Bartholomew-Consolidated-School-Corporation-Operating-Determination.pdf) · [The Republic, Oct 14](https://www.therepublic.com/2026/10/14/voters-to-decide-future-of-bcsc-operating-referendum/) · [The Republic, Oct 31](https://www.therepublic.com/2026/10/31/man-loses-court-bid-over-bcsc-referendum-message/) · [The Republic, Apr 29](https://www.therepublic.com/2026/04/29/bcsc-begins-discussions-to-seek-referendum-renewal/) · [White River Broadcasting, Nov 4](https://updates.whiteriverbroadcasting.com/2026/11/04/voters-approve-bcsc-referendum/) · [Yes for BCSC (campaign)](https://www.yesforbcsc.org/)

### Brief C: Election results (November 3, 2026)

Unofficial results as reported; **use the clerk's certified canvass in print**:
- Recorder: Debra K. Beck Settle (R) over Nancy Merbitz (D), about 55.9 to
  44.1 percent.
- County Commissioner, District 2: Carl Lienhoop (R) won a seventh term over
  Hale (D), about 56.6 to 43.4 percent.
- Treasurer: Sandy Beatty (R) over Elizabeth Cleland, about 56 to 44.
- Clerk: Shari Lentz reelected in a rematch.
- Auditor and County Council: get names and districts from the certified
  results (the summaries were incomplete; one reported an upset in Council
  District 3).
- Congress: Shreve reelected (6th District), Houchin reelected (9th).
- WKKG reported Republicans won every countywide race.

Sources: [The Republic roundup, Nov 4](https://www.therepublic.com/2026/11/04/a-roundup-of-2026-bartholomew-county-election-results/) · [Recorder](https://www.therepublic.com/2026/11/03/beck-settle-wins-race-for-bartholomew-county-recorder/) · [Commissioner](https://www.therepublic.com/2026/11/03/lienhoop-wins-seventh-term-as-bartholomew-county-commissioner/) · [WKKG](https://wkkg.com/local-news/bartholomew-dems-holding-leads-in-many-races-as-early-votes-counted/)

### Brief D: The state camping law and Columbus

What the sources say:
- **Senate Enrolled Act 285** was signed by Gov. Mike Braun on March 5, 2026
  and took effect July 1, 2026. It makes camping on state or local public
  property (parks, sidewalks, underpasses) without permission a Class C
  misdemeanor: up to 60 days in jail and a $500 fine.
- Police must warn first, and the warning must include where to find shelter
  and services; reported details are 48 hours to move at least 300 feet
  (**verify** in the enacted text).
- The bill bars cities and counties from passing their own rules on public
  camping (**verify** in the enacted text; it matters for what Columbus can
  do).
- In Columbus: the city's homelessness work began in 2024 with $500,000 in
  federal American Rescue Plan money; officials have said permanent
  supportive housing is the missing piece. The city's **Encampment Task
  Force** was named the United Way of Bartholomew County's 2026 Advocate of
  the Year (city announcement, April 29, 2026).
- Advocates in southern Indiana have criticized the law.

Ask: the city (the task force), Brighter Days Housing and Horizon House how
the law has changed things since July: arrests or citations, shelter
numbers, what people need. Keep it about people and services, not only the
law.

Sources: [Indiana Capital Chronicle, Feb 27](https://indianacapitalchronicle.com/2026/02/27/indiana-senate-concurs-with-houses-public-camping-ban-edits-sends-bill-to-governors-desk/) · [WFYI, Apr 22](https://www.wfyi.org/statewide/2026-04-22/homeless-people-camping-on-public-property-could-face-criminal-charges-under-new-law) · [WLKY](https://www.wlky.com/article/indiana-ban-public-camping-statewide/71088352) · [Bill text](https://iga.in.gov/pdf-documents/124/2026/senate/bills/SB0285/SB0285.02.COMS.pdf) · [City: Encampment Task Force](https://www.columbus.in.gov/columbus-encampment-task-force-honored-as-united-way-of-bartholomew-countys-advocate-of-the-year/) · [The Republic: housing update](https://www.therepublic.com/?p=881533) · [News and Tribune](https://www.newsandtribune.com/news/discrimination-on-every-level-southern-indiana-advocates-react-to-homeless-camping-ban/article_4529653d-573f-4aac-af98-6cd98e232dc9.html)

## Printing: where, how, and what it costs

### What to expect to pay

For a friends and family run, the cost is mostly setup, so the price per
copy drops fast as the count goes up. One online newspaper printer
publishes its prices (full color tabloid on newsprint, parcel delivery
included):

| 16 page tabloid | Per copy | Total |
|---|---|---|
| 25 copies | $9.15 | about $229 |
| 50 copies | $5.82 | about $291 |
| 100 copies | $3.66 | about $366 |
| 200 copies | $2.83 | about $566 |
| 300 copies | $2.55 | about $765 |

An 8 page tabloid runs about half that at small counts (25 copies at $8.10
each); a 4 page tabloid falls to about $0.77 a copy at 2,000. Postage is
extra if you mail them.

**Budget for the prototype: about $400 to $600 for 100 to 200 copies of a
16 page paper.** At 1,000 or more copies, a traditional web press (the kind
The Republic is printed on) becomes cheaper per copy; get a quote.

### Where to print

1. **The Columbus press.** AIM Media Indiana (now HD Media's) prints The
   Republic and other papers in Columbus and does commercial printing for
   others. Ask for a quote for 16 page tabloid, 200 and 1,000 copies, and the
   minimum run. Local pickup, no shipping. (Yes, it prints a competitor; that
   is normal in the business.)
2. **Online short run newspaper printers:** printnewspaper.com (published
   price list above; check shipping time to Indiana), Newspaper Club, and
   Mixam (US; instant quote calculator, enter tabloid 11 x 17, 16 pages).
3. Get all three quotes with the same specs before ordering.

### How to do it

1. **Lock the page plan** (this document) and assign every page a writer and
   an editor. Two-person rule: nobody edits their own story.
2. **Get the printer's spec sheet first**: trim size, bleed (usually 1/8 inch),
   safe margins, color (CMYK), photos at 300 dpi at printed size, fonts
   embedded, PDF/X export.
3. **Lay it out** in Affinity Publisher (one-time purchase), Adobe InDesign,
   or Canva (has newspaper templates; fine for a prototype). Start from a
   5 column tabloid grid. The site's print metadata gives each history
   article's length in column inches, so it is easy to fit.
4. **Order one proof copy**, read it on paper, fix, then order the run.
5. **Distribute by hand** at December gatherings, and ask a few friendly
   local shops (coffee shops, the bookstore) if they'll keep a small stack.
   Count who reads what and ask them what they'd pay for.

### A December timeline

- **By December 4:** page plan final, writers assigned, photo permissions asked.
- **December 5 to 11:** write and edit; lay out.
- **December 12:** proof ordered.
- **December 15:** run ordered (shipping can take a week or more; the
  Columbus press is faster).
- **December 20 onward:** in hands for the holidays.

Sources for printing: [printnewspaper.com price list](https://www.printnewspaper.com/pricing/) · [Newspaper Club tabloid](https://www.newspaperclub.com/choose/tabloid) · [Mixam US](https://mixam.com/) · [AIM Media Indiana (Wikipedia)](https://en.wikipedia.org/wiki/AIM_Media_Indiana) · [Small run costs (UK printer)](https://www.printmynewspaper-online.com/small-run-printing-costs)
