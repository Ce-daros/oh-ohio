import type { BodyBlock, ContentBody, ContentMeta } from './types';

const bodies = import.meta.glob<ContentBody>('./documents/*/*.json', { eager: true, import: 'default' });

export function legacyBody(document: ContentMeta): readonly BodyBlock[] {
  const body = bodies[document.bodyPath];
  if (!body || body.meta.id !== document.id) throw new Error(`Invalid legacy body: ${document.bodyPath}`);
  return body.blocks;
}
