import { renderToString } from 'vue/server-renderer';
import { createSiteApp } from './app';

export async function render(url: string) {
  const { app, router } = createSiteApp();
  await router.push(url);
  await router.isReady();
  const context = { modules: new Set<string>() };
  const html = await renderToString(app, context);
  const route = router.currentRoute.value;
  return {
    html,
    path: route.path,
    title: String(route.meta.title),
    description: String(route.meta.description),
    image: route.meta.image ? String(route.meta.image) : undefined,
    noindex: Boolean(route.meta.noindex),
    notFound: Boolean(route.meta.notFound),
    modules: [...context.modules],
  };
}
