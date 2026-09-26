import { renderToString } from 'vue/server-renderer';
import { createHead, renderSSRHead } from '@unhead/vue/server';
import { createSiteApp } from './app';
import { routeHeadInput } from './head';

export async function render(url: string) {
  const { app, router } = createSiteApp();
  const head = createHead({ disableDefaults: true });
  app.use(head);
  await router.push(url);
  await router.isReady();
  const context = { modules: new Set<string>() };
  const html = await renderToString(app, context);
  const route = router.currentRoute.value;
  const input = routeHeadInput(route);
  const { headTags } = await renderSSRHead(head);
  return {
    html,
    head: headTags,
    path: route.path,
    title: input.title,
    description: input.description,
    noindex: input.noindex,
    notFound: input.notFound,
    modules: [...context.modules],
  };
}
