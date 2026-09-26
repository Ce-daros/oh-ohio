# Voice alignment — 2026-09-26

The approved direction is subject first, specific personal taste or observation second, and occasional gentle flirt. Ohio-chan remains a naturally cute English anime-girl host, civic idol, and local girl. The mural aside in `cincinnati-market-to-music` is the reference passage in the current voice guide.

## Revised copy

- All 22 features: summaries, introductions, character asides, farewells, selected narrative passages, and related-reading copy. The eight newer long features received broader body rewrites to replace formal research-report phrasing with conversational explanation.
- All 84 notes: subject-specific personal observations in their closing narration; 16 previously formal summaries also revised.
- Four phrase pages: host commentary; definitions and regional information retained.
- Home welcome, theme and neighborhood copy; four-world introductions, all 23 scene recommendations, world reading selections, eight reading journeys, and the Field notes directory.
- README, voice guide, content architecture, update policy, and implementation status updated. Three historical reviews in the parent editorial directory now identify the current voice guide instead of presenting earlier directions as current.

## Integrity and verification

Compared all 110 canonical documents with a pre-edit snapshot. IDs, slugs, canonical paths, source references, block citations, verification records and date evidence are unchanged. Quote and other structured blocks are unchanged. The prose changes do not claim new visits, publication dates, or source verification. Removed a duplicated Rookwood sentence in the materials feature.

244 body blocks changed. A numeral comparison found no removed distinct numerical values from the document prose; this is a consistency check, not independent factual verification.

`npm run validate:content` passed all 17 tests. The final `npm run build` passed type checks, rendered 127 routes, verified 110 complete stories and 2514 asset references, and passed the static HTTP/404 test. `git diff --check` passed.

Browser review covered the mural aside at desktop and 390px, all four worlds at desktop and 390px, home and the Field notes directory at desktop, and library and art-note pages at 390px. Checked pages had no horizontal overflow; the browser logged no warnings or errors during final review. The local development and static preview servers were restarted for review; no remote deployment was performed.
