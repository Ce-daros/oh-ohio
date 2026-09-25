import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('src/content/data/manifest.json', 'utf8'));
const assetDir = 'dist/assets';
const scripts = fs.readdirSync(assetDir).filter(name => name.endsWith('.js'));
const textByFile = new Map(scripts.map(name => [name, fs.readFileSync(path.join(assetDir, name), 'utf8')]));

for (const document of manifest.documents) {
  const body = JSON.parse(fs.readFileSync(path.join('src/content', document.bodyPath), 'utf8'));
  const excerpt = body.blocks.filter(block => block.type === 'paragraph').sort((a, b) => b.text.length - a.text.length)[0].text.slice(0, 50);
  const matches = [...textByFile].filter(([, text]) => text.includes(excerpt)).map(([name]) => name);
  if (matches.length !== 1 || !matches[0].startsWith(`${document.slug}-`)) {
    throw new Error(`${document.bodyPath}: body excerpt must appear only in its own lazy chunk; found ${matches.join(', ')}`);
  }
}

console.log(`Verified ${manifest.documents.length} independently loaded story chunks`);
