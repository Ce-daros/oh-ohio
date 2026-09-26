// Preview-server semantics for the prerendered dist/ tree, matching the
// Vercel deployment: catalog-driven 308 redirects that preserve query
// strings, trailing-slash normalization, and a real noindex 404 for
// unknown paths. Dev keeps the SPA fallback; this only applies to
// `vite preview`.
import fs from 'node:fs';
import path from 'node:path';
import { computeCatalog } from './lib/content.mjs';

const HTML_TYPE = 'text/html; charset=utf-8';

export function previewPlugin() {
  return {
    name: 'ohio-preview',

    config(_config, { isPreview }) {
      // Static-host semantics: no SPA fallback, so unknown paths stay 404.
      return isPreview ? { appType: 'mpa' } : undefined;
    },

    configurePreviewServer(server) {
      const { catalog } = computeCatalog(process.cwd());
      const canonicalPaths = new Set(catalog.routes.map(route => route.path));
      const redirects = new Map(catalog.redirects.map(item => [item.source, item.destination]));
      const dist = path.resolve(server.config.root, server.config.build.outDir);

      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const { pathname, search } = new URL(req.url, 'http://localhost');
        if (pathname.endsWith('/') && pathname !== '/' && canonicalPaths.has(pathname.slice(0, -1))) {
          res.writeHead(308, { Location: pathname.slice(0, -1) + search });
          return res.end();
        }
        const destination = redirects.get(pathname);
        if (destination) {
          res.writeHead(308, { Location: destination + search });
          return res.end();
        }
        // Clean URLs: /journal is prerendered as journal/index.html and
        // / as index.html; hand the exact file to the static middleware
        // instead of relying on directory resolution, which it does not
        // do here.
        if (fs.existsSync(path.join(dist, pathname.slice(1), 'index.html'))) {
          req.url = `${pathname}/index.html${search}`;
        }
        next();
      });

      // Anything that survives the static middleware and the html fallback
      // is a genuine miss: serve the prerendered noindex 404 page. Post
      // hooks run once and install middleware after the internal stack.
      return () => {
        server.middlewares.use((req, res, next) => {
          if (res.writableEnded || (req.method !== 'GET' && req.method !== 'HEAD')) return next();
          res.statusCode = 404;
          res.setHeader('Content-Type', HTML_TYPE);
          res.end(fs.readFileSync(path.join(dist, '404.html')));
        });
      };
    },
  };
}
