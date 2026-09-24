import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const html = readFileSync("dist/index.html", "utf8");
const worlds = JSON.parse(readFileSync("src/data/worlds.json", "utf8"));
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const world of worlds) {
  const page = html.replace(/<title>.*?<\/title>/, `<title>${world.title} — Oh, Ohio</title>`).replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(world.tease)}" />`);
  for (const id of new Set([world.id, ...world.sources])) {
    mkdirSync(`dist/${id}`, { recursive: true });
    writeFileSync(`dist/${id}/index.html`, page);
  }
}
writeFileSync("dist/404.html", html);
