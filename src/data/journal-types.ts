export type JournalCategory = "guides" | "making" | "table" | "everyday";

export interface JournalSource {
  label: string;
  url: string;
  kind: "Travel account" | "Local guide" | "Official source" | "Reporting";
}

export interface JournalSection {
  id: string;
  title: string;
  eyebrow: string;
  paragraphs: string[];
}

export interface JournalArticle {
  slug: string;
  category: JournalCategory;
  chapter: "explore" | "make" | "culture" | "live";
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
