import { collections, contentManifest, getContent, type ContentMeta } from './index';

export function relatedStories(content: Readonly<ContentMeta>) {
  if (content.kind === 'feature') {
    return content.recommendations.map(item => ({ content: getContent(item.id), reason: item.reason }));
  }
  const dossiers = collections.filter(item => item.kind === 'dossier' && item.itemIds.includes(content.id));
  return contentManifest.documents
    .filter(item => item.kind === 'feature')
    .map(item => ({
      content: item,
      reason: '',
      score: (item.recommendations.some(ref => ref.id === content.id) ? 20 : 0)
        + dossiers.filter(collection => collection.itemIds.includes(item.id)).length * 10
        + item.topics.filter(id => content.topics.includes(id)).length * 3
        + item.places.filter(id => id !== 'ohio' && content.places.includes(id)).length,
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.content.order - b.content.order)
    .slice(0, 3);
}
