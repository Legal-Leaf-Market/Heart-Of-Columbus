# Trails, Columbus Passports and merchant participation

## The five requested trail families

| Trail | Purpose | Initial implementation |
| --- | --- | --- |
| Founders Trail | Independent owners, makers, origins and local enterprise | Opt-in business stops, founder stories and curated partnerships; distinguish trail participants from the ten paid founding-member entitlements. |
| Historical Trail | How Columbus developed and changed | Sourced articles and dated before/after stories, with historical imagery only when appropriately licensed. |
| Landmark Trail | The architectural and public-art collection | Begin with the nine researched landmark records; verify safe public viewpoints and access. |
| People Trail | Explore the existing bicycle/pedestrian network | Use official Parks information and verified routes; do not invent a new route under the same established name. |
| Bus Transit Trail | Explore using ColumBUS Transit | Use current official loops and stop data, with operator links until schedule integration is verified. |

Official People Trail source: https://columbusparksandrec.com/peopletrail/ . Official transit maps/schedules: https://www.columbus.in.gov/columbus-transit/transit-map/ . The transit site contains both newer loop material and older route pages; do not hard-code an old route count. Sources checked November 13, 2026.

## Columbus Passport

An illustrated digital passport records a person's discoveries across trail collections. A printable or physical passport can follow, using the same stamp definitions and redemption policy. Support independent progress on each trail and a combined city collection.

Distinguish three records in both UX and database:

1. **Digital discovery:** someone explored a page, solved an online clue or visited the virtual world. No claim of physical presence.
2. **Verified visit:** a location/QR/staff verification process recorded an eligible visit under a published rule.
3. **Reward redemption:** a participating organization accepted a specific, valid benefit. A stamp alone does not prove redemption.

Start with browser-local progress, clearly labeled and exportable. Add authenticated sync, backups, consent and deletion when there is a real backend. Use versioned export files and validate imports. Keep a guest route so families and visitors can explore without registration. Avoid making ongoing location tracking a condition of having a passport.

Stamp awards should reference a stable stamp definition, trail version, place and award method. Define what happens when a stop closes or a trail changes. A shop that changes its name should not erase a person's history. Paid participation must not silently masquerade as an independent editorial recommendation.

## Scavenger-hunt engine

Model a hunt as a versioned set or graph of steps: clue, answer/verification method, stop, availability, hints, accessible alternative, award, and prerequisites. Support ordered and unordered routes. Answers and signed redemption tokens belong on a server when they protect a reward, not embedded in a public JavaScript bundle.

An MVP can offer observation clues at public viewpoints and owner-approved business stops. Do not instruct players to enter staff-only areas, emergency-service facilities, private property or unsafe crossings. Include opening/access constraints and a skip/alternative stop when participation is unavailable. These are route-design requirements, not an assertion that the existing data establishes accessibility.

Physical geocaches require real placement permission and maintenance. Digital discovery stamps do not establish an official affiliation with any geocaching brand or external platform.

## Merchant campaigns and pop-ups

The owner's example was a lemon shake-up stand that sometimes appears near the Walmart location he described as Whitfield. Treat that as an **example and research lead**, not a verified vendor identity, current location, opening announcement or Walmart partnership.

A pop-up needs its own `Campaign`/`Appearance` record, not a permanent address edit on the business. Fields: business owner, verified venue/location, start/end timestamps, timezone, approved copy, offer details, inventory/availability note, participation/verification method, artwork, sponsorship status and publication state. A vendor can retain followers while moving between appearances.

Required lifecycle: draft → review → scheduled → active → ended; optional rejected/cancelled states with reason and history. Expiration must use server time and affect both map visibility and redemption, even when a client is left open overnight. Maintain an archive without continuing to advertise an expired offer.

Merchant tools: profile/location editing; draft campaigns; hunt participation; offers; shareable landing pages; approved QR materials; visit/referral/redemption summaries. Later add booking, inventory, purchasing, invoices and reconciliation through the ERP plan. A first draft builder must not display “published” when it only saved local data.

## Verification and incentives

GPS can be approximate or spoofed; fixed QR codes can be copied. For meaningful rewards use a defined verification method, short-lived signed tokens, redemption limits, idempotent server writes and an audit log. Staff-assisted verification or a rotating merchant QR can be alternatives. Do not promise fraud prevention merely because a geofence exists.

Publish the actual reward, eligibility, dates, available quantity, participating business and redemption conditions before a user commits time to a hunt. Do not invent cash prizes, sweepstakes or guaranteed discounts in demo copy. Promotional funding and responsibility for fulfillment must be explicit.

## Measurement

Measure discovery-to-profile opens, opt-in referrals, campaign views, verified visits and actual redemptions separately. Report campaign totals only at a useful privacy-preserving level. A virtual stamp is engagement, not proof of a sale; a profile click is not a visit. Do not promise a merchant a causal revenue increase without evidence.

## Back YOUR Blue — first launch feature

This is a separate gratitude/editorial program, not an officer-rating feature or a competitive trail. Emphasize **YOUR**: the specific officer, EMT, firefighter, dispatcher, veteran or responder who showed up for someone. No party, policy or institutional endorsement is implied. The owner described it as an “orchids” section: appreciation and specific acts of respectful service.

Submission flow: private draft → identity/consent and personal-detail review → editorial review → approved publication. Do not automatically expose health details, home addresses, case information, emergency locations, claims about third parties or a responder's private contact information. Permit corrections and withdrawal requests. No real submission storage or moderation is implemented yet.

Jacob's opening tribute is to his father **Kevin Lee Kennedy**, from Muncie and a Columbus resident for about 20 years, retired after 21 years in the U.S. Air Force: first half military police, later cross-trained to personnel. These are user-supplied facts. Jacob is the named co-founder/chief editor. Preserve his exact lines:

> My father was, and still is, my hero.

> I could never quite get a salute right, but you never gave me shit for it, Dad. Love you.

The complete article, teaser and page implementation brief are in `launch/`. Do not imply Kevin is a current Columbus police officer or invent rank, deployments, awards or dates. This is Jacob's first intended personal share when the project launches. Tonight's requested host is the existing Crossroads site.
