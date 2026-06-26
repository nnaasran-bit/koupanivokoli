// Přidá k lokalitám vybavení v okolí: kemp/tábořiště, stánky, občerstvení,
// WC, parkování. Jeden Overpass dotaz na celou ČR + lokální prostorové přiřazení
// (nedestruktivní – jen doplňuje pole `amenities`). Spuštění: node scripts/enrich-nearby.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const ENDPOINT = "https://overpass-api.de/api/interpreter";
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";

const QUERY = `
[out:json][timeout:300];
area["ISO3166-1"="CZ"][admin_level=2]->.cz;
(
  nwr["tourism"="camp_site"](area.cz);
  nwr["tourism"="caravan_site"](area.cz);
  nwr["shop"="kiosk"](area.cz);
  nwr["amenity"="fast_food"](area.cz);
  nwr["amenity"~"^(cafe|restaurant|bar|pub|biergarten|ice_cream)$"](area.cz);
  nwr["amenity"="toilets"](area.cz);
  nwr["amenity"="parking"](area.cz);
  nwr["amenity"="drinking_water"](area.cz);
);
out center tags;
`;

function coordsOf(el) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  return lat != null && lng != null ? { lat: +lat, lng: +lng } : null;
}
function amenityId(t) {
  if (t.tourism === "camp_site" || t.tourism === "caravan_site") return "kemp";
  if (t.shop === "kiosk") return "stanek";
  if (t.amenity === "fast_food") return "stanek";
  if (/^(cafe|restaurant|bar|pub|biergarten|ice_cream)$/.test(t.amenity || "")) return "obcerstveni";
  if (t.amenity === "toilets") return "wc";
  if (t.amenity === "parking") return "parkovani";
  if (t.amenity === "drinking_water") return "pitna_voda";
  return null;
}
function distM(a, b) {
  const dLat = (a.lat - b.lat) * 111320;
  const dLng = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}
// vzdálenosti: kemp širší (areál bývá větší)
const RADIUS = { kemp: 700, stanek: 300, obcerstveni: 300, wc: 350, parkovani: 400, pitna_voda: 350 };

function buildGrid(points, cell = 0.01) {
  const g = new Map();
  for (const p of points) {
    const key = `${Math.round(p.lat / cell)},${Math.round(p.lng / cell)}`;
    if (!g.has(key)) g.set(key, []);
    g.get(key).push(p);
  }
  return { g, cell };
}
function collect(grid, pt) {
  const { g, cell } = grid;
  const ci = Math.round(pt.lat / cell);
  const cj = Math.round(pt.lng / cell);
  const out = [];
  for (let di = -1; di <= 1; di++)
    for (let dj = -1; dj <= 1; dj++) {
      const arr = g.get(`${ci + di},${cj + dj}`);
      if (arr) out.push(...arr);
    }
  return out;
}

async function main() {
  console.log("Stahuji vybavení (kempy, stánky, občerstvení…) z OSM…");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA, Accept: "application/json" },
    body: "data=" + encodeURIComponent(QUERY),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();

  const points = [];
  for (const el of json.elements || []) {
    const c = coordsOf(el);
    const id = amenityId(el.tags || {});
    if (c && id) points.push({ ...c, id });
  }
  console.log(`  staženo ${points.length} bodů vybavení`);
  const grid = buildGrid(points);

  let total = 0;
  for (const fn of ["locations.sample.json", "locations.eea.json", "locations.osm.json"]) {
    const path = join(dataDir, fn);
    const list = JSON.parse(readFileSync(path, "utf8"));
    let updated = 0;
    for (const loc of list) {
      if (loc.type === "bazen") continue; // u bazénů okolní stánky neřešíme
      const found = new Set(loc.amenities || []);
      const before = found.size;
      for (const p of collect(grid, loc)) {
        if (distM(p, loc) <= (RADIUS[p.id] || 300)) found.add(p.id);
      }
      if (found.size > before) {
        loc.amenities = [...found];
        updated++;
      }
    }
    writeFileSync(path, JSON.stringify(list, null, 2) + "\n", "utf8");
    console.log(`  ${fn}: doplněno vybavení u ${updated} lokalit`);
    total += updated;
  }
  console.log(`Hotovo: ${total} lokalit doplněno o okolní vybavení (kemp/stánek/občerstvení…).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
