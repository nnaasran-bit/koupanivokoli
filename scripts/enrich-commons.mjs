// Najde fotku místa podle GPS na Wikimedia Commons (geotagged fotky).
// Legální: obrázky pod volnou licencí, ukládáme URL + autora + odkaz.
// Doplňuje jen místa bez fotky. Spuštění: node scripts/enrich-commons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const FILES = ["locations.eea.json", "locations.osm.json"].map((f) => join(dataDir, f));
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHtml(s) {
  return (s || "").replace(/<[^>]*>/g, "").trim();
}

// Geosearch fotek na Commons + jejich URL a metadata v jednom dotazu.
async function findPhoto(lat, lng) {
  const u =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=geosearch&ggscoord=${lat}|${lng}&ggsradius=300&ggsnamespace=6&ggslimit=12` +
    `&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1000`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  // seřaď podle vzdálenosti (index z geosearch) – bereme první vhodnou fotku
  const sorted = pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  for (const p of sorted) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if (!/^image\/(jpeg|png)$/.test(ii.mime || "")) continue; // jen fotky, ne mapy/SVG
    const meta = ii.extmetadata || {};
    const title = (p.title || "").toLowerCase();
    if (/(map|mapa|diagram|logo|coat of arms|znak|plan)/.test(title)) continue;
    const author = stripHtml(meta.Artist?.value) || "Wikimedia Commons";
    const license = stripHtml(meta.LicenseShortName?.value) || "";
    return {
      url: ii.thumburl || ii.url,
      credit: `${author}${license ? ` (${license})` : ""} / Wikimedia Commons`,
      page: ii.descriptionurl,
    };
  }
  return null;
}

async function enrichFile(file) {
  const list = JSON.parse(readFileSync(file, "utf8"));
  const targets = list.filter((l) => !l.photoUrl && l.type !== "bazen" && l.type !== "kemp");
  console.log(`  ${file.split(/[\\/]/).pop()}: ${targets.length} bez fotky`);
  let added = 0;
  let i = 0;
  for (const loc of list) {
    if (loc.photoUrl || loc.type === "bazen" || loc.type === "kemp") continue;
    i++;
    try {
      const photo = await findPhoto(loc.lat, loc.lng);
      if (photo) {
        loc.photoUrl = photo.url;
        loc.photoCredit = photo.credit;
        if (!loc.wikiUrl && photo.page) loc.wikiUrl = photo.page;
        added++;
      }
      await sleep(200);
    } catch (e) {
      console.warn(`    ${loc.name}: ${e.message}`);
      await sleep(500);
    }
    if (i % 50 === 0) console.log(`    …${i}/${targets.length} (přidáno ${added})`);
  }
  writeFileSync(file, JSON.stringify(list, null, 2) + "\n", "utf8");
  return added;
}

async function main() {
  console.log("Hledám fotky míst na Wikimedia Commons (podle GPS)…");
  let total = 0;
  for (const f of FILES) total += await enrichFile(f);
  console.log(`Hotovo: přidáno ${total} fotek z Commons.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
