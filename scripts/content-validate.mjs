import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const idPattern = /^(note|phrase|feature):[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kinds = new Set(['note', 'phrase', 'feature']);
const blockTypes = new Set(['paragraph', 'heading', 'illustration', 'process', 'quote', 'timeline', 'practical', 'characterAside', 'audio', 'video', 'placeMap', 'route']);
const asideRoles = new Set(['welcome', 'notice', 'explain', 'listen', 'practical', 'farewell']);
const mediaUses = new Set(['atmosphere', 'explanation', 'documentary']);
const mediaKinds = new Set(['image', 'audio', 'video']);

export function validateContent(repoRoot = process.cwd()) {
  const errors = [];
  const fail = (file, message) => errors.push(`${file}: ${message}`);
  const read = relative => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));
  const base = 'src/content/';
  const manifest = read(`${base}data/manifest.json`);
  const worlds = read(`${base}data/worlds.json`);
  const topics = read(`${base}data/topics.json`);
  const places = read(`${base}data/places.json`);
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
  const topicIds = new Set(topics.map(topic => topic.id));
  const placeIds = new Set(places.map(place => place.id));
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

  if (manifest.schemaVersion !== 1) fail(`${base}data/manifest.json`, 'schemaVersion must be 1');
  unique(metas, `${base}documents`, 'ID', item => item.id);
  unique(metas, `${base}documents`, 'slug', item => item.slug);
  unique(metas, `${base}documents`, 'order', item => item.order);
  unique(worlds, `${base}data/worlds.json`, 'world ID', item => item.id);
  unique(topics, `${base}data/topics.json`, 'topic ID', item => item.id);
  unique(places, `${base}data/places.json`, 'place ID', item => item.id);
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
    for (const field of ['publishedAt', 'updatedAt']) if (meta[field] !== undefined) {
      if (!validDate(meta[field])) fail(file, `${field} must be a real ISO date`);
      const evidence = meta.dateEvidence?.[field];
      if (evidence?.kind !== 'editorial-record' || typeof evidence.path !== 'string' || !/^editorial\/research\/[a-z0-9-]+\.md$/.test(evidence.path) || !fs.existsSync(path.join(repoRoot, evidence.path))) fail(file, `${field} requires an existing editorial research record`);
    }
    if (meta.kind === 'note') { nonempty(meta.sectionId, file, 'sectionId'); nonempty(meta.kicker, file, 'kicker'); }
    if (meta.kind === 'phrase') nonempty(meta.region, file, 'region');
    if (meta.kind === 'feature') {
      for (const field of ['category', 'location', 'duration', 'readTime', 'coverAlt', 'titleAccent']) nonempty(meta[field], file, field);
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
      if (block.type === 'audio') { linked(block.mediaId, mediaIds, at, 'mediaId'); if (media.find(item => item.id === block.mediaId)?.kind !== 'audio') fail(at, 'audio block requires audio media'); nonempty(block.transcript, at, 'transcript'); }
      if (block.type === 'video') { linked(block.mediaId, mediaIds, at, 'mediaId'); if (media.find(item => item.id === block.mediaId)?.kind !== 'video') fail(at, 'video block requires video media'); nonempty(block.transcript, at, 'transcript'); }
      if (block.type === 'placeMap') {
        nonempty(block.title, at, 'title');
        nonempty(block.caption, at, 'caption');
        if (!Array.isArray(block.placeIds) || !block.placeIds.length) fail(at, 'placeIds must contain at least one marker');
        else {
          unique(block.placeIds, at, 'place marker', id => id);
          block.placeIds.forEach(id => {
            linked(id, placeIds, at, 'placeId');
            const place = places.find(item => item.id === id);
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
      if (block.type === 'route') { validateItems(block.stops, at, ['id', 'title', 'note'], fail, nonempty); block.stops?.forEach(stop => { if (stop.placeId) linked(stop.placeId, placeIds, at, 'route placeId'); }); }
    }
    if (meta.kind === 'feature') {
      if (data.blocks[0]?.type !== 'paragraph' || data.blocks[0]?.role !== 'intro') fail(file, 'feature body must begin with intro paragraph');
      if (!data.blocks.some(block => block.type === 'heading')) fail(file, 'feature body requires a heading');
    }
    if (meta.kind === 'note' && !data.blocks.some(block => block.type === 'paragraph')) fail(file, 'note body requires a paragraph');
    if (meta.kind === 'phrase' && data.blocks.filter(block => block.type === 'paragraph').length < 2) fail(file, 'phrase body requires region and note paragraphs');
  }

  const sorted = [...metas].sort((a, b) => a.order - b.order);
  if (JSON.stringify(manifest.documents) !== JSON.stringify(sorted)) fail(`${base}data/manifest.json`, 'generated manifest is stale; run node scripts/content-manifest.mjs');
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
    for (const [name, point] of [['focalPoint', item.focalPoint], ['crop', item.crop]]) if (point) for (const [coordinate, value] of Object.entries(point)) if (!Number.isFinite(value)) fail(file, `${name}.${coordinate} must be finite`);
  }
  for (const place of places) {
    const file = `${base}data/places.json ${place.id}`;
    nonempty(place.title, file, 'title');
    if (place.address || place.coordinates) linked(place.sourceId, sourceIds, file, 'place sourceId');
    if (place.coordinates && (!Number.isFinite(place.coordinates.lat) || place.coordinates.lat < -90 || place.coordinates.lat > 90 || !Number.isFinite(place.coordinates.lon) || place.coordinates.lon < -180 || place.coordinates.lon > 180)) fail(file, 'coordinates must be valid latitude and longitude');
  }
  for (const topic of topics) { const file = `${base}data/topics.json ${topic.id}`; linked(topic.world, worldIds, file, 'world'); linked(topic.featuredId, new Set(byId.keys()), file, 'featuredId'); linked(topic.id, collectionIds, file, 'collection'); }
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

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const errors = validateContent();
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else {
    const manifest = JSON.parse(fs.readFileSync('src/content/data/manifest.json', 'utf8'));
    const collections = JSON.parse(fs.readFileSync('src/content/data/collections.json', 'utf8'));
    const sources = JSON.parse(fs.readFileSync('src/content/data/sources.json', 'utf8'));
    console.log(`Content valid: ${manifest.documents.length} documents, ${collections.length} collections, ${sources.length} sources`);
  }
}
