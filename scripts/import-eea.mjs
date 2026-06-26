// Importér oficiální kvality koupacích vod z dat EEA (WISE Bathing Water Directive).
// Zdroj: European Environment Agency, ArcGIS REST služba (countryCode='CZ').
// Klasifikace je roční (sezónní hodnocení dle směrnice 2006/7/ES).
// Spuštění: node scripts/import-eea.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "locations.eea.json");

const LAYER = "https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM/MapServer/0/query";
const FIELDS = [
  "bathingWaterName",
  "countryCode",
  "bwWaterCategory",
  "longitude",
  "latitude",
  "qualityStatus",
  "qualityStatus_minus1",
  "qualityStatus_minus2",
  "qualityStatus_minus3",
  "bathingWaterIdentifier",
  "bwProfileLink",
];

function url() {
  const p = new URLSearchParams({
    where: "countryCode='CZ'",
    outFields: FIELDS.join(","),
    returnGeometry: "false",
    resultRecordCount: "3000",
    f: "json",
  });
  return `${LAYER}?${p.toString()}`;
}

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ALL CAPS oficiální názvy zhezčíme na Title Case (VN = vodní nádrž ponecháme).
function pretty(name) {
  if (!name || name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => (w === "vn" ? "VN" : w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function classifyType(name, cat) {
  const n = (name || "").toLowerCase();
  if (n.includes("přehrad") || /\bvn\b/.test(n) || n.includes("nádrž")) return "prehrada";
  if (cat === "River") return "reka";
  if (cat === "Lake") return "jezero";
  return "koupaci_oblast";
}

function mapQuality(s) {
  switch ((s || "").toLowerCase()) {
    case "excellent":
      return "vyborna";
    case "good":
      return "vhodna";
    case "sufficient":
      return "zhorsena";
    case "poor":
      return "nevhodna";
    default:
      return "nesledovano";
  }
}

async function main() {
  console.log("Stahuji oficiální data EEA…");
  const res = await fetch(url(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "MapaKoupaniCR/0.1 (import; kontakt: jiri.karafiat@gmail.com)",
    },
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  const baseYear = parseInt(json.fieldAliases?.qualityStatus, 10) || new Date().getFullYear() - 1;
  const today = new Date().toISOString().slice(0, 10);

  const out = [];
  (json.features || []).forEach((feat, idx) => {
    const a = feat.attributes;
    const lat = +a.latitude;
    const lng = +a.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;

    const name = pretty(a.bathingWaterName) || "Koupací voda";
    const cls = mapQuality(a.qualityStatus);

    const history = [];
    [a.qualityStatus, a.qualityStatus_minus1, a.qualityStatus_minus2, a.qualityStatus_minus3].forEach(
      (v, i) => {
        const c = mapQuality(v);
        if (v && c !== "nesledovano") history.push({ date: `${baseYear - i}-09-15`, class: c });
      },
    );

    const sid = (a.bathingWaterIdentifier || `i${idx}`).replace(/[^a-z0-9]/gi, "").toLowerCase().slice(-8);

    out.push({
      id: `eea-${a.bathingWaterIdentifier || idx}`,
      slug: `${slugify(name)}-${sid}`,
      name,
      type: classifyType(a.bathingWaterName, a.bwWaterCategory),
      lat: +lat.toFixed(6),
      lng: +lng.toFixed(6),
      region: "",
      district: "",
      municipality: "",
      monitored: true,
      quality: {
        class: cls,
        sampledAt: `${baseYear}-09-15`,
        source: `EEA – koupací vody (sezóna ${baseYear})`,
        sourceUrl: a.bwProfileLink || "https://www.eea.europa.eu/en/topics/in-depth/bathing-water",
        trust: 5,
      },
      access: { status: "povoleno", source: "EEA / koupací vody" },
      ...(history.length ? { history } : {}),
      updatedAt: today,
    });
  });

  out.sort((x, y) => x.name.localeCompare(y.name, "cs"));
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Hotovo: ${out.length} oficiálních koupacích vod (sezóna ${baseYear}) → ${OUT}`);
}

main().catch((e) => {
  console.error("Import EEA selhal:", e);
  process.exit(1);
});
