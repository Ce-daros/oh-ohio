import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/content');
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
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sources.json'), 'utf8'));
const sourceUrls = sourceRegistry.map(({ id, url }) => ({ id, url }));
const output = JSON.stringify({ schemaVersion: 1, documents, sourceUrls }, null, 2) + '\n';
const target = path.join(root, 'data', 'manifest.json');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) {
    console.error('src/content/data/manifest.json is stale; run node scripts/content-manifest.mjs');
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(target, output);
  console.log(`Generated manifest for ${documents.length} documents`);
}
