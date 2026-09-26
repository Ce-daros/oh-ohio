import type { Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { useMotionScope } from "./useMotionPolicy";

gsap.registerPlugin(ScrollTrigger, SplitText);

const materialize = { ease: "power3.out", clearProps: "transform,opacity,filter" };

/**
 * Shared masthead choreography (World / Journal / Topics pages):
 * kicker blur-fade → title line-mask reveal → description rise → actions fade.
 * The same language as the homepage headings, so the whole site reads as one system.
 */
function animateMasthead(scope: HTMLElement) {
  const masthead = scope.querySelector<HTMLElement>(".page-masthead");
  if (!masthead) return;
  const kicker = masthead.querySelector<HTMLElement>(".masthead-kicker");
  const title = masthead.querySelector<HTMLElement>(".masthead-line h1");
  const description = masthead.querySelector<HTMLElement>(".masthead-line > p");
  const actions = masthead.querySelector<HTMLElement>(".masthead-actions");
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  if (kicker) tl.from(kicker, { y: 14, opacity: 0, filter: "blur(5px)", duration: .7, clearProps: "filter" }, 0);
  if (title) {
    const split = new SplitText(title, { type: "lines", mask: "lines" });
    tl.from(split.lines, { yPercent: 120, duration: 1.05, stagger: .08, ease: "power4.out" }, .06);
  }
  if (description) tl.from(description, { y: 18, opacity: 0, filter: "blur(8px)", duration: .9, clearProps: "filter" }, .38);
  if (actions) tl.from(actions, { y: 12, opacity: 0, duration: .7, clearProps: "transform,opacity" }, .5);
}

/**
 * Generic page motion. Opt in via data attributes:
 * - [data-hero-art]   hero art materializes (blur + rise, image slowly settles from 1.08)
 * - [data-reveal]     scroll-triggered materialize, fires once
 * - [data-reveal-grid] children stagger in as a sequence, fires once
 * - [data-reveal-art]  like data-reveal, plus inner image scale settle
 * Plus the shared masthead choreography when a .page-masthead is present.
 */
export function usePageMotion(root: Ref<HTMLElement | null>) {
  useMotionScope(root, element => {
    animateMasthead(element);
    const heroArt = element.querySelector<HTMLElement>("[data-hero-art]");
    if (heroArt) {
      const img = heroArt.querySelector("img");
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: .18 });
      tl.from(heroArt, { y: 34, opacity: 0, filter: "blur(12px)", duration: 1.1, clearProps: "transform,opacity,filter" });
      if (img) tl.from(img, { scale: 1.08, duration: 1.7, clearProps: "transform" }, 0);
    }
    element.querySelectorAll<HTMLElement>("[data-reveal]").forEach(section => {
      gsap.from(section, {
        ...materialize, y: 26, opacity: 0, filter: "blur(8px)", duration: .8,
        scrollTrigger: { trigger: section, start: "top 92%", once: true },
      });
    });
    element.querySelectorAll<HTMLElement>("[data-reveal-grid]").forEach(grid => {
      const kids = [...grid.children];
      if (!kids.length) return;
      gsap.from(kids, {
        ...materialize, y: 30, opacity: 0, filter: "blur(8px)", duration: .9, stagger: .07,
        scrollTrigger: { trigger: grid, start: "top 90%", once: true },
      });
    });
    element.querySelectorAll<HTMLElement>("[data-reveal-art]").forEach(figure => {
      const img = figure.querySelector("img");
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: figure, start: "top 90%", once: true },
      });
      tl.from(figure, { y: 40, opacity: 0, filter: "blur(10px)", duration: 1.1, clearProps: "transform,opacity,filter" });
      if (img) tl.from(img, { scale: 1.08, duration: 1.6, clearProps: "transform" }, 0);
    });
  });
}
