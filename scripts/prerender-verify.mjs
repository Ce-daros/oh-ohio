import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('src/content/data/manifest.json', 'utf8'));
const site = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('src/content/data/routes.json', 'utf8'));
const routes = catalog.routes;
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
let assetsChecked = 0;
for (const route of routes) {
  const file = path.join('dist', route.path.slice(1), 'index.html');
  if (!fs.existsSync(file)) throw new Error(`${route.path}: prerendered file missing (${file})`);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<main') || !html.includes('id="app"')) throw new Error(`${file}: missing actual Vue-rendered main content`);
  if (html.includes('<!--app-html-->') || html.includes('<!--page-head-->')) throw new Error(`${file}: template marker was not replaced`);
  const pageStyle = { home: 'HomePage', journal: 'JournalPage', topics: 'TopicsPage', search: 'SearchPage', saved: 'SavedPage', world: 'ChapterPage', dossier: 'TopicPage', content: 'ContentPage' }[route.kind];
  if (!html.includes(`/assets/${pageStyle}-`) || !new RegExp(`<link rel="stylesheet" href="/assets/${pageStyle}-[^" ]+\\.css"`).test(html)) throw new Error(`${file}: route CSS is not in static HTML`);
  if (!route.noindex && !html.includes(`rel="canonical" href="${site.origin}${route.path}"`)) throw new Error(`${file}: canonical URL missing`);
  if (!html.includes(`property="og:url" content="${site.origin}${route.path}"`)) throw new Error(`${file}: Open Graph URL missing`);
  if (route.noindex && !html.includes('name="robots" content="noindex,follow"')) throw new Error(`${file}: noindex missing`);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:webp|png|jpe?g|svg|woff2?|css|js|ico|mp3|mp4))"/g)) {
    const asset = path.join('dist', match[1].slice(1));
    if (!fs.existsSync(asset)) throw new Error(`${file}: referenced asset missing ${match[1]}`);
    assetsChecked++;
  }
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',').map(value => value.trim().split(/\s+/)[0])) {
      if (candidate.startsWith('http://') || candidate.startsWith('https://')) continue;
      const asset = path.join('dist', candidate.slice(1));
      if (!fs.existsSync(asset)) throw new Error(`${file}: responsive asset missing ${candidate}`);
      assetsChecked++;
    }
  }
}
for (const document of manifest.documents) {
  const file = path.join('dist', document.canonicalPath.slice(1), 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const body = JSON.parse(fs.readFileSync(path.join('src/content', document.bodyPath), 'utf8'));
  const firstParagraph = body.blocks.find(block => block.type === 'paragraph');
  if (!html.includes(escapeHtml(firstParagraph.text))) throw new Error(`${file}: first body paragraph was not server rendered`);
  if (!html.includes(escapeHtml(document.title))) throw new Error(`${file}: document title was not server rendered`);
}
const notFound = fs.readFileSync('dist/404.html', 'utf8');
if (!notFound.includes('<main') || !notFound.includes('name="robots" content="noindex,follow"')) throw new Error('dist/404.html is not a rendered noindex page');
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
for (const route of routes.filter(route => !route.noindex)) if (!sitemap.includes(`<loc>${site.origin}${route.path}</loc>`)) throw new Error(`sitemap missing ${route.path}`);
console.log(`Verified ${routes.length} prerendered routes, ${manifest.documents.length} complete stories, ${assetsChecked} asset references`);
