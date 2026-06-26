import { allLocations } from "@/lib/data";
import { REGIONS } from "@/lib/regions";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// /llms.txt – standard pro AI/LLM crawlery (popis webu strojově čitelně).
export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} je veřejný rozcestník stavu koupání v Česku. Pro každou lokalitu
odděluje zdravotní kvalitu vody, právní/přístupový status a bezpečnostní rizika
a vždy uvádí zdroj a stáří informace.

## Klíčové stránky
- [Interaktivní mapa](${SITE_URL}/): všechny lokality, filtry, vyhledávání, koupání v okolí
- [Kvalita vody – vysvětlení](${SITE_URL}/kvalita-vody): význam barev a stupňů jakosti vody
- [Žebříček komunity](${SITE_URL}/zebricek)
- [Nahlásit stav vody nebo nové místo](${SITE_URL}/nahlasit)

## Lokality
- Detail lokality: ${SITE_URL}/lokalita/{slug}
- Počet lokalit v databázi: ${allLocations.length}
- Kompletní seznam URL: ${SITE_URL}/sitemap.xml

## Koupání podle krajů
${REGIONS.map((r) => `- [Koupání v ${r.name}](${SITE_URL}/koupani/${r.slug})`).join("\n")}

## Zdroje dat a licence
- Oficiální kvalita vody: Ministerstvo zdravotnictví, SZÚ, krajské hygienické stanice (portál Koupací vody)
- Body míst ke koupání: OpenStreetMap (licence ODbL, © OpenStreetMap přispěvatelé)
- Počasí a hydrologie: ČHMÚ
- Komunitní hlášení: orientační, moderovaná; nikdy nemění oficiální kvalitu vody

## Upozornění
Informace jsou orientační; rozhodující jsou oficiální zdroje. U nesledovaných míst
je koupání na vlastní riziko. Web nezveřejňuje návody k obcházení zákazů.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
