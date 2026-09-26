import { collections, contentManifest, places, type ContentMeta, type WorldId } from './index';

const SEARCH_ALIASES: Record<string, string> = {
  cle: 'cleveland', cbus: 'columbus', otr: 'over-the-rhine', cvnp: 'cuyahoga', buckeyes: 'buckeye',
};

export function normalizeText(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Search filters as strings; values come straight from URL query params. */
export interface SearchQuery { q?: string; world?: string; kind?: string; place?: string }

const topicTitle = (id: string) => collections.find(collection => collection.id === id)?.title ?? id;
const searchableText = (item: Readonly<ContentMeta>) => normalizeText([
  item.title, item.summary, item.slug,
  ...item.places.map(id => places.find(place => place.id === id)!.title),
  ...item.topics.map(id => topicTitle(id)),
].join(' '));

/**
 * Filter documents by facet filters and a whitespace-separated query.
 * Every term must occur in the document's title, summary, slug, place
 * names, or topic titles; title matches rank results first. An empty
 * query matches all documents filtered only by the facets.
 */
export function searchContent(query: SearchQuery): readonly Readonly<ContentMeta>[] {
  const normalizedQuery = normalizeText(query.q?.trim() ?? '');
  const terms = normalizedQuery.split(/\s+/).filter(Boolean).map(term => SEARCH_ALIASES[term] ?? term);
  const matches = contentManifest.documents.filter(item => {
    if (query.world && !item.worlds.includes(query.world as WorldId)) return false;
    if (query.kind && item.kind !== query.kind) return false;
    if (query.place && !item.places.includes(query.place)) return false;
    return terms.every(term => searchableText(item).includes(term));
  });
  if (!normalizedQuery) return matches;
  return [...matches].sort((a, b) =>
    Number(normalizeText(b.title).includes(normalizedQuery)) - Number(normalizeText(a.title).includes(normalizedQuery)));
}
