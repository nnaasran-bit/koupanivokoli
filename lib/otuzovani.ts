import type { Location, LocationType } from "./types";

// Otužování = zimní doplněk ke stejné mapě koupacích míst. Nejde o samostatnou
// databázi – naprostá většina přírodních vod se v zimě reálně používá k
// otužování stejně jako v létě ke koupání. Odlišujeme jen typy, které jsou
// SEZÓNNÍ ZAŘÍZENÍ (placený vstup, vypouštění/zavírání na zimu) – ty v zimě
// prakticky nejdou použít:
//   - koupaliste: provozovaný areál, přes zimu zavřený/vypuštěný
//   - bazen: vytápěná/chlorovaná voda, aquapark – mimo téma otužování v přírodě
//   - kemp: není vodní plocha, jen tábořiště
// Naopak "prirodni_koupaliste" necháváme – jde o přírodní vodu (jezero/řeka),
// mimo sezónu bez plotu a bez dozoru, ale fyzicky stále přístupnou.
export const WINTER_TYPES: LocationType[] = [
  "reka",
  "jezero",
  "prehrada",
  "rybnik",
  "lom",
  "piskovna",
  "biotop",
  "koupaci_oblast",
  "prirodni_koupaliste",
];

// Místo je "vhodné k posouzení pro otužování", pokud jde o přírodní vodní
// plochu bez právního zákazu vstupu. Nejde o tvrzení, že místo je bezpečné –
// to se v zimě navíc řídí i podmínkami, které nemáme (led, proud, teplota).
export function isOtuzovaniVhodne(l: Location): boolean {
  if (!WINTER_TYPES.includes(l.type)) return false;
  if (l.access.status === "zakazano") return false;
  return true;
}

export const OTUZOVANI_TYPE_GROUPS: { label: string; types: LocationType[] }[] = [
  { label: "Řeky", types: ["reka"] },
  { label: "Jezera, lomy, pískovny", types: ["jezero", "lom", "piskovna"] },
  { label: "Rybníky a přehrady", types: ["rybnik", "prehrada"] },
  { label: "Přírodní koupaliště a biotopy", types: ["prirodni_koupaliste", "biotop", "koupaci_oblast"] },
];

export const otuzovaniLocations = (all: Location[]): Location[] => all.filter(isOtuzovaniVhodne);
