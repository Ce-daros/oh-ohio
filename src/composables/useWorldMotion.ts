import type { Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionScope } from "./useMotionPolicy";
import { usePageMotion } from "./usePageMotion";

gsap.registerPlugin(ScrollTrigger);

const materialize = { ease: "power3.out", clearProps: "transform,opacity,filter" };

/**
 * World pages: generic page motion + statewide numbers count-up
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
