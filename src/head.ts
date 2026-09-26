import site from '../site.config.json';

/**
 * Head metadata rules shared by the client router (DOM updates on
 * navigation) and the prerenderer (serialized markup for static pages).
 * Both sides must agree on canonical URLs, robots directives, and the
 * Open Graph tags, so the rules live here once.
 */
export interface RouteHeadInput {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  notFound?: boolean;
  path: string;
}

export interface MetaTag { attr: 'name' | 'property'; key: string; content: string }

export interface RouteHead {
  title: string;
  description: string;
  metas: MetaTag[];
  canonical?: string;
}

const absoluteUrl = (value: string) =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `${site.origin}${value}`;

export function routeHead(input: RouteHeadInput): RouteHead {
  const metas: MetaTag[] = [
    { attr: 'name', key: 'robots', content: input.noindex ? 'noindex,follow' : 'index,follow' },
    { attr: 'property', key: 'og:title', content: input.title },
    { attr: 'property', key: 'og:description', content: input.description },
    { attr: 'property', key: 'og:type', content: 'website' },
  ];
  if (!input.notFound) {
    metas.push({ attr: 'property', key: 'og:url', content: `${site.origin}${input.path}` });
    if (input.image) metas.push({ attr: 'property', key: 'og:image', content: absoluteUrl(input.image) });
  }
  return {
    title: input.title,
    description: input.description,
    metas,
    canonical: input.notFound ? undefined : `${site.origin}${input.path}`,
  };
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
const escapeHtml = (value: string) => value.replace(/[&"<>]/g, char => ESCAPES[char] ?? char);

/** Serialized head markup for prerendered pages (description lives in the page template). */
export function headMarkup(head: RouteHead): string {
  const metas = head.metas.map(meta => `<meta ${meta.attr}="${meta.key}" content="${escapeHtml(meta.content)}" />`).join('');
  const canonical = head.canonical ? `<link rel="canonical" href="${escapeHtml(head.canonical)}" />` : '';
  return `${canonical}${metas}`;
}
