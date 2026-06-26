// Vyčistí URL (slug) lokalit: pryč s čísly z OSM/EEA ID.
// Slug = z názvu, při kolizi doplní obec, teprve pak pořadové číslo.
// Ruční (sample) slugy ponecháme. Spuštění: node scripts/clean-slugs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

function slugify(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\bu\b/g, " ") // vynech předložku „u" (Zatopený lom u Pavlova → zatopeny-lom-pavlova)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const taken = new Set();

function unique(base, municipality) {
  let s = base || "lokalita";
  if (!taken.has(s)) {
    taken.add(s);
    return s;
  }
  const withCity = municipality ? `${base}-${slugify(municipality)}` : "";
  if (withCity && !taken.has(withCity)) {
    taken.add(withCity);
    return withCity;
  }
  let i = 2;
  while (taken.has(`${s}-${i}`)) i++;
  s = `${s}-${i}`;
  taken.add(s);
  return s;
}

// 1) Ruční data – slugy ponecháme, jen je zarezervujeme.
const sample = JSON.parse(readFileSync(join(dataDir, "locations.sample.json"), "utf8"));
for (const l of sample) taken.add(l.slug);

// 2) EEA → OSM → kempy → příhraničí – přegenerujeme čisté a GLOBÁLNĚ unikátní slugy.
let changed = 0;
for (const fn of [
  "locations.eea.json",
  "locations.osm.json",
  "locations.kemp.json",
  "locations.border.json",
]) {
  const path = join(dataDir, fn);
  const list = JSON.parse(readFileSync(path, "utf8"));
  for (const l of list) {
    const old = l.slug;
    l.slug = unique(slugify(l.name), l.municipality);
    if (l.slug !== old) changed++;
  }
  writeFileSync(path, JSON.stringify(list, null, 2) + "\n", "utf8");
  console.log(`  ${fn}: ${list.length} slugů přegenerováno`);
}
console.log(`Hotovo. Změněno ${changed} slugů. Celkem unikátních: ${taken.size}.`);
