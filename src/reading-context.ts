import { worlds, type WorldId } from './content';

/**
 * The reading panel and full article pages share a small URL contract:
 * a story carries `from`, `scene`, `view`, and `journey` query keys so a
 * visitor can return to the world page with their scene and journey
 * selection intact. This module is the single place that reads and
 * builds those keys.
 */
export interface ReadingContext {
  from?: WorldId;
  scene?: string;
  view?: string;
  journey?: string;
}

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

const isWorldId = (value: unknown): value is WorldId =>
  typeof value === 'string' && worlds.some(world => world.id === value);

export function readingContext(query: Readonly<Record<string, unknown>>): ReadingContext {
  const context: ReadingContext = {};
  if (isWorldId(query.from)) context.from = query.from;
  const scene = asString(query.scene);
  if (scene) context.scene = scene;
  const view = asString(query.view);
  if (view) context.view = view;
  const journey = asString(query.journey);
  if (journey) context.journey = journey;
  return context;
}

/** Target for "back to the world page" links; drops `from` itself. */
export function worldReturnTarget(world: WorldId, context: ReadingContext): { path: string; query: { scene?: string; view?: string; journey?: string } } {
  return { path: `/${world}`, query: { scene: context.scene, view: context.view, journey: context.journey } };
}
