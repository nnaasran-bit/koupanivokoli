import raw from "@/data/spolky.json";

// Otužilecké spolky a party – ručně kurátorovaný seznam (na rozdíl od EEA/OSM/
// ČHMÚ nemá tahle data žádné strojové API). Zdroje: veřejný katalog otuzovani.eu
// (neformální party, vlastní profilová stránka u každé) a zimni-plavani.info /
// Česká otužilecká unie (registrované sportovní oddíly). Aktualizuje se ručně –
// viz sourceUrl u každého záznamu pro ověření aktuálnosti.
export type SpolekType = "parta" | "klub";

export interface Spolek {
  slug: string;
  name: string;
  type: SpolekType;
  city: string;
  district?: string;
  region: string;
  schedule?: string;
  place?: string;
  desc?: string;
  members?: number;
  contactPerson?: string;
  website?: string;
  contactUrl: string;
  sourceUrl: string;
  sourceName: string;
}

export const SPOLKY: Spolek[] = raw as Spolek[];

export function spolekBySlug(slug: string): Spolek | undefined {
  return SPOLKY.find((s) => s.slug === slug);
}

export function spolkyByRegion(region: string): Spolek[] {
  return SPOLKY.filter((s) => s.region === region);
}

export const TYPE_LABEL: Record<SpolekType, string> = {
  parta: "Neformální parta",
  klub: "Registrovaný oddíl",
};
