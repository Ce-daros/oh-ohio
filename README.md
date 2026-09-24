# Oh, Ohio

A Vue 3, TypeScript, and Vite guide to Ohio, with Ohio-chan as its illustrated host.

## Development

Run `npm ci` and `npm run dev` locally. `npm run build` checks TypeScript, builds static assets into `dist/`, and creates direct-entry HTML for canonical and migrated routes.

## Four worlds

- `/explore`: Discover and Travel (19 articles).
- `/make`: Economy and Industry (18 articles and 4 sourced metrics).
- `/culture`: Culture and Local Language (16 articles and 4 language notes).
- `/live`: Life and Government (15 articles).

Old chapter URLs redirect to their new world and retain article hashes and query parameters. A hash opens the corresponding reading panel. Browser Back/Forward closes/reopens it; direct-link Close remains on the site.

`src/data/guide.json` contains all 44 original articles and sources. `worlds.json` defines the four routes. `catalog.ts` assigns each article to one scene group. `scene-summaries.json` contains brief group introductions. Supplemental field notes link to their official sources.

`extra-stories.json` adds 24 sourced stories, bringing the total to 68. `guided-tours.json` contains eight three-stop reading journeys and homepage invitations in Ohio-chan’s voice. `scene-guidance.json` adds her commentary to every scene group without replacing the original summaries.

## Art and interaction

Four scene images are served in `public/art/scenes/`. Character art is served from `public/art/characters/`.

Each world has a scene component, responsive labeled hotspots, a complete topic index, and a shared native-dialog reader. GSAP handles scoped entrances, scene selection and restrained pointer depth. Reduced-motion and keyboard input show final states immediately. Mobile scenes retain numbered landmarks and labeled touch controls.

## Deployment

Vercel builds this repository with `npm run build` and serves `dist/`. `vercel.json` lets direct links reach Vue Router while generated route entries provide page metadata for current and older chapter paths. The Vercel project is connected to the GitHub `main` branch.
