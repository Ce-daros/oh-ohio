# Implementation status

Application repository: `site/` (branch `main`). Source artwork lives in `artwork/` on disk but is not tracked by Git; archived drafts and past reviews are not part of this repository.

## Delivered scope

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

## Verification approach

Document, collection, source and route totals live in the generated `src/content/data/manifest.json`, `src/content/data/routes.json` and `editorial/content-coverage.json` — this document deliberately does not repeat them.

- `npm run validate:content` runs the manifest, content and route-catalog validators; `npm test` adds the fault-injection suite (deliberately broken IDs, references, dates, coordinates and media) plus the static HTTP/404 tests against a built `dist/`.
- `npx vue-tsc --noEmit` and `npm run lint` cover types and style across `src/` and `scripts/`.
- `npm run build` type-checks, builds client and server bundles, prerenders every public route, and verifies bundle isolation, sitemap/robots and prerendered output.

### Browser QA highlights

- Shared masthead geometry inspected on Make, Culture, Live, Field notes and Collections at desktop and 320 px; intentionally different title fonts kept.
- Home inspected at 320, 390, 768 and desktop widths; search with world filtering and URL persistence; reading-list save/reload/remove; Make scene/index entry with dialog, Escape, focus restoration and history restoration.
- Keyboard menu Enter/Escape returns focus to Menu; Live scene selection and journey ArrowRight keyboard flows checked.
- Reduced-motion emulation leaves all hero/reveal content visible without entrance motion; 640 × 450 reflow checked (equivalent to 1280 × 900 at 200% zoom).
- JavaScript disabled: the static listening feature and small-town diagrams render fully without scripts.
- Native NPS video reached readyState 4 and advanced past 15 seconds with transcript disclosure checked; Cincinnati map loaded real OSM tiles with visible attribution.

## Voice alignment (2026-09-26)

Subject first, specific personal taste or observation second, occasional gentle flirt; identity remains "civic idol, local girl, your Ohio guide." The revision reached all feature narrations, note commentary, phrase pages, home copy, world recommendations and reading journeys; the mural aside in `cincinnati-market-to-music` is the reference passage. IDs, slugs, source references, verification records and structured blocks were preserved — this was a copy revision, not a source-verification pass. See [voice-guide.md](voice-guide.md) and [motion-system.md](motion-system.md) for current behavior (home scroll snapping was removed 2026-09-27 in favor of dwell/breathing sections).

## Known limits

Source checks and editorial review remain separate. The inherited documents carry a complete code/editorial review with recorded recommendations, not a fresh fact-check; their unverified status is retained. Inherited illustrations with incomplete rights/provenance records keep those records; the generation manifest is described in [art-direction.md](art-direction.md). This record does not claim that future merge/deepen recommendations were executed or that all inherited media received new clearance.

## Release

Latest verified preview: `https://oh-ohio-7o0wgtb93-cedaros-projects.vercel.app`. The remote build passed validation and rendering for every public route and document; authenticated HTTP checks matched the local `dist` SHA256, sitemap, canonical metadata, `robots.txt`, query-preserving 308 redirects and real noindex 404s. Vercel's build-time `name`/`version` annotations are excluded from the `vercel.json` comparison; synthetic rewrites and changed redirect targets still fail validation. Deployment protection remains enabled; production was not promoted.
