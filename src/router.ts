import { createMemoryHistory, createRouter, createWebHistory, type RouteLocationGeneric, type RouteRecordRaw } from 'vue-router';
import { resolveLegacySlug, worlds, type WorldId } from './content';
import routeData from 'virtual:routes';

type CatalogRoute = {
  path: string;
  kind: 'home' | 'journal' | 'topics' | 'search' | 'saved' | 'world' | 'dossier' | 'content';
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  slug?: string;
  world?: WorldId;
};
type RouteCatalog = { routes: CatalogRoute[]; redirects: { source: string; destination: string }[] };
const catalog = routeData as RouteCatalog;

const routes: RouteRecordRaw[] = [
  ...(import.meta.env.DEV ? [{ path: '/editorial', component: () => import('./pages/EditorialPage.vue'), meta: { title: 'Content desk — Oh, Ohio', description: 'Local editorial review.', noindex: true } }] : []),
  ...catalog.routes.map(route => ({
    path: route.path,
    component: routeComponent(route.kind),
    props: route.kind === 'content' || route.kind === 'dossier' ? { slug: route.slug } : route.kind === 'world' ? { worldId: route.world } : undefined,
    meta: { title: route.title, description: route.description, image: route.image, noindex: route.noindex },
  })),
  ...catalog.redirects.map(redirect => ({
    path: redirect.source,
    redirect: (to: RouteLocationGeneric) => ({ path: redirect.destination, hash: to.hash, query: to.query }),
  })),
  { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFoundPage.vue'), meta: { title: 'Page not found — Oh, Ohio', description: 'That page could not be found.', noindex: true, notFound: true } },
];

function routeComponent(kind: CatalogRoute['kind']) {
  switch (kind) {
    case 'home': return () => import('./pages/HomePage.vue');
    case 'journal': return () => import('./pages/JournalPage.vue');
    case 'topics': return () => import('./pages/TopicsPage.vue');
    case 'search': return () => import('./pages/SearchPage.vue');
    case 'saved': return () => import('./pages/SavedPage.vue');
    case 'world': return () => import('./pages/WorldPage.vue');
    case 'dossier': return () => import('./pages/TopicPage.vue');
    case 'content': return () => import('./pages/ContentPage.vue');
  }
}

// How long to wait for a deep-link target to mount before giving up on
// the scroll adjustment (e.g. a lazily loaded body still suspending).
const ANCHOR_TIMEOUT_MS = 3000;

function anchorPosition(hash: string) {
  const id = decodeURIComponent(hash.slice(1));
  return new Promise<false | { el: HTMLElement; top: number }>(resolve => {
    const find = () => document.getElementById(id);
    const position = (element: HTMLElement) => ({ el: element, top: Number.parseFloat(getComputedStyle(element).scrollMarginTop) });
    const ready = find();
    if (ready) { resolve(position(ready)); return; }
    const observer = new MutationObserver(() => {
      const element = find();
      if (element) { observer.disconnect(); clearTimeout(timeout); resolve(position(element)); }
    });
    observer.observe(document.getElementById('app')!, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => { observer.disconnect(); resolve(false); }, ANCHOR_TIMEOUT_MS);
  });
}

export function createSiteRouter(hydrationPath?: string) {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.hash && worlds.some(world => to.path === `/${world.id}`)) return false;
      if (to.hash) return anchorPosition(to.hash);
      if (to.path === from.path) return false;
      return { top: 0 };
    },
  });
  let initialNavigation = true;
  router.beforeEach(to => {
    if (initialNavigation) {
      initialNavigation = false;
      if (hydrationPath && to.fullPath !== hydrationPath) return { path: hydrationPath, replace: true };
    }
    if (to.hash.startsWith('#phrase-')) {
      const slug = to.hash.slice(1);
      const canonical = resolveLegacySlug(slug);
      if (canonical !== slug) return { path: to.path, query: to.query, hash: `#${canonical}`, replace: true };
    }
  });
  return router;
}
