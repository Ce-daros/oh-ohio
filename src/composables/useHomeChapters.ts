import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import gsap from 'gsap';

export const homeChapters = [
  { id: 'welcome', label: 'Hello' }, { id: 'worlds', label: 'Four worlds' },
  { id: 'in-focus', label: 'In focus' }, { id: 'field-notes', label: 'Field notes' },
  { id: 'discoveries', label: 'Little finds' }, { id: 'neighborhood', label: 'Everyday Ohio' },
];

export function useHomeChapters(root: Ref<HTMLElement | null>) {
  const active = ref('welcome');
  let dispose: () => void;
  onMounted(() => {
    const html = document.documentElement;
    html.dataset.home = '';
    const sections = [...root.value!.querySelectorAll<HTMLElement>('.home-stage')];
    const motion = matchMedia('(min-width:1024px) and (min-height:720px) and (prefers-reduced-motion:no-preference)');
    const context = gsap.context(() => {}, root.value!);
    const visited = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || visited.has(entry.target)) continue;
        visited.add(entry.target);
        observer.unobserve(entry.target);
        if (!motion.matches || html.dataset.input === 'keyboard') continue;
        context.add(() => {
          entry.target.querySelectorAll<HTMLElement>('[data-home-reveal]').forEach((element, index) => {
            gsap.from(element, { y: 10, opacity: 0, duration: element.dataset.homeReveal === 'art' ? .4 : .28, delay: index * .04, ease: 'power3.out', clearProps: 'transform,opacity' });
          });
        });
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    sections.forEach(section => observer.observe(section));
    let frame = 0;
    function update() {
      frame = 0;
      const header = parseFloat(getComputedStyle(html).getPropertyValue('--header-height'));
      const line = header + (innerHeight - header) * .4;
      let current = sections[0]!;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section;
      }
      active.value = current.id;
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function finishMotion() { context.revert(); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('ohio:motion-stop', finishMotion);
    motion.addEventListener('change', finishMotion);
    update();
    dispose = () => {
      delete html.dataset.home;
      observer.disconnect();
      context.revert();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('ohio:motion-stop', finishMotion);
      motion.removeEventListener('change', finishMotion);
    };
  });
  onUnmounted(() => dispose());
  return active;
}
