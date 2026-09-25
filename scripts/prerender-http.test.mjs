import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createStaticServer } from './serve-dist.mjs';

const catalog = JSON.parse(fs.readFileSync('src/content/data/routes.json', 'utf8'));
const redirects = catalog.redirects;
const manifest = JSON.parse(fs.readFileSync('src/content/data/manifest.json', 'utf8'));
const byPath = new Map(manifest.documents.map(document => [document.canonicalPath, document]));

test('static output serves complete HTML routes and a real 404 over HTTP', async () => {
  const server = createStaticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    for (const route of catalog.routes) {
      const response = await fetch(`${origin}${route.path}`);
      assert.equal(response.status, 200, route.path);
      const html = await response.text();
      assert.match(html, /<main\b/);
      const document = byPath.get(route.path);
      if (document) {
        const body = JSON.parse(fs.readFileSync(path.join('src/content', document.bodyPath), 'utf8'));
        const excerpt = body.blocks.find(block => block.type === 'paragraph').text;
        assert.ok(html.includes(excerpt.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')), `${route.path}: story text missing from raw HTTP response`);
      }
      assert.match(html, /<link rel="stylesheet" href="\/assets\//);
    }
    for (const [requested, canonical] of [
      ['/make?view=index', '/make'],
      ['/search?q=whistle', '/search'],
      ['/journal?category=making', '/journal'],
      ['/culture#phrase-1', '/culture'],
    ]) {
      const response = await fetch(`${origin}${requested}`);
      assert.equal(response.status, 200, requested);
      assert.equal(await response.text(), fs.readFileSync(path.join('dist', canonical.slice(1), 'index.html'), 'utf8'));
    }
    const clientScript = await fetch(`${origin}/assets/${fs.readdirSync('dist/assets').find(name => /^index-[^/]+\.js$/.test(name))}`);
    assert.equal(clientScript.status, 200);
    assert.match(clientScript.headers.get('content-type'), /text\/javascript/);
    const missing = await fetch(`${origin}/no-such-story`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /name="robots" content="noindex,follow"/);
    const editorial = await fetch(`${origin}/editorial`);
    assert.equal(editorial.status, 404);
    for (const redirect of redirects) {
      const moved = await fetch(`${origin}${redirect.source}`, { redirect: 'manual' });
      assert.equal(moved.status, 308, redirect.source);
      assert.equal(moved.headers.get('location'), redirect.destination);
      assert.ok(!moved.headers.get('location').includes('#'));
      const movedWithQuery = await fetch(`${origin}${redirect.source}?ref=old&view=full#section`, { redirect: 'manual' });
      assert.equal(movedWithQuery.status, 308, redirect.source);
      assert.equal(movedWithQuery.headers.get('location'), `${redirect.destination}?ref=old&view=full`);
    }
    const trailingSlash = await fetch(`${origin}/make/?view=index`, { redirect: 'manual' });
    assert.equal(trailingSlash.status, 308);
    assert.equal(trailingSlash.headers.get('location'), '/make?view=index');
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
