import site from '../site.config.json';
import type { ReactiveHead } from '@unhead/vue';
import type { RouteLocationGeneric } from 'vue-router';

/**
 * Head metadata rules shared by the app shell (unhead, driven by the
 * router's current route) and the prerenderer. Both sides must agree on
 * canonical URLs, robots directives, and the Open Graph tags, so the
 * rules live here once.
 */
export interface RouteHeadInput {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  notFound?: boolean;
  path: string;
}

const absoluteUrl = (value: string) =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `${site.origin}${value}`;

/** Route meta → head input; the single conversion point for both sides. */
export function routeHeadInput(route: Pick<RouteLocationGeneric, 'path' | 'meta'>): RouteHeadInput {
  const meta = route.meta;
  return {
    title: String(meta.title),
    description: String(meta.description),
    image: meta.image ? String(meta.image) : undefined,
    noindex: Boolean(meta.noindex),
    notFound: Boolean(meta.notFound),
    path: route.path,
  };
}

/** unhead entry describing the tags for one route. */
export function routeHeadOptions(input: RouteHeadInput): ReactiveHead {
  return {
    title: input.title,
    meta: [
      { name: 'description', content: input.description },
      { name: 'robots', content: input.noindex ? 'noindex,follow' : 'index,follow' },
      { property: 'og:title', content: input.title },
      { property: 'og:description', content: input.description },
      { property: 'og:type', content: 'website' },
      ...(!input.notFound ? [{ property: 'og:url', content: `${site.origin}${input.path}` }] : []),
      ...(input.image && !input.notFound ? [{ property: 'og:image', content: absoluteUrl(input.image) }] : []),
    ],
    link: input.notFound ? [] : [{ rel: 'canonical', href: `${site.origin}${input.path}` }],
  };
}
