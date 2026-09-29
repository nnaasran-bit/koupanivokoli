// Import živé teploty vody z otevřených dat ČHMÚ (opendata.chmi.cz/hydrology/now).
// Zdroj je veřejný a bezplatný. Parametr "TH" (teplota vody, °C) hlásí necelá
// polovina hydrologických stanic – ostatní přeskočíme. Necháváme syrový seznam
// stanic (nepárujeme na konkrétní lokality) – párování na nejbližší lokalitu
// (do X km) dělá až lib/watertemp.ts za běhu webu, ať zůstane vždy aktuální
// i když se lokality nebo prahová vzdálenost změní.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const META_URL = "https://opendata.chmi.cz/hydrology/now/metadata/meta1.json";
const DATA_BASE = "https://opendata.chmi.cz/hydrology/now/data/";
const OUT = fileURLToPath(new URL("../data/water-temperature.json", import.meta.url));
const UA = "koupanivokoli.cz bot (kontakt: bot@koupanivokoli.cz)";

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// Jednoduchý paralelní pool – 545 stanic najednou by ČHMÚ zbytečně zatížilo.
async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

async function main() {
  const meta = await fetchJson(META_URL);
  const header = meta.data.data.header.split(",");
  const col = (name) => header.indexOf(name);
  const iId = col("objID");
  const iName = col("STATION_NAME");
  const iRiver = col("STREAM_NAME");
  const iLat = col("GEOGR1");
  const iLng = col("GEOGR2");

  const stations = meta.data.data.values.map((row) => ({
    id: row[iId],
    name: row[iName],
    river: row[iRiver],
    lat: row[iLat],
    lng: row[iLng],
  }));

  const results = await mapPool(stations, 15, async (s) => {
    try {
      const d = await fetchJson(`${DATA_BASE}${s.id}.json`);
      const th = d.objList?.[0]?.tsList?.find((t) => t.tsConID === "TH");
      const last = th?.tsData?.length ? th.tsData[th.tsData.length - 1] : null;
      if (!last || typeof last.value !== "number") return null;
      return {
        stationId: s.id,
        name: s.name,
        river: s.river,
        lat: s.lat,
        lng: s.lng,
        tempC: last.value,
        measuredAt: last.dt,
      };
    } catch {
      return null; // jedna nedostupná stanice nesmí shodit celý import
    }
  });

  const out = results
    .filter((r) => r !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "cs"));

  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Hotovo: teplota vody z ${out.length}/${stations.length} stanic ČHMÚ → ${OUT}`);
}

main().catch((e) => {
  console.error("Import teploty vody selhal:", e);
  process.exit(1);
});
