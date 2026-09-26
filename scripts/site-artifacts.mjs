import fs from 'node:fs';

export function buildSitemap(routes, origin) {
  const xmlEscape = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const urls = routes
    .filter(route => !route.noindex)
    .map(route => `<url><loc>${xmlEscape(`${origin}${route.path}`)}</loc></url>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function buildRobots(origin) {
  return `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
}

if (process.argv.includes('--write-robots')) {
  const site = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
  fs.writeFileSync('public/robots.txt', buildRobots(site.origin));
  console.log('Updated public/robots.txt');
}
