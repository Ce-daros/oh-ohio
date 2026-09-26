# Motion system

All site motion shares one language, established on the homepage and reused through small opt-in attributes. The goal is a quiet, physical feel: elements materialize (a short rise with a blur that resolves), grids stagger, exits are quicker and quieter than entrances, and scroll is never hijacked.

## Principles

1. **Materializing enters** — `opacity 0 → 1`, `y ≈ 14–40px → 0`, `filter: blur(6–12px) → 0`, custom easing only (`expo.out`, `power4.out`, `power3.out`). Never bare `ease`.
2. **Exits are subtler than enters** — smaller travel, roughly half the duration, no stagger.
3. **Scroll belongs to the user** — no snapping, no hijacking. Pinning exists only to create a dwell in which the content itself is choreographed.
4. **Frequency gates duration** — menu, filters and live search re-flow stay under ~400 ms; page entrances may breathe up to ~1.9 s (image settle).
5. **Only compositor properties animate** — `transform`, `opacity`, `filter`. Never layout properties. Entrance tweens `clearProps` when finished.
6. **Accessibility is part of the effect** — see below, not an appendix.

## Access control — `useMotionPolicy`

`src/composables/useMotionPolicy.ts` is the single gate. Motion runs only when the user has no `prefers-reduced-motion: reduce` preference and has not used the keyboard in this session (`html[data-input=keyboard]`, set on first `keydown`). CSS transitions carry explicit `html[data-input=keyboard]` opt-outs, and the global `@media(prefers-reduced-motion:reduce)` rule in `style.css` disables every CSS animation and transition. When the policy flips mid-animation, GSAP contexts revert and imperative text changes (count-up numbers) restore their original strings.

## Homepage — `src/composables/useHomeChapters.ts`

Desktop (≥1024×720, pointer users): each of the six sections pins for a `+=55%` dwell. During the dwell a scrubbed timeline (`scrub: 0.8` smoothing):

- the whole `.home-inner` recedes — `y: -14`, `opacity → .75` — handing off to the next screen;
- the section art slowly zooms (`scale 1 → 1.045`);
- the welcome watermark drifts on a slower parallax for depth.

Entrances fire once per section at `top 72%`: eyebrow → `SplitText` line-mask headline reveal → aside → copy blocks (blur materialize) → art (rise + blur + `scale 1.09 → 1` settle), with portal, discovery and supporting grids staggering their children.

**Scroll snap was deliberately removed.** Earlier versions snapped to section boundaries after the wheel stopped; it fought user input and read as mechanical. Stopping mid-dwell is designed to look intentional — a slightly receded screen, not a broken one.

Touch, small viewports and reduced motion fall back to IntersectionObserver reveals with shorter, simpler tweens.

## Pages — `src/composables/usePageMotion.ts`

`animateMasthead()` gives every `PageMasthead` page the homepage headline treatment: kicker → line-mask title → description → actions. Pages opt into the rest through attributes:

| Attribute | Behavior |
| --- | --- |
| `data-hero-art` | Hero art materializes; the inner image settles from `scale 1.08`. |
| `data-reveal` | Section materializes once at `top 92%`. |
| `data-reveal-grid` | Children stagger in once at `top 90%`. |
| `data-reveal-art` | Like `data-reveal`, plus an inner image scale settle. |

`useWorldMotion()` (world pages) adds: statewide numbers count up on enter — format-preserving for `$`, thousands separators and decimals — and culture-page word slips drop in with a settle rotation on top of their static ±3° tilt. An interrupted count restores the original string.

## Grid re-flow — `src/composables/useGridFlip.ts`

Journal filtering and live search re-flow their grids with GSAP Flip: surviving cards glide to their new slot, entering cards materialize, leaving cards fade in 160 ms. Rapid consecutive changes (typing) interrupt cleanly — in-flight tweens are killed and cleared before the next flip. Reduced-motion and keyboard users get instant swaps.

## Components

- **Menu** (`style.css`) — grows from its trigger (`transform-origin: top right`, `scale .96` plus blur), links stagger in at ~25 ms each, closes in 140 ms with no stagger.
- **World scene** (`worlds.css`, `WorldSelection.vue`) — hotspot pins drop in sequence with a small overshoot; the focus ring glides to the selected group; the selection panel cross-fades (`mode="out-in"`, 140 ms out, 280 ms in).
- **Scene ↔ topic index** (`ChapterPage.vue`) — the two views cross-fade.
- **Reader** — the panel slide is unchanged; `::backdrop` now fades in.

## Adding motion

1. Pass the frequency gate: rare, occasional, or frequent? Frequent interactions stay under ~300 ms without blur.
2. Reuse the materialize recipe and the existing easing; do not invent new curves.
3. Animate `transform` / `opacity` / `filter` only, and `clearProps` when done.
4. Handle `prefers-reduced-motion` and keyboard users in the same change — the composables do this for you.
5. Exits: half the duration, no blur, no stagger.
