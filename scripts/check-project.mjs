// Kontrollerer projektets filer, links, datafelter og JavaScript for kendte fejl.
import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

const requiredFiles = [
  "index.html",
  "udgivelser.html",
  "udgivelse.html",
  "om-kokon.html",
  "kontakt.html",
  "presse-materialer.html",
  "css/global.css",
  "css/layout.css",
  "css/styling.css",
  "js/navigation-tema.js",
  "js/home.js",
  "js/publication-detail.js",
  "js/publications.js",
  "supabase/migrations/202608280001_create_udgivelser.sql",
  "supabase/seed.sql",
];

for (const file of requiredFiles) await access(file);

const globalCss = await readFile("css/global.css", "utf8");
if (!globalCss.includes('url("./layout.css")') || !globalCss.includes('url("./styling.css")')) {
  throw new Error("global.css must load both layout.css and styling.css.");
}

const scripts = [
  "js/theme-init.js",
  "js/navigation-tema.js",
  "js/home.js",
  "js/supabase.js",
  "js/publications.js",
  "js/publication-detail.js",
];

for (const file of scripts) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${file}: ${result.stderr}`);
}

const allHtml = await Promise.all(
  requiredFiles.filter((file) => file.endsWith(".html")).map((file) => readFile(file, "utf8")),
);
const htmlFiles = requiredFiles.filter((file) => file.endsWith(".html"));

for (const [index, html] of allHtml.entries()) {
  if (!html.includes('<header class="sidehoved"')) throw new Error(`Missing static header in HTML file ${index + 1}`);
  if (!html.includes('<footer class="sidefod"')) throw new Error(`Missing static footer in HTML file ${index + 1}`);
  if (html.includes("<site-header") || html.includes("<site-footer")) throw new Error(`Unexpected Web Component placeholder in HTML file ${index + 1}`);
  if (/type=["']knap["']/i.test(html)) throw new Error(`Invalid translated button type in HTML file ${index + 1}`);
  if (!html.includes("theme-init.js")) throw new Error(`Missing early theme initialization in HTML file ${index + 1}`);
  if (!html.includes('rel="icon"')) throw new Error(`Missing favicon in HTML file ${index + 1}`);
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  if (images.some((image) => !/\balt=(?:"[^"]*"|'[^']*')/i.test(image))) {
    throw new Error(`An image is missing alt text in HTML file ${index + 1}`);
  }
}

for (const [index, html] of allHtml.entries()) {
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
    const cleanReference = reference.split(/[?#]/)[0];
    const localPath = cleanReference === "/" ? "index.html" : cleanReference.replace(/^\//, "");
    try { await access(join(process.cwd(), localPath)); }
    catch { throw new Error(`Missing local reference ${reference} in ${htmlFiles[index]}`); }
  }
}

const factFields = ["isbn", "sidetal", "format_bind", "sprog", "dansk_udgivelsesaar", "originaludgivelsesaar", "originaltitel"];
const seed = await readFile("supabase/seed.sql", "utf8");
const publicationSlugs = ["flaskepost-fra-helvede", "uegnet-som-menneske", "ti-naetters-droemme", "citronen", "vi-er-en-kat-del-1"];
for (const slug of publicationSlugs) {
  if (!seed.includes(`('${slug}'`)) throw new Error(`Supabase seed is missing publication: ${slug}`);
}
for (const assetPath of seed.matchAll(/'(\/assets\/images\/[^']+\.(?:webp|svg))'/g)) {
  await access(join(process.cwd(), assetPath[1].replace(/^\//, "")));
}

const migration = await readFile("supabase/migrations/202608280001_create_udgivelser.sql", "utf8");
const supabaseSource = await readFile("js/supabase.js", "utf8");
for (const field of ["forfatter_kilde", ...factFields]) {
  if (!migration.includes(field) || !supabaseSource.includes(field)) {
    throw new Error(`Supabase migration/select is missing ${field}.`);
  }
}
const detailSource = await readFile("js/publication-detail.js", "utf8");
if (!detailSource.includes("Mere om bogen") || !detailSource.includes('<dl class="bogfakta">')) {
  throw new Error("The shared detail template must contain the static book-facts definition list.");
}
if (detailSource.includes("Billeder og formidling") || !detailSource.includes("valid.length > 1")
  || !detailSource.includes("data-carousel-next") || !detailSource.includes("data-carousel-dot")
  || !detailSource.includes("initializeCarousels")) {
  throw new Error("Detail images must use the manual multi-image carousel with arrows and dots.");
}

const themeSource = await readFile("js/theme-init.js", "utf8");
function resolveTheme(storedTheme, systemIsDark) {
  const sandbox = {
    document: { documentElement: { dataset: {} } },
    localStorage: { getItem: () => storedTheme },
    matchMedia: () => ({ matches: systemIsDark }),
  };
  runInNewContext(themeSource, sandbox);
  return sandbox.document.documentElement.dataset;
}
const systemTheme = resolveTheme(null, true);
const systemLightTheme = resolveTheme(null, false);
const manualTheme = resolveTheme("light", true);
const manualDarkTheme = resolveTheme("dark", false);
if (systemTheme.theme !== "dark" || systemTheme.themePreference !== "system") {
  throw new Error("System theme preference is not initialized correctly.");
}
if (manualTheme.theme !== "light" || manualTheme.themePreference !== "light") {
  throw new Error("Saved manual theme preference is not initialized correctly.");
}
if (systemLightTheme.theme !== "light" || systemLightTheme.themePreference !== "system") {
  throw new Error("Light system theme preference is not initialized correctly.");
}
if (manualDarkTheme.theme !== "dark" || manualDarkTheme.themePreference !== "dark") {
  throw new Error("Saved dark theme preference is not initialized correctly.");
}

const contactHtml = await readFile("kontakt.html", "utf8");
if (/<form[\s>]/i.test(contactHtml)) throw new Error("Contact must remain a direct-email page without a form.");
if (!/href="mailto:[^"@\s]+@[^"@\s]+\.[^"\s]+"/i.test(contactHtml)) {
  throw new Error("Contact must contain a static mailto link.");
}

const redirectConfig = await readFile("netlify.toml", "utf8");
if (/\[\[redirects\]\]/i.test(redirectConfig)) throw new Error("Redirect rules are outside the approved implementation.");

const browserScripts = await Promise.all(scripts.map((file) => readFile(file, "utf8")));
const generatedConfig = await readFile("js/config.js", "utf8");
if ([...browserScripts, generatedConfig].some((source) => /sb_secret_|service[_-]?role/i.test(source))) {
  throw new Error("A service-role reference was found in browser JavaScript.");
}

console.log(`Checked ${requiredFiles.length} required files and ${scripts.length} JavaScript modules.`);
