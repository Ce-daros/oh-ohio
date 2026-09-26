import fs from 'node:fs';
import path from 'node:path';
import { computeManifest } from './lib/content.mjs';

const output = JSON.stringify(computeManifest(process.cwd()), null, 2) + '\n';
const target = path.join('src/content/data', 'manifest.json');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) {
    console.error('src/content/data/manifest.json is stale; run node scripts/content-manifest.mjs');
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(target, output);
  console.log(`Generated manifest for ${JSON.parse(output).documents.length} documents`);
}
