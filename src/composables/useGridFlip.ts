import { onUpdated, watch, type Ref } from "vue";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useMotionPolicy } from "./useMotionPolicy";

gsap.registerPlugin(Flip);

/**
 * Smoothly re-flows a card grid when its items change (filters, live search):
 * surviving cards glide to their new slot (FLIP), entering cards materialize
 * with a soft blur, leaving cards fade quickly. Rapid consecutive changes
 * (e.g. typing) interrupt cleanly — in-flight tweens are killed and cleared
 * before the next flip so nothing gets stuck half-way. No-ops for reduced
 * motion and keyboard users: content just swaps.
 */
export function useGridFlip(root: Ref<HTMLElement | null>, selector: string, signal: () => unknown) {
  const allowed = useMotionPolicy(() => {
    // Motion became disallowed mid-flight: drop the captured state and
    // clear any in-progress tweens so cards never freeze half-way.
    state = null;
    const grid = root.value?.querySelector(selector);
    if (grid?.children.length) {
      gsap.killTweensOf(grid.children);
      Flip.killFlipsOf(grid.children);
      gsap.set(grid.children, { clearProps: "opacity,transform,filter" });
    }
  });
  let state: Flip.FlipState | null = null;
  watch(signal, () => {
    const grid = allowed() ? root.value?.querySelector(selector) : null;
    state = grid ? Flip.getState(grid) : null;
  });
  onUpdated(() => {
    if (!state || !root.value) { state = null; return; }
    const captured = state;
    state = null;
    const grid = root.value.querySelector(selector);
    if (grid?.children.length) {
      gsap.killTweensOf(grid.children);
      Flip.killFlipsOf(grid.children);
      gsap.set(grid.children, { clearProps: "opacity,transform,filter" });
    }
    Flip.from(captured, {
      duration: .4, ease: "power2.out", stagger: .015,
      onEnter: elements => gsap.fromTo(elements,
        { opacity: 0, y: 16, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: .35, ease: "power2.out", clearProps: "all" }),
      onLeave: elements => gsap.to(elements, { opacity: 0, duration: .16, ease: "power1.in" }),
    });
  });
}
