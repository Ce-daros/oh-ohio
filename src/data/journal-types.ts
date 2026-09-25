import type { JournalCategory, SourceKind, WorldId } from '../content/types';

export type { JournalCategory } from '../content/types';
export interface JournalSource { label: string; url: string; kind: SourceKind }
export interface JournalSection { id: string; title: string; eyebrow: string; paragraphs: string[] }
export interface JournalArticle {
  slug: string;
  category: JournalCategory;
  chapter: WorldId;
  title: string;
  titleAccent: string;
  dek: string;
  location: string;
  duration: string;
  readTime: string;
  cover: string;
  coverAlt: string;
  intro: string;
  sections: JournalSection[];
  aside: { title: string; text: string };
  practical: { label: string; text: string }[];
  signoff: string;
  sources: JournalSource[];
  related: string[];
}
