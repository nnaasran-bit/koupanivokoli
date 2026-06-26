import type { AccessStatus, LocationType, QualityClass } from "./types";

// Barvy podle zadání: modrá výborná, zelená vhodná, žlutá zhoršená,
// červená nevhodná, černá zákaz koupání, šedá nesledováno.
export const QUALITY_COLORS: Record<QualityClass, string> = {
  vyborna: "#2563eb",
  vhodna: "#16a34a",
  zhorsena: "#eab308",
  nevhodna: "#dc2626",
  zakaz_koupani: "#111827",
  nesledovano: "#9ca3af",
};

export const QUALITY_LABELS: Record<QualityClass, string> = {
  vyborna: "Voda výborná",
  vhodna: "Voda vhodná ke koupání",
  zhorsena: "Zhoršená kvalita vody",
  nevhodna: "Voda nevhodná ke koupání",
  zakaz_koupani: "Zákaz koupání (zdravotní)",
  nesledovano: "Nesledováno – na vlastní riziko",
};

export const ACCESS_LABELS: Record<AccessStatus, string> = {
  povoleno: "Přístup povolený",
  omezeno: "Přístup omezený",
  zakazano: "Zákaz vstupu / koupání",
  nezname: "Přístup neznámý",
};

export const TYPE_LABELS: Record<LocationType, string> = {
  koupaliste: "Koupaliště",
  prirodni_koupaliste: "Přírodní koupaliště",
  koupaci_oblast: "Koupací oblast",
  lom: "Lom",
  piskovna: "Pískovna",
  rybnik: "Rybník",
  jezero: "Jezero",
  prehrada: "Přehrada",
  reka: "Řeka",
  biotop: "Biotop",
  bazen: "Bazén / aquapark",
  neoficialni: "Neoficiální místo",
};

// Bazény a aquaparky = umělá (chlorovaná) voda → odlišíme fialovou,
// barvou, která se k přírodní vodě nehodí.
export const POOL_COLOR = "#a855f7";

export type FreshnessLevel = "fresh" | "recent" | "old" | "none";

// Stáří informace – jeden z hlavních diferenciátorů: uživatel hned vidí, jak čerstvé je hodnocení.
export function freshness(sampledAt?: string): { label: string; level: FreshnessLevel } {
  if (!sampledAt) return { label: "bez data", level: "none" };
  const days = Math.floor((Date.now() - new Date(sampledAt).getTime()) / 86_400_000);
  if (days <= 0) return { label: "aktuální (dnes)", level: "fresh" };
  if (days === 1) return { label: "včera", level: "fresh" };
  if (days <= 7) return { label: `před ${days} dny`, level: "recent" };
  if (days <= 31) return { label: `před ${days} dny`, level: "old" };
  return { label: `starší (${days} dní)`, level: "old" };
}

export function formatDateCz(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}
