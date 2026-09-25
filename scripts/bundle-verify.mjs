import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('src/content/data/manifest.json', 'utf8'));
const ssrManifest = JSON.parse(fs.readFileSync('dist/.vite/ssr-manifest.json', 'utf8'));
const assetDir = 'dist/assets';
const scripts = fs.readdirSync(assetDir).filter(name => name.endsWith('.js'));
const textByFile = new Map(scripts.map(name => [name, fs.readFileSync(path.join(assetDir, name), 'utf8')]));
const chunkByDocument = new Map(manifest.documents.map(document => {
  const module = `src/content/${document.bodyPath.slice(2)}`;
  const names = ssrManifest[module]?.filter(asset => asset.endsWith('.js')).map(asset => path.basename(asset));
  if (names?.length !== 1) throw new Error(`${document.bodyPath}: expected one lazy body chunk, found ${names?.join(', ')}`);
  return [document.id, names[0]];
}));
const bodyChunks = new Set(chunkByDocument.values());

for (const document of manifest.documents) {
  const body = JSON.parse(fs.readFileSync(path.join('src/content', document.bodyPath), 'utf8'));
  const excerpt = body.blocks.filter(block => block.type === 'paragraph').sort((a, b) => b.text.length - a.text.length)[0].text.slice(0, 50);
  const ownChunk = chunkByDocument.get(document.id);
  if (!textByFile.get(ownChunk).includes(excerpt)) throw new Error(`${document.bodyPath}: body excerpt is missing from its lazy chunk`);
  const eager = [...textByFile].filter(([name, text]) => !bodyChunks.has(name) && text.includes(excerpt)).map(([name]) => name);
  if (eager.length) throw new Error(`${document.bodyPath}: body excerpt leaked into ${eager.join(', ')}`);
}

console.log(`Verified ${manifest.documents.length} independently loaded story chunks`);
