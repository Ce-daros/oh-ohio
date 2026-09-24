import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const html = readFileSync("dist/index.html", "utf8");
const worlds = JSON.parse(readFileSync("src/data/worlds.json", "utf8"));
const articles = [
  ...JSON.parse(readFileSync("src/data/journal-guides.json", "utf8")),
  ...JSON.parse(readFileSync("src/data/journal-features.json", "utf8")),
];
const origin = "https://oh-ohio.vercel.app";
const escape = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const paragraph = value => `<p>${escape(value)}</p>`;
const articleLink = article => `<li><a href="/journal/${escape(article.slug)}">${escape(article.title)}</a> — ${escape(article.dek)}</li>`;

function journalIndex() {
  return `<main id="main-content"><h1>Field notes.</h1><p>Good stories are worth staying for. The people, places, and little everyday things make Ohio feel like Ohio. I saved you a few favorites. ♡</p><section aria-labelledby="stories-title"><h2 id="stories-title">Pick a page. Stay awhile.</h2><ul>${articles.map(articleLink).join("")}</ul></section></main>`;
}

function journalArticle(article) {
  const sections = article.sections.map(section => `<section id="${escape(section.id)}"><h2>${escape(section.title)}</h2>${section.paragraphs.map(paragraph).join("")}</section>`).join("");
  const practical = article.practical.map(item => `<div><dt>${escape(item.label)}</dt><dd>${escape(item.text)}</dd></div>`).join("");
  const sources = article.sources.map(source => `<li><a href="${escape(source.url)}">${escape(source.label)}</a> — ${escape(source.kind)}</li>`).join("");
  const related = article.related.map(slug => articleLink(articles.find(item => item.slug === slug))).join("");
  return `<main id="main-content"><nav aria-label="Breadcrumb"><a href="/journal">Field notes</a></nav><article><header><h1>${escape(article.title)}</h1>${paragraph(article.dek)}<p>With Ohio-chan · ${escape(article.readTime)} · ${escape(article.duration)} · ${escape(article.location)}</p></header>${paragraph(article.intro)}${sections}<aside><h2>${escape(article.aside.title)}</h2>${paragraph(article.aside.text)}</aside><section><h2>${article.category === "guides" ? "Before we go." : "A little closer."}</h2><dl>${practical}</dl></section>${paragraph(article.signoff)}<section id="reading-sources"><h2>Reading &amp; sources</h2><ul>${sources}</ul></section></article><section><h2>Where to next?</h2><ul>${related}</ul><a href="/journal">All field notes</a></section></main>`;
}

function entryPage(title, description, path, content) {
  return html.replace(/<title>.*?<\/title>/, `<title>${escape(title)} — Oh, Ohio</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(description)}" />`)
    .replace("</head>", `<link rel="canonical" href="${origin}${path}" /></head>`)
    .replace('<div id="app"></div>', `<div id="app">${content}</div>`);
}
for (const world of worlds) {
  const page = html.replace(/<title>.*?<\/title>/, `<title>${world.title} — Oh, Ohio</title>`).replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(world.tease)}" />`);
  for (const id of new Set([world.id, ...world.sources])) {
    mkdirSync(`dist/${id}`, { recursive: true });
    writeFileSync(`dist/${id}/index.html`, page);
  }
}
for (const article of [{ slug: "", title: "Field notes", dek: "Little adventures, things made here, and a seat at the table. Ohio stories with Ohio-chan." }, ...articles]) {
  const path = `/journal${article.slug ? `/${article.slug}` : ""}`;
  const page = entryPage(article.title, article.dek, path, article.slug ? journalArticle(article) : journalIndex());
  const directory = `dist${path}`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/index.html`, page);
}
writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["/", "/journal", ...articles.map(article => `/journal/${article.slug}`)].map(path => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>`);
writeFileSync("dist/404.html", html);
