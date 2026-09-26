export type WorldId = 'explore' | 'make' | 'culture' | 'live';
export type CharacterId = 'discover' | 'travel' | 'economy' | 'industry' | 'culture' | 'language' | 'life' | 'government';
export type ContentKind = 'note' | 'phrase' | 'feature';
type JournalCategory = 'guides' | 'making' | 'table' | 'everyday' | 'culture';
type SourceKind = 'Travel account' | 'Local guide' | 'Official source' | 'Reporting';

export interface Metric { id: string; scope: string; label: string; value: string; unit: string; period: string; source: string; url: string }
export interface JourneyStop { contentId: string; note: string }
export interface Journey { id: string; world: WorldId; title: string; intro: string; stops: JourneyStop[] }

interface SourceRef { id: string; label: string; kind?: SourceKind }
export interface Source { id: string; title: string; url: string }
export interface Media {
  id: string;
  kind: 'image' | 'audio' | 'video';
  use: 'atmosphere' | 'explanation' | 'documentary';
  src: string;
  alt?: string;
  caption?: string;
  provenance: { status: 'unverified' } | { status: 'verified'; sourceId: string };
  rights: { status: 'unverified' } | { status: 'cleared'; license: string };
  variants?: { src: string; width: number; height: number }[];
  crop?: { x: number; y: number; width: number; height: number };
  focalPoint?: { x: number; y: number };
}
export interface Place { id: string; title: string; address?: string; coordinates?: { lat: number; lon: number }; sourceId?: string }
export interface Topic { id: string; title: string; dek: string; order: number; world: WorldId; featuredId: string }
export interface World { id: WorldId; title: string; headline: string; tease: string; symbol: string; color: string; art: CharacterId; portrait: CharacterId; prop: string; invitation: string }
export interface Collection {
  id: string;
  kind: 'topic' | 'category' | 'world' | 'home' | 'dossier';
  slug?: string;
  title: string;
  dek: string;
  order: number;
  world?: WorldId;
  featuredId: string;
  itemIds: string[];
  presentation?: { id: JournalCategory; label: string; eyebrow: string; description: string; color: string; ink: string; prop: string };
}
export interface SceneGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  collectionId: string;
  metricIds?: string[];
  slugs: string[];
}

interface BaseMeta {
  id: string;
  order: number;
  slug: string;
  title: string;
  summary: string;
  canonicalPath: string;
  primaryWorld: WorldId;
  worlds: WorldId[];
  topics: string[];
  places: string[];
  sourceRefs: SourceRef[];
  verification: { status: 'unverified' } | { status: 'verified'; verifiedAt: string; sourceId: string };
  publishedAt?: string;
  updatedAt?: string;
  dateEvidence?: {
    publishedAt?: { kind: 'editorial-record'; path: string };
    updatedAt?: { kind: 'editorial-record'; path: string };
  };
  bodyPath: string;
}
export interface NoteMeta extends BaseMeta {
  kind: 'note';
  sectionId: string;
  kicker: string;
}
export interface PhraseMeta extends BaseMeta {
  kind: 'phrase';
  region: string;
}
export interface FeatureMeta extends BaseMeta {
  kind: 'feature';
  category: JournalCategory;
  location: string;
  duration: string;
  readTime: string;
  coverMediaId: string;
  coverAlt: string;
  titleAccent: string;
  recommendations: { id: string; reason: string }[];
}
export type ContentMeta = NoteMeta | PhraseMeta | FeatureMeta;

export type BodyBlock = ({
    type: 'paragraph'; text: string; role?: 'intro' | 'signoff'
  }
  | { type: 'heading'; id: string; title: string; eyebrow: string }
  | { type: 'illustration'; mediaId: string; caption?: string }
  | { type: 'process'; title: string; layout?: 'steps' | 'parallel'; steps: { title: string; text: string }[] }
  | { type: 'quote'; text: string; attribution: string; sourceId?: string }
  | { type: 'timeline'; events: { label: string; text: string }[] }
  | { type: 'practical'; items: { label: string; text: string }[] }
  | { type: 'characterAside'; title: string; text: string; role?: 'welcome' | 'notice' | 'explain' | 'listen' | 'practical' | 'farewell' }
  | { type: 'audio'; mediaId: string; transcript: string }
  | { type: 'video'; mediaId: string; transcript: string }
  | { type: 'placeMap'; title: string; placeIds: string[]; caption: string }
  | { type: 'route'; stops: { id: string; title: string; note: string; placeId?: string }[] }) & { sourceIds?: string[] };

export interface ContentBody { meta: ContentMeta; blocks: BodyBlock[] }
export interface ContentManifest { schemaVersion: 1; documents: ContentMeta[]; sourceUrls: { id: string; url: string }[] }
export interface ContentQuery {
  kind?: ContentKind;
  world?: WorldId;
  topic?: string;
  place?: string;
  collection?: string;
}
