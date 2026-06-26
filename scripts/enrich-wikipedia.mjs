// Obohatí lokality o úvodní popis a fotku z Wikipedie (cs) podle polohy.
// Legální: text CC BY-SA, obrázky z Wikimedia Commons – uvádíme zdroj a odkaz.
// Spuštění: node scripts/enrich-wikipedia.mjs [typ]   (výchozí: lom)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
// Obohacujeme oba zdroje – oficiální (EEA) i OSM místa.
const FILES = ["locations.eea.json", "locations.osm.json"].map((f) => join(dataDir, f));
const TARGET_TYPE = process.argv[2] || "lom";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = "MapaKoupaniCR/0.3 (enrichment; kontakt: info@koupanivokoli.cz)";

function norm(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Najde nejbližší vhodný článek na cs.wikipedii v okolí bodu.
async function geosearch(lat, lng) {
  const u = `https://cs.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lng}&gsradius=1500&gslimit=6&format=json&origin=*`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("geosearch HTTP " + r.status);
  const j = await r.json();
  return j?.query?.geosearch || [];
}

// Načte úvodní text + náhledový obrázek článku.
async function summary(title) {
  const u = `https://cs.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return null;
  return r.json();
}

function pickArticle(loc, hits) {
  const n = norm(loc.name);
  // Preferuj článek, jehož název odpovídá lokalitě; jinak nejbližší do 600 m.
  const byName = hits.find((h) => {
    const t = norm(h.title);
    return t.includes(n) || n.includes(t);
  });
  if (byName) return byName;
  const near = hits.filter((h) => h.dist <= 600).sort((a, b) => a.dist - b.dist);
  return near[0] || null;
}

async function enrichFile(file) {
  const list = JSON.parse(readFileSync(file, "utf8"));
  const targets = list.filter((l) => l.type === TARGET_TYPE);
  if (targets.length === 0) return 0;
  console.log(`  ${file.split(/[\\/]/).pop()}: ${targets.length} lokalit typu „${TARGET_TYPE}"`);

  let enriched = 0;
  let i = 0;
  for (const loc of list) {
    if (loc.type !== TARGET_TYPE) continue;
    if (loc.photoUrl && loc.description) continue;
    i++;
    try {
      const hits = await geosearch(loc.lat, loc.lng);
      const art = pickArticle(loc, hits);
      if (art) {
        const s = await summary(art.title);
        if (s && s.type !== "disambiguation") {
          if (!loc.description && s.extract && s.extract.length > 40) loc.description = s.extract;
          if (!loc.photoUrl && s.thumbnail?.source) {
            loc.photoUrl = s.originalimage?.source || s.thumbnail.source;
            loc.photoCredit = `Wikipedie / ${art.title}`;
          }
          loc.wikiUrl = s.content_urls?.desktop?.page || `https://cs.wikipedia.org/wiki/${encodeURIComponent(art.title)}`;
          if (loc.description || loc.photoUrl) enriched++;
        }
      }
    } catch (e) {
      console.warn(`    ${loc.name}: ${e.message}`);
    }
    if (i % 25 === 0) console.log(`    …${i}/${targets.length} (obohaceno ${enriched})`);
    await sleep(250);
  }
  writeFileSync(file, JSON.stringify(list, null, 2) + "\n", "utf8");
  return enriched;
}

async function main() {
  console.log(`Obohacuji typ „${TARGET_TYPE}" z Wikipedie (oba zdroje)…`);
  let total = 0;
  for (const f of FILES) total += await enrichFile(f);
  console.log(`Hotovo: obohaceno celkem ${total} lokalit typu „${TARGET_TYPE}".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
