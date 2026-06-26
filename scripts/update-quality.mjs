// AUTOMATICKÁ aktualizace kvality vody z oficiálních dat EEA – BEZ ztráty obohacení.
// Aktualizuje jen quality.class / sampledAt / source u existujících EEA lokalit,
// dohledává je podle stabilního identifikátoru (bathingWaterIdentifier v poli id).
// Spouští se přes GitHub Actions (cron). Lokálně: node scripts/update-quality.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "locations.eea.json");
const LAYER =
  "https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM/MapServer/0/query";
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";

function mapQuality(s) {
  switch ((s || "").toLowerCase()) {
    case "excellent": return "vyborna";
    case "good": return "vhodna";
    case "sufficient": return "zhorsena";
    case "poor": return "nevhodna";
    default: return "nesledovano";
  }
}

async function main() {
  const params = new URLSearchParams({
    where: "countryCode='CZ'",
    outFields: "bathingWaterIdentifier,qualityStatus,qualityStatus_minus1,qualityStatus_minus2,qualityStatus_minus3",
    returnGeometry: "false",
    resultRecordCount: "3000",
    f: "json",
  });
  console.log("Stahuji aktuální klasifikaci z EEA…");
  const res = await fetch(`${LAYER}?${params}`, { headers: { Accept: "application/json", "User-Agent": UA } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  const baseYear = parseInt(json.fieldAliases?.qualityStatus, 10) || new Date().getFullYear() - 1;

  // Mapa identifikátor → aktuální klasifikace + historie
  const byId = new Map();
  for (const feat of json.features || []) {
    const a = feat.attributes;
    if (!a.bathingWaterIdentifier) continue;
    const history = [];
    [a.qualityStatus, a.qualityStatus_minus1, a.qualityStatus_minus2, a.qualityStatus_minus3].forEach((v, i) => {
      const c = mapQuality(v);
      if (v && c !== "nesledovano") history.push({ date: `${baseYear - i}-09-15`, class: c });
    });
    byId.set(a.bathingWaterIdentifier, { class: mapQuality(a.qualityStatus), history });
  }

  const list = JSON.parse(readFileSync(FILE, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  let updated = 0;
  for (const loc of list) {
    const id = (loc.id || "").replace(/^eea-/, "");
    const fresh = byId.get(id);
    if (!fresh) continue;
    const changed = loc.quality.class !== fresh.class;
    loc.quality.class = fresh.class;
    loc.quality.sampledAt = `${baseYear}-09-15`;
    loc.quality.source = `EEA – koupací vody (sezóna ${baseYear})`;
    if (fresh.history.length) loc.history = fresh.history;
    loc.updatedAt = today;
    if (changed) updated++;
  }

  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`Hotovo: sezóna ${baseYear}, změněna klasifikace u ${updated} lokalit (obohacení zachováno).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
