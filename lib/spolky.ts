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
  contactUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
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

// Když nemáme odkaz na FB/web (např. u party bez vlastní stránky), nabídneme
// aspoň vyhledání místa srazu na mapě – lepší než nic, a nic si nevymýšlíme.
export function spolekMapsUrl(s: Spolek): string {
  const q = [s.place, s.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

// Komunitní přidání party BEZ registrace (/otuzovani/spolky/pridat) – ukládá
// se do DB (lib/store.ts), ne do data/spolky.json. Zobrazuje se rovnou se
// štítkem „od komunity, neověřeno“; zjevný spam mažeme přes admin panel.
export interface SpolekSubmission {
  id: string;
  name: string;
  city: string;
  region: string;
  schedule?: string;
  place?: string;
  desc?: string;
  contact?: string;
  createdAt: string;
}
