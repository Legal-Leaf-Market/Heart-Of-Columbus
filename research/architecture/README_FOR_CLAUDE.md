# Architecture editorial research handoff

Research checked November 13, 2026. These are sourced starting briefs and article assignments, not finished publishable historical articles. Open the supplied sources, expand with archives and site-owner records, and cite factual claims in each final article. Do not mistake the generated illustrations for documentary evidence.

## Deliverable requested
Build a connected architecture/history section for Heart of Columbus using all nine illustrated landmarks. Start with the existing route/data structure; do not invent a parallel content system. Read `landmark-briefs.json` and the individual briefs. For each landmark prepare a useful 600–1,000-word article when evidence supports that length, a concise map-popup summary, an image caption, sources, and verified visit information. Write shorter when sources are thin. Avoid padding and generic tourism copy.

## Voice and structure
Write for residents and curious visitors: concrete, observant, warm, locally grounded. Explain what someone can actually notice in the building, how it came to be, why its design mattered and how it serves the community now. Architectural terminology should earn its place. No invented anecdotes, quotations, architect intentions, acoustics, interior details, visitor experiences or superlatives.

Suggested article structure: vivid but fact-based introduction; origin and people; three things to notice; civic or artistic significance; preservation and changing use; practical visit details; nearby related places; sources and last-verified date. Use each brief's distinct story angle. All headlines below are editorial proposals, not quoted source titles.

## Sources and fact checking
Prefer building owners/operators, BCPL, county/city/state records, Newfields, NPS nominations, architectural archives and conservation plans. Visit Columbus provides useful local summaries, but corroborate precision claims and disputed dates. Linked pages were read except those explicitly marked search-excerpt-only or research-lead-only. Some sources have changed names or migrated domains; preserve official redirects and record the final URL you actually read.

Do not copy full articles, source photos or substantial source prose into the repo. Write original summaries with source links and the date accessed. License any additional photography separately. Source links in the JSON are intentionally ordinary URLs usable by any coding agent.

## Critical correction: North Christian / The LEX
The package initially included a no-spire variant after interpreting the user's recollection too broadly. Primary-source library records document removal of the **cross from the spire**, not removal of the entire spire. BCPL board minutes dated August 19, 2024 explicitly record successful removal of the cross. The corrected current artwork retains the tall spire and removes only the cross. Never publish the no-spire variant as an established current appearance. See `CURRENT_APPEARANCE_NOTE.md` for provenance and source links.

## Other traps to resolve
- Courthouse: Isaac Hodgson; completed 1874. The state marker distinguishes the original slate roof from the later copper replacement. Do not describe the illustrated dark roof as proof of its current material.
- First Christian is Eliel Saarinen; North Christian is Eero Saarinen. Do not swap father and son.
- City Hall here means Edward Bassett's 1981 building, not the separate historic City Hall. Verify dramatic cantilever/entry geometry with a recent real photograph before using the generated image as a detailed architectural reference.
- Irwin Union Bank is now the Cummins Irwin Conference Center. Separate the original pavilion from later additions.
- Library building and Large Arch have different creators and dates: Pei / 1969 and Moore / 1971. One composite illustration does not make them one work.
- Chaos I: official local pages disagree on the year (1974 versus completed 1975). Check fabrication, installation and dedication dates individually before fixing a timeline. Spell Jean Tinguely correctly even where a source has a typo.
- Miller House: ticket/check-in address is not necessarily the house's physical location. Do not copy a visitor-center address into map coordinates. Use existing verified landmark geometry, and verify tours with Newfields/Visit Columbus.
- Do not assume interior access, free admission, opening status, organ performances or current mechanical operation from a historical description. Date-stamp practical details.

## Local oral-history opportunity
The user reports living locally for 20 years and playing worship at First Christian many times and North Christian a few times. Treat this as an unpublished interview lead, not permission to quote or publish personal details. Ask before attributing an anecdote. The memory suggests a promising human story about sound, worship and the changing life of these buildings; research actual instruments and acoustics before making claims.

## Integration guidance
Reuse landmark IDs, coordinates, routes, accessibility patterns and map click behavior. Link a landmark popup to its article and let the article offer a clear return-to-map action. Use a real descriptive title, canonical URL, unique description, image dimensions, and `Article`/`Place` structured data only where true. Do not fabricate `datePublished`, author identities, ratings or visitor reviews. Add factual sources visibly; keep internal research notes out of customer-facing prose.

Build an overview story with links to all nine pages, then a proposed downtown trail joining the library/Large Arch, First Christian, bank, courthouse, Chaos I and City Hall. Verify walking directions, crossings, accessibility and distance before describing it as an accessible or timed route. North Christian, Miller House and Fire Station 4 should not be presented as adjacent downtown stops.

## Final review
Check each date/name against its cited source, resolve flagged conflicts, verify current access and North Christian's appearance, review image captions against actual imagery, build the site and test map-to-article links on mobile. Provide a reviewable PR; research briefs alone are not a completed content deployment.
