# Homepage refinement — 2026-09-25

> Superseded in part on 2026-09-27 by the motion refinement described at the end of this file: scroll snapping was removed. See [motion-system.md](motion-system.md) for current behavior.

## Composition

- Split the homepage into six components, retaining the existing character and scene assets.
- Four world links use a two-column desktop composition; Field notes has one lead and three supporting stories.
- The home theme collection now selects the materials feature, whistle cross-section and kiln note.
- Discovery save buttons are siblings of article links and use the existing reading-list provider.
- Only the homepage uses the compact footer.

## Interaction and static output

- Document-level proximity snapping is limited to the homepage at widths of at least 1024px and heights of at least 720px. *(Superseded 2026-09-27: snapping removed — see the update below.)*
- Keyboard input and reduced-motion preferences disable snapping and entrance motion. Each section enters once per mount; completed content stays visible.
- Chapter links preserve native anchor/history behavior. Ordinary scrolling only updates the active chapter.
- Verified save, reload persistence, reading-list navigation, removal, browser back, anchor alignment and native letter expansion.
- Verified single and multiple-page wheel input; fast input crossed multiple sections without changing the URL.
- Verified route cleanup restores no snapping and the full footer outside the homepage.
- With script execution disabled, all six sections remained readable, the letter expanded, and the Live link navigated successfully.

## Responsive checks

No horizontal overflow or broken loaded images at 320×740, 390×844, 768×1024, 1440×600, 720×450 and 1440×900. Snap was enabled only at 1440×900 among these sizes.

720×450 checks the CSS viewport equivalent of a 1440×900 window at 200% zoom; native browser zoom was not tested. Wheel input was exercised through browser automation; a physical touchpad gesture was not tested.

## Automated verification

- `npm run build`: passed, including type checking, 127 prerendered routes, 110 complete stories, 2514 asset references and the static HTTP/404 test.
- `npm run validate:content`: passed all 17 tests.
- `git diff --check`: passed.
- Browser console: no warnings or errors during final verification.

## Update — 2026-09-27 motion refinement

Document-level scroll snapping was removed from the homepage: it fought user input and read as mechanical. Each pinned section now keeps breathing through its dwell (scrub-linked recede, slow art zoom, watermark depth parallax), and entrance motion gained blur-based materializing with per-card grid staggers. The same materializing language was extended across the world, journal, collections and search pages; journal filtering and live search re-flow with GSAP Flip. Current behavior is documented in [motion-system.md](motion-system.md).

Re-verification after the change: `npm run build` passed with the same totals (127 prerendered routes, 110 complete stories, 2514 asset references) and `vue-tsc --noEmit` was clean. The responsive viewport spot checks above were not repeated.
