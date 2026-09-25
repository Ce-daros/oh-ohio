import { createMemoryHistory, createRouter, createWebHistory, type RouteLocationGeneric, type RouteRecordRaw } from 'vue-router';
import { collections, contentManifest, getContent, getMedia, resolveLegacySlug, worlds, type FeatureMeta } from './content';
import site from '../site.config.json';

const movedPages: Record<string, string> = {
  discover: 'explore', travel: 'explore', economy: 'make', industry: 'make',
  language: 'culture', life: 'live', government: 'live',
};

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./pages/HomePage.vue'), meta: { title: 'Oh, Ohio', description: 'Explore Ohio’s places, people, and culture with Ohio-chan.', image: '/art/scenes/explore.webp' } },
  { path: '/journal', component: () => import('./pages/JournalPage.vue'), meta: { title: 'Field notes — Oh, Ohio', description: 'Little adventures, things made here, and a seat at the table.', image: '/art/scenes/culture.webp' } },
  { path: '/topics', component: () => import('./pages/TopicsPage.vue'), meta: { title: 'Topics — Oh, Ohio', description: 'Explore Ohio stories by topic.', image: '/art/scenes/explore.webp' } },
  ...collections.filter(collection => collection.kind === 'dossier').map(topic => ({
    path: `/topics/${topic.slug}`,
    component: () => import('./pages/TopicPage.vue'),
    props: { slug: topic.slug },
    meta: { title: `${topic.title} — Oh, Ohio`, description: topic.dek, image: getMedia((getContent(topic.featuredId) as FeatureMeta).coverMediaId).src },
  })),
  { path: '/search', component: () => import('./pages/SearchPage.vue'), meta: { title: 'Search — Oh, Ohio', description: 'Search Ohio stories.', noindex: true } },
  { path: '/saved', component: () => import('./pages/SavedPage.vue'), meta: { title: 'Saved stories — Oh, Ohio', description: 'Your saved Ohio stories.', noindex: true } },
  ...contentManifest.documents.map(content => ({
    path: content.canonicalPath,
    component: () => import('./pages/ContentPage.vue'),
    props: { slug: content.slug },
    meta: {
      title: `${content.title} — Oh, Ohio`,
      description: content.summary,
      image: content.kind === 'feature' ? getMedia(content.coverMediaId).src : `/art/scenes/${content.primaryWorld}.webp`,
    },
  })),
  ...worlds.map(world => ({
    path: `/${world.id}`,
    component: () => import('./pages/ChapterPage.vue'),
    props: { chapterId: world.id },
    meta: { title: `${world.title} — Oh, Ohio`, description: world.tease, image: `/art/scenes/${world.id}.webp` },
  })),
  ...Object.entries(movedPages).map(([old, current]) => ({
    path: `/${old}`,
    redirect: (to: RouteLocationGeneric) => ({ path: `/${current}`, hash: to.hash, query: to.query }),
  })),
  { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFoundPage.vue'), meta: { title: 'Page not found — Oh, Ohio', description: 'That page could not be found.', noindex: true, notFound: true } },
];

function setHeadMeta(selector: string, name: string, content: string, property = false) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(property ? 'property' : 'name', name);
    document.head.append(element);
  }
  element.content = content;
}

function updateHead(to: RouteLocationGeneric) {
  const title = String(to.meta.title);
  const description = String(to.meta.description);
  document.title = title;
  setHeadMeta('meta[name="description"]', 'description', description);
  setHeadMeta('meta[name="robots"]', 'robots', to.meta.noindex ? 'noindex,follow' : 'index,follow');
  setHeadMeta('meta[property="og:title"]', 'og:title', title, true);
  setHeadMeta('meta[property="og:description"]', 'og:description', description, true);
  setHeadMeta('meta[property="og:type"]', 'og:type', 'website', true);
  if (to.meta.image) setHeadMeta('meta[property="og:image"]', 'og:image', `${site.origin}${to.meta.image}`, true);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (to.meta.notFound) canonical?.remove();
  else if (canonical) canonical.href = `${site.origin}${to.path}`;
  else {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = `${site.origin}${to.path}`;
    document.head.append(link);
  }
}

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
    const timeout = window.setTimeout(() => { observer.disconnect(); resolve(false); }, 3000);
  });
}

export function createSiteRouter() {
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
  router.beforeEach(to => {
    if (to.hash.startsWith('#phrase-')) {
      const slug = to.hash.slice(1);
      const canonical = resolveLegacySlug(slug);
      if (canonical !== slug) return { path: to.path, query: to.query, hash: `#${canonical}`, replace: true };
    }
  });
  if (!import.meta.env.SSR) router.afterEach(updateHead);
  return router;
}
