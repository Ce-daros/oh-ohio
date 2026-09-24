import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const html = readFileSync("dist/index.html", "utf8");
const worlds = JSON.parse(readFileSync("src/data/worlds.json", "utf8"));
const articles = [
  ...JSON.parse(readFileSync("src/data/journal-guides.json", "utf8")),
  ...JSON.parse(readFileSync("src/data/journal-features.json", "utf8")),
];
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const world of worlds) {
  const page = html.replace(/<title>.*?<\/title>/, `<title>${world.title} — Oh, Ohio</title>`).replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(world.tease)}" />`);
  for (const id of new Set([world.id, ...world.sources])) {
    mkdirSync(`dist/${id}`, { recursive: true });
    writeFileSync(`dist/${id}/index.html`, page);
  }
}
for (const article of [{ slug: "", title: "Field notes", dek: "Little adventures, things made here, and a seat at the table. Ohio stories with Ohio-chan." }, ...articles]) {
  const page = html.replace(/<title>.*?<\/title>/, `<title>${escape(article.title)} — Oh, Ohio</title>`).replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(article.dek)}" />`);
  const directory = `dist/journal${article.slug ? `/${article.slug}` : ""}`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/index.html`, page);
}
writeFileSync("dist/404.html", html);
