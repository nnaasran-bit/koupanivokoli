// Konfigurace webu pro SEO / geo / LLM. URL lze přepsat env proměnnou.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://koupanivokoli.cz").replace(
  /\/$/,
  "",
);
export const SITE_NAME = "Koupání v okolí";
export const SITE_DESCRIPTION =
  "Aktuální stav koupání v Česku na jedné mapě: kvalita vody, stáří údajů, zdroj, právní status přístupu, bezpečnostní rizika a počasí. Koupaliště, jezera, lomy, pískovny, přehrady, rybníky, řeky i neoficiální místa.";
