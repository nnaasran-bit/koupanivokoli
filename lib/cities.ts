// Souřadnice center 16 větších českých měst – pro „Top 10 u vás" stránky
// (/nejlepsi-mista/[mesto]). `genitive` = 2. pád ("u ...") pro gramaticky
// správné "u Prahy", ne "u Praha". Čistý statický seznam, žádné závislosti.
export interface City {
  slug: string;
  name: string;
  genitive: string;
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { slug: "praha", name: "Praha", genitive: "Prahy", lat: 50.0755, lng: 14.4378 },
  { slug: "brno", name: "Brno", genitive: "Brna", lat: 49.1951, lng: 16.6068 },
  { slug: "ostrava", name: "Ostrava", genitive: "Ostravy", lat: 49.8209, lng: 18.2625 },
  { slug: "plzen", name: "Plzeň", genitive: "Plzně", lat: 49.7384, lng: 13.3736 },
  { slug: "liberec", name: "Liberec", genitive: "Liberce", lat: 50.7663, lng: 15.0543 },
  { slug: "olomouc", name: "Olomouc", genitive: "Olomouce", lat: 49.5938, lng: 17.2509 },
  { slug: "ceske-budejovice", name: "České Budějovice", genitive: "Českých Budějovic", lat: 48.9745, lng: 14.4744 },
  { slug: "hradec-kralove", name: "Hradec Králové", genitive: "Hradce Králové", lat: 50.2092, lng: 15.8328 },
  { slug: "usti-nad-labem", name: "Ústí nad Labem", genitive: "Ústí nad Labem", lat: 50.6607, lng: 14.0328 },
  { slug: "pardubice", name: "Pardubice", genitive: "Pardubic", lat: 50.0343, lng: 15.7812 },
  { slug: "zlin", name: "Zlín", genitive: "Zlína", lat: 49.2331, lng: 17.6669 },
  { slug: "havirov", name: "Havířov", genitive: "Havířova", lat: 49.7797, lng: 18.4368 },
  { slug: "kladno", name: "Kladno", genitive: "Kladna", lat: 50.1477, lng: 14.1026 },
  { slug: "most", name: "Most", genitive: "Mostu", lat: 50.5030, lng: 13.6362 },
  { slug: "karlovy-vary", name: "Karlovy Vary", genitive: "Karlových Varů", lat: 50.2313, lng: 12.8710 },
  { slug: "jihlava", name: "Jihlava", genitive: "Jihlavy", lat: 49.3961, lng: 15.5912 },
];

export function cityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
