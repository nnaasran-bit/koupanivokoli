// Pojmenuje bazény/aquaparky jednotně „Bazén <obec>" a doplní obec podle
// souřadnic (reverse geocoding přes Nominatim/OSM). Původní název uloží do `operator`,
// pokud tam nic není (kvůli dohledatelnosti). Spuštění: node scripts/name-pools.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "locations.osm.json");
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function reverseTown(lat, lng) {
  const u = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=14&addressdetails=1&accept-language=cs`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  const a = j.address || {};
  return a.city || a.town || a.village || a.municipality || a.suburb || a.county || null;
}

async function main() {
  const list = JSON.parse(readFileSync(FILE, "utf8"));
  const pools = list.filter((l) => l.type === "bazen");
  console.log(`Pojmenovávám ${pools.length} bazénů…`);

  let i = 0;
  let named = 0;
  for (const l of pools) {
    i++;
    let town = l.municipality;
    if (!town) {
      try {
        town = await reverseTown(l.lat, l.lng);
        if (town) l.municipality = town;
        await sleep(1100); // Nominatim: max 1 req/s
      } catch (e) {
        console.warn(`  ${l.name}: ${e.message}`);
        await sleep(1500);
      }
    }
    if (town) {
      // Původní název zachováme jako provozovatele, ať se neztratí.
      if (!l.operator && l.name && !/^bazén/i.test(l.name)) l.operator = l.name;
      l.name = `Bazén ${town}`;
      named++;
    }
    if (i % 25 === 0) console.log(`  …${i}/${pools.length} (pojmenováno ${named})`);
  }

  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`Hotovo: pojmenováno ${named} bazénů ve tvaru „Bazén <obec>".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
