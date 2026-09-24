import guideData from "./data/guide.json";
import worldData from "./data/worlds.json";
import extraStories from "./data/extra-stories.json";
export type ChapterId = "explore" | "make" | "culture" | "live";
export type CharacterId = "discover" | "travel" | "economy" | "industry" | "culture" | "language" | "life" | "government";
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
export interface SceneGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  slugs: string[];
}
export const chapters = worldData as Chapter[];
export const guide = {
  ...guideData,
  sections: guideData.sections.map(section => ({
    ...section,
    entries: [...section.entries, ...extraStories.filter(story => story.sectionId === section.id).map(story => story.entry)],
  })),
};
export const entries: Entry[] = guide.sections.flatMap(section => section.entries);
export const phrases: Entry[] = guide.languageNotes.map((note, index) => ({
  slug: `phrase-${index + 1}`,
  title: note.expression,
  kicker: "LOCAL WORDS",
  summary: note.meaning,
  body: [note.region, note.note],
  source: note.source,
  url: note.url,
}));
export function chapterEntries(id: ChapterId): Entry[] {
  const chapter = chapters.find(item => item.id === id)!;
  return guide.sections.filter(section => chapter.sources.includes(section.id as CharacterId)).flatMap(section => section.entries);
}
export const sceneGroups: Record<ChapterId, SceneGroup[]> = {
  explore: [
    { id: "coast", title: "Lake Erie", x: 25, y: 25, slugs: ["north-coast", "lake-erie-islands", "cleveland"] },
    { id: "cities", title: "City days", x: 72, y: 28, slugs: ["cities-regions", "columbus", "cincinnati", "dayton"] },
    { id: "hills", title: "The hills", x: 73, y: 70, slugs: ["appalachian-ohio", "hocking-hills"] },
    { id: "wild", title: "Out in the green", x: 34, y: 57, slugs: ["nature", "cuyahoga-valley"] },
    { id: "past", title: "Past & present", x: 49, y: 34, slugs: ["history"] },
    { id: "symbols", title: "The Buckeye State", x: 22, y: 79, slugs: ["symbols"] },
  ],
  make: [
    { id: "factory", title: "Made in Ohio", x: 24, y: 38, slugs: ["production", "advanced-manufacturing", "automotive", "energy-chemicals"] },
    { id: "flight", title: "Ready for takeoff", x: 67, y: 22, slugs: ["aerospace"] },
    { id: "lab", title: "The next idea", x: 80, y: 51, slugs: ["healthcare", "technology"] },
    { id: "farm", title: "From the ground up", x: 24, y: 75, slugs: ["food-agriculture"] },
    { id: "movement", title: "On the move", x: 59, y: 73, slugs: ["trade", "logistics"] },
    { id: "work", title: "People at work", x: 47, y: 46, slugs: ["economic-map", "jobs-households"] },
  ],
  culture: [
    { id: "records", title: "Turn it up", x: 23, y: 44, slugs: ["music"] },
    { id: "gallery", title: "Take another look", x: 76, y: 24, slugs: ["arts-museums", "hopewell-earthworks"] },
    { id: "table", title: "A taste of home", x: 74, y: 73, slugs: ["foodways"] },
    { id: "game", title: "Game day", x: 26, y: 78, slugs: ["sports-community"] },
    { id: "words", title: "Say that again?", x: 51, y: 38, slugs: ["regional-voices", "appalachian-english", "place-names", "community-languages"] },
    { id: "invention", title: "A little invention", x: 52, y: 66, slugs: ["aviation-heritage"] },
  ],
  live: [
    { id: "campus", title: "Keep learning", x: 28, y: 23, slugs: ["universities", "research", "schools-learning"] },
    { id: "library", title: "Your next chapter", x: 20, y: 52, slugs: ["libraries"] },
    { id: "civic", title: "State government", x: 73, y: 24, slugs: ["executive", "legislative", "judicial"] },
    { id: "local", title: "Closer to home", x: 76, y: 71, slugs: ["local-government"] },
    { id: "community", title: "Meet the neighbors", x: 43, y: 75, slugs: ["community-life"] },
  ],
};
for (const story of extraStories) {
  const chapter = chapters.find(item => item.sources.includes(story.sectionId as CharacterId))!;
  sceneGroups[chapter.id].find(group => group.id === story.sceneGroupId)!.slugs.push(story.entry.slug);
}
