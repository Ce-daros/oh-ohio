import type { Ref } from "vue";
import gsap from "gsap";
import { useMotionScope } from "./useMotionPolicy";
import { usePageMotion } from "./usePageMotion";
import { useGridFlip } from "./useGridFlip";

/**
 * Field notes page: shared masthead choreography + generic reveals
 * (data-reveal / data-reveal-grid / data-reveal-art) + the featured story
 * materializing alongside its cover settling from 1.08. When a filter
 * signal is provided, the archive grid re-flows smoothly on change.
 */
export function useJournalMotion(root: Ref<HTMLElement | null>, signal?: () => unknown) {
  if (signal) useGridFlip(root, ".journal-grid", signal);
  usePageMotion(root);
  useMotionScope(root, element => {
    const feature = element.querySelectorAll("[data-journal-enter]");
    if (!feature.length) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: .2 });
    tl.from(feature, {
      y: 30, opacity: 0, filter: "blur(10px)", duration: 1, stagger: .12, clearProps: "transform,opacity,filter",
    });
    const art = element.querySelector<HTMLElement>(".journal-feature-art img");
    if (art) tl.from(art, { scale: 1.08, duration: 1.6, clearProps: "transform" }, .08);
  });
}
