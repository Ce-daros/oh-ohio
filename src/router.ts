import { createRouter, createWebHistory, type RouteLocationGeneric } from "vue-router";
import { chapters } from "./catalog";
import { articles } from "./journal";
const movedPages: Record<string, string> = {
  discover: "explore", travel: "explore", economy: "make", industry: "make",
  language: "culture", life: "live", government: "live",
};
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("./pages/HomePage.vue"), meta: { title: "Oh, Ohio", description: "Yayyy, you're here! Explore Ohio's places, people, and culture with Ohio-chan. ♡" } },
    { path: "/journal", component: () => import("./pages/JournalPage.vue"), meta: { title: "Field notes — Oh, Ohio", description: "Little adventures, things made here, and a seat at the table. Ohio stories with Ohio-chan." } },
    ...articles.map(article => ({
      path: `/journal/${article.slug}`, component: () => import("./pages/JournalArticlePage.vue"),
      props: { slug: article.slug }, meta: { title: `${article.title} — Oh, Ohio`, description: article.dek },
    })),
    ...chapters.map(chapter => ({
      path: `/${chapter.id}`, component: () => import("./pages/ChapterPage.vue"),
      props: { chapterId: chapter.id }, meta: { title: `${chapter.title} — Oh, Ohio`, description: chapter.tease },
    })),
    ...Object.entries(movedPages).map(([old, current]) => ({ path: `/${old}`, redirect: (to: RouteLocationGeneric) => ({ path: `/${current}`, hash: to.hash, query: to.query }) })),
    { path: "/:pathMatch(.*)*", component: () => import("./pages/NotFoundPage.vue"), meta: { title: "Oopsie, a detour — Oh, Ohio", description: "A wrong turn? Let's find our way back to Oh, Ohio. ♡" } },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.path.startsWith("/journal/") && to.hash) return { el: to.hash, top: 120 };
    if (to.path === from.path) return false;
    if (to.path === "/" && to.hash) return { el: to.hash, top: 104 };
    return { top: 0 };
  },
});
router.afterEach(to => {
  document.title = String(to.meta.title);
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = String(to.meta.description);
});
