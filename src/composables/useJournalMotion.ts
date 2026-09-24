import { onMounted, onUnmounted, type Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useJournalMotion(root: Ref<HTMLElement | null>) {
  let media: gsap.MatchMedia;
  let context: gsap.Context;
  const stop = () => media.revert();

  onMounted(() => {
    context = gsap.context(() => {
      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (document.documentElement.dataset.input === "keyboard") return;
        gsap.from(root.value!.querySelectorAll("[data-journal-enter]"), {
          y: 14, opacity: 0, duration: .55, stagger: .055, ease: "power3.out", clearProps: "transform,opacity",
        });
        root.value!.querySelectorAll("[data-journal-reveal]").forEach(element => {
          gsap.from(element, {
            y: 12, opacity: 0, duration: .45, ease: "power3.out", clearProps: "transform,opacity",
            scrollTrigger: { trigger: element, start: "top 96%", once: true },
          });
        });
      });
    }, root.value!);
    document.addEventListener("ohio:motion-stop", stop);
  });

  onUnmounted(() => {
    document.removeEventListener("ohio:motion-stop", stop);
    media.revert();
    context.revert();
  });
}
