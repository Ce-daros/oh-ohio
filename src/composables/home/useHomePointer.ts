import gsap from 'gsap';
import { useEventListener, type Fn } from '@vueuse/core';

// Pointer parallax strengths: portals drift subtly, plain buttons a bit more.
const BUTTON_DRIFT = .22;
const PORTAL_DRIFT = .12;
// Portal art sways across this span (in px) as the pointer crosses the card.
const PORTAL_ART_SPAN_X = 14;
const PORTAL_ART_SPAN_Y = 10;

/**
 * Pointer-reactive drift for the homepage buttons and world portals.
 * Bound and released by the choreography when it (re)builds the desktop
 * motion; bindings survive via explicit stop handles so re-binding never
 * stacks duplicate listeners.
 */
export function useHomePointer(main: HTMLElement) {
  const stops: Fn[] = [];

  function bind() {
    for (const element of main.querySelectorAll<HTMLElement>('.home-welcome .button, .world-portal')) {
      const strength = element.classList.contains('world-portal') ? PORTAL_DRIFT : BUTTON_DRIFT;
      const xTo = gsap.quickTo(element, 'x', { duration: .5, ease: 'expo.out' });
      const yTo = gsap.quickTo(element, 'y', { duration: .5, ease: 'expo.out' });
      stops.push(useEventListener(element, 'pointermove', (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
        yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
      }));
      stops.push(useEventListener(element, 'pointerleave', () => gsap.to(element, { x: 0, y: 0, duration: .9, ease: 'expo.out' })));
    }
    for (const card of main.querySelectorAll<HTMLElement>('.world-portal')) {
      const art = card.querySelector<HTMLElement>('.portal-art');
      if (!art) continue;
      gsap.set(art, { scale: 1.1 });
      const xTo = gsap.quickTo(art, 'x', { duration: .6, ease: 'expo.out' });
      const yTo = gsap.quickTo(art, 'y', { duration: .6, ease: 'expo.out' });
      stops.push(useEventListener(card, 'pointermove', (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        xTo(((event.clientX - rect.left) / rect.width - .5) * PORTAL_ART_SPAN_X);
        yTo(((event.clientY - rect.top) / rect.height - .5) * PORTAL_ART_SPAN_Y);
      }));
      stops.push(useEventListener(card, 'pointerleave', () => gsap.to(art, { x: 0, y: 0, duration: .9, ease: 'expo.out' })));
    }
  }

  function unbind() {
    stops.splice(0).forEach(stop => stop());
    for (const element of main.querySelectorAll<HTMLElement>('.home-welcome .button, .world-portal')) {
      gsap.set(element, { x: 0, y: 0 });
    }
    for (const card of main.querySelectorAll<HTMLElement>('.world-portal')) {
      const art = card.querySelector<HTMLElement>('.portal-art');
      if (art) gsap.set(art, { x: 0, y: 0, scale: 1 });
    }
  }

  return { bind, unbind };
}
