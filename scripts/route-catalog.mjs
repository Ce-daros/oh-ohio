// Writes vercel.json from the computed route catalog. Run after content
// changes that add, remove, or rename documents. vercel.json stays in Git
// because the Vercel platform reads it before the build runs.
import fs from 'node:fs';
import { computeCatalog, verifyVercelConfig } from './lib/content.mjs';

const { vercel } = computeCatalog(process.cwd());
if (process.argv.includes('--check')) {
  const error = verifyVercelConfig(process.cwd());
  if (error) { console.error(error); process.exitCode = 1; }
  else console.log('vercel.json matches the route catalog');
} else {
  fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
  console.log(`Generated vercel.json with ${vercel.redirects.length} redirects`);
}
