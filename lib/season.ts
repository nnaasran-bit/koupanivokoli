// Sezónní identita webu: v Česku koupací sezóna reálně končí začátkem září,
// zbytek roku (září–duben) je naopak přirozená sezóna otužování. Přepnutí je
// automatické podle aktuálního data na serveru – žádné ruční nastavení.
export type Season = "leto" | "zima";

export function currentSeason(d: Date = new Date()): Season {
  const m = d.getMonth() + 1; // 1–12
  return m >= 5 && m <= 8 ? "leto" : "zima";
}
