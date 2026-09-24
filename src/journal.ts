import guides from "./data/journal-guides.json";
import features from "./data/journal-features.json";
import type { JournalArticle, JournalCategory } from "./data/journal-types";

export const articles: JournalArticle[] = [...guides, ...features] as JournalArticle[];
export const journalCategories: { id: JournalCategory; label: string; eyebrow: string; description: string; color: string; ink: string; prop: string }[] = [
  { id: "guides", label: "Little adventures", eyebrow: "A DAY OUT", description: "A market morning. A whole day by the lake. Let's make a little time for both.", color: "#dcecef", ink: "#345c68", prop: "camera" },
  { id: "making", label: "Made here", eyebrow: "MEET THE MAKERS", description: "Clay, glass, a little brass. Follow each from start to finish.", color: "#e4e8f4", ink: "#485879", prop: "whistle" },
  { id: "table", label: "At the table", eyebrow: "SAVED YOU A SEAT", description: "There are stories behind these familiar flavors. Save room for one.", color: "#f3e1dc", ink: "#884b47", prop: "record" },
  { id: "everyday", label: "Everyday Ohio", eyebrow: "STAY A LITTLE LONGER", description: "Libraries, garden plots, and the places a day unfolds.", color: "#e1ebe2", ink: "#426351", prop: "backpack" },
];
export function categoryFor(id: JournalCategory) {
  return journalCategories.find(category => category.id === id)!;
}
export function articleBySlug(slug: string) {
  return articles.find(article => article.slug === slug)!;
}
