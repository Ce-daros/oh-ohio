import { onMounted, onUnmounted, type Ref } from "vue";
import gsap from "gsap";
import { inputMode, onInputModeChange } from "../input-mode";

export function useMotionPolicy(stop: () => void) {
  // Created during setup so `allowed()` is safe to call at any point
  // after component creation, not only after mount.
  const preference = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  let offInputChange: () => void = () => {};
  onMounted(() => {
    preference?.addEventListener("change", stop);
    offInputChange = onInputModeChange(stop);
  });
  onUnmounted(() => {
    preference?.removeEventListener("change", stop);
    offInputChange();
  });
  return () => preference !== null && !preference.matches && inputMode() !== "keyboard";
}

export function useMotionScope(root: Ref<HTMLElement | null>, animate: (element: HTMLElement) => (() => void) | void) {
  let context: gsap.Context;
  const allowed = useMotionPolicy(() => context.revert());
  onMounted(() => {
    context = gsap.context(() => {
      if (allowed()) return animate(root.value!) ?? undefined;
    }, root.value!);
  });
  onUnmounted(() => context.revert());
}
