// Importér koupacích míst v příhraničí – do ~50 km ZA hranicemi ČR (DE/AT/PL/SK).
// Bere jen vyhrazená koupací místa (pláž, koupací zóna, aquapark, sportovní plavání),
// pouze MIMO ČR a do 50 km od české hranice. Licence OSM: ODbL.
// Spuštění: node scripts/import-osm-border.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const OUT = join(dataDir, "locations.border.json");
const ENDPOINT = "https://overpass-api.de/api/interpreter";
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";
const MAX_KM = 50;

// Rozšířený bbox kolem ČR (~+0.6° ≈ 50–65 km). [jih, západ, sever, východ]
const BBOX = "48.0,11.4,51.65,19.5";

const QUERY = `
[out:json][timeout:240];
(
  nwr["leisure"="swimming_area"](${BBOX});
  nwr["natural"="beach"](${BBOX});
  nwr["leisure"="water_park"](${BBOX});
  nwr["sport"="swimming"]["leisure"!="sports_centre"](${BBOX});
);
out center tags;
`;

const kraje = JSON.parse(readFileSync(join(dataDir, "kraje.geojson"), "utf8"));

function slugify(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/\bu\b/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}

// Ray casting (point v polygonu) na [lng,lat] prstenci.
function inRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inCZ(lng, lat) {
  const pt = [lng, lat];
  for (const f of kraje.features) {
    const g = f.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) if (inRing(pt, poly[0])) return true;
  }
  return false;
}

// Vzdálenost bodu od úsečky v km (equirektangulární aproximace pro ČR).
function segDistKm(plat, plng, alat, alng, blat, blng) {
  const k = 111;
  const cos = Math.cos((plat * Math.PI) / 180);
  const px = plng * k * cos, py = plat * k;
  const ax = alng * k * cos, ay = alat * k;
  const bx = blng * k * cos, by = blat * k;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}
function distToCZBorderKm(lat, lng) {
  let min = Infinity;
  for (const f of kraje.features) {
    const g = f.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      const ring = poly[0];
      for (let i = 0; i < ring.length - 1; i++) {
        const d = segDistKm(lat, lng, ring[i][1], ring[i][0], ring[i + 1][1], ring[i + 1][0]);
        if (d < min) min = d;
        if (min < 0.5) return min;
      }
    }
  }
  return min;
}

function classify(t) {
  if (t.leisure === "water_park" || t.sport === "swimming" || t.leisure === "swimming_pool") return "bazen";
  if (t.natural === "beach") return "prirodni_koupaliste";
  if (t.leisure === "swimming_area") return "prirodni_koupaliste";
  return "neoficialni";
}

async function main() {
  console.log("Stahuji příhraniční koupací místa z OSM…");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA, Accept: "application/json" },
    body: "data=" + encodeURIComponent(QUERY),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  const today = new Date().toISOString().slice(0, 10);

  const out = [];
  const seen = new Set();
  let checked = 0;
  for (const el of json.elements || []) {
    const t = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;
    if (!t.name && t.natural !== "beach") continue;
    if (inCZ(lng, lat)) continue; // ČR už máme
    checked++;
    if (distToCZBorderKm(lat, lng) > MAX_KM) continue; // jen do 50 km od hranice

    const key = `${(+lat).toFixed(3)},${(+lng).toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const name = t.name || "Pláž";
    out.push({
      id: `osm-${el.type}-${el.id}`,
      slug: slugify(name),
      name,
      type: classify(t),
      lat: +(+lat).toFixed(6),
      lng: +(+lng).toFixed(6),
      region: "Příhraničí (mimo ČR)",
      district: "",
      municipality: t["addr:city"] || "",
      monitored: false,
      quality: { class: "nesledovano", trust: 3, source: "OpenStreetMap" },
      access: {
        status: "nezname",
        note: "Místo za hranicemi ČR (do 50 km). Kvalita vody není sledována českými úřady.",
        source: "OpenStreetMap",
      },
      abroad: true,
      updatedAt: today,
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Hotovo: ${out.length} příhraničních míst (z ${checked} mimo ČR) → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
