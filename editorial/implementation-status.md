# Next edition delivery record

Working branch: `codex/editorial-next`. Application repository: `site/`.
The parent directory contains archived drafts and source artwork; it is not the application Git repository.

## Required scope

### 1. Content and publishing architecture

- [x] Independent canonical documents; stable IDs and slugs; distinct worlds, topics, places, kinds and art.
- [x] Source/media registries, explicit editorial collections, immutable indexes, lazy body loading.
- [x] Typed narrative blocks and shared reader; notes and language canonical pages; existing URL migration.
- [x] Integrity validation with corrupt-data tests; actual verification dates; documented editing workflow.
- [x] Vue static generation and hydration; one route/metadata/sitemap definition; real deep-link and 404 responses.

### 2. Product experience

- [x] Semantic visual tokens and scoped styles; readable metadata; consistent shared previews.
- [x] Editorial home; distinct four-world layouts; immediate scene/index access; explicit metrics.
- [x] Journal editorial selection; content-specific article rhythm; source/related context.
- [x] Search and filters; locally saved reading list; recoverable scene/journey choices.
- [x] Panel/full page identity, share URLs, close/back/forward/focus/scroll behavior.
- [x] Ohio-chan narrative roles and asset records; illustration/documentary distinction; responsive hero.
- [x] Unified motion policy and responsive, keyboard, reduced-motion browser verification.

### 3. Editorial expansion and release

- [x] Life of an object: feature, companion notes, explanation graphic, cross-world links.
- [x] Ohio sounds: feature, companion notes, authentic audio/transcript/rights, cross-world links.
- [x] One library loan: feature, companion notes, sourced workflow, practical information.
- [x] One street at different times: feature, companion notes, real geography and timeline.
- [x] Water organizes place: feature, companion notes, explanatory map/diagram.
- [x] Who keeps local memory: feature, companion notes, attribution and archival sources.
- [x] Beyond big cities: feature, companion notes, specific towns and institutions.
- [x] Different ways through Cincinnati/Dayton: sourced route variants, transport/rest/access details.
- [x] Existing content review, source/rights/revision records, update policy, internal coverage inspection.
- [x] Integrated tests and browser QA; actual deployment response verification.

## Evidence log

### Canonical content and publishing

The final graph contains 110 documents (22 features, 84 notes, 4 phrases), 43 collections including eight dossiers, 203 sources and 16 media records. Twenty-four new documents form eight features with two companion notes each. Every document has a separate lazy body chunk; the build checks that bodies and the local editorial desk do not enter the initial client bundle.

`npm run validate:content` passed all 17 integrity tests, including deliberately broken IDs, references, evidence dates, map coordinates and media. `npx vue-tsc --noEmit` passed. `npm run build` passed route validation, client/server builds, bundle isolation, Vue prerendering, HTML metadata/assets and HTTP tests for 127 public routes, seven legacy redirects, unknown-route 404 and production exclusion of `/editorial`.

Source checks and editorial review remain separate. The 86 inherited documents have a complete code/editorial review with recorded recommendations, not 86 new fact checks. Their unverified status is retained. Fourteen inherited illustrations retain incomplete rights/provenance records; the original generation manifest is described in `art-direction.md`. The project diagram and the linked NPS video have explicit records. This delivery does not claim that future merge/deepen recommendations were executed or that all inherited media received new clearance.

### Root browser inspection

- Shared masthead geometry inspected on Make, Culture, Live, Field notes and Collections at desktop and 320 px. Their intentionally different title fonts remain.
- Home inspected at 320, 390, 768 and desktop widths after the civic-idol/local-girl introduction. Narrow-screen portrait and stamp changes keep identity and entry button clear. Responsive portrait variants preserve composition.
- Search `whistle`, world filtering and URL persistence checked. Saving a note, reloading the reading list and removing the test save checked.
- Make scene/index entry, note dialog, Escape, focus restoration, scroll unlock, history restoration and full-page contextual links checked. Rechecked against the static production build.
- Keyboard menu Enter/Escape returns focus to Menu. Live scene selection updates `scene`; journey ArrowRight updates selected tab, tab stops and `journey` query.
- Reduced-motion emulation leaves all hero/reveal content visible without entrance motion. Inspected 640 × 450 viewport reflow, equivalent to the CSS viewport of a 1280 × 900 screen at 200% zoom; native browser zoom was not available in the in-app browser.
- JavaScript disabled on the static listening feature: full opening, 30 prose/source paragraphs, farewell, title and canonical remain in the DOM and render normally. Both small-town geographic diagrams and address links remain available without scripts.
- Native NPS video reached readyState 4, duration 190.44 seconds, and advanced beyond 15 seconds. Playback paused after verification; transcript/listening notes disclosure checked.
- Cincinnati interactive map loaded actual OSM street tiles and visible attribution. Static geography remains separate from illustrated topic hotspots. Split small-town maps and whistle/process diagrams inspected.
- Local content desk inspected; searching `whistle` with Make returns three records and separates verified/unverified status. Production build excludes this page.
- Static query-entry, dialog and complete-page navigation produced no browser warnings or errors in the final check.

Browser testing used the in-app browser directly. A Vue type check alone was not treated as visual verification.

### Voice alignment

The user selected the bright, friendly companion direction. Home now identifies Ohio-chan as “Civic idol, local girl, your Ohio guide.” Eight feature introductions, asides and farewells follow the recorded voice guide. Source-backed explanatory paragraphs remain, without invented first-person visits. A separate editorial review found no concrete factual drift in this voice pass.

### Release

Ready preview: https://oh-ohio-7o0wgtb93-cedaros-projects.vercel.app (`dpl_G1Ah1YrmEiAzHELNjFP84u9wzgj6`). The remote build passed validation and rendering for all 127 routes and 110 documents. Authenticated HTTP checks returned complete article HTML with the same SHA256 as local `dist`, matching sitemap content, correct canonical metadata and `robots.txt`, query-preserving 308 redirects for legacy/trailing-slash URLs, and real noindex 404 responses for `/editorial` and unknown paths. The production client bundle excludes the internal audit.

Vercel adds `name` and `version` to its build-time config. The validator accounts only for those observed annotations in the Vercel environment and compares the remaining config semantically. A synthetic check confirmed that additional rewrites and changed redirect targets still fail. Local preview redirects were fixed to preserve query strings.

Deployment protection remains enabled. The in-app browser has no Vercel login session, so remote checks used authenticated CLI HTTP; visual inspection used the matching local production build. Production was not promoted.

Logical commits include `8168e47` (connected dossiers/shared reading), `66582f0` (single-catalog static rendering), `15dbebd` (diagrams/geography), `741fd02` (local editorial desk), `e77ee0c` (voice/home portrait), `c720c65` (citations/count label), `b2ebf77` / `e005004` / `e91f6ca` (publishing corrections and checks), and `2fe4960` (maintenance documentation). Each stage was reviewed with staged diffs and relevant validation before delivery.
