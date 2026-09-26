import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createStaticServer } from './serve-dist.mjs';
import { computeCatalog } from './lib/content.mjs';

const catalog = computeCatalog(process.cwd()).catalog;

// HTTP-layer checks only: which file a route serves, its headers,
// redirects, and error handling. The content of the prerendered pages
// (head tags, story text, assets) is verified against the files by
// prerender-verify.mjs during the build.
let server;
let origin;

before(async () => {
  server = createStaticServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve, reject) => server.close(error => (error ? reject(error) : resolve()))));

test('serves prerendered routes and resolves queries to the same file', async () => {
  for (const routePath of ['/', '/journal', '/notes/north-coast', '/topics']) {
    const response = await fetch(`${origin}${routePath}`);
    assert.equal(response.status, 200, routePath);
    assert.match(await response.text(), /<link rel="stylesheet" href="\/assets\//);
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
});

test('issues permanent redirects that preserve query strings', async () => {
  for (const redirect of catalog.redirects) {
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
});

test('returns a real noindex 404 for unknown and editorial routes', async () => {
  for (const missingPath of ['/no-such-story', '/editorial']) {
    const response = await fetch(`${origin}${missingPath}`);
    assert.equal(response.status, 404, missingPath);
    assert.match(await response.text(), /name="robots" content="noindex,follow"/);
  }
});
