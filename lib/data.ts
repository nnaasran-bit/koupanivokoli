import sample from "@/data/locations.sample.json";
import eea from "@/data/locations.eea.json";
import osm from "@/data/locations.osm.json";
import { distanceKm } from "./filters";
import type { Location } from "./types";

// Jediné místo pro přístup k datům lokalit. Spojuje tři zdroje podle důvěryhodnosti:
//  1. ručně ověřená data (nejvyšší priorita),
//  2. oficiální koupací vody z EEA (kvalita vody, monitorováno),
//  3. reálné body z OpenStreetMap (nesledováno).
// Bližší duplicity nižší priority se vynechají. Později nahradí PostgreSQL beze změny volajících.

const curated = sample as unknown as Location[];
const eeaData = (eea as unknown as Location[]).filter(
  (e) => !curated.some((c) => distanceKm(e, c) < 0.4),
);
const higher = [...curated, ...eeaData];
const osmData = (osm as unknown as Location[]).filter(
  (o) => !higher.some((h) => distanceKm(o, h) < 0.4),
);

export const allLocations: Location[] = [...higher, ...osmData];

export function getLocationBySlug(slug: string): Location | undefined {
  return allLocations.find((l) => l.slug === slug);
}

export function allSlugs(): string[] {
  return allLocations.map((l) => l.slug);
}
