// Sjednotí skutečné duplikáty: stejný typ + (skoro) stejný název do 600 m.
// Z dvojice ponechá bohatší záznam (fotka, popis, vybavení, sledováno).
// Mezisousedí různých typů (kemp u jezera) nechává být. Spuštění: node scripts/dedup.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const norm = (s) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/\b(koupaliste|koupaci oblast|plaz|rybnik|prehrada|jezero|lom|piskovna)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

function dKm(a, b) {
  const dLat = (a.lat - b.lat) * 111.32;
  const dLng = (a.lng - b.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}
function richness(l) {
  return (l.photoUrl ? 4 : 0) + (l.description ? 3 : 0) + (l.amenities?.length ?? 0) + (l.monitored ? 5 : 0) + (l.website ? 1 : 0);
}

function dedupeFile(file) {
  const list = JSON.parse(readFileSync(file, "utf8"));
  const kept = [];
  const dropped = [];
  // řadíme od nejbohatších, ať zůstává ten lepší
  const sorted = [...list].sort((a, b) => richness(b) - richness(a));
  for (const l of sorted) {
    const key = norm(l.name);
    const dup = key && kept.find((k) => k.type === l.type && norm(k.name) === key && dKm(k, l) < 0.6);
    if (dup) dropped.push(l);
    else kept.push(l);
  }
  // zachovej původní pořadí (podle původního indexu)
  const order = new Map(list.map((l, i) => [l, i]));
  kept.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  writeFileSync(file, JSON.stringify(kept, null, 2) + "\n", "utf8");
  console.log(`  ${file.split(/[\\/]/).pop()}: ${list.length} → ${kept.length} (sjednoceno ${dropped.length})`);
  return dropped.length;
}

console.log("Sjednocuji duplikáty (stejný typ + název do 600 m)…");
let total = 0;
for (const fn of ["locations.osm.json", "locations.kemp.json", "locations.border.json"]) {
  total += dedupeFile(join(dataDir, fn));
}
console.log(`Hotovo. Sjednoceno celkem ${total} duplikátů.`);
