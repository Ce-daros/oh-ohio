import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useEventListener } from '@vueuse/core';

// A section counts as current once its top crosses 40% of the way from
// the header line to the bottom of the viewport.
const TRACK_LINE_RATIO = .4;

/** Highlights the homepage section currently in the reading zone. */
export function useHomeNav(root: Ref<HTMLElement | null>) {
  const active = ref('welcome');
  let frame = 0;
  let sections: HTMLElement[] = [];
  function update() {
    frame = 0;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
    const line = header + (innerHeight - header) * TRACK_LINE_RATIO;
    let current = sections[0]!;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
    }
    active.value = current.id;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  onMounted(() => {
    sections = [...root.value!.querySelectorAll<HTMLElement>('.home-stage')];
    useEventListener(window, 'scroll', schedule, { passive: true });
    useEventListener(window, 'resize', schedule);
    update();
  });
  onUnmounted(() => cancelAnimationFrame(frame));
  return active;
}
