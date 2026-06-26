// Importér kempů a tábořišť z OpenStreetMap (vč. vodáckých). Licence ODbL.
// Ukládá do samostatného souboru locations.kemp.json (neovlivní obohacení koupání).
// Spuštění: node scripts/import-camps.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "locations.kemp.json");
const ENDPOINT = "https://overpass-api.de/api/interpreter";
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";

const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="CZ"][admin_level=2]->.cz;
(
  nwr["tourism"="camp_site"]["name"](area.cz);
  nwr["tourism"="caravan_site"]["name"](area.cz);
);
out center tags;
`;

function slugify(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/\bu\b/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}

async function main() {
  console.log("Stahuji kempy z OpenStreetMap…");
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
  for (const el of json.elements || []) {
    const t = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!t.name || lat == null || lng == null) continue;
    const key = `${(+lat).toFixed(3)},${(+lng).toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const web = t.website || t["contact:website"] || t.url;
    out.push({
      id: `osm-${el.type}-${el.id}`,
      slug: slugify(t.name),
      name: t.name,
      type: "kemp",
      lat: +(+lat).toFixed(6),
      lng: +(+lng).toFixed(6),
      region: "",
      district: "",
      municipality: t["addr:city"] || t["addr:village"] || "",
      monitored: false,
      quality: { class: "nesledovano", trust: 3, source: "OpenStreetMap" },
      access: { status: "povoleno", source: "OpenStreetMap" },
      ...(web ? { website: web.startsWith("http") ? web : `https://${web}` } : {}),
      ...(t.phone || t["contact:phone"] ? { phone: t.phone || t["contact:phone"] } : {}),
      ...(t.operator ? { operator: t.operator } : {}),
      updatedAt: today,
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Hotovo: ${out.length} kempů → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
