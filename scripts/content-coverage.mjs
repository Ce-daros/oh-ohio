import fs from 'node:fs';
import { computeCoverage } from './lib/content.mjs';

const report = computeCoverage(process.cwd());
fs.writeFileSync('editorial/content-coverage.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Generated coverage for ${report.totals.documents} documents, ${report.totals.dossiers} dossiers, ${report.totals.sources} sources`);
