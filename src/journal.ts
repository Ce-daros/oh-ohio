import { collections, contentManifest, getMedia, getSource } from './content';
import { legacyBody } from './content/legacy';
import type { FeatureMeta, JournalCategory } from './content/types';
import type { JournalArticle, JournalSection } from './data/journal-types';

function toArticle(document: FeatureMeta): JournalArticle {
  const blocks = legacyBody(document);
  const sections: JournalSection[] = [];
  for (const block of blocks) {
    if (block.type === 'heading') sections.push({ id: block.id, title: block.title, eyebrow: block.eyebrow, paragraphs: [] });
    if (block.type === 'paragraph' && !block.role) sections[sections.length - 1]!.paragraphs.push(block.text);
  }
  const paragraphs = blocks.filter(block => block.type === 'paragraph');
  const intro = paragraphs.find(block => block.role === 'intro')!;
  const signoff = paragraphs.find(block => block.role === 'signoff')!;
  const aside = blocks.find(block => block.type === 'characterAside')!;
  const practical = blocks.find(block => block.type === 'practical')!;
  return {
    slug: document.slug,
    category: document.category,
    chapter: document.primaryWorld,
    title: document.title,
    titleAccent: document.titleAccent,
    dek: document.summary,
    location: document.location,
    duration: document.duration,
    readTime: document.readTime,
    cover: getMedia(document.coverMediaId).src,
    coverAlt: document.coverAlt,
    intro: intro.text,
    sections,
    aside: { title: aside.title, text: aside.text },
    practical: practical.items,
    signoff: signoff.text,
    sources: document.sourceRefs.map(source => ({ label: source.label, url: getSource(source.id).url, kind: source.kind! })),
    related: document.recommendations.map(item => item.id.replace(/^feature:/, '')),
  };
}

export const articles = contentManifest.documents.filter((item): item is FeatureMeta => item.kind === 'feature').map(toArticle);
export const journalCategories = collections.filter(item => item.kind === 'category').map(item => item.presentation!) as { id: JournalCategory; label: string; eyebrow: string; description: string; color: string; ink: string; prop: string }[];
export function categoryFor(id: JournalCategory) {
  return journalCategories.find(category => category.id === id)!;
}
export function articleBySlug(slug: string) {
  return articles.find(article => article.slug === slug)!;
}
