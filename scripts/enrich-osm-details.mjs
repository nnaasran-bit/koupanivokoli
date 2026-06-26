// Doplní k OSM lokalitám praktické info: vstupné (fee), oficiální web, otevírací
// dobu, telefon, provozovatele. Nedestruktivní – dohledává podle uloženého OSM ID,
// takže fotky/popisy z Wikipedie zůstávají. Spuštění: node scripts/enrich-osm-details.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "locations.osm.json");
const ENDPOINT = "https://overpass-api.de/api/interpreter";
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// id ve tvaru "osm-node-123" / "osm-way-456" / "osm-relation-789"
function parseId(id) {
  const m = /^osm-(node|way|relation)-(\d+)$/.exec(id || "");
  return m ? { kind: m[1], ref: m[2] } : null;
}

function feeText(t) {
  if (t.fee === "no" || t.fee === "free") return "zdarma";
  if (t.charge) return t.charge; // konkrétní cena
  if (t.fee === "yes") return "ano (vstupné)";
  return undefined;
}

async function fetchTags(ids) {
  const byKind = { node: [], way: [], relation: [] };
  for (const { kind, ref } of ids) byKind[kind].push(ref);
  const parts = [];
  for (const k of ["node", "way", "relation"]) {
    if (byKind[k].length) parts.push(`${k}(id:${byKind[k].join(",")});`);
  }
  const q = `[out:json][timeout:120];(${parts.join("")});out tags;`;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: "data=" + encodeURIComponent(q),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  const map = new Map();
  for (const el of json.elements || []) map.set(`${el.type}-${el.id}`, el.tags || {});
  return map;
}

async function main() {
  const list = JSON.parse(readFileSync(FILE, "utf8"));
  const withId = list.map((l) => ({ l, p: parseId(l.id) })).filter((x) => x.p);
  console.log(`Dohledávám detaily pro ${withId.length} OSM lokalit…`);

  let updated = 0;
  const BATCH = 250;
  for (let i = 0; i < withId.length; i += BATCH) {
    const chunk = withId.slice(i, i + BATCH);
    try {
      const tags = await fetchTags(chunk.map((x) => x.p));
      for (const { l, p } of chunk) {
        const t = tags.get(`${p.kind}-${p.ref}`);
        if (!t) continue;
        let changed = false;
        const web = t.website || t["contact:website"] || t.url;
        if (web && !l.website) { l.website = web.startsWith("http") ? web : `https://${web}`; changed = true; }
        if (t.opening_hours && !l.openingHours) { l.openingHours = t.opening_hours; changed = true; }
        const tel = t.phone || t["contact:phone"];
        if (tel && !l.phone) { l.phone = tel; changed = true; }
        if (t.operator && !l.operator) { l.operator = t.operator; changed = true; }
        const fee = feeText(t);
        if (fee && !l.fee) { l.fee = fee; changed = true; }
        if (changed) updated++;
      }
    } catch (e) {
      console.warn(`  dávka ${i}: ${e.message}`);
    }
    console.log(`  …${Math.min(i + BATCH, withId.length)}/${withId.length} (doplněno ${updated})`);
    await sleep(1500);
  }

  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`Hotovo: doplněno praktické info u ${updated} lokalit.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
