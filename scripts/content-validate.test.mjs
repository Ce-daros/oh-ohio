import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateContent } from './content-validate.mjs';

const projectRoot = process.cwd();

// One shared fixture for the whole file: each corruption test mutates
// exactly one registry file and restores it afterwards, so the suite
// copies the content tree once instead of once per test.
const fixtureRoot = createFixture();
after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));

function createFixture() {
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

function withMutation(relative, change, run) {
  const file = path.join(fixtureRoot, relative);
  const original = fs.readFileSync(file, 'utf8');
  const value = JSON.parse(original);
  change(value);
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
  try {
    run(validateContent(fixtureRoot));
  } finally {
    fs.writeFileSync(file, original);
  }
}

// Assertions match the stable fragment of each message, so rewording
// the file context in a failure does not break every test.
function checkCorruption(name, relative, change, expected) {
  test(name, () => {
    withMutation(relative, change, errors => {
      assert.match(errors.join('\n'), expected);
    });
  });
}

test('remote media validates without a local file or network request', () => {
  withMutation('src/content/data/media.json', media => { media[0].src = 'https://www.nps.gov/media/example.mp4'; }, errors => {
    assert.deepEqual(errors, []);
  });
});

checkCorruption('rejects duplicate document IDs with file context',
  'src/content/documents/note/north-coast.json',
  doc => { doc.meta.id = 'note:history'; },
  /duplicate ID note:history/);

checkCorruption('rejects broken source references',
  'src/content/documents/note/north-coast.json',
  doc => { doc.meta.sourceRefs[0].id = 'source:missing'; },
  /sourceRef references unknown source:missing/);

checkCorruption('rejects empty body content',
  'src/content/documents/note/north-coast.json',
  doc => { doc.blocks[0].text = ''; },
  /text must be non-empty text/);

checkCorruption('rejects a block source absent from article citations',
  'src/content/documents/note/north-coast.json',
  doc => { doc.blocks[0].sourceIds = ['source:missing']; },
  /sourceId references unknown source:missing/);

checkCorruption('rejects an unevidenced publication timestamp',
  'src/content/documents/note/north-coast.json',
  doc => { doc.meta.publishedAt = '2024-01-01T00:00:00Z'; },
  /publishedAt requires an existing editorial research record/);

checkCorruption('rejects invalid remote media URLs',
  'src/content/data/media.json',
  media => { media[0].src = 'https://'; },
  /asset missing or invalid https:\/\//);

checkCorruption('rejects journey stops outside their world',
  'src/content/data/journeys.json',
  journeys => { journeys[0].stops[0].contentId = 'note:statehouse-open-door'; },
  /is outside world explore/);

checkCorruption('rejects metrics without a source URL',
  'src/content/data/metrics.json',
  metrics => { metrics[0].url = 'source unknown'; },
  /invalid evidence URL source unknown/);

checkCorruption('rejects map markers without sourced coordinates',
  'src/content/documents/note/north-coast.json',
  doc => { doc.blocks.push({ type: 'placeMap', title: 'Map', caption: 'Places', placeIds: ['ohio'], sourceIds: [] }); },
  /place ohio requires sourced coordinates/);

checkCorruption('rejects invalid geocoded places',
  'src/content/data/places.json',
  places => { places[0].coordinates = { lat: 200, lon: -83 }; places[0].sourceId = 'source:missing'; },
  /coordinates must be valid latitude and longitude/);

checkCorruption('rejects missing media assets',
  'src/content/data/media.json',
  media => { media[0].src = '/art/journal/does-not-exist.webp'; },
  /asset missing or invalid \/art\/journal\/does-not-exist\.webp/);

checkCorruption('rejects broken collection relations',
  'src/content/data/collections.json',
  collections => { collections.find(item => item.id === 'home:field-notes').itemIds[0] = 'feature:missing'; },
  /item references unknown feature:missing/);

checkCorruption('rejects recommendations to missing content',
  'src/content/documents/feature/brass-whistle.json',
  doc => { doc.meta.recommendations[0].id = 'note:missing'; },
  /recommendation references unknown note:missing/);

checkCorruption('rejects stale legacy slug migrations',
  'src/content/data/migrations.json',
  migrations => { migrations['phrase-1'] = 'unknown-phrase'; },
  /references unknown slug unknown-phrase/);

checkCorruption('rejects stale generated manifest',
  'src/content/data/manifest.json',
  manifest => { manifest.documents[0].title = 'Changed only in the manifest'; },
  /generated manifest is stale/);
