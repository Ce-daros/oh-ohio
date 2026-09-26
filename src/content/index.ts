import manifestData from './data/manifest.json';
import worldsData from './data/worlds.json';
import topicsData from './data/topics.json';
import placesData from './data/places.json';
import sourcesData from './data/sources.json';
import mediaData from './data/media.json';
import collectionsData from './data/collections.json';
import scenesData from './data/scenes.json';
import migrationsData from './data/migrations.json';
import type { Collection, ContentBody, ContentManifest, ContentMeta, ContentQuery, Media, Place, SceneGroup, Source, Topic, World, WorldId } from './types';
import { deepFreeze } from './freeze';

export type * from './types';

export const contentManifest = deepFreeze(manifestData as ContentManifest);
export const worlds = deepFreeze(worldsData as World[]);
export const topics = deepFreeze(topicsData as Topic[]);
export const places = deepFreeze(placesData as Place[]);
const sources = deepFreeze(sourcesData as Source[]);
export const media = deepFreeze(mediaData as Media[]);
export const collections = deepFreeze(collectionsData as Collection[]);
export const scenes = deepFreeze(scenesData as Record<WorldId, SceneGroup[]>);
const legacySlugs = deepFreeze(migrationsData as Record<string, string>);

const byId = new Map(contentManifest.documents.map(document => [document.id, document]));
const bySlug = new Map(contentManifest.documents.map(document => [document.slug, document]));
const sourceById = new Map(sources.map(source => [source.id, source]));
const mediaById = new Map(media.map(item => [item.id, item]));
const collectionById = new Map(collections.map(collection => [collection.id, collection]));
const worldById = new Map(worlds.map(world => [world.id, world]));
const bodyModules = import.meta.glob<ContentBody>('./documents/*/*.json', { import: 'default' });

export const kindLabels: Record<ContentMeta['kind'], string> = { feature: 'Field note', note: 'Guide note', phrase: 'Local words' };

export function getWorld(id: WorldId): Readonly<World> {
  const world = worldById.get(id);
  if (!world) throw new Error(`Unknown world: ${id}`);
  return world;
}

export function resolveLegacySlug(slug: string): string {
  return legacySlugs[slug] ?? slug;
}

export function getContent(idOrSlug: string): Readonly<ContentMeta> {
  const document = byId.get(idOrSlug) ?? bySlug.get(resolveLegacySlug(idOrSlug));
  if (!document) throw new Error(`Unknown content: ${idOrSlug}`);
  return document;
}

export function queryContent(query: ContentQuery = {}): readonly Readonly<ContentMeta>[] {
  const collection = query.collection ? getCollection(query.collection) : undefined;
  const pool = collection ? collection.itemIds.map(id => getContent(id)) : contentManifest.documents;
  const selected = pool.filter(document =>
    (!query.kind || document.kind === query.kind) &&
    (!query.world || document.worlds.includes(query.world)) &&
    (!query.topic || document.topics.includes(query.topic)) &&
    (!query.place || document.places.includes(query.place)));
  return Object.freeze(selected);
}

export async function loadContentBody(idOrSlug: string): Promise<readonly Readonly<import('./types').BodyBlock>[]> {
  const document = getContent(idOrSlug);
  const load = bodyModules[document.bodyPath];
  if (!load) throw new Error(`Missing body module: ${document.bodyPath}`);
  const body = await load();
  if (body.meta.id !== document.id) throw new Error(`Body ID mismatch: ${document.bodyPath}`);
  return deepFreeze(body.blocks);
}

export function getSource(id: string): Readonly<Source> {
  const source = sourceById.get(id);
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}

export function getMedia(id: string): Readonly<Media> {
  const item = mediaById.get(id);
  if (!item) throw new Error(`Unknown media: ${id}`);
  return item;
}

export function getCollection(id: string): Readonly<Collection> {
  const collection = collectionById.get(id);
  if (!collection) throw new Error(`Unknown collection: ${id}`);
  return collection;
}
