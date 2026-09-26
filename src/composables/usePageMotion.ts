import type { Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { useMotionScope } from "./useMotionPolicy";

gsap.registerPlugin(ScrollTrigger, SplitText);

const materialize = { ease: "power3.out", clearProps: "transform,opacity,filter" };

/**
 * Shared masthead choreography (Chapter / Journal / Topics pages):
 * kicker blur-fade → title line-mask reveal → description rise → actions fade.
 * The same language as the homepage headings, so the whole site reads as one system.
 */
export function animateMasthead(scope: HTMLElement) {
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
    const entrance = element.querySelectorAll("[data-hero-copy], [data-hero-detail]");
    if (entrance.length) gsap.from(entrance, {
      y: 14, opacity: 0, filter: "blur(8px)", duration: .55, stagger: .05, ease: "power3.out",
      clearProps: "transform,opacity,filter",
    });
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

/**
 * World (chapter) pages: generic page motion + statewide numbers count-up
 * + word slips dropping in with a settle rotation. Returns cleanup so an
 * interrupted count never leaves a stale number behind.
 */
export function useWorldMotion(root: Ref<HTMLElement | null>) {
  usePageMotion(root);
  useMotionScope(root, element => {
    const restore: Array<() => void> = [];
    element.querySelectorAll<HTMLElement>(".economy-numbers article").forEach((article, index) => {
      const strong = article.querySelector<HTMLElement>("strong");
      const textNode = strong?.childNodes[0];
      const original = textNode?.nodeValue ?? "";
      const parsed = original.match(/^([^\d]*)([\d,.]+)(.*)$/);
      if (!strong || !textNode || !parsed) return;
      const prefix = parsed[1] ?? "";
      const digits = parsed[2] ?? "0";
      const suffix = parsed[3] ?? "";
      const target = parseFloat(digits.replace(/,/g, ""));
      if (!Number.isFinite(target)) return;
      const decimals = (digits.split(".")[1] ?? "").length;
      const grouped = digits.includes(",");
      const format = (value: number) => grouped
        ? value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : value.toFixed(decimals);
      gsap.from(article, {
        ...materialize, y: 24, opacity: 0, duration: .7, delay: index * .08,
        scrollTrigger: { trigger: article, start: "top 92%", once: true },
      });
      const counter = { value: 0 };
      gsap.to(counter, {
        value: target, duration: 1.4, ease: "power2.out", delay: index * .08 + .1,
        onUpdate: () => { textNode.nodeValue = `${prefix}${format(counter.value)}${suffix}`; },
        scrollTrigger: { trigger: article, start: "top 92%", once: true },
      });
      restore.push(() => { textNode.nodeValue = original; });
    });
    const slips = element.querySelectorAll<HTMLElement>(".word-slips a");
    if (slips.length) gsap.from(slips, {
      ...materialize, y: -28, opacity: 0, rotation: "+=8", filter: "blur(6px)", duration: .85, stagger: .09,
      scrollTrigger: { trigger: slips[0], start: "top 90%", once: true },
    });
    return () => restore.forEach(reset => reset());
  });
}
