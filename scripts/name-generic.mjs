// Pojmenuje místa s obecným názvem (Lom, Pláž, Jezero…) podle nejbližší
// vesnice/obce: „Zatopený lom u Pavlova". Obec doplní reverse geocodingem (Nominatim).
// Spuštění: node scripts/name-generic.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "locations.osm.json");
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const GENERIC = /^(lom|zatopený lom|zatopeny lom|jezero|koupaliště|koupaliste|pláž|plaz|rybník|rybnik|pískovna|piskovna|přehrada|prehrada|nádrž|vodní nádrž|biotop)$/i;

// Sjednocení obecného slova na hezký tvar.
function displayGeneric(name) {
  const n = name.trim().toLowerCase();
  if (n === "lom" || n === "zatopený lom" || n === "zatopeny lom") return "Zatopený lom";
  if (n === "pláž" || n === "plaz") return "Pláž";
  if (n === "jezero") return "Jezero";
  if (n === "koupaliště" || n === "koupaliste") return "Koupaliště";
  if (n === "rybník" || n === "rybnik") return "Rybník";
  if (n === "pískovna" || n === "piskovna") return "Pískovna";
  if (n === "přehrada" || n === "prehrada" || n === "nádrž" || n === "vodní nádrž") return "Přehrada";
  if (n === "biotop") return "Biotop";
  return name.trim();
}

async function reverseVillage(lat, lng) {
  const u = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=16&addressdetails=1&accept-language=cs`;
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const a = (await r.json()).address || {};
  return a.village || a.hamlet || a.town || a.suburb || a.city || a.municipality || null;
}

async function main() {
  const list = JSON.parse(readFileSync(FILE, "utf8"));
  const targets = list.filter((l) => GENERIC.test(l.name.trim()));
  console.log(`Pojmenovávám ${targets.length} míst s obecným názvem…`);

  let i = 0;
  let named = 0;
  for (const l of targets) {
    i++;
    try {
      const village = await reverseVillage(l.lat, l.lng);
      if (village) {
        l.name = `${displayGeneric(l.name)} u ${village}`;
        if (!l.municipality) l.municipality = village;
        named++;
      }
      await sleep(1100);
    } catch (e) {
      console.warn(`  ${l.name}: ${e.message}`);
      await sleep(1500);
    }
    if (i % 25 === 0) console.log(`  …${i}/${targets.length} (pojmenováno ${named})`);
  }

  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`Hotovo: pojmenováno ${named} míst podle nejbližší vesnice.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
