// Importér míst ke koupání z OpenStreetMap (Overpass API). Licence dat: ODbL.
// KVALITA NAD KVANTITOU: bereme jen místa se signálem koupání –
// vyhrazené koupací zóny, pláže, aquaparky, sportovní plavání, lomy/pískovny,
// a vodní plochy (jezero/přehrada/rybník) JEN když mají poblíž pláž/koupací zónu.
// K tomu dotahujeme vybavení (WC, parkování, občerstvení, pitná voda) z okolí.
// Spuštění: node scripts/import-osm.mjs
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

const QUERY = `
[out:json][timeout:300];
area["ISO3166-1"="CZ"][admin_level=2]->.cz;
(
  nwr["leisure"="swimming_area"](area.cz);
  nwr["natural"="beach"](area.cz);
  nwr["leisure"="water_park"](area.cz);
  nwr["sport"="swimming"]["leisure"!="sports_centre"](area.cz);
)->.swim;
(
  nwr["natural"="water"]["name"](area.cz);
  nwr["landuse"="quarry"]["name"](area.cz);
  nwr["landuse"="reservoir"]["name"](area.cz);
)->.water;
.swim out center tags;
.water out center tags;
(
  node["amenity"="toilets"](around.swim:350);
  node["amenity"="drinking_water"](around.swim:350);
  node["amenity"="parking"](around.swim:400);
  node["amenity"~"^(cafe|restaurant|fast_food|bar|pub|biergarten|ice_cream)$"](around.swim:350);
  node["shop"~"^(kiosk|convenience)$"](around.swim:350);
)->.am;
.am out center tags;
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

function pretty(name) {
  if (!name || name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => (w === "vn" ? "VN" : w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function coordsOf(el) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  return lat != null && lng != null ? { lat, lng } : null;
}

// metry mezi dvěma body (rychlá aproximace pro malé vzdálenosti v ČR)
function distM(a, b) {
  const dLat = (a.lat - b.lat) * 111320;
  const dLng = (a.lng - b.lng) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

// Prostorová mřížka pro rychlé hledání „je poblíž?" (buňka ~1.1 km)
function buildGrid(points, cell = 0.01) {
  const g = new Map();
  for (const p of points) {
    const key = `${Math.round(p.lat / cell)},${Math.round(p.lng / cell)}`;
    if (!g.has(key)) g.set(key, []);
    g.get(key).push(p);
  }
  return { g, cell };
}
function near(grid, pt, radiusM) {
  const { g, cell } = grid;
  const ci = Math.round(pt.lat / cell);
  const cj = Math.round(pt.lng / cell);
  for (let di = -1; di <= 1; di++)
    for (let dj = -1; dj <= 1; dj++) {
      const arr = g.get(`${ci + di},${cj + dj}`);
      if (!arr) continue;
      for (const p of arr) if (distM(pt, p) <= radiusM) return p;
    }
  return null;
}
function collect(grid, pt, radiusM) {
  const { g, cell } = grid;
  const ci = Math.round(pt.lat / cell);
  const cj = Math.round(pt.lng / cell);
  const out = [];
  for (let di = -1; di <= 1; di++)
    for (let dj = -1; dj <= 1; dj++) {
      const arr = g.get(`${ci + di},${cj + dj}`);
      if (!arr) continue;
      for (const p of arr) if (distM(pt, p) <= radiusM) out.push(p);
    }
  return out;
}

function amenityIds(tags) {
  const a = tags.amenity || "";
  const s = tags.shop || "";
  if (a === "toilets") return ["wc"];
  if (a === "drinking_water") return ["pitna_voda"];
  if (a === "parking") return ["parkovani"];
  if (/^(cafe|restaurant|fast_food|bar|pub|biergarten|ice_cream)$/.test(a)) return ["obcerstveni"];
  if (/^(kiosk|convenience)$/.test(s)) return ["obcerstveni"];
  return [];
}

function classify(t) {
  const name = (t.name || "").toLowerCase();
  if (name.includes("pískov") || name.includes("piskov")) return "piskovna";
  if (name.includes("lom") || name.includes("amerika")) return "lom";
  if (t.landuse === "quarry" || t.man_made === "quarry") return "lom";
  if (t.leisure === "water_park") return "koupaliste";
  if (t.sport === "swimming" || t.leisure === "swimming_pool") return "koupaliste";
  if (t.natural === "beach") return "prirodni_koupaliste";
  if (t.leisure === "swimming_area") return "prirodni_koupaliste";
  if (t.landuse === "reservoir") return "prehrada";
  if (t.natural === "water" || t.water) {
    if (t.water === "pond" || name.includes("rybník") || name.includes("rybnik")) return "rybnik";
    if (t.water === "reservoir" || t.water === "basin" || name.includes("přehrad")) return "prehrada";
    return "jezero";
  }
  return "neoficialni";
}

function accessFrom(t) {
  if (t.access === "private" || t.access === "no") {
    return {
      status: "omezeno",
      reason: "soukromý pozemek / omezený vstup",
      note: "Dle OpenStreetMap je vstup soukromý nebo omezený. Respektuj prosím zákaz vstupu.",
      source: "OpenStreetMap",
    };
  }
  return null;
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
            "User-Agent": "MapaKoupaniCR/0.2 (import; kontakt: info@koupanivokoli.cz)",
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

async function main() {
  const data = await fetchOverpass();
  const els = data.elements || [];

  // Roztřídění: koupací kotvy / vodní plochy / vybavení
  const swimAnchors = [];
  const waterBodies = [];
  const amenities = [];
  for (const el of els) {
    const t = el.tags || {};
    const c = coordsOf(el);
    if (!c) continue;
    if (t.amenity || t.shop) {
      const ids = amenityIds(t);
      if (ids.length) amenities.push({ ...c, ids });
      continue;
    }
    if (t.leisure === "swimming_area" || t.natural === "beach" || t.leisure === "water_park" || t.sport === "swimming") {
      swimAnchors.push({ ...c, el, t });
    } else {
      waterBodies.push({ ...c, el, t });
    }
  }

  const anchorGrid = buildGrid(swimAnchors);
  const amenityGrid = buildGrid(amenities);

  // Kandidáti: všechny koupací kotvy + lomy/pískovny (pojmenované) +
  // vodní plochy, které mají poblíž (≤400 m) pláž / koupací zónu.
  const candidates = [];
  for (const a of swimAnchors) candidates.push(a);
  for (const w of waterBodies) {
    const type = classify(w.t);
    const keep = type === "lom" || type === "piskovna" || near(anchorGrid, w, 400) != null;
    if (keep) candidates.push(w);
  }

  // Deduplikace: skóre kvality a pak zahození bližších duplicit (≤150 m)
  function score(t) {
    let s = 0;
    if (t.name) s += 5;
    if (t.leisure === "swimming_area") s += 4;
    if (t.leisure === "water_park" || t.sport === "swimming") s += 4;
    if (t.landuse === "quarry") s += 3;
    if (t.natural === "beach") s += 1;
    return s;
  }
  candidates.sort((x, y) => score(y.t) - score(x.t));
  const kept = [];
  const keptGrid = buildGrid([]);
  for (const c of candidates) {
    if (near(keptGrid, c, 150)) continue;
    kept.push(c);
    const key = `${Math.round(c.lat / keptGrid.cell)},${Math.round(c.lng / keptGrid.cell)}`;
    if (!keptGrid.g.has(key)) keptGrid.g.set(key, []);
    keptGrid.g.get(key).push(c);
  }

  const today = new Date().toISOString().slice(0, 10);
  const out = [];
  for (const c of kept) {
    const t = c.t;
    const name = pretty(t.name) || (t.natural === "beach" ? "Pláž" : "Koupání");
    if (!t.name && t.natural !== "beach") continue; // bez názvu jen pláže
    const type = classify(t);

    // Vybavení z OSM (okolí ≤ 250 m) + z vlastních tagů
    const set = new Set();
    for (const am of collect(amenityGrid, c, 250)) for (const id of am.ids) set.add(id);
    if (t.toilets === "yes") set.add("wc");
    if (t.drinking_water === "yes") set.add("pitna_voda");
    if (t.dog === "yes") set.add("psi");
    if (t.fee === "no") set.add("bez_vstupneho");
    const amenitiesArr = [...set];

    const access =
      accessFrom(t) ||
      (type === "koupaliste"
        ? { status: "povoleno", source: "OpenStreetMap" }
        : {
            status: "nezname",
            note: "Kvalita vody není oficiálně sledována – koupání na vlastní riziko.",
            source: "OpenStreetMap",
          });

    const since = t.start_date || t.opening_date || t["year_of_construction"] || undefined;

    out.push({
      id: `osm-${c.el.type}-${c.el.id}`,
      slug: `${slugify(name)}-osm${c.el.id}`,
      name,
      type,
      lat: +c.lat.toFixed(6),
      lng: +c.lng.toFixed(6),
      region: "",
      district: "",
      municipality: t["addr:city"] || t["addr:place"] || t["addr:village"] || "",
      monitored: false,
      quality: { class: "nesledovano", trust: 3, source: "OpenStreetMap" },
      access,
      ...(amenitiesArr.length ? { amenities: amenitiesArr } : {}),
      ...(since ? { since: String(since).slice(0, 10) } : {}),
      updatedAt: today,
    });
  }

  out.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(
    `Hotovo: ${out.length} míst ke koupání z OpenStreetMap (kvalitní výběr) → ${OUT}`,
  );
}

main().catch((e) => {
  console.error("Import selhal:", e);
  process.exit(1);
});
