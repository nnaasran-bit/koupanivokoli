// Vrátí bazénům/aquaparkům jejich VLASTNÍ název z OSM (Aqualand Moravia, Aquapalace,
// Bospor…). Jen obecné názvy (Aquapark, Aquacentrum, Bazén) nechá jako „Bazén <obec>".
// Skutečný název znovu načte z OSM podle uloženého ID. Spuštění: node scripts/restore-pool-names.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "locations.osm.json");
const ENDPOINT = "https://overpass-api.de/api/interpreter";
const UA = "KoupaniVOkoli/0.3 (info@koupanivokoli.cz)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Obecná slova – pokud po jejich odebrání (a názvu obce) nic nezbyde, je název obecný.
const GENERIC =
  /\b(aquapark|akvapark|aquacentrum|akvacentrum|aquacentr|aquapalace|aqua|akva|centrum|bazén|bazen|bazény|koupaliště|koupaliste|plovárna|plovarna|krytý|kryty|letní|letni|venkovní|venkovni|vnitřní|vnitrni|městský|mestsky|městské|mestske|sportovní|sportovni|areál|areal|plavecký|plavecky|stadion|wellness|park|a\.s\.|s\.r\.o\.|spol)\b/gi;

function isGeneric(name, town) {
  let rest = " " + name.toLowerCase() + " ";
  rest = rest.replace(GENERIC, " ");
  if (town) rest = rest.replace(new RegExp(town.toLowerCase(), "g"), " ");
  rest = rest.replace(/[^a-záčďéěíňóřšťúůýž]+/gi, "").trim();
  return rest.length < 2;
}

function parseId(id) {
  const m = /^osm-(node|way|relation)-(\d+)$/.exec(id || "");
  return m ? { kind: m[1], ref: m[2] } : null;
}

async function fetchNames(ids) {
  const byKind = { node: [], way: [], relation: [] };
  for (const { kind, ref } of ids) byKind[kind].push(ref);
  const parts = [];
  for (const k of ["node", "way", "relation"]) if (byKind[k].length) parts.push(`${k}(id:${byKind[k].join(",")});`);
  const q = `[out:json][timeout:120];(${parts.join("")});out tags;`;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: "data=" + encodeURIComponent(q),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  const map = new Map();
  for (const el of json.elements || []) map.set(`${el.type}-${el.id}`, (el.tags || {}).name || null);
  return map;
}

async function main() {
  const list = JSON.parse(readFileSync(FILE, "utf8"));
  const pools = list.map((l) => ({ l, p: parseId(l.id) })).filter((x) => x.l.type === "bazen" && x.p);
  console.log(`Kontroluji vlastní názvy u ${pools.length} bazénů…`);

  let restored = 0;
  const BATCH = 200;
  for (let i = 0; i < pools.length; i += BATCH) {
    const chunk = pools.slice(i, i + BATCH);
    try {
      const names = await fetchNames(chunk.map((x) => x.p));
      for (const { l, p } of chunk) {
        const orig = names.get(`${p.kind}-${p.ref}`);
        if (!orig) continue;
        if (!isGeneric(orig, l.municipality)) {
          l.name = orig; // má vlastní název → vrať ho
          restored++;
        }
      }
    } catch (e) {
      console.warn(`  dávka ${i}: ${e.message}`);
    }
    console.log(`  …${Math.min(i + BATCH, pools.length)}/${pools.length} (obnoveno ${restored})`);
    await sleep(1500);
  }

  writeFileSync(FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`Hotovo: ${restored} bazénů má zpět vlastní název, ostatní zůstávají „Bazén <obec>".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
