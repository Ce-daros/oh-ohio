// Vite plugin: the single content pipeline lives in the build.
//
// - buildStart validates the whole content graph and computes the
//   manifest, route catalog, and editorial coverage in memory.
// - The derived data is served as virtual modules, so no generated
//   JSON lives in Git and nothing can go stale.
// - In dev, edits under src/content or editorial re-validate and hot-
//   reload the virtual modules; validation errors surface in the overlay.
// - The client bundle is checked structurally: every story body must be
//   exactly one lazy chunk outside the entry closure, and the local
//   editorial desk must be tree-shaken out of production.
import { computeCatalog, computeCoverage, computeManifest, validateContent, verifyVercelConfig } from './lib/content.mjs';

const VIRTUAL_PREFIX = '\0virtual:';
const toPosix = value => value.replaceAll('\\', '/');

export function contentPlugin() {
  let manifest;
  let catalog;
  let coverage;

  function recompute() {
    manifest = computeManifest(process.cwd());
    catalog = computeCatalog(process.cwd()).catalog;
    coverage = computeCoverage(process.cwd());
  }

  return {
    name: 'ohio-content',

    configResolved(config) {
      this.isClientBuild = !config.build.ssr;
    },

    buildStart() {
      const errors = validateContent(process.cwd());
      if (errors.length) throw new Error(`Content validation failed:\n${errors.join('\n')}`);
      const vercelError = verifyVercelConfig(process.cwd());
      if (vercelError) throw new Error(vercelError);
      recompute();
    },

    resolveId(id) {
      if (id === 'virtual:content-manifest') return `${VIRTUAL_PREFIX}content-manifest`;
      if (id === 'virtual:routes') return `${VIRTUAL_PREFIX}routes`;
      if (id === 'virtual:coverage') return `${VIRTUAL_PREFIX}coverage`;
    },

    load(id) {
      if (id === `${VIRTUAL_PREFIX}content-manifest`) return `export default ${JSON.stringify(manifest)};`;
      if (id === `${VIRTUAL_PREFIX}routes`) return `export default ${JSON.stringify(catalog)};`;
      if (id === `${VIRTUAL_PREFIX}coverage`) return `export default ${JSON.stringify(coverage)};`;
    },

    configureServer(server) {
      const refresh = file => {
        const normalized = toPosix(file);
        if (!normalized.includes('/src/content/') && !normalized.includes('/editorial/')) return;
        const errors = validateContent(process.cwd());
        if (errors.length) {
          server.ws.send({ type: 'error', err: { message: `Content validation failed:\n${errors.join('\n')}` } });
          return;
        }
        recompute();
        for (const name of ['content-manifest', 'routes', 'coverage']) {
          const module = server.moduleGraph.getModuleById(`${VIRTUAL_PREFIX}${name}`);
          if (module) server.moduleGraph.invalidateModule(module);
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', refresh);
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },

    writeBundle(_options, bundle) {
      if (!this.isClientBuild) return;
      const chunks = Object.entries(bundle).filter(([, item]) => item.type === 'chunk');

      if (chunks.some(([name]) => name.startsWith('EditorialPage'))) {
        throw new Error('The local editorial page leaked into the production bundle');
      }

      const eager = new Set();
      const walk = chunk => {
        for (const dep of chunk.imports) {
          if (eager.has(dep)) continue;
          eager.add(dep);
          const depChunk = bundle[dep];
          if (depChunk) walk(depChunk);
        }
      };
      const entry = chunks.find(([, item]) => item.isEntry);
      if (entry) walk(entry[1]);

      const ownedBy = moduleId => chunks
        .filter(([, item]) => Object.keys(item.modules ?? {}).some(id => toPosix(id).endsWith(`/${moduleId}`)))
        .map(([name]) => name);
      for (const document of manifest.documents) {
        const moduleId = `src/content/${document.bodyPath.slice(2)}`;
        const owners = ownedBy(moduleId);
        if (owners.length !== 1) {
          throw new Error(`${document.bodyPath}: expected exactly one client chunk for the body module, found ${owners.join(', ') || 'none'}`);
        }
        if (eager.has(owners[0])) {
          throw new Error(`${document.bodyPath}: body chunk ${owners[0]} is reachable from the entry; it must stay lazy`);
        }
      }
      this.verifiedChunks = manifest.documents.length;
    },
  };
}
