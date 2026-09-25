import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = read('src/content/data/manifest.json');
const worlds = read('src/content/data/worlds.json');
const collections = read('src/content/data/collections.json');
const media = read('src/content/data/media.json');
const byId = new Map(manifest.documents.map(document => [document.id, document]));
const mediaById = new Map(media.map(item => [item.id, item]));

const routes = [
  { path: '/', kind: 'home', title: 'Oh, Ohio', description: 'Explore Ohio’s places, people, and culture with Ohio-chan.', image: '/art/scenes/explore.webp' },
  { path: '/journal', kind: 'journal', title: 'Field notes — Oh, Ohio', description: 'Little adventures, things made here, and a seat at the table.', image: '/art/scenes/culture.webp' },
  { path: '/topics', kind: 'topics', title: 'Topics — Oh, Ohio', description: 'Explore Ohio stories by topic.', image: '/art/scenes/explore.webp' },
  { path: '/search', kind: 'search', title: 'Search — Oh, Ohio', description: 'Search Ohio stories.', noindex: true },
  { path: '/saved', kind: 'saved', title: 'Saved stories — Oh, Ohio', description: 'Your saved Ohio stories.', noindex: true },
  ...worlds.map(world => ({ path: `/${world.id}`, kind: 'world', world: world.id, title: `${world.title} — Oh, Ohio`, description: world.tease, image: `/art/scenes/${world.id}.webp` })),
  ...collections.filter(collection => collection.kind === 'dossier').map(collection => ({
    path: `/topics/${collection.slug}`, kind: 'dossier', slug: collection.slug,
    title: `${collection.title} — Oh, Ohio`, description: collection.dek,
    image: mediaById.get(byId.get(collection.featuredId).coverMediaId).src,
  })),
  ...manifest.documents.map(document => ({
    path: document.canonicalPath, kind: 'content', slug: document.slug,
    title: `${document.title} — Oh, Ohio`, description: document.summary,
    image: document.kind === 'feature' ? mediaById.get(document.coverMediaId).src : `/art/scenes/${document.primaryWorld}.webp`,
  })),
];

const movedPages = [
  ['discover', 'explore'], ['travel', 'explore'], ['economy', 'make'], ['industry', 'make'],
  ['language', 'culture'], ['life', 'live'], ['government', 'live'],
];
const redirects = movedPages.map(([source, destination]) => ({ source: `/${source}`, destination: `/${destination}`, permanent: true }));
const catalog = { schemaVersion: 1, routes, redirects };
const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  trailingSlash: false,
  redirects,
};

const uniquePaths = new Set(routes.map(route => route.path));
if (uniquePaths.size !== routes.length) throw new Error('Route catalog contains duplicate public paths');
for (const redirect of redirects) if (uniquePaths.has(redirect.source) || !uniquePaths.has(redirect.destination)) throw new Error(`Invalid redirect ${redirect.source} -> ${redirect.destination}`);

for (const [file, value] of [['src/content/data/routes.json', catalog], ['vercel.json', vercel]]) {
  if (process.argv.includes('--check')) {
    const current = read(file);
    const expected = file === 'vercel.json'
      ? Object.fromEntries(Object.keys(vercel).map(key => [key, current[key]]))
      : current;
    if (JSON.stringify(expected) !== JSON.stringify(value)) throw new Error(`${file} is stale; run node scripts/route-catalog.mjs`);
  } else fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

console.log(`${process.argv.includes('--check') ? 'Checked' : 'Generated'} ${routes.length} public routes and ${redirects.length} redirects`);
