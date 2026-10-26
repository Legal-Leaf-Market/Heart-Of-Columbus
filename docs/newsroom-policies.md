# Heart of Columbus newsroom policies (draft for the owner)

These are starting drafts for the standards pages in item 1 of the newspaper
plan (`/about/standards/`, `/about/corrections/` and the rest). They're
written in the site's plain voice and based on the SPJ Code of Ethics, the
Trust Project's trust indicators, AP's 2023 generative AI standards, and
Poynter's newsroom AI guidance. Sources are at the end.

**For the owner:** every line in brackets like `[OWNER: ...]` is a decision
only you can make. Everything else is a suggestion you can change.

**For Claude Code:** render these as pages, but don't change policy wording
without the owner's approval. Keep `[OWNER: ...]` markers visible on
preview builds and fail the production build if any remain (add this to
`tests/news.test.mjs`).

---

## About us

Heart of Columbus covers Columbus and Bartholomew County, Indiana: its
independent businesses, its neighborhoods, its buildings, and the decisions
that shape daily life here.

- **Mission:** [OWNER: one or two sentences. Example: "Useful, accurate
  local news for the people who live, work and visit here."]
- **Owner and publisher:** [OWNER: name, and the legal entity behind the
  site]
- **Editor:** [OWNER: name. Every story is approved by the editor before it
  publishes.]
- **Who pays for this:** [OWNER: memberships, sponsors, grants, owner
  funding. List every funder giving more than $[OWNER: amount] a year, and
  update the list at least every quarter.]
- **Our other business:** Heart of Columbus also runs a directory of
  independent businesses and, for some partner businesses, a free pickup
  ordering tool. When a story involves a business we have a relationship
  with, the story says so (see Conflicts of interest).

## Accuracy

- We name where every fact comes from: a person we talked to, a public
  record, or a document we've seen. Stories list their sources under
  "References."
- **Facts about a business** (opening, closing, new owner, prices, hours)
  are confirmed with the business or a public record before we publish.
  If we can't reach the business, we say so and say what we relied on.
- **Closings get extra care.** Online listings are sometimes wrong about
  closings. We report a closing only when the owner confirms it, or when we
  have two independent signs (for example, a sign on the door and a
  disconnected phone), and we say which.
- **Quotes** come from interviews we did, and we say how (in person, by
  phone, by email). We don't change the words. We may trim, and we mark
  where.
- **Numbers** link to the record they came from whenever there's one online.
- Every story has a "How we reported this" note.

## Labels

Every piece carries one label, shown above the headline.

| Label | What it means |
| --- | --- |
| News | What happened, verified, without our opinion. |
| Analysis | Explains why something happened or what it means, based on reporting. Not opinion. |
| Explainer | How something works (a tax, a zoning process, a bus route). |
| Data | Built mainly from public records or our directory data, with the method explained. |
| Meeting notes | Notes from a public meeting, written by a trained note-taker and checked by an editor. |
| Opinion | An argument: editorials, columns and letters. Clearly ours or clearly the writer's. |
| Community | Submitted by readers or organizations (announcements, obituaries from families), checked for basic facts. |
| Sponsored | Paid for by a sponsor. Never written by our newsroom. Always says who paid. |

## Sources

- We name our sources. We grant anonymity only when the information is
  important, can't be gotten on the record, and the person would face real
  harm (job, safety) if named.
- The editor must know who an anonymous source is and approve its use. The
  story explains why we didn't name them.
- We don't pay sources.

## Corrections

- If we get something wrong, we fix it quickly and say so. We never quietly
  change a fact.
- **Correction:** we got a fact wrong. The note says what was wrong and
  what's right.
- **Clarification:** a fact was right but could mislead. We explain.
- **Update:** new information arrived. We say what changed and when.
- **Editor's note:** something about how the story was made needs explaining
  (for example, a conflict we should have disclosed).
- Corrections appear on the story with the date, and in the corrections log
  at `/about/corrections/`. If the error was in the newsletter, the next
  edition carries the correction. If it was on social media, we post the
  correction there too.
- **How to tell us:** the "Spot an error?" link on every story, or
  [OWNER: corrections email]. We aim to respond within [OWNER: e.g., one
  business day].

## Removing or changing old stories

- We don't remove stories because they're unflattering, and we never
  remove them at a business's or advertiser's request.
- We will consider removing a name or a story when keeping it does more harm
  than good: for example, an old, minor arrest where charges were dropped
  or the record was expunged. Cleveland.com has run a program like this
  since 2018, and *The Boston Globe* launched "Fresh Start" in 2021.
- Requests go through a form. The editor decides and keeps a private record
  of each decision. Stories about violent crime and about public officials'
  public duties stay up.
- [OWNER: confirm you want this policy, and who besides the editor decides.]

## Crime, courts and safety

- No mugshot galleries.
- We name people suspected of crimes only once they're charged, and only
  with the editor's approval. When we report a charge, we follow the case
  and report how it ends.
- We don't name victims of sexual assault without their consent.
- We don't name minors accused of crimes. [OWNER: confirm any exceptions,
  such as a minor charged as an adult in a serious case.]
- During emergencies, safety information comes first, and we say clearly
  what we know, what we don't, and when we last checked.

## Minors

- High school athletes and students may be named and photographed in
  sports, school and achievement coverage.
- We avoid identifying minors in sensitive stories (health, discipline,
  family trouble) without a parent's permission.

## Artificial intelligence

[OWNER: approve or change this section. It follows AP's August 2023
standards: generative AI output is treated as unvetted source material and
isn't used to create publishable content.]

- **We don't use AI to write or edit stories, headlines, quotes,
  obituaries, letters or newsletters.** A person writes everything we
  publish, and an editor approves it.
- **We don't publish AI-generated or AI-altered photos, video or audio**
  of real people, places or events. If an AI-made image is itself the
  subject of a story, we label it clearly.
- **Allowed with a human check:**
  - Transcribing interviews and meetings. A person checks every quote
    against the recording.
  - Spelling and grammar checks.
  - Software that compares our directory data between updates and lists
    possible openings, closings and hours changes for a reporter to verify.
    Nothing from it is published until a person confirms it.
  - First drafts of translations, reviewed by a fluent speaker before
    publishing.
  - Tools that help build and test the website itself.
- Anything an AI tool tells us is a lead, not a fact, until we confirm it.
- We review this policy every [OWNER: six months] and publish a short
  plain-language summary on every page that links here.

## Conflicts of interest

- Staff don't cover businesses, organizations or people they own, work
  for, are related to, or have a financial stake in. They tell the editor
  about any such ties.
- **Our own business ties are disclosed on the story automatically:**
  - Businesses that take pickup orders through Heart of Columbus (our
    partners list)
  - Sponsors and advertisers
  - [OWNER: list any other businesses the owner or staff own, work for, or
    have built websites or storefronts for]
- We pay our own way when we review food, products or services. If
  something was free, the story says so.
- Staff don't accept gifts worth more than [OWNER: amount] from anyone we
  cover.
- Staff don't hold office, run campaigns, or endorse candidates in local
  races. [OWNER: decide on political yard signs, donations and petitions.]

## Advertising and sponsorship

- Ads and sponsored items are always labeled "Sponsored" and appear only in
  marked spaces, never inside a story.
- Sponsors don't see stories before publication and have no say in what we
  cover. Sponsoring us doesn't earn coverage, and we cover sponsors like
  anyone else.
- We may decline any ad or sponsor.
- [OWNER: decide whether you accept political ads, and if so, how they're
  labeled and who paid.]

## Opinion and letters

- Editorials represent [OWNER: the editor, or an editorial board you name].
  Columns represent their writers.
- Letters to the editor:
  - Up to [OWNER: 300] words, with the writer's full name and town. We
    confirm every letter with the writer by phone or email.
  - One letter per writer every [OWNER: 30] days.
  - No personal attacks, unverifiable claims of fact, or anonymous letters.
  - We may trim for length and fix spelling, and we never change the
    writer's meaning.
- Opinion pieces follow the same accuracy and corrections rules as news.

## Obituaries

- [OWNER: decide free or paid, and whether staff write any.]
- Family-submitted obituaries are labeled "Submitted by the family" and
  confirmed with the funeral home or a family member before publishing.

## Photos and images

- Every image has a credit and, if it isn't ours, its license.
- We don't alter news photos beyond cropping and basic color and exposure
  fixes. Illustrations and photo composites are labeled.
- Landmark photos from Wikimedia Commons are credited on `/credits/`, and
  they show Columbus, never a business we list.

## Your information, tips and privacy

- We collect only what we need: your email if you sign up for the
  newsletter, and what you choose to send us in a form.
- We don't sell or share reader data. [OWNER: name the email and payment
  services we use.]
- Tips: the tip form doesn't record your IP address. For sensitive tips,
  [OWNER: give a safer option, such as a Signal number or a mailing
  address]. We protect the identity of people who tip us.
- Newsletter: double opt-in and a one-click unsubscribe in every email.

## Accessibility

- Every image has alt text, and video has captions.
- Pages meet WCAG contrast guidelines and work with a keyboard and screen
  reader. Tell us if something doesn't work for you.

## Contact

- Editor: [OWNER: name and email]
- Corrections: [OWNER: email] or the "Spot an error?" link on any story
- Tips: `/tips/`
- Questions you want us to answer: `/ask/`
- Letters: `/letters/`

---

## Sources

- SPJ, [Code of Ethics](https://spj.org/ethicscode.asp)
- The Trust Project, [Trust Indicators](https://thetrustproject.org/trust-indicators/)
- Popular Science, [Associated Press sets its first AI rules for journalists](https://www.popsci.com/technology/ap-ai-news-guidelines/) (August 2023)
- Poynter, [What's changed since we created AI ethics guidelines for newsrooms](https://www.poynter.org/ethics-trust/2025/a-lot-has-changed-since-we-created-ai-ethics-guidelines-for-newsrooms-heres-what-you-need-to-know-now/) (2025) and [How to create a newsroom AI ethics policy](https://www.poynter.org/ethics-trust/2024/how-to-create-newsroom-artificial-intelligence-ethics-policy/)
- GPB/NPR, [Cleveland and Boston newsrooms revisit old stories to offer a fresh start](https://www.gpb.org/news/2021/02/24/cleveland-boston-newsrooms-revisit-old-stories-offer-fresh-start) (2021)
