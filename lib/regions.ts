// Kanonický seznam 14 krajů ČR (název = oficiální INSPIRE název, slug = hezká URL).
// `locative` = 6. pád ("v ...") pro gramaticky správné věty typu "Koupání v
// Jihočeském kraji" – bez něj vycházelo "Koupání v Jihočeský kraj".
// Čistý modul (žádný geojson) – bezpečné importovat i na klientu.
export interface Region {
  name: string;
  slug: string;
  locative: string;
}

export const REGIONS: Region[] = [
  { name: "Hlavní město Praha", slug: "praha", locative: "Hlavním městě Praze" },
  { name: "Středočeský kraj", slug: "stredocesky", locative: "Středočeském kraji" },
  { name: "Jihočeský kraj", slug: "jihocesky", locative: "Jihočeském kraji" },
  { name: "Plzeňský kraj", slug: "plzensky", locative: "Plzeňském kraji" },
  { name: "Karlovarský kraj", slug: "karlovarsky", locative: "Karlovarském kraji" },
  { name: "Ústecký kraj", slug: "ustecky", locative: "Ústeckém kraji" },
  { name: "Liberecký kraj", slug: "liberecky", locative: "Libereckém kraji" },
  { name: "Královéhradecký kraj", slug: "kralovehradecky", locative: "Královéhradeckém kraji" },
  { name: "Pardubický kraj", slug: "pardubicky", locative: "Pardubickém kraji" },
  { name: "Kraj Vysočina", slug: "vysocina", locative: "Kraji Vysočina" },
  { name: "Jihomoravský kraj", slug: "jihomoravsky", locative: "Jihomoravském kraji" },
  { name: "Olomoucký kraj", slug: "olomoucky", locative: "Olomouckém kraji" },
  { name: "Moravskoslezský kraj", slug: "moravskoslezsky", locative: "Moravskoslezském kraji" },
  { name: "Zlínský kraj", slug: "zlinsky", locative: "Zlínském kraji" },
];

export function regionBySlug(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export function slugForRegion(name: string): string | undefined {
  return REGIONS.find((r) => r.name === name)?.slug;
}
