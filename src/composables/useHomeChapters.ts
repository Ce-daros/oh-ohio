import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

export const homeChapters = [
  { id: 'welcome', label: 'Hello' }, { id: 'worlds', label: 'Four worlds' },
  { id: 'in-focus', label: 'In focus' }, { id: 'field-notes', label: 'Field notes' },
  { id: 'discoveries', label: 'Little finds' }, { id: 'neighborhood', label: 'Everyday Ohio' },
];

export function useHomeChapters(root: Ref<HTMLElement | null>) {
  const active = ref('welcome');
  let dispose: () => void;
  onMounted(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const html = document.documentElement;
    html.dataset.home = '';
    const main = root.value!;
    const sections = [...main.querySelectorAll<HTMLElement>('.home-stage')];
    const motion = matchMedia('(min-width:1024px) and (min-height:720px) and (prefers-reduced-motion:no-preference)');
    // Motion opt-outs only: viewport size never disables entrance motion, it only
    // switches between the pinned desktop choreography and the simpler fallback.
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer:fine)');
    const animated = () => motion.matches && html.dataset.input !== 'keyboard';
    const context = gsap.context(() => {}, main);
    let observer: IntersectionObserver | null = null;
    let cleanups: Array<() => void> = [];

    function bindPointer() {
      const strengthOf = (element: HTMLElement) => element.classList.contains('world-portal') ? .12 : .22;
      for (const element of main.querySelectorAll<HTMLElement>('.home-welcome .button, .world-portal')) {
        const strength = strengthOf(element);
        const xTo = gsap.quickTo(element, 'x', { duration: .5, ease: 'expo.out' });
        const yTo = gsap.quickTo(element, 'y', { duration: .5, ease: 'expo.out' });
        const move = (event: PointerEvent) => {
          const rect = element.getBoundingClientRect();
          xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
          yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
        };
        const leave = () => gsap.to(element, { x: 0, y: 0, duration: .9, ease: 'expo.out' });
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', leave);
          gsap.set(element, { x: 0, y: 0 });
        });
      }
      for (const card of main.querySelectorAll<HTMLElement>('.world-portal')) {
        const art = card.querySelector<HTMLElement>('.portal-art');
        if (!art) continue;
        gsap.set(art, { scale: 1.1 });
        const xTo = gsap.quickTo(art, 'x', { duration: .6, ease: 'expo.out' });
        const yTo = gsap.quickTo(art, 'y', { duration: .6, ease: 'expo.out' });
        const move = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          xTo(((event.clientX - rect.left) / rect.width - .5) * 14);
          yTo(((event.clientY - rect.top) / rect.height - .5) * 10);
        };
        const leave = () => gsap.to(art, { x: 0, y: 0, duration: .9, ease: 'expo.out' });
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', leave);
          gsap.set(art, { x: 0, y: 0, scale: 1 });
        });
      }
    }

    function setupDesktop() {
      context.add(() => {
        const header = parseFloat(getComputedStyle(html).getPropertyValue('--header-height')) || 0;
        // —— 1) 每屏 pin 住，但驻留期间内容持续“呼吸”：整屏轻微退场让位 + 画面缓慢推近，scrub 平滑跟随，绝无死屏 ——
        sections.forEach(section => {
          const inner = section.querySelector<HTMLElement>('.home-inner');
          if (!inner) return;
          const art = section.querySelector<HTMLElement>('[data-home-reveal="art"]');
          const dwell = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section, start: `top top+=${header}`, end: '+=55%',
              pin: true, anticipatePin: 1, scrub: .8,
            },
          });
          dwell.fromTo(inner, { y: 0, opacity: 1 }, { y: -14, opacity: .75, ease: 'power1.inOut', duration: 1 }, 0);
          if (art) dwell.fromTo(art, { scale: 1 }, { scale: 1.045, ease: 'power1.out', duration: 1 }, 0);
          const watermark = section.querySelector<HTMLElement>('.welcome-watermark');
          if (watermark) gsap.fromTo(watermark, { y: -26 }, {
            y: 26, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
          for (const img of section.querySelectorAll<HTMLElement>('[data-home-reveal="art"] img')) {
            if (img.closest('.portal-art')) continue;
            gsap.fromTo(img, { yPercent: -4 }, {
              yPercent: 4, ease: 'none',
              scrollTrigger: { trigger: section, start: `top bottom`, end: `bottom top-=${header}`, scrub: 1 },
            });
          }
        });
        // —— 2) 入场编排：eyebrow → 标题逐行揭幕 → 侧栏 → 内容模糊聚焦上浮（blur 物质化）→ 画面缓释，卡片网格逐张错峰 ——
        const staggerGrids = '.world-portals, .discovery-grid, .supporting-stories, .theme-companions';
        sections.forEach(section => {
          const eyebrow = section.querySelector<HTMLElement>('.eyebrow');
          const heading = section.id === 'welcome'
            ? section.querySelector<HTMLElement>('#welcome-title')
            : section.querySelector<HTMLElement>('.home-heading h2');
          const headingAside = section.querySelector<HTMLElement>('.home-heading > p, .home-heading > a');
          const content = [...section.querySelectorAll<HTMLElement>('[data-home-reveal]')]
            .filter(element => element !== heading && !element.classList.contains('home-heading'));
          const arts = content.filter(element => element.dataset.homeReveal === 'art');
          const copy = content.filter(element => element.dataset.homeReveal !== 'art');
          const tl = gsap.timeline({
            defaults: { ease: 'expo.out' },
            scrollTrigger: { trigger: section, start: 'top 72%', once: true },
          });
          const reveal = (element: HTMLElement, at: number) => {
            if (element.matches(staggerGrids) && element.children.length > 2) {
              tl.from([...element.children], {
                y: 38, opacity: 0, scale: .97, filter: 'blur(8px)', duration: 1.1, stagger: .09,
                clearProps: 'transform,opacity,filter',
              }, at);
            } else {
              tl.from(element, {
                y: 34, opacity: 0, filter: 'blur(10px)', duration: 1.05,
                clearProps: 'transform,opacity,filter',
              }, at);
            }
          };
          if (eyebrow) tl.from(eyebrow, { y: 16, opacity: 0, filter: 'blur(6px)', duration: .85, clearProps: 'filter' }, 0);
          if (heading) {
            const split = new SplitText(heading, { type: 'lines', mask: 'lines' });
            tl.from(split.lines, { yPercent: 120, duration: 1.15, stagger: .09, ease: 'power4.out' }, .07);
          }
          if (headingAside) tl.from(headingAside, { y: 22, opacity: 0, filter: 'blur(8px)', duration: .95, clearProps: 'filter' }, .42);
          copy.forEach((element, index) => reveal(element, heading ? .3 + index * .09 : .05));
          for (const art of arts) {
            const at = heading ? .34 : .1;
            reveal(art, at + .06);
            const img = art.querySelector('img');
            if (img && !img.closest('.portal-art')) tl.from(img, { scale: 1.09, duration: 1.9, clearProps: 'transform' }, at);
          }
        });
      });
      if (fine.matches) bindPointer();
    }

    function setupFallback() {
      const visited = new Set<Element>();
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || visited.has(entry.target)) continue;
          visited.add(entry.target);
          observer!.unobserve(entry.target);
          if (calm.matches || html.dataset.input === 'keyboard') continue;
          context.add(() => {
            entry.target.querySelectorAll<HTMLElement>('[data-home-reveal]').forEach((element, index) => {
              gsap.from(element, {
                y: 14, opacity: 0, filter: 'blur(8px)',
                duration: element.dataset.homeReveal === 'art' ? .55 : .45, delay: index * .06,
                ease: 'power3.out', clearProps: 'transform,opacity,filter',
              });
            });
          });
        }
      }, { rootMargin: '0px 0px -8% 0px' });
      sections.forEach(section => observer!.observe(section));
    }

    function teardownMotion() {
      context.revert();
      cleanups.forEach(cleanup => cleanup());
      cleanups = [];
      observer?.disconnect();
      observer = null;
    }

    function finishMotion() {
      teardownMotion();
      if (animated()) setupDesktop(); else setupFallback();
    }

    if (animated()) setupDesktop(); else setupFallback();

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
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('ohio:motion-stop', finishMotion);
    motion.addEventListener('change', finishMotion);
    update();
    dispose = () => {
      delete html.dataset.home;
      teardownMotion();
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
