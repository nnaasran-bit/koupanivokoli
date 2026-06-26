import type { Location, LocationType, QualityClass } from "./types";

export interface Filters {
  query: string;
  types: LocationType[]; // prázdné = všechny typy
  monitoredOnly: boolean; // jen oficiálně sledované
  suitableToday: boolean; // vhodné ke koupání dnes
  restrictedOnly: boolean; // jen zákazy / omezení
  hideCyano: boolean; // skrýt vodu se sinicemi
  freshness: "all" | "24h" | "7d" | "30d"; // stáří posledního odběru
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  types: [],
  monitoredOnly: false,
  suitableToday: false,
  restrictedOnly: false,
  hideCyano: false,
  freshness: "all",
};

// Porovnání bez diakritiky a velikosti písmen (Velká Amerika ~ velka amerika).
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const SUITABLE: QualityClass[] = ["vyborna", "vhodna"];

export function ageDays(iso?: string): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function filterLocations(list: Location[], f: Filters): Location[] {
  const q = norm(f.query.trim());
  return list.filter((l) => {
    if (q) {
      const hay = norm(`${l.name} ${l.municipality ?? ""} ${l.region} ${l.district ?? ""}`);
      if (!hay.includes(q)) return false;
    }
    if (f.types.length && !f.types.includes(l.type)) return false;
    if (f.monitoredOnly && !l.monitored) return false;
    if (f.suitableToday) {
      if (!SUITABLE.includes(l.quality.class)) return false;
      if (l.access.status === "zakazano") return false; // nenavádět na zakázaná místa
    }
    if (f.restrictedOnly && !(l.access.status === "zakazano" || l.access.status === "omezeno")) {
      return false;
    }
    if (f.hideCyano && l.quality.cyanobacteria) return false;
    if (f.freshness !== "all") {
      const d = ageDays(l.quality.sampledAt);
      if (d === null) return false;
      const max = f.freshness === "24h" ? 1 : f.freshness === "7d" ? 7 : 31;
      if (d > max) return false;
    }
    return true;
  });
}

// Vzdálenost dvou bodů v km (haversine) – pro „najít koupání v okolí".
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
