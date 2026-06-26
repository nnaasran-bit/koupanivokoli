// Kanonický seznam 14 krajů ČR (název = oficiální INSPIRE název, slug = hezká URL).
// Čistý modul (žádný geojson) – bezpečné importovat i na klientu.
export interface Region {
  name: string;
  slug: string;
}

export const REGIONS: Region[] = [
  { name: "Hlavní město Praha", slug: "praha" },
  { name: "Středočeský kraj", slug: "stredocesky" },
  { name: "Jihočeský kraj", slug: "jihocesky" },
  { name: "Plzeňský kraj", slug: "plzensky" },
  { name: "Karlovarský kraj", slug: "karlovarsky" },
  { name: "Ústecký kraj", slug: "ustecky" },
  { name: "Liberecký kraj", slug: "liberecky" },
  { name: "Královéhradecký kraj", slug: "kralovehradecky" },
  { name: "Pardubický kraj", slug: "pardubicky" },
  { name: "Kraj Vysočina", slug: "vysocina" },
  { name: "Jihomoravský kraj", slug: "jihomoravsky" },
  { name: "Olomoucký kraj", slug: "olomoucky" },
  { name: "Moravskoslezský kraj", slug: "moravskoslezsky" },
  { name: "Zlínský kraj", slug: "zlinsky" },
];

export function regionBySlug(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export function slugForRegion(name: string): string | undefined {
  return REGIONS.find((r) => r.name === name)?.slug;
}
