// Přiřadí každé lokalitě kraj podle souřadnic (point-in-polygon) z oficiálních
// hranic krajů (INSPIRE, CC-BY-4.0). Zapisuje pole "region" do datových souborů.
// Spustit po importech: node scripts/assign-regions.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const kraje = JSON.parse(readFileSync(join(dataDir, "kraje.geojson"), "utf8"));

// Ray casting na jednom prstenci ([lng,lat]).
function inRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Polygon s dírami: uvnitř vnějšího prstence a mimo všechny vnitřní (díry).
function inPolygon(pt, rings) {
  if (!inRing(pt, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) if (inRing(pt, rings[i])) return false;
  return true;
}

function regionFor(lng, lat) {
  const pt = [lng, lat];
  for (const f of kraje.features) {
    const g = f.geometry;
    if (g.type === "Polygon") {
      if (inPolygon(pt, g.coordinates)) return f.name;
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) if (inPolygon(pt, poly)) return f.name;
    }
  }
  return null;
}

function process(file) {
  const path = join(dataDir, file);
  const list = JSON.parse(readFileSync(path, "utf8"));
  let assigned = 0;
  for (const loc of list) {
    const r = regionFor(loc.lng, loc.lat);
    if (r) {
      loc.region = r;
      assigned++;
    }
  }
  writeFileSync(path, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`  ${file}: přiřazeno ${assigned}/${list.length}`);
}

console.log("Přiřazuji kraje podle souřadnic…");
for (const f of ["locations.sample.json", "locations.eea.json", "locations.osm.json"]) process(f);
console.log("Hotovo.");
