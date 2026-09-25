import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve('dist');
const catalog = JSON.parse(fs.readFileSync('src/content/data/routes.json', 'utf8'));
const redirects = new Map(catalog.redirects.map(item => [item.source, item.destination]));
const canonicalPaths = new Set(catalog.routes.map(route => route.path));
const types = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'], ['.txt', 'text/plain; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.webp', 'image/webp'], ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'], ['.woff2', 'font/woff2'], ['.mp3', 'audio/mpeg'], ['.mp4', 'video/mp4'],
]);

export function createStaticServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const pathname = url.pathname;
    if (pathname.endsWith('/') && pathname !== '/' && canonicalPaths.has(pathname.slice(0, -1))) {
      response.writeHead(308, { Location: pathname.slice(0, -1) + url.search });
      response.end();
      return;
    }
    const destination = redirects.get(pathname);
    if (destination) {
      response.writeHead(308, { Location: destination + url.search });
      response.end();
      return;
    }
    const target = path.resolve(root, `.${pathname}`);
    const file = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
      response.writeHead(404, { 'Content-Type': types.get('.html') });
      response.end(fs.readFileSync(path.join(root, '404.html')));
      return;
    }
    response.writeHead(200, { 'Content-Type': types.get(path.extname(file)) });
    response.end(fs.readFileSync(file));
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = process.argv.includes('--port') ? Number(process.argv[process.argv.indexOf('--port') + 1]) : 4173;
  createStaticServer().listen(port, '0.0.0.0', () => console.log(`Static site: http://localhost:${port}/`));
}
