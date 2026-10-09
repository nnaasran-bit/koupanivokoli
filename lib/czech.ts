// Drobné helpery pro správnou českou gramatiku v generovaných textech
// (tituly, popisky) – aby "3 party" nebylo "3 part".
export function pluralCz(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}
