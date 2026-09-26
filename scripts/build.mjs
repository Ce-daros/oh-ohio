import { spawnSync } from 'node:child_process';
import path from 'node:path';

// The content plugin (vite.config) validates the content graph, serves
// the manifest/routes/coverage virtual modules, and structurally verifies
// the client bundle while it builds.
const commands = [
  [path.join('node_modules', 'vue-tsc', 'bin', 'vue-tsc.js'), '--noEmit'],
  [path.join('node_modules', 'vite', 'bin', 'vite.js'), 'build', '--ssrManifest'],
  [path.join('node_modules', 'vite', 'bin', 'vite.js'), 'build', '--ssr', 'src/entry-server.ts', '--outDir', '.ssr'],
  ['scripts/prerender.mjs'],
  ['scripts/inline-critical-css.mjs'],
  ['scripts/prerender-verify.mjs'],
];

for (const args of commands) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
