// Inlines the above-the-fold CSS of every prerendered page so first
// paint doesn't wait on the stylesheet round-trip (LCP). Runs as a build
// step after prerender.mjs and before prerender-verify.mjs.
//
// Stylesheet <link> tags are kept (reduceInlineStyles: false): the page
// loads the full CSS as before, the inline copy only removes the
// blocking dependency on it. The one critters warning about `:global`
// selectors is expected — those rules are Vue scoped-CSS helpers and
// remain in the linked stylesheet.
import fs from 'node:fs';
import path from 'node:path';
import Critters from 'critters';

const dist = path.join(process.cwd(), 'dist');
const critters = new Critters({ path: dist, reduceInlineStyles: false, logLevel: 'error' });

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(child);
    else if (entry.name.endsWith('.html')) yield child;
  }
}

let inlined = 0;
for (const file of htmlFiles(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  const next = await critters.process(html);
  if (next !== html) {
    fs.writeFileSync(file, next);
    inlined++;
  }
}
console.log(`Inlined critical CSS in ${inlined} pages`);
