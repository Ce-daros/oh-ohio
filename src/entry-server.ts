import { renderToString } from 'vue/server-renderer';
import { createSiteApp } from './app';
import { headMarkup, routeHead, type RouteHeadInput } from './head';
import type { RouteMeta } from 'vue-router';

export async function render(url: string) {
  const { app, router } = createSiteApp();
  await router.push(url);
  await router.isReady();
  const context = { modules: new Set<string>() };
  const html = await renderToString(app, context);
  const route = router.currentRoute.value;
  const meta = route.meta as RouteMeta;
  const input: RouteHeadInput = {
    title: String(meta.title),
    description: String(meta.description),
    image: meta.image ? String(meta.image) : undefined,
    noindex: Boolean(meta.noindex),
    notFound: Boolean(meta.notFound),
    path: route.path,
  };
  const head = routeHead(input);
  return {
    html,
    head: headMarkup(head),
    path: route.path,
    title: head.title,
    description: head.description,
    noindex: Boolean(meta.noindex),
    notFound: Boolean(meta.notFound),
    modules: [...context.modules],
  };
}
