import fs from 'node:fs';

const media = JSON.parse(fs.readFileSync('src/content/data/media.json', 'utf8'));
const remote = media.flatMap(item => [item.src, ...(item.variants?.map(variant => variant.src) ?? [])]
  .filter(src => src.startsWith('http://') || src.startsWith('https://'))
  .map(src => ({ id: item.id, src })));

for (const item of remote) {
  const response = await fetch(item.src, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${item.id}: remote media HEAD returned ${response.status} for ${item.src}`);
  console.log(`${item.id}: ${response.status} ${response.headers.get('content-type')}`);
}

console.log(`Checked ${remote.length} remote media URLs`);
