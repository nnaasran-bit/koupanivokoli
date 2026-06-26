// Datový model „Mapa koupání ČR".
// Klíčový princip: oddělené domény. Zdravotní kvalita vody, právní/přístupový
// status a bezpečnostní rizika jsou nezávislé věci a nikdy se navzájem nepřepisují.

export type LocationType =
  | "koupaliste"
  | "prirodni_koupaliste"
  | "koupaci_oblast"
  | "lom"
  | "piskovna"
  | "rybnik"
  | "jezero"
  | "prehrada"
  | "reka"
  | "biotop"
  | "neoficialni";

// Zdravotní kvalita vody (zobrazená barva na mapě). Pozor: „zakaz_koupani" je
// ZDRAVOTNÍ zákaz (KHS kvůli sinicím apod.), ne právní zákaz vstupu – ten je v Access.
export type QualityClass =
  | "vyborna" // modrá
  | "vhodna" // zelená
  | "zhorsena" // žlutá
  | "nevhodna" // červená
  | "zakaz_koupani" // černá – zdravotní zákaz koupání
  | "nesledovano"; // šedá – data nejsou k dispozici

// Právní / přístupový status (samostatný odznak, nezávislý na kvalitě vody).
export type AccessStatus = "povoleno" | "omezeno" | "zakazano" | "nezname";

// Hierarchie důvěryhodnosti zdroje (5 = oficiální úřad, 0 = sociální sítě).
export type TrustLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface WaterQuality {
  class: QualityClass;
  cyanobacteria?: boolean; // výskyt sinic
  sampledAt?: string; // ISO datum posledního odběru / kontroly
  source?: string; // např. „KHS Středočeského kraje"
  sourceUrl?: string;
  trust?: TrustLevel;
}

export interface Access {
  status: AccessStatus;
  reason?: string; // ochranné pásmo, soukromý pozemek, lom v provozu, ...
  note?: string;
  source?: string;
}

export interface SafetyWarning {
  kind: string; // hluboká voda, bez dozoru, skoky do vody, ...
  text: string;
}

export interface QualitySample {
  date: string; // ISO datum odběru
  class: QualityClass;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
  region: string; // kraj
  district?: string; // okres
  municipality?: string; // obec
  monitored: boolean; // oficiálně sledovaná koupací voda?
  quality: WaterQuality;
  access: Access;
  safety?: SafetyWarning[];
  description?: string; // textový popis lokality
  history?: QualitySample[]; // historie kvality vody
  updatedAt?: string; // poslední aktualizace na našem webu
}
