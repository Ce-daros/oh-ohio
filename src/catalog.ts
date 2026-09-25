import guideData from './data/guide.json';
import { contentManifest, getSource, scenes, worlds } from './content';
import { legacyBody } from './content/legacy';
import type { NoteMeta, PhraseMeta, SceneGroup as ContentSceneGroup, WorldId } from './content/types';

export type ChapterId = WorldId;
export type CharacterId = 'discover' | 'travel' | 'economy' | 'industry' | 'culture' | 'language' | 'life' | 'government';
export interface Entry {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  body: string[];
  source: string;
  url: string;
  supportingSource?: string;
  supportingUrl?: string;
}
export interface Chapter {
  id: ChapterId;
  title: string;
  headline: string;
  tease: string;
  symbol: string;
  color: string;
  art: CharacterId;
  prop: string;
  sources: CharacterId[];
}
export type SceneGroup = ContentSceneGroup;

function toEntry(document: NoteMeta | PhraseMeta): Entry {
  const [primary, supporting] = document.sourceRefs;
  const paragraphs = legacyBody(document).filter(block => block.type === 'paragraph').map(block => block.text);
  return {
    slug: document.slug,
    title: document.title,
    kicker: document.kind === 'note' ? document.kicker : 'LOCAL WORDS',
    summary: document.summary,
    body: paragraphs,
    source: primary!.label,
    url: getSource(primary!.id).url,
    ...(supporting ? { supportingSource: supporting.label, supportingUrl: getSource(supporting.id).url } : {}),
  };
}

export const chapters = worlds as Chapter[];
export const entries = contentManifest.documents.filter((item): item is NoteMeta => item.kind === 'note').map(toEntry);
export const phrases = contentManifest.documents.filter((item): item is PhraseMeta => item.kind === 'phrase').map(toEntry);
export const guide = {
  ...guideData,
  sections: guideData.sections.map(section => ({
    ...section,
    entries: contentManifest.documents.filter((item): item is NoteMeta => item.kind === 'note' && item.sectionId === section.id).map(toEntry),
  })),
  languageNotes: contentManifest.documents.filter((item): item is PhraseMeta => item.kind === 'phrase').map(item => ({
    expression: item.title, meaning: item.summary, region: item.region,
    note: legacyBody(item).filter(block => block.type === 'paragraph')[1]!.text,
    source: item.sourceRefs[0]!.label, url: getSource(item.sourceRefs[0]!.id).url,
  })),
};
export function chapterEntries(id: ChapterId): Entry[] {
  const chapter = chapters.find(item => item.id === id)!;
  return guide.sections.filter(section => chapter.sources.includes(section.id as CharacterId)).flatMap(section => section.entries);
}
export const sceneGroups = scenes as Record<ChapterId, SceneGroup[]>;
