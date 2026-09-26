// Single content pipeline shared by the Vite plugin, the CLI checks,
// and the verification scripts. Everything here reads the canonical
// sources (documents + registries) and computes derived data in memory,
// so no generated file can go stale.
import fs from 'node:fs';
import path from 'node:path';

export const readJson = (repoRoot, relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));

/** Sorted metadata-only manifest computed from the document files. */
export function computeManifest(repoRoot) {
  const root = path.join(repoRoot, 'src/content');
  const documentsRoot = path.join(root, 'documents');
  const documents = fs.readdirSync(documentsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(directory => fs.readdirSync(path.join(documentsRoot, directory.name))
      .filter(name => name.endsWith('.json'))
      .map(name => {
        const relative = `./documents/${directory.name}/${name}`;
        const document = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
        if (document.meta.bodyPath !== relative) throw new Error(`${relative}: meta.bodyPath does not match file path`);
        return document.meta;
      }));
  documents.sort((a, b) => a.order - b.order);
  return { schemaVersion: 1, documents };
}

/** Route catalog (public routes + legacy redirects) and the matching
 *  Vercel config, computed from the manifest and registries. */
export function computeCatalog(repoRoot) {
  const manifest = computeManifest(repoRoot);
  const worlds = readJson(repoRoot, 'src/content/data/worlds.json');
  const collections = readJson(repoRoot, 'src/content/data/collections.json');
  const media = readJson(repoRoot, 'src/content/data/media.json');
  const byId = new Map(manifest.documents.map(document => [document.id, document]));
  const mediaById = new Map(media.map(item => [item.id, item]));

  const routes = [
    { path: '/', kind: 'home', title: 'Oh, Ohio', description: 'Explore Ohio’s places, people, and culture with Ohio-chan.', image: '/art/scenes/explore.webp' },
    { path: '/journal', kind: 'journal', title: 'Field notes — Oh, Ohio', description: 'Little adventures, things made here, and a seat at the table.', image: '/art/scenes/culture.webp' },
    { path: '/topics', kind: 'topics', title: 'Topics — Oh, Ohio', description: 'Explore Ohio stories by topic.', image: '/art/scenes/explore.webp' },
    { path: '/search', kind: 'search', title: 'Search — Oh, Ohio', description: 'Search Ohio stories.', noindex: true },
    { path: '/saved', kind: 'saved', title: 'Saved stories — Oh, Ohio', description: 'Your saved Ohio stories.', noindex: true },
    ...worlds.map(world => ({ path: `/${world.id}`, kind: 'world', world: world.id, title: `${world.title} — Oh, Ohio`, description: world.tease, image: `/art/scenes/${world.id}.webp` })),
    ...collections.filter(collection => collection.kind === 'dossier').map(collection => ({
      path: `/topics/${collection.slug}`, kind: 'dossier', slug: collection.slug,
      title: `${collection.title} — Oh, Ohio`, description: collection.dek,
      image: mediaById.get(byId.get(collection.featuredId).coverMediaId).src,
    })),
    ...manifest.documents.map(document => ({
      path: document.canonicalPath, kind: 'content', slug: document.slug,
      title: `${document.title} — Oh, Ohio`, description: document.summary,
      image: document.kind === 'feature' ? mediaById.get(document.coverMediaId).src : `/art/scenes/${document.primaryWorld}.webp`,
    })),
  ];

  const movedPages = [
    ['discover', 'explore'], ['travel', 'explore'], ['economy', 'make'], ['industry', 'make'],
    ['language', 'culture'], ['life', 'live'], ['government', 'live'],
  ];
  const redirects = movedPages.map(([source, destination]) => ({ source: `/${source}`, destination: `/${destination}`, permanent: true }));
  const catalog = { schemaVersion: 1, routes, redirects };
  const vercel = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    trailingSlash: false,
    redirects,
  };

  const uniquePaths = new Set(routes.map(route => route.path));
  if (uniquePaths.size !== routes.length) throw new Error('Route catalog contains duplicate public paths');
  for (const redirect of redirects) if (uniquePaths.has(redirect.source) || !uniquePaths.has(redirect.destination)) throw new Error(`Invalid redirect ${redirect.source} -> ${redirect.destination}`);
  return { catalog, vercel };
}

/** Editorial coverage report for the local content desk (dev only). */
export function computeCoverage(repoRoot) {
  const read = relative => readJson(repoRoot, relative);
  const manifest = computeManifest(repoRoot);
  const worlds = read('src/content/data/worlds.json');
  const collections = read('src/content/data/collections.json');
  const sources = read('src/content/data/sources.json');
  const media = read('src/content/data/media.json');
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
    ...places(repoRoot).filter(place => place.sourceId).map(place => place.sourceId),
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

  return {
    schemaVersion: 1,
    auditReviewedAt: review.reviewedAt,
    totals: {
      documents: manifest.documents.length,
      kinds: byKind(manifest.documents),
      worlds: worlds.length,
      collections: collections.length,
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
}

function places(repoRoot) { return readJson(repoRoot, 'src/content/data/places.json'); }

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const idPattern = /^(note|phrase|feature):[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kinds = new Set(['note', 'phrase', 'feature']);
const blockTypes = new Set(['paragraph', 'heading', 'illustration', 'process', 'quote', 'timeline', 'practical', 'characterAside', 'video', 'placeMap', 'route']);
const asideRoles = new Set(['welcome', 'notice', 'explain', 'listen', 'practical', 'farewell']);
const mediaUses = new Set(['atmosphere', 'explanation', 'documentary']);
const mediaKinds = new Set(['image', 'video']);

/**
 * Full integrity check of the content graph. The manifest is computed,
 * not read from disk, so freshness is structural. Returns a list of
 * human-readable errors; an empty list means the graph is valid.
 */
export function validateContent(repoRoot = process.cwd()) {
  const errors = [];
  const fail = (file, message) => errors.push(`${file}: ${message}`);
  const read = relative => readJson(repoRoot, relative);
  const base = 'src/content/';
  const manifest = computeManifest(repoRoot);
  const worlds = read(`${base}data/worlds.json`);
  const places_ = read(`${base}data/places.json`);
  const sources = read(`${base}data/sources.json`);
  const media = read(`${base}data/media.json`);
  const collections = read(`${base}data/collections.json`);
  const scenes = read(`${base}data/scenes.json`);
  const migrations = read(`${base}data/migrations.json`);
  const journeys = read(`${base}data/journeys.json`);
  const metrics = read(`${base}data/metrics.json`);
  const documentRoot = path.join(repoRoot, base, 'documents');
  const files = fs.readdirSync(documentRoot, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .flatMap(dir => fs.readdirSync(path.join(documentRoot, dir.name))
      .filter(name => name.endsWith('.json'))
      .map(name => `${base}documents/${dir.name}/${name}`));
  const docs = files.map(file => ({ file, data: read(file) }));
  const metas = docs.map(({ data }) => data.meta);
  const byId = new Map(metas.map(meta => [meta.id, meta]));
  const bySlug = new Map(metas.map(meta => [meta.slug, meta]));
  const worldIds = new Set(worlds.map(world => world.id));
  const topicIds = new Set(collections.filter(item => item.kind === 'topic').map(item => item.id));
  const placeIds = new Set(places_.map(place => place.id));
  const sourceIds = new Set(sources.map(source => source.id));
  const mediaIds = new Set(media.map(item => item.id));
  const collectionIds = new Set(collections.map(item => item.id));
  const collectionMembers = new Set(collections.flatMap(item => item.itemIds));
  const unique = (items, file, label, value) => {
    const seen = new Set();
    for (const item of items) {
      const key = value(item);
      if (seen.has(key)) fail(file, `duplicate ${label} ${key}`);
      seen.add(key);
    }
  };
  const nonempty = (value, file, label) => {
    if (typeof value !== 'string' || !value.trim()) fail(file, `${label} must be non-empty text`);
  };
  const linked = (value, ids, file, label) => {
    if (!ids.has(value)) fail(file, `${label} references unknown ${value}`);
  };

  unique(metas, `${base}documents`, 'ID', item => item.id);
  unique(metas, `${base}documents`, 'slug', item => item.slug);
  unique(metas, `${base}documents`, 'order', item => item.order);
  unique(worlds, `${base}data/worlds.json`, 'world ID', item => item.id);
  unique(places_, `${base}data/places.json`, 'place ID', item => item.id);
  unique(sources, `${base}data/sources.json`, 'source ID', item => item.id);
  unique(media, `${base}data/media.json`, 'media ID', item => item.id);
  unique(collections, `${base}data/collections.json`, 'collection ID', item => item.id);
  unique(collections.filter(item => item.kind === 'dossier'), `${base}data/collections.json`, 'dossier slug', item => item.slug);

  for (const { file, data } of docs) {
    const meta = data.meta;
    if (!meta || !Array.isArray(data.blocks)) { fail(file, 'requires meta and blocks'); continue; }
    if (!kinds.has(meta.kind)) fail(file, `unknown kind ${meta.kind}`);
    if (!idPattern.test(meta.id) || meta.id !== `${meta.kind}:${meta.slug}`) fail(file, `invalid ID ${meta.id}`);
    if (!slugPattern.test(meta.slug)) fail(file, `invalid slug ${meta.slug}`);
    if (!Number.isInteger(meta.order) || meta.order < 0) fail(file, 'order must be a nonnegative integer');
    if (`${base}${meta.bodyPath.slice(2)}` !== file) fail(file, `bodyPath ${meta.bodyPath} does not match filename`);
    const expectedPath = meta.kind === 'feature' ? `/journal/${meta.slug}` : meta.kind === 'phrase' ? `/words/${meta.slug}` : `/notes/${meta.slug}`;
    if (meta.canonicalPath !== expectedPath) fail(file, `invalid canonicalPath ${meta.canonicalPath}`);
    nonempty(meta.title, file, 'title');
    nonempty(meta.summary, file, 'summary');
    linked(meta.primaryWorld, worldIds, file, 'primaryWorld');
    if (!Array.isArray(meta.worlds) || !meta.worlds.includes(meta.primaryWorld)) fail(file, 'worlds must include primaryWorld');
    else meta.worlds.forEach(id => linked(id, worldIds, file, 'world'));
    if (!Array.isArray(meta.topics)) fail(file, 'topics must be an array');
    else meta.topics.forEach(id => linked(id, topicIds, file, 'topic'));
    if (!Array.isArray(meta.places)) fail(file, 'places must be an array');
    else meta.places.forEach(id => linked(id, placeIds, file, 'place'));
    if (!Array.isArray(meta.sourceRefs) || !meta.sourceRefs.length) fail(file, 'sourceRefs must contain at least one source');
    else meta.sourceRefs.forEach(ref => { linked(ref.id, sourceIds, file, 'sourceRef'); nonempty(ref.label, file, 'sourceRef.label'); });
    const articleSourceIds = new Set(meta.sourceRefs?.map(ref => ref.id));
    if (!collectionMembers.has(meta.id)) fail(file, `orphan document ${meta.id}: no collection contains it`);
    if (meta.verification?.status !== 'unverified' && meta.verification?.status !== 'verified') fail(file, 'verification status must be explicit');
    if (meta.verification?.status === 'verified') {
      if (!validDate(meta.verification.verifiedAt)) fail(file, 'verifiedAt must be a real ISO date');
      linked(meta.verification.sourceId, articleSourceIds, file, 'verification sourceId');
    }
    if (meta.kind === 'feature') {
      for (const field of ['category', 'location', 'readTime', 'coverAlt', 'titleAccent']) nonempty(meta[field], file, field);
      linked(meta.coverMediaId, mediaIds, file, 'coverMediaId');
      if (media.find(item => item.id === meta.coverMediaId)?.kind !== 'image') fail(file, 'coverMediaId must reference image media');
      if (!collections.some(item => item.kind === 'category' && item.presentation?.id === meta.category)) fail(file, `unknown category ${meta.category}`);
      if (!Array.isArray(meta.recommendations)) fail(file, 'recommendations must be an array');
      else { unique(meta.recommendations, file, 'recommendation', item => item.id); meta.recommendations.forEach(rec => { linked(rec.id, new Set(byId.keys()), file, 'recommendation'); if (rec.id === meta.id) fail(file, 'feature cannot recommend itself'); nonempty(rec.reason, file, 'recommendation.reason'); }); }
    }
    if (!data.blocks.length) fail(file, 'body must contain blocks');
    const headings = new Set();
    for (const [index, block] of data.blocks.entries()) {
      const at = `${file} blocks[${index}]`;
      if (!blockTypes.has(block.type)) { fail(at, `unknown block type ${block.type}`); continue; }
      if (block.sourceIds !== undefined) {
        if (!Array.isArray(block.sourceIds)) fail(at, 'sourceIds must be an array');
        else block.sourceIds.forEach(id => linked(id, articleSourceIds, at, 'sourceId'));
      }
      if (block.type === 'paragraph') { nonempty(block.text, at, 'text'); if (block.role && !['intro', 'signoff'].includes(block.role)) fail(at, `invalid paragraph role ${block.role}`); }
      if (block.type === 'heading') { nonempty(block.title, at, 'title'); nonempty(block.eyebrow, at, 'eyebrow'); if (!slugPattern.test(block.id)) fail(at, `invalid heading ID ${block.id}`); if (headings.has(block.id)) fail(at, `duplicate heading ID ${block.id}`); headings.add(block.id); }
      if (block.type === 'illustration') { linked(block.mediaId, mediaIds, at, 'mediaId'); if (media.find(item => item.id === block.mediaId)?.kind !== 'image') fail(at, 'illustration requires image media'); }
      if (block.type === 'video') { linked(block.mediaId, mediaIds, at, 'mediaId'); if (media.find(item => item.id === block.mediaId)?.kind !== 'video') fail(at, 'video block requires video media'); nonempty(block.transcript, at, 'transcript'); }
      if (block.type === 'placeMap') {
        nonempty(block.title, at, 'title');
        nonempty(block.caption, at, 'caption');
        if (!Array.isArray(block.placeIds) || !block.placeIds.length) fail(at, 'placeIds must contain at least one marker');
        else {
          unique(block.placeIds, at, 'place marker', id => id);
          block.placeIds.forEach(id => {
            linked(id, placeIds, at, 'placeId');
            const place = places_.find(item => item.id === id);
            if (place && (!place.coordinates || !place.sourceId)) fail(at, `place ${id} requires sourced coordinates`);
            if (place?.sourceId) {
              linked(place.sourceId, articleSourceIds, at, `place ${id} sourceId`);
              if (!block.sourceIds?.includes(place.sourceId)) fail(at, `place ${id} sourceId must appear in block sourceIds`);
            }
          });
        }
      }
      if (block.type === 'process') { nonempty(block.title, at, 'title'); validateItems(block.steps, at, ['title', 'text'], fail, nonempty); }
      if (block.type === 'quote') { nonempty(block.text, at, 'text'); nonempty(block.attribution, at, 'attribution'); if (block.sourceId) linked(block.sourceId, articleSourceIds, at, 'sourceId'); }
      if (block.type === 'timeline') validateItems(block.events, at, ['label', 'text'], fail, nonempty);
      if (block.type === 'practical') validateItems(block.items, at, ['label', 'text'], fail, nonempty);
      if (block.type === 'characterAside') { nonempty(block.title, at, 'title'); nonempty(block.text, at, 'text'); if (block.role && !asideRoles.has(block.role)) fail(at, `invalid characterAside role ${block.role}`); }
      if (block.type === 'route') validateItems(block.stops, at, ['id', 'title', 'note'], fail, nonempty);
    }
    if (meta.kind === 'feature') {
      if (data.blocks[0]?.type !== 'paragraph' || data.blocks[0]?.role !== 'intro') fail(file, 'feature body must begin with intro paragraph');
      if (!data.blocks.some(block => block.type === 'heading')) fail(file, 'feature body requires a heading');
    }
    if (meta.kind === 'note' && !data.blocks.some(block => block.type === 'paragraph')) fail(file, 'note body requires a paragraph');
    if (meta.kind === 'phrase' && data.blocks.filter(block => block.type === 'paragraph').length < 2) fail(file, 'phrase body requires two paragraphs');
  }

  for (const source of sources) {
    const file = `${base}data/sources.json ${source.id}`;
    nonempty(source.title, file, 'title');
    if (!validUrl(source.url)) fail(file, `invalid URL ${source.url}`);
  }
  for (const item of media) {
    const file = `${base}data/media.json ${item.id}`;
    if (!mediaKinds.has(item.kind)) fail(file, `invalid kind ${item.kind}`);
    if (!mediaUses.has(item.use)) fail(file, `invalid use ${item.use}`);
    if (!['unverified', 'verified'].includes(item.provenance?.status)) fail(file, 'provenance status must be explicit');
    if (item.provenance?.status === 'verified') linked(item.provenance.sourceId, sourceIds, file, 'provenance sourceId');
    if (!['unverified', 'cleared'].includes(item.rights?.status)) fail(file, 'rights status must be explicit');
    if (item.rights?.status === 'cleared') nonempty(item.rights.license, file, 'rights.license');
    if (item.kind === 'image' && item.use !== 'atmosphere') nonempty(item.alt, file, 'alt');
    if (!validMediaPath(item.src, repoRoot)) fail(file, `asset missing or invalid ${item.src}`);
    item.variants?.forEach(variant => {
      if (!Number.isInteger(variant.width) || variant.width <= 0 || !Number.isInteger(variant.height) || variant.height <= 0) fail(file, `variant ${variant.src} requires positive pixel dimensions`);
      if (!validMediaPath(variant.src, repoRoot)) fail(file, `variant asset missing or invalid ${variant.src}`);
    });
  }
  for (const place of places_) {
    const file = `${base}data/places.json ${place.id}`;
    nonempty(place.title, file, 'title');
    if (place.address || place.coordinates) linked(place.sourceId, sourceIds, file, 'place sourceId');
    if (place.coordinates && (!Number.isFinite(place.coordinates.lat) || place.coordinates.lat < -90 || place.coordinates.lat > 90 || !Number.isFinite(place.coordinates.lon) || place.coordinates.lon < -180 || place.coordinates.lon > 180)) fail(file, 'coordinates must be valid latitude and longitude');
  }
  for (const collection of collections) {
    const file = `${base}data/collections.json ${collection.id}`;
    nonempty(collection.title, file, 'title'); nonempty(collection.dek, file, 'dek');
    if (!Number.isInteger(collection.order) || collection.order < 0) fail(file, 'order must be a nonnegative integer');
    if (!Array.isArray(collection.itemIds) || !collection.itemIds.length) fail(file, 'itemIds must contain documents');
    else { unique(collection.itemIds, file, 'item ID', id => id); collection.itemIds.forEach(id => linked(id, new Set(byId.keys()), file, 'item')); }
    if (!collection.itemIds.includes(collection.featuredId)) fail(file, `featuredId ${collection.featuredId} must be in itemIds`);
    if (collection.world) linked(collection.world, worldIds, file, 'world');
    if (collection.kind === 'dossier') {
      if (!slugPattern.test(collection.slug)) fail(file, `invalid dossier slug ${collection.slug}`);
      if (byId.get(collection.featuredId)?.kind !== 'feature') fail(file, 'dossier featuredId must reference a feature');
    }
  }
  for (const [world, groups] of Object.entries(scenes)) {
    linked(world, worldIds, `${base}data/scenes.json`, 'world');
    for (const group of groups) {
      const file = `${base}data/scenes.json ${world}/${group.id}`;
      linked(group.collectionId, collectionIds, file, 'collectionId');
      if (group.x < 0 || group.x > 100 || group.y < 0 || group.y > 100) fail(file, 'scene coordinates must be 0–100');
      for (const slug of group.slugs) {
        const meta = bySlug.get(slug);
        if (!meta) fail(file, `unknown slug ${slug}`);
        else if (!collections.find(item => item.id === group.collectionId)?.itemIds.includes(meta.id)) fail(file, `slug ${slug} is absent from ${group.collectionId}`);
      }
    }
  }
  for (const [oldSlug, newSlug] of Object.entries(migrations)) {
    const file = `${base}data/migrations.json`;
    if (!slugPattern.test(oldSlug) || !slugPattern.test(newSlug)) fail(file, `invalid migration ${oldSlug} -> ${newSlug}`);
    if (bySlug.has(oldSlug)) fail(file, `old slug ${oldSlug} collides with a canonical slug`);
    if (!bySlug.has(newSlug)) fail(file, `migration ${oldSlug} references unknown slug ${newSlug}`);
  }
  unique(journeys, `${base}data/journeys.json`, 'journey ID', item => item.id);
  for (const journey of journeys) {
    const file = `${base}data/journeys.json ${journey.id}`;
    if (!slugPattern.test(journey.id) || !journey.id.startsWith(`${journey.world}-`)) fail(file, 'ID must be a world-prefixed slug');
    linked(journey.world, worldIds, file, 'world');
    nonempty(journey.title, file, 'title');
    nonempty(journey.intro, file, 'intro');
    if (!Array.isArray(journey.stops) || journey.stops.length < 2) fail(file, 'stops must contain at least two documents');
    else {
      unique(journey.stops, file, 'stop', stop => stop.contentId);
      journey.stops.forEach((stop, index) => {
        linked(stop.contentId, new Set(byId.keys()), file, `stops[${index}].contentId`);
        if (byId.has(stop.contentId) && !byId.get(stop.contentId).worlds.includes(journey.world)) fail(file, `stops[${index}] is outside world ${journey.world}`);
        nonempty(stop.note, file, `stops[${index}].note`);
      });
    }
  }
  unique(metrics, `${base}data/metrics.json`, 'metric ID', item => item.id);
  for (const metric of metrics) {
    const file = `${base}data/metrics.json ${metric.id}`;
    if (!slugPattern.test(metric.id)) fail(file, 'ID must be a slug');
    for (const field of ['scope', 'label', 'value', 'unit', 'period', 'source']) nonempty(metric[field], file, field);
    if (!validUrl(metric.url)) fail(file, `invalid evidence URL ${metric.url}`);
  }
  return errors;
}

function validDate(value) {
  if (typeof value !== 'string') return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!parts || Number.isNaN(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second] = parts.map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return calendar.getUTCFullYear() === year && calendar.getUTCMonth() === month - 1 && calendar.getUTCDate() === day && (parts[4] === undefined || hour <= 23 && minute <= 59 && second <= 59);
}
function validUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } }
function validMediaPath(value, repoRoot) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return validUrl(value);
  return value.startsWith('/') && !value.includes('..') && fs.existsSync(path.join(repoRoot, 'public', value.slice(1)));
}
function validateItems(items, file, fields, fail, nonempty) {
  if (!Array.isArray(items) || !items.length) { fail(file, 'items must be a nonempty array'); return; }
  items.forEach((item, index) => fields.forEach(field => nonempty(item[field], `${file} items[${index}]`, field)));
}
