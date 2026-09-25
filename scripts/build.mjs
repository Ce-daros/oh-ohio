import { spawnSync } from 'node:child_process';
import path from 'node:path';

const commands = [
  ['scripts/content-manifest.mjs', '--check'],
  ['scripts/content-validate.mjs'],
  [path.join('node_modules', 'vue-tsc', 'bin', 'vue-tsc.js'), '--noEmit'],
  [path.join('node_modules', 'vite', 'bin', 'vite.js'), 'build', '--ssrManifest'],
  [path.join('node_modules', 'vite', 'bin', 'vite.js'), 'build', '--ssr', 'src/entry-server.ts', '--outDir', '.ssr'],
  ['scripts/prerender.mjs'],
  ['scripts/prerender-verify.mjs'],
  ['--test', 'scripts/prerender-http.test.mjs'],
];

for (const args of commands) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
