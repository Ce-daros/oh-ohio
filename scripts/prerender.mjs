import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildRobots, buildSitemap } from './site-artifacts.mjs';
import { computeCatalog } from './lib/content.mjs';

const root = process.cwd();
const { catalog } = computeCatalog(root);
const site = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const template = fs.readFileSync('dist/index.html', 'utf8');
const ssrManifest = JSON.parse(fs.readFileSync('dist/.vite/ssr-manifest.json', 'utf8'));
const { render } = await import(pathToFileURL(path.join(root, '.ssr', 'entry-server.js')).href);
const routes = catalog.routes.map(route => route.path);
const uniqueRoutes = [...new Set(routes)];
if (uniqueRoutes.length !== routes.length) throw new Error('Prerender routes contain duplicate paths');
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function pageHtml(result) {
  const styles = new Set(result.modules.flatMap(module => {
    const assets = ssrManifest[module];
    if (!assets) throw new Error(`SSR module absent from client manifest: ${module}`);
    return assets.filter(asset => asset.endsWith('.css'));
  }));
  const links = [...styles].map(asset => `<link rel="stylesheet" href="${asset}" />`).join('');
  const extra = `${links}${result.head}`;
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(result.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(result.description)}" />`)
    .replace('<!--page-head-->', extra)
    .replace('<!--app-html-->', result.html);
}

for (const route of uniqueRoutes) {
  const result = await render(route);
  if (result.notFound) throw new Error(`Known route rendered as 404: ${route}`);
  if (!result.html.includes('<main')) throw new Error(`Route has no rendered main content: ${route}`);
  const directory = path.join(root, 'dist', route.slice(1));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), pageHtml(result));
}

const notFound = await render('/__not_found__');
if (!notFound.notFound) throw new Error('404 route did not render the not-found page');
fs.writeFileSync(path.join(root, 'dist', '404.html'), pageHtml(notFound));
fs.writeFileSync(path.join(root, 'dist', 'sitemap.xml'), buildSitemap(catalog.routes, site.origin));
fs.writeFileSync(path.join(root, 'dist', 'robots.txt'), buildRobots(site.origin));
console.log(`Prerendered ${uniqueRoutes.length} routes and 404.html`);
