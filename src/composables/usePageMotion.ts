import type { Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionScope } from "./useMotionPolicy";

gsap.registerPlugin(ScrollTrigger);

export function usePageMotion(root: Ref<HTMLElement | null>) {
  useMotionScope(root, element => {
    const entrance = element.querySelectorAll("[data-hero-copy], [data-hero-art], [data-hero-detail]");
    if (entrance.length) gsap.from(entrance, {
      y: 12, opacity: 0, duration: .42, stagger: .04,
      ease: "power3.out", clearProps: "transform,opacity",
    });
    element.querySelectorAll<HTMLElement>("[data-reveal]").forEach(section => {
      gsap.from(section, {
        y: 12, opacity: 0, duration: .4, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: section, start: "top 96%", once: true },
      });
    });
  });
}
