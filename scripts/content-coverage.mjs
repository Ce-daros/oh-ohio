import fs from 'node:fs';
import path from 'node:path';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = read('src/content/data/manifest.json');
const worlds = read('src/content/data/worlds.json');
const collections = read('src/content/data/collections.json');
const sources = read('src/content/data/sources.json');
const media = read('src/content/data/media.json');
const places = read('src/content/data/places.json');
const review = read('editorial/existing-content-review.json');
const documents = manifest.documents.map(meta => ({ meta, blocks: read(path.join('src/content', meta.bodyPath)).blocks }));
const byId = new Map(manifest.documents.map(meta => [meta.id, meta]));
const dossiers = collections.filter(collection => collection.kind === 'dossier');
const membership = new Map(manifest.documents.map(meta => [meta.id, collections.filter(collection => collection.itemIds.includes(meta.id)).map(collection => collection.id)]));
const citationIds = new Set(documents.flatMap(({ meta }) => meta.sourceRefs.map(ref => ref.id)));
const mediaIds = new Set(documents.flatMap(({ meta, blocks }) => [
  ...(meta.kind === 'feature' ? [meta.coverMediaId] : []),
  ...blocks.filter(block => block.mediaId).map(block => block.mediaId),
]));
const evidenceIds = new Set([
  ...citationIds,
  ...media.filter(item => item.provenance.status === 'verified').map(item => item.provenance.sourceId),
  ...places.filter(place => place.sourceId).map(place => place.sourceId),
]);
const byKind = items => Object.fromEntries(['feature', 'note', 'phrase'].map(kind => [kind, items.filter(item => item.kind === kind).length]));
const sorted = items => [...items].sort((a, b) => a.localeCompare(b));

const auditIds = new Set();
for (const item of review.items) {
  if (auditIds.has(item.id)) throw new Error(`Duplicate audit item ${item.id}`);
  auditIds.add(item.id);
  const canonical = byId.get(item.id);
  if (!canonical || canonical.canonicalPath !== item.canonicalPath) throw new Error(`Audit item ${item.id} does not match a canonical path`);
}
if (review.summary.canonicalItemsReviewed !== review.items.length) throw new Error('Audit summary count does not match reviewed items');

const report = {
  schemaVersion: 1,
  auditReviewedAt: review.reviewedAt,
  totals: {
    documents: manifest.documents.length,
    kinds: byKind(manifest.documents),
    worlds: worlds.length,
    dossiers: dossiers.length,
    sources: sources.length,
    media: media.length,
  },
  worldCoverage: worlds.map(world => {
    const items = manifest.documents.filter(meta => meta.worlds.includes(world.id));
    return { id: world.id, title: world.title, kinds: byKind(items), documentIds: items.map(meta => meta.id), dossierIds: dossiers.filter(dossier => dossier.world === world.id).map(dossier => dossier.id) };
  }),
  categoryCoverage: collections.filter(collection => collection.kind === 'category').map(collection => {
    const category = collection.presentation.id;
    return { id: category, collectionId: collection.id, featureIds: manifest.documents.filter(meta => meta.kind === 'feature' && meta.category === category).map(meta => meta.id) };
  }),
  dossierCoverage: dossiers.map(dossier => ({
    id: dossier.id, slug: dossier.slug, world: dossier.world, featuredId: dossier.featuredId,
    kinds: byKind(dossier.itemIds.map(id => byId.get(id))), itemIds: dossier.itemIds,
  })),
  relationships: {
    orphanNotes: manifest.documents.filter(meta => meta.kind === 'note' && !membership.get(meta.id).length).map(meta => meta.id),
    documentsWithoutDossier: manifest.documents.filter(meta => !membership.get(meta.id).some(id => id.startsWith('dossier:'))).map(meta => meta.id),
    unusedSources: sorted(sources.filter(source => !evidenceIds.has(source.id)).map(source => source.id)),
    unusedMedia: sorted(media.filter(item => !mediaIds.has(item.id)).map(item => item.id)),
  },
  evidence: {
    verifiedDocuments: manifest.documents.filter(meta => meta.verification.status === 'verified').map(meta => meta.id),
    unverifiedDocuments: manifest.documents.filter(meta => meta.verification.status === 'unverified').map(meta => meta.id),
    documentsWithoutBlockCitations: documents.filter(({ blocks }) => !blocks.some(block => block.sourceIds?.length || block.sourceId)).map(({ meta }) => meta.id),
    citedSourceIds: sorted(citationIds),
    remoteMediaIds: media.filter(item => item.src.startsWith('http://') || item.src.startsWith('https://')).map(item => item.id),
    mediaWithoutVerifiedProvenance: media.filter(item => item.provenance.status !== 'verified').map(item => item.id),
    mediaWithoutClearedRights: media.filter(item => item.rights.status !== 'cleared').map(item => item.id),
  },
  existingContentReview: {
    reviewedCount: review.items.length,
    dispositions: review.summary.byDisposition,
    reviewedIds: review.items.map(item => item.id),
    addedAfterReview: manifest.documents.filter(meta => !auditIds.has(meta.id)).map(meta => meta.id),
    pendingMergeIds: review.items.filter(item => item.disposition === 'merge').map(item => item.id),
  },
};

const output = 'editorial/content-coverage.json';
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`Generated coverage for ${report.totals.documents} documents, ${report.totals.dossiers} dossiers, ${report.totals.sources} sources`);
