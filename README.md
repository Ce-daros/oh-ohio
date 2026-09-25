# Oh, Ohio

A Vue 3, TypeScript, and Vite guide to Ohio.

## Run locally

```sh
npm ci
npm run dev
```

`npm run build` validates content and types, builds the client and server bundles, renders every public route to `dist/`, and checks the resulting HTML. `npm run preview` serves the build locally. `npm run validate:content` checks the document graph without building the site.

## Content

Stories live in independent JSON documents under `src/content/documents/{feature,note,phrase}/`. Each document owns its metadata and typed body blocks. The generated `src/content/data/manifest.json` contains metadata only; `loadContentBody` imports each body on demand. Edit a document, then run `node scripts/content-manifest.mjs` to refresh the manifest.

The registries in `src/content/data/` hold worlds, topics, places, sources, media, collections, scene relationships, journeys, metrics, and old phrase slug mappings. Collections give editorial order through `itemIds`; dossier collections appear at `/topics/<slug>`. The public content API is `src/content/index.ts`. See [the content architecture guide](editorial/content-architecture.md) before adding a story or source.

Canonical story routes are `/journal/<slug>` for features, `/notes/<slug>` for notes, and `/words/<slug>` for phrases. The four world routes are `/explore`, `/make`, `/culture`, and `/live`. World hashes can open a reading panel. Old chapter paths redirect to their corresponding world, and old phrase hashes resolve through `migrations.json`.

## Static publishing

The build renders Vue to complete HTML for home, worlds, collections, and every story. Each direct-entry page includes its full story text, route CSS, canonical metadata, and links to its assets. `dist/sitemap.xml`, `dist/robots.txt`, and a rendered `dist/404.html` are generated together with the pages. Client navigation hydrates the same components. Search and the browser-local reading list are marked `noindex`.

Vercel serves `dist/` as static files. `vercel.json` contains only the old chapter redirects and does not rewrite unknown routes to the app. A local build does not publish changes.

## Art

Scene and character art lives in `public/art/`. Feature illustrations have responsive WebP variants registered in `src/content/data/media.json`. The art manifest and research records are under `editorial/`.
