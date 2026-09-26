# Source, rights, and update policy

This policy describes how editorial records should be verified and maintained. It is not a claim that a review, rights clearance, or scheduled monitoring has already happened.

## Current review baseline

The existing-content review covers 86 canonical documents. Its 2026-09-25 pass was a code and editorial audit: it inspected document text and metadata, but did not reopen the cited source pages. Treat all 86 documents as factually unverified until a reviewer checks the claims against their cited sources. The review's `retain`, `deepen`, `merge`, and `retire` entries are recommendations; none by itself records an editorial disposition as executed. A merge or retirement requires a separate decision, preservation of unique evidence, and a working redirect before the old URL is removed.

The inherited art records include 14 assets whose provenance and rights are marked unverified. The archived generation manifest records project illustrations made with the built-in image generator; it does not record a separate license for any reference inputs. Continue the existing project use authorized by the owner while retaining that distinction in the registry. For new third-party media or reuse outside this project, record the creator, origin, applicable license or permission, attribution and restrictions. Do not invent a public-domain designation or a license from an asset’s presence in the repository.

## Verifying a document

Review the source itself, not only its title, search snippet, or a citation copied from another page. Prefer the primary record or responsible institution for dates, processes, access rules, and services. Use a second independent source when a claim is contested, interpretive, or depends on institutional self-description. Attribute institutional histories and personal accounts to their authors, and keep a narrator's words within the scope of that person's testimony. For tribal histories and living communities, use the relevant nation or community's own material where available and do not generalize one archive or account to the whole community.

Check each material claim in context and ensure its block cites the source that supports it. A source may support one sentence and not the whole paragraph. Record the actual date checked in `verification.verifiedAt` and the checked source ID in `verification.sourceId`; that ID must also appear in `meta.sourceRefs`. Leave status `unverified` when the page was not opened, does not support the claim, or could not be accessed. Record inaccessible or conflicting evidence in the research note and revise or qualify the copy rather than implying certainty.

For new source records, use a stable direct URL and a descriptive title. Add a short research note under `editorial/research/` for substantial fact checks, interpretation choices, and date evidence. Keep publication and editorial-update dates tied to real records. A date when someone checks a source is not a publication date or proof that every claim in the story was reviewed.

## Voice-only revisions

Use [the current voice guide](voice-guide.md) for Ohio-chan’s explanation, personal tastes, and occasional gentle flirt. Revise narrative flow as well as openings; do not append the same interjection or heart everywhere. Preserve source-linked facts, quotations, practical conditions, and verification records. A fictional preference is not evidence of a visit. A voice revision does not reset `verifiedAt` or claim that sources were reopened. Historical review documents remain dated records and should link to the current guide when their voice advice has been superseded.

## Changes and corrections

When revising a factual claim, check the affected claim and its neighboring context, update block-level citations, and record the change in the research note. Preserve the prior account when it is necessary to understand a correction, disagreement, or historical change. When sources disagree, name the disagreement and attribute each account. Do not silently turn a proposed itinerary into a visited route or an institution's account into a community-wide conclusion.

Apply the existing-content review's disposition definitions only after editorial review. `retain` means retain with normal maintenance; `deepen` means add or qualify evidence or practical context; `merge` and `retire` are proposed actions that require a named destination or redirect and a check for unique material. Update the review record only when that decision has actually been made, and distinguish a recommendation from completed work.

## Time-sensitive details

Treat opening hours, admission, tours, reservations, eligibility, transit service, construction, accessibility conditions, and contact details as dynamic. Link to the responsible operator's current page and state conditions next to the advice. Recheck these details immediately before publishing or materially updating practical guidance, and again when a reader is likely to rely on a dated event or seasonal service. Do not invent a recurring check cadence or suggest that pages are monitored automatically. If the current status cannot be confirmed, remove the precise instruction or label it clearly as something the reader must confirm with the operator.

For trip suggestions, distinguish a proposed route from a route personally traveled. Check the current operator and venue information for each stop and each transport leg; one current map does not verify hours, fares, access, or connections. Include enough context that readers can confirm service on their travel date.

## Maps and coordinates

Store coordinates only when a cited source supports the represented point. A geocoder result for a street address supports an address-level map point; it does not establish an entrance, accessible entrance, trailhead, platform, or safe pedestrian route. Prefer an operator map or a source identifying the exact entrance for those uses. Keep coordinate precision consistent with the evidence and intended display, and do not imply survey accuracy by retaining unnecessary decimal places. Verify the place name, address, and point together. Recheck points after a venue relocation or material map change.

Historic maps need their date, sheet or volume, creator, and collection identified. Explain what the map can establish at its scale. A plat or fire-insurance map can document streets and mapped structures; it cannot, by itself, establish residents' experience or what a street felt like.

## Review record

For each completed review, retain the document ID, review date, claims or sections checked, source IDs opened, unresolved limitations, and resulting editorial action in the appropriate research note or review record. Keep verification metadata, publication history, and rights evidence separate so each says only what was actually established. Use `npm run validate:content` to check registry relationships and metadata consistency after editing; that structural check does not fact-check sources, clear rights, or confirm that live services remain current.
