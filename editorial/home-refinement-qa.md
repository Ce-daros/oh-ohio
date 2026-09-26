# Homepage refinement — 2026-09-25

## Composition

- Split the homepage into six components, retaining the existing character and scene assets.
- Four world links use a two-column desktop composition; Field notes has one lead and three supporting stories.
- The home theme collection now selects the materials feature, whistle cross-section and kiln note.
- Discovery save buttons are siblings of article links and use the existing reading-list provider.
- Only the homepage uses the compact footer.

## Interaction and static output

- Document-level proximity snapping is limited to the homepage at widths of at least 1024px and heights of at least 720px.
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
