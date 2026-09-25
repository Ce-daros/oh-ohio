import type { Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionScope } from "./useMotionPolicy";

gsap.registerPlugin(ScrollTrigger);

export function useJournalMotion(root: Ref<HTMLElement | null>) {
  useMotionScope(root, element => {
    gsap.from(element.querySelectorAll("[data-journal-enter]"), {
      y: 10, opacity: 0, duration: .4, stagger: .035, ease: "power3.out", clearProps: "transform,opacity",
    });
    element.querySelectorAll("[data-journal-reveal]").forEach(section => {
      gsap.from(section, {
        y: 8, opacity: 0, duration: .3, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: section, start: "top 96%", once: true },
      });
    });
  });
}
