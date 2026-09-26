import { onMounted, onUnmounted, type Ref } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { useEventListener } from '@vueuse/core';
import { inputMode, onInputModeChange } from '../../input-mode';
import { useHomePointer } from './useHomePointer';

// Pin/scrub: each screen stays pinned for 55% of a viewport of scrolling
// while its content recedes slightly and its art slowly zooms.
const PIN_DISTANCE = '+=55%';
const DWELL_RECEDE_Y = -14;
const DWELL_RECEDE_OPACITY = .75;
const DWELL_ART_ZOOM = 1.045;
const WATERMARK_DRIFT_Y = 26;
const IMG_PARALLAX_PERCENT = 4;

// Entrance: grid cards materialize out of a soft blur; lone elements sit
// a touch deeper, the eyebrow lighter.
const GRID_STAGGER = '.world-portals, .discovery-grid, .supporting-stories, .theme-companions';
const BLUR_SOFT = 'blur(8px)';
const BLUR_DEEP = 'blur(10px)';
const BLUR_LIGHT = 'blur(6px)';

/**
 * The homepage scroll choreography: pinned desktop motion with entrance
 * reveals, or a lightweight IntersectionObserver fallback. Rebuilt from
 * scratch whenever the input mode or the motion media query flips.
 */
export function useHomeChoreography(root: Ref<HTMLElement | null>) {
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
    const animated = () => motion.matches && inputMode() !== 'keyboard';
    const context = gsap.context(() => {}, main);
    const pointer = useHomePointer(main);
    let observer: IntersectionObserver | null = null;

    function setupDesktop() {
      context.add(() => {
        const header = parseFloat(getComputedStyle(html).getPropertyValue('--header-height')) || 0;
        // 1) Pin each screen, but keep it breathing while dwelling: the content
        // recedes slightly and its art slowly zooms, scrub-linked — no dead screens.
        sections.forEach(section => {
          const inner = section.querySelector<HTMLElement>('.home-inner');
          if (!inner) return;
          const art = section.querySelector<HTMLElement>('[data-home-reveal="art"]');
          const dwell = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section, start: `top top+=${header}`, end: PIN_DISTANCE,
              pin: true, anticipatePin: 1, scrub: .8,
            },
          });
          dwell.fromTo(inner, { y: 0, opacity: 1 }, { y: DWELL_RECEDE_Y, opacity: DWELL_RECEDE_OPACITY, ease: 'power1.inOut', duration: 1 }, 0);
          if (art) dwell.fromTo(art, { scale: 1 }, { scale: DWELL_ART_ZOOM, ease: 'power1.out', duration: 1 }, 0);
          const watermark = section.querySelector<HTMLElement>('.welcome-watermark');
          if (watermark) gsap.fromTo(watermark, { y: -WATERMARK_DRIFT_Y }, {
            y: WATERMARK_DRIFT_Y, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
          for (const img of section.querySelectorAll<HTMLElement>('[data-home-reveal="art"] img')) {
            if (img.closest('.portal-art')) continue;
            gsap.fromTo(img, { yPercent: -IMG_PARALLAX_PERCENT }, {
              yPercent: IMG_PARALLAX_PERCENT, ease: 'none',
              scrollTrigger: { trigger: section, start: `top bottom`, end: `bottom top-=${header}`, scrub: 1 },
            });
          }
        });
        // 2) Entrance choreography: eyebrow → title line-mask reveal → aside →
        // content materializing out of blur → art settling, card grids staggered.
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
            if (element.matches(GRID_STAGGER) && element.children.length > 2) {
              tl.from([...element.children], {
                y: 38, opacity: 0, scale: .97, filter: BLUR_SOFT, duration: 1.1, stagger: .09,
                clearProps: 'transform,opacity,filter',
              }, at);
            } else {
              tl.from(element, {
                y: 34, opacity: 0, filter: BLUR_DEEP, duration: 1.05,
                clearProps: 'transform,opacity,filter',
              }, at);
            }
          };
          if (eyebrow) tl.from(eyebrow, { y: 16, opacity: 0, filter: BLUR_LIGHT, duration: .85, clearProps: 'filter' }, 0);
          if (heading) {
            const split = new SplitText(heading, { type: 'lines', mask: 'lines' });
            tl.from(split.lines, { yPercent: 120, duration: 1.15, stagger: .09, ease: 'power4.out' }, .07);
          }
          if (headingAside) tl.from(headingAside, { y: 22, opacity: 0, filter: BLUR_SOFT, duration: .95, clearProps: 'filter' }, .42);
          copy.forEach((element, index) => reveal(element, heading ? .3 + index * .09 : .05));
          for (const art of arts) {
            const at = heading ? .34 : .1;
            reveal(art, at + .06);
            const img = art.querySelector('img');
            if (img && !img.closest('.portal-art')) tl.from(img, { scale: 1.09, duration: 1.9, clearProps: 'transform' }, at);
          }
        });
      });
      if (fine.matches) pointer.bind();
    }

    function setupFallback() {
      const visited = new Set<Element>();
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || visited.has(entry.target)) continue;
          visited.add(entry.target);
          observer!.unobserve(entry.target);
          if (calm.matches || inputMode() === 'keyboard') continue;
          context.add(() => {
            entry.target.querySelectorAll<HTMLElement>('[data-home-reveal]').forEach((element, index) => {
              gsap.from(element, {
                y: 14, opacity: 0, filter: BLUR_SOFT,
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
      pointer.unbind();
      observer?.disconnect();
      observer = null;
    }

    function finishMotion() {
      teardownMotion();
      if (animated()) setupDesktop(); else setupFallback();
    }

    if (animated()) setupDesktop(); else setupFallback();

    const offInputChange = onInputModeChange(finishMotion);
    const offMotionChange = useEventListener(motion, 'change', finishMotion);
    dispose = () => {
      delete html.dataset.home;
      teardownMotion();
      offInputChange();
      offMotionChange();
    };
  });
  onUnmounted(() => dispose());
}
