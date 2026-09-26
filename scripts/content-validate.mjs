import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { computeManifest, computeCoverage, validateContent, verifyVercelConfig } from './lib/content.mjs';

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const errors = validateContent();
  const vercelError = verifyVercelConfig(process.cwd());
  if (vercelError) errors.push(vercelError);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else {
    const manifest = computeManifest(process.cwd());
    const coverage = computeCoverage(process.cwd());
    console.log(`Content valid: ${manifest.documents.length} documents, ${coverage.totals.collections} collections, ${coverage.totals.sources} sources`);
  }
}
