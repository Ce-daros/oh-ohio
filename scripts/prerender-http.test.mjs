import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve('dist');
const redirects = JSON.parse(fs.readFileSync('vercel.json', 'utf8')).redirects;

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const redirect = redirects.find(item => item.source === pathname);
  if (redirect) {
    response.writeHead(308, { Location: redirect.destination });
    response.end();
    return;
  }
  const target = path.resolve(root, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
  const file = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(fs.readFileSync(path.join(root, '404.html')));
    return;
  }
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(fs.readFileSync(file));
});

test('static output serves complete HTML routes and a real 404 over HTTP', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    for (const [route, expected] of [
      ['/', 'Ohio'],
      ['/journal/brass-whistle', 'Start with the brass'],
      ['/notes/north-coast', 'Much of northern Ohio'],
      ['/words/scioto', 'Scioto River'],
    ]) {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, route);
      const html = await response.text();
      assert.match(html, /<main\b/);
      assert.ok(html.includes(expected), `${route}: expected text missing from raw HTTP response`);
      assert.match(html, /<link rel="stylesheet" href="\/assets\//);
    }
    const missing = await fetch(`${origin}/no-such-story`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /name="robots" content="noindex,follow"/);
    const moved = await fetch(`${origin}/discover`, { redirect: 'manual' });
    assert.equal(moved.status, 308);
    assert.equal(moved.headers.get('location'), '/explore');
    assert.ok(!moved.headers.get('location').includes('#'));
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
