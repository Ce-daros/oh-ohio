import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { computeCatalog } from './lib/content.mjs';

const { catalog, vercel } = computeCatalog(process.cwd());

for (const [file, value] of [['src/content/data/routes.json', catalog], ['vercel.json', vercel]]) {
  if (process.argv.includes('--check')) {
    const current = JSON.parse(fs.readFileSync(file, 'utf8'));
    const checked = file === 'vercel.json' && process.env.VERCEL
      ? Object.fromEntries(Object.entries(current).filter(([key]) => key !== 'name' && key !== 'version'))
      : current;
    if (!isDeepStrictEqual(checked, value)) throw new Error(`${file} is stale; run node scripts/route-catalog.mjs`);
  } else fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

console.log(`${process.argv.includes('--check') ? 'Checked' : 'Generated'} ${catalog.routes.length} public routes and ${catalog.redirects.length} redirects`);
