import { onMounted, onUnmounted, type Ref } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function usePageMotion(root: Ref<HTMLElement | null>) {
  let media: gsap.MatchMedia;
  const finishMotion = () => { gsap.getTweensOf(root.value!.querySelectorAll("*")).forEach(tween => { tween.progress(1).kill(); }); };
  onMounted(() => {
    document.addEventListener("ohio:motion-stop", finishMotion);
    media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (document.documentElement.dataset.input === "keyboard") return;
      const scope = root.value!;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline.from(scope.querySelectorAll("[data-hero-copy]"), { y: 24, opacity: 0, duration: .65, stagger: .07 }, 0)
        .from(scope.querySelectorAll("[data-hero-art]"), { y: 18, opacity: 0, duration: .85 }, .08)
        .from(scope.querySelectorAll("[data-hero-detail]"), { y: 10, opacity: 0, duration: .4, stagger: .045 }, .25);
      scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        const reveal = { trigger: element, start: "top 94%", once: true };
        if (element.dataset.reveal === "portrait") {
          gsap.from(element, { x: -16, rotation: -2, opacity: 0, duration: .7, ease: "power3.out", scrollTrigger: reveal });
        } else if (element.dataset.reveal === "story") {
          gsap.from(element.querySelector(".dispatch-image"), { clipPath: "inset(0 0 12% 0)", duration: .7, ease: "power3.out", scrollTrigger: reveal });
          gsap.from(element.querySelector(".dispatch-copy"), { y: 12, opacity: 0, duration: .45, ease: "power3.out", scrollTrigger: reveal });
        } else {
          gsap.from(element, { y: 18, opacity: 0, duration: .5, ease: "power3.out", scrollTrigger: reveal });
        }
      });
    }, root.value!);
    media.add("(min-width: 960px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const stage = root.value!.querySelector<HTMLElement>("[data-parallax-stage]")!;
      const target = stage.querySelector<HTMLElement>("[data-parallax-art]")!;
      const x = gsap.quickTo(target, "x", { duration: .55, ease: "power3.out" });
      const y = gsap.quickTo(target, "y", { duration: .55, ease: "power3.out" });
      let bounds = stage.getBoundingClientRect();
      const enter = () => { bounds = stage.getBoundingClientRect(); };
      const move = (event: PointerEvent) => {
        if (document.documentElement.classList.contains("reading-open") || document.documentElement.dataset.input === "keyboard") return;
        x(((event.clientX - bounds.left) / bounds.width - .5) * 12);
        y(((event.clientY - bounds.top) / bounds.height - .5) * 8);
      };
      const reset = () => { x(0); y(0); };
      stage.addEventListener("pointerenter", enter);
      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerleave", reset);
      return () => { stage.removeEventListener("pointerenter", enter); stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", reset); };
    }, root.value!);
  });
  onUnmounted(() => { document.removeEventListener("ohio:motion-stop", finishMotion); media.revert(); });
}
