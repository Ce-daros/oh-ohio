import { onMounted, onUnmounted, type Ref } from "vue";
import gsap from "gsap";

export function useMotionPolicy(stop: () => void) {
  let preference: MediaQueryList;
  onMounted(() => {
    preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener("change", stop);
    document.addEventListener("ohio:motion-stop", stop);
  });
  onUnmounted(() => {
    preference.removeEventListener("change", stop);
    document.removeEventListener("ohio:motion-stop", stop);
  });
  return () => !preference.matches && document.documentElement.dataset.input !== "keyboard";
}

export function useMotionScope(root: Ref<HTMLElement | null>, animate: (element: HTMLElement) => void) {
  let context: gsap.Context;
  const allowed = useMotionPolicy(() => context.revert());
  onMounted(() => {
    context = gsap.context(() => {
      if (allowed()) animate(root.value!);
    }, root.value!);
  });
  onUnmounted(() => context.revert());
}
