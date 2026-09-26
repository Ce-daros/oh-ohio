# Content architecture

Each story is one JSON file under `src/content/documents/feature/`, `note/`, or `phrase/`. Its `meta` and `blocks` are the canonical copy. `scripts/content-manifest.mjs` generates the metadata-only manifest from those files. Never edit the generated manifest by hand. The earlier guide, extra-story, journal, and phrase arrays were one-time migration inputs; they are no longer a source of truth.

## Add or revise a story

1. Choose a stable slug and ID (`feature:<slug>`, `note:<slug>`, or `phrase:<slug>`). Create the document file with the matching path, `meta.bodyPath`, and canonical URL. Keep its `order` unique.
2. Add sources to `src/content/data/sources.json` and cite their IDs in `meta.sourceRefs`. Put source IDs on blocks where they support specific claims. `verification.status` is explicit: leave it `unverified` until a source has actually been checked. A verified document records `verifiedAt` and a source ID from its own references.
3. Add referenced images or video to `media.json`. Local assets use `/` paths into `public/`; remotely hosted media use HTTP(S) URLs. Record `use`, provenance, and rights. An illustration needs image media, and a video block needs video media. A remote URL is structurally checked during the build; run `npm run check:remote-media` for an explicit network HEAD check before publishing.
4. Connect the document to at least one collection in `collections.json`. Collection `itemIds` control reading order. Update topics, places, world scene groups, or a dossier collection where relevant. A dossier collection needs a unique slug and a feature as its featured item.
5. Run `node scripts/content-manifest.mjs`, `node scripts/route-catalog.mjs`, `npm run validate:content`, and `npm run build`. The validator checks relationships, source and media references, block requirements, dates, files, legacy slugs, and generated-file freshness. The build checks emitted route HTML and that every body remains in its own lazy client chunk.

## Voice and editorial ownership

Follow [Ohio-chan’s current voice guide](voice-guide.md) when revising public narration: subject first, specific personal taste next, occasional gentle flirt. This applies inside feature bodies as well as to summaries and character asides. World recommendations live in `src/content/data/scene-guidance.json`; reading-journey narration lives in `src/content/data/journeys.json`. Keep this prose in the canonical files, not a runtime catchphrase transform or a second content list. Archived research prose is evidence, not a voice template.

## Metadata and dates

All documents have `id`, `kind`, `slug`, `title`, `summary`, `canonicalPath`, `primaryWorld`, `worlds`, `topics`, `places`, `sourceRefs`, `verification`, and `bodyPath`. Features add category, location, read time, cover image, title accent, and reasoned recommendations. Keep a feature cover's `coverMediaId` in the media registry. Do not invent timestamps or source verification.

`verifiedAt` is the date a cited source was checked, with `verification.sourceId` among the document's source references. Dates can be ISO calendar dates or precise ISO timestamps.

Body blocks are `paragraph`, `heading`, `illustration`, `process`, `quote`, `timeline`, `practical`, `characterAside`, `video`, `route`, and `placeMap`. Any block can carry `sourceIds` selected from that document's `sourceRefs`. Headings have stable IDs so direct links work. A process defaults to sequential steps; use `layout: "parallel"` for related systems that do not form a sequence. Place maps require sourced geographic coordinates and show a static location diagram before the reader chooses to load the interactive map. Character asides use an optional role: `welcome`, `notice`, `explain`, `listen`, `practical`, or `farewell`.

## Registries and API

`worlds.json` defines the four primary worlds. `collections.json` carries explicit editorial membership and order for topics, worlds, home sections, categories, and dossiers; scene topics are the `kind: "topic"` entries there. `scenes.json` maps world hotspots to collections and slugs. `places.json` stores named places; coordinates and addresses require a source ID. `journeys.json` contains ordered reading stops referencing content IDs. `metrics.json` holds sourced figures with evidence URLs. `migrations.json` maps old phrase hashes to stable slugs.

`src/content/index.ts` exports immutable `contentManifest`, registry values, `getContent(idOrSlug)`, `getContents(ids)`, `queryContent({ kind, world })`, `loadContentBody(idOrSlug)`, `getWorld(id)`, `getSource(id)`, `getMedia(id)`, `getCollection(id)`, and `resolveLegacySlug(slug)`. The manifest and registries load with the app; each body is imported only when its story is opened. Server rendering loads the requested story body and writes the complete text into its direct-entry HTML.

The old JSON collections and `catalog.ts`/`journal.ts` arrays were migration scaffolding. New editorial work belongs in the independent documents and registries. Do not recreate a parallel hand-maintained content list.

`scripts/route-catalog.mjs` generates `routes.json` and `vercel.json` from the manifest and registries. The browser router, prerenderer, sitemap, and HTTP checks read the same route catalog. The prerender verifier requires the sitemap URL list to match every indexable route exactly and checks the configured origin in both robots files. `scripts/content-coverage.mjs` writes a deterministic editorial report outside `dist/`, cross-checking the existing-content review against canonical paths and summarizing orphan notes, unused sources and media, citation status, and world/category/dossier coverage.
