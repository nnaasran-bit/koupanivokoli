// Konfigurace webu pro SEO / geo / LLM. URL lze přepsat env proměnnou.
// Vynucujeme www variantu naší domény – apex (bez www) se přesměrovává (308)
// a OG náhledy/obrázky přesměrování nenásledují, proto musí být kanonicky www.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.koupanivokoli.cz")
  .replace(/\/$/, "")
  .replace(/^https?:\/\/koupanivokoli\.cz/, "https://www.koupanivokoli.cz");
export const SITE_NAME = "Koupání v okolí";
export const SITE_DESCRIPTION =
  "Aktuální stav koupání v Česku na jedné mapě: kvalita vody, stáří údajů, zdroj, právní status přístupu, bezpečnostní rizika a počasí. Koupaliště, jezera, lomy, pískovny, přehrady, rybníky, řeky i neoficiální místa.";
