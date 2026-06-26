// Pošle seznam URL do IndexNow (Bing, Seznam.cz, Yandex) pro okamžité indexování.
// Klíč musí být veřejně dostupný na https://www.koupanivokoli.cz/<key>.txt
// Spuštění (až po nasazení): node scripts/indexnow.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const KEY = "0f3b9d2a7c1e4856b0d9f24a6e8c1357";
const HOST = "www.koupanivokoli.cz";
const BASE = `https://${HOST}`;

const REGION_SLUGS = [
  "praha", "stredocesky", "jihocesky", "plzensky", "karlovarsky", "ustecky",
  "liberecky", "kralovehradecky", "pardubicky", "vysocina", "jihomoravsky",
  "olomoucky", "moravskoslezsky", "zlinsky",
];

function loadSlugs() {
  const slugs = new Set();
  for (const fn of ["locations.sample.json", "locations.eea.json", "locations.osm.json"]) {
    for (const l of JSON.parse(readFileSync(join(dataDir, fn), "utf8"))) slugs.add(l.slug);
  }
  return [...slugs];
}

function allUrls() {
  const urls = [
    `${BASE}/`,
    `${BASE}/koupani`,
    `${BASE}/kvalita-vody`,
    `${BASE}/podminky`,
    `${BASE}/ochrana-udaju`,
    ...REGION_SLUGS.map((r) => `${BASE}/koupani/${r}`),
    ...loadSlugs().map((s) => `${BASE}/lokalita/${s}`),
  ];
  return urls;
}

async function submit(urlList) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList }),
  });
  return res.status;
}

async function main() {
  const urls = allUrls();
  console.log(`Odesílám ${urls.length} URL do IndexNow…`);
  for (let i = 0; i < urls.length; i += 10000) {
    const batch = urls.slice(i, i + 10000);
    const status = await submit(batch);
    console.log(`  dávka ${i / 10000 + 1}: ${batch.length} URL → HTTP ${status}`);
  }
  console.log("Hotovo. (200/202 = přijato.)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
