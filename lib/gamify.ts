// Gamifikace komunity – čistý modul (bez DB), sdílený serverem i klientem.

export type ReportKind =
  | "kvalita_ok"
  | "kvalita_zhorsena"
  | "sinice"
  | "riziko"
  | "nove_misto";

export interface KindDef {
  id: ReportKind;
  label: string;
  emoji: string;
  points: number;
  isNewPlace?: boolean;
}

export const REPORT_KINDS: KindDef[] = [
  { id: "kvalita_ok", label: "Voda vypadá čistě", emoji: "💧", points: 10 },
  { id: "kvalita_zhorsena", label: "Zhoršená voda / zákal", emoji: "🌫️", points: 10 },
  { id: "sinice", label: "Sinice / zelená voda", emoji: "🦠", points: 15 },
  { id: "riziko", label: "Nebezpečí / odpad", emoji: "⚠️", points: 15 },
  { id: "nove_misto", label: "Navrhnout nové místo", emoji: "📍", points: 25, isNewPlace: true },
];

export function kindDef(id: string): KindDef | undefined {
  return REPORT_KINDS.find((k) => k.id === id);
}

// Vybavení, které může komunita u lokality potvrzovat.
export interface AmenityDef {
  id: string;
  label: string;
  emoji: string;
}

export const AMENITIES: AmenityDef[] = [
  { id: "parkovani", label: "Parkování", emoji: "🅿️" },
  { id: "wc", label: "WC", emoji: "🚻" },
  { id: "sprchy", label: "Sprchy", emoji: "🚿" },
  { id: "obcerstveni", label: "Občerstvení", emoji: "🍔" },
  { id: "deti", label: "Vhodné pro děti", emoji: "🧒" },
  { id: "psi", label: "Psi povoleni", emoji: "🐕" },
  { id: "bez_vstupneho", label: "Bez vstupného", emoji: "🆓" },
  { id: "ohniste", label: "Ohniště / gril", emoji: "🔥" },
];

export function amenityDef(id: string): AmenityDef | undefined {
  return AMENITIES.find((a) => a.id === id);
}

export const CONTRIB_POINTS = { amenity: 5, tip: 10 };

export interface Contribution {
  id: string;
  locationSlug: string;
  userId: string;
  nick: string;
  kind: "amenity" | "tip";
  amenity?: string;
  text?: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  nick: string;
  points: number;
  reportCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  nick: string;
  kind: ReportKind;
  locationName?: string;
  locationSlug?: string;
  newPlaceName?: string;
  lat?: number;
  lng?: number;
  text?: string;
  status: "pending" | "approved" | "rejected";
  points: number;
  createdAt: string;
}

export interface LevelInfo {
  name: string;
  emoji: string;
  min: number;
}

export const LEVELS: LevelInfo[] = [
  { min: 0, name: "Nováček", emoji: "🐣" },
  { min: 50, name: "Plavčík", emoji: "🏊" },
  { min: 150, name: "Otužilec", emoji: "❄️" },
  { min: 400, name: "Strážce vody", emoji: "🛟" },
  { min: 1000, name: "Vodní mistr", emoji: "👑" },
];

export function levelFor(points: number): {
  current: LevelInfo;
  next: LevelInfo | null;
  progress: number;
} {
  let current = LEVELS[0];
  let next: LevelInfo | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const progress = next
    ? Math.min(100, Math.round(((points - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, progress };
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export function badgesFor(
  user: { points: number; reportCount: number },
  reports: Report[],
): Badge[] {
  const b: Badge[] = [];
  if (user.reportCount >= 1) b.push({ id: "first", name: "První hlášení", emoji: "🌟", desc: "Odeslal jsi první report." });
  if (user.reportCount >= 5) b.push({ id: "hlidka", name: "Hlídka", emoji: "🛡️", desc: "5 hlášení." });
  if (user.reportCount >= 20) b.push({ id: "veteran", name: "Veterán", emoji: "🎖️", desc: "20 hlášení." });
  if (reports.some((r) => r.kind === "nove_misto")) b.push({ id: "objevitel", name: "Objevitel", emoji: "🧭", desc: "Navrhl jsi nové místo." });
  if (reports.some((r) => r.kind === "sinice")) b.push({ id: "radar", name: "Sinicový radar", emoji: "🦠", desc: "Nahlásil jsi sinice." });
  if (user.points >= 100) b.push({ id: "stovkar", name: "Stovkař", emoji: "💯", desc: "100 bodů." });
  return b;
}
