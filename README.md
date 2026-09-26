# Oh, Ohio

A Vue 3, TypeScript, and Vite guide to Ohio.

## Run locally

```sh
npm ci
npm run dev
```

`npm run build` validates content and types, builds the client and server bundles, renders every public route to `dist/`, and checks the resulting HTML. `npm run preview` serves the build locally. `npm run validate:content` checks the document graph without building the site.

## Content

Stories live in independent JSON documents under `src/content/documents/{feature,note,phrase}/`. Each document owns its metadata and typed body blocks. The generated `src/content/data/manifest.json` contains metadata only; `loadContentBody` imports each body on demand. Edit a document, then run `node scripts/content-manifest.mjs` and `node scripts/route-catalog.mjs` to refresh the manifest, routes, and Vercel redirects. The browser router, prerendered pages, canonical URLs, and sitemap all use that route catalog; only routes without `noindex` appear in the sitemap.

The registries in `src/content/data/` hold worlds, topics, places, sources, media, collections, scene relationships, journeys, metrics, and old phrase slug mappings. Collections give editorial order through `itemIds`; dossier collections appear at `/topics/<slug>`. The public content API is `src/content/index.ts`. See [the content architecture guide](editorial/content-architecture.md) before adding a story or source.

`npm run report:coverage` writes `editorial/content-coverage.json` from the canonical graph and the existing-content review. It reports world, category, dossier, source, media, and verification coverage outside the public site. A full build refreshes it. The local development route `/editorial` presents the report with document filters; it is excluded from production builds.

Follow the [voice guide](editorial/voice-guide.md) for Ohio-chan’s naturally cute English anime-girl voice: introduce the subject, express a specific personal taste, then occasionally add a gentle flirt. She remains a civic idol and local girl. Use the [update policy](editorial/update-policy.md) for fact checks, corrections and rights records. The inherited 86-document editorial review is separate from factual verification. It does not claim that those sources were reopened or that proposed merges have already happened.

Canonical story routes are `/journal/<slug>` for features, `/notes/<slug>` for notes, and `/words/<slug>` for phrases. The four world routes are `/explore`, `/make`, `/culture`, and `/live`. World hashes can open a reading panel. Old chapter paths redirect to their corresponding world, and old phrase hashes resolve through `migrations.json`.

## Motion

Entrances across the site share one language: a short rise with opacity and a blur that resolves, custom easing, and grid children staggering in; exits are always quicker and quieter. On desktop the homepage pins each section for a dwell with scrub-linked choreography — the screen recedes while its art slowly zooms — and scroll never snaps or hijacks input. Pages opt into shared motion through data attributes handled by `src/composables/usePageMotion.ts` (`data-reveal`, `data-reveal-grid`, `data-reveal-art`, `data-hero-art`) plus a shared masthead choreography; journal filtering and live search re-flow their grids with GSAP Flip via `src/composables/useGridFlip.ts`. Only `transform`, `opacity` and `filter` animate, and every effect is disabled for `prefers-reduced-motion` and keyboard users. See [the motion system guide](editorial/motion-system.md).

## Static publishing

The build renders Vue to complete HTML for home, worlds, collections, and every story. Each direct-entry page includes its full story text, route CSS, canonical metadata, and links to its assets. `dist/sitemap.xml`, `dist/robots.txt`, and a rendered `dist/404.html` are generated with the pages. The build checks that the sitemap exactly matches all indexable routes, has no duplicate or stale entries, and that both robots files point to the sitemap at `site.config.json`'s origin. If that origin changes, run `node scripts/site-artifacts.mjs --write-robots` to update the development copy in `public/robots.txt`. Client navigation hydrates the same components. Search and the browser-local reading list are marked `noindex`.

Vercel serves `dist/` as static files. `vercel.json` contains only the old chapter redirects and does not rewrite unknown routes to the app. A local build does not publish changes.

## Art

Scene and character art lives in `public/art/`. Feature illustrations have responsive WebP variants registered in `src/content/data/media.json`. The art manifest and research records are under `editorial/`.
