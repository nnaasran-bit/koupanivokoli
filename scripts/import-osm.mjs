// Importér reálných míst ke koupání z OpenStreetMap přes Overpass API.
// Licence dat: ODbL (© OpenStreetMap přispěvatelé). Spuštění: node scripts/import-osm.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "locations.osm.json");

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Designovaná místa ke koupání + aquaparky + sportovní plavání v ČR.
const QUERY = `
[out:json][timeout:90];
area["ISO3166-1"="CZ"][admin_level=2]->.cz;
(
  nwr["leisure"="swimming_area"](area.cz);
  nwr["leisure"="water_park"](area.cz);
  nwr["sport"="swimming"]["leisure"!="sports_centre"](area.cz);
);
out center tags;
`;

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function classify(t) {
  if (t.landuse === "quarry" || t.man_made === "quarry") return "lom";
  if (t.leisure === "water_park") return "koupaliste";
  if (t.natural === "water" || t.water) {
    if (t.water === "pond") return "rybnik";
    if (t.water === "reservoir" || t.water === "basin") return "prehrada";
    return "jezero";
  }
  if (t.leisure === "swimming_pool" || t.sport === "swimming") return "koupaliste";
  if (t.leisure === "swimming_area") return "prirodni_koupaliste";
  return "neoficialni";
}

async function fetchOverpass() {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const url of ENDPOINTS) {
      try {
        console.log("Stahuji z", url, "…");
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": "MapaKoupaniCR/0.1 (import; kontakt: jiri.karafiat@gmail.com)",
          },
          body: "data=" + encodeURIComponent(QUERY),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
      } catch (e) {
        console.warn("  selhalo:", e.message);
        lastErr = e;
        await sleep(3000);
      }
    }
  }
  throw lastErr;
}

function toLocation(el, today) {
  const t = el.tags || {};
  if (!t.name) return null; // jen pojmenovaná místa (méně šumu)
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const type = classify(t);
  const access =
    type === "koupaliste"
      ? { status: "povoleno", source: "OpenStreetMap" }
      : {
          status: "nezname",
          note: "Kvalita vody není oficiálně sledována – koupání na vlastní riziko.",
          source: "OpenStreetMap",
        };

  return {
    id: `osm-${el.type}-${el.id}`,
    slug: `${slugify(t.name)}-osm${el.id}`,
    name: t.name,
    type,
    lat: +lat.toFixed(6),
    lng: +lng.toFixed(6),
    region: t["addr:region"] || "",
    district: "",
    municipality: t["addr:city"] || t["addr:place"] || t["addr:village"] || "",
    monitored: false,
    quality: { class: "nesledovano", trust: 3, source: "OpenStreetMap" },
    access,
    updatedAt: today,
  };
}

async function main() {
  const data = await fetchOverpass();
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const out = [];
  for (const el of data.elements || []) {
    const loc = toLocation(el, today);
    if (!loc) continue;
    const key = `${loc.lat.toFixed(3)},${loc.lng.toFixed(3)}`; // hrubá deduplikace
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(loc);
  }
  out.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Hotovo: ${out.length} lokalit z OpenStreetMap → ${OUT}`);
}

main().catch((e) => {
  console.error("Import selhal:", e);
  process.exit(1);
});
