import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateContent } from './content-validate.mjs';

const projectRoot = process.cwd();

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ohio-content-test-'));
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.cpSync(path.join(projectRoot, 'src/content'), path.join(root, 'src/content'), { recursive: true });
  fs.cpSync(path.join(projectRoot, 'editorial/research'), path.join(root, 'editorial/research'), { recursive: true });
  const media = JSON.parse(fs.readFileSync(path.join(root, 'src/content/data/media.json'), 'utf8'));
  for (const item of media) {
    for (const asset of [item.src, ...(item.variants?.map(variant => variant.src) ?? [])]) {
      if (!asset.startsWith('/')) continue;
      const target = path.join(root, 'public', asset.slice(1));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, '');
    }
  }
  return root;
}

function mutate(root, relative, change) {
  const file = path.join(root, relative);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(value);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function checkCorruption(name, relative, change, expected) {
  test(name, () => {
    const root = fixture();
    try {
      mutate(root, relative, change);
      assert.match(validateContent(root).join('\n'), expected);
    } finally {
      const temporaryParent = fs.realpathSync(os.tmpdir());
      assert.ok(fs.realpathSync(root).startsWith(temporaryParent + path.sep));
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

test('canonical content validates', () => {
  assert.deepEqual(validateContent(projectRoot), []);
});

checkCorruption('rejects duplicate document IDs with file context',
  'src/content/documents/note/north-coast.json',
  doc => { doc.meta.id = 'note:history'; },
  /src\/content\/documents: duplicate ID note:history/);

checkCorruption('rejects broken source references',
  'src/content/documents/note/north-coast.json',
  doc => { doc.meta.sourceRefs[0].id = 'source:missing'; },
  /north-coast\.json: sourceRef references unknown source:missing/);

checkCorruption('rejects empty body content',
  'src/content/documents/note/north-coast.json',
  doc => { doc.blocks[0].text = ''; },
  /north-coast\.json blocks\[0\]: text must be non-empty text/);

checkCorruption('rejects a block source absent from article citations',
  'src/content/documents/note/north-coast.json',
  doc => { doc.blocks[0].sourceIds = ['source:missing']; },
  /north-coast\.json blocks\[0\]: sourceId references unknown source:missing/);

checkCorruption('rejects an unevidenced publication timestamp',
  'src/content/documents/note/north-coast.json',
  doc => { doc.meta.publishedAt = '2024-01-01T00:00:00Z'; },
  /north-coast\.json: publishedAt requires an existing editorial research record/);

checkCorruption('rejects invalid remote media URLs',
  'src/content/data/media.json',
  media => { media[0].src = 'https://'; },
  /media\.json media:.*asset missing or invalid https:\/\//);

checkCorruption('rejects journey stops outside their world',
  'src/content/data/journeys.json',
  journeys => { journeys[0].stops[0].contentId = 'note:statehouse-open-door'; },
  /journeys\.json explore-three-ways-to-meet-the-lake: stops\[0\] is outside world explore/);

checkCorruption('rejects metrics without a source URL',
  'src/content/data/metrics.json',
  metrics => { metrics[0].url = 'source unknown'; },
  /metrics\.json population: invalid evidence URL source unknown/);

checkCorruption('rejects invalid geocoded places',
  'src/content/data/places.json',
  places => { places[0].coordinates = { lat: 200, lon: -83 }; places[0].sourceId = 'source:missing'; },
  /places\.json ohio: coordinates must be valid latitude and longitude/);

checkCorruption('rejects missing media assets',
  'src/content/data/media.json',
  media => { media[0].src = '/art/journal/does-not-exist.webp'; },
  /media\.json media:.*asset missing or invalid \/art\/journal\/does-not-exist.webp/);

checkCorruption('rejects broken collection relations',
  'src/content/data/collections.json',
  collections => { collections.find(item => item.id === 'home:field-notes').itemIds[0] = 'feature:missing'; },
  /collections\.json home:field-notes: item references unknown feature:missing/);

checkCorruption('rejects stale legacy slug migrations',
  'src/content/data/migrations.json',
  migrations => { migrations['phrase-1'] = 'unknown-phrase'; },
  /migrations\.json: migration phrase-1 references unknown slug unknown-phrase/);

checkCorruption('rejects stale generated manifest',
  'src/content/data/manifest.json',
  manifest => { manifest.documents[0].title = 'Changed only in the manifest'; },
  /manifest\.json: generated manifest is stale/);
