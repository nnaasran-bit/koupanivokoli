import { allLocations } from "@/lib/data";
import { REGIONS } from "@/lib/regions";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { SPOLKY } from "@/lib/spolky";
import { CITIES } from "@/lib/cities";

// /llms.txt – standard pro AI/LLM crawlery (popis webu strojově čitelně).
export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} je veřejný rozcestník stavu koupání v Česku. Pro každou lokalitu
odděluje zdravotní kvalitu vody, právní/přístupový status a bezpečnostní rizika
a vždy uvádí zdroj a stáří informace.

## Klíčové stránky
- [Interaktivní mapa](${SITE_URL}/): všechny lokality, filtry, vyhledávání, koupání v okolí
- [Otužování v okolí](${SITE_URL}/otuzovani): mapa přírodních míst vhodných k otužování v zimě,
  živá teplota vody z ČHMÚ, bezpečnostní zásady a postup pro začátečníky
- [Tipy a triky na otužování](${SITE_URL}/otuzovani/tipy-a-triky): dýchání, vybavení, frekvence,
  kombinace se saunou, časté chyby začátečníků
- [Otužilecké spolky a party](${SITE_URL}/otuzovani/spolky): ${SPOLKY.length} komunitních part a
  registrovaných oddílů po celé ČR s dnem/časem srazu a kontaktem
- [Sauny u vody](${SITE_URL}/otuzovani/sauny): sauny a wellness přímo u přírodní vody – kontrastní
  koupel k otužování
- [Teplota vody – rekordy](${SITE_URL}/teploty-vody): živý žebříček nejstudenější a nejteplejší
  vody v ČR podle dat ČHMÚ
- [Kvalita vody – vysvětlení](${SITE_URL}/kvalita-vody): význam barev a stupňů jakosti vody
- [Žebříček komunity](${SITE_URL}/zebricek)
- [Nahlásit stav vody nebo nové místo](${SITE_URL}/nahlasit)

## Lokality
- Detail lokality: ${SITE_URL}/lokalita/{slug}
- Počet lokalit v databázi: ${allLocations.length}
- Kompletní seznam URL: ${SITE_URL}/sitemap.xml

## Koupání podle krajů
${REGIONS.map((r) => `- [Koupání v ${r.locative}](${SITE_URL}/koupani/${r.slug})`).join("\n")}

## Otužování podle krajů
${REGIONS.map((r) => `- [Otužování v ${r.locative}](${SITE_URL}/otuzovani/${r.slug})`).join("\n")}

## Top 10 nejlepších míst podle většího města
${CITIES.map((c) => `- [Nejlepší místa u ${c.genitive}](${SITE_URL}/nejlepsi-mista/${c.slug})`).join("\n")}

## Zdroje dat a licence
- Oficiální kvalita vody: Ministerstvo zdravotnictví, SZÚ, krajské hygienické stanice (portál Koupací vody)
- Body míst ke koupání: OpenStreetMap (licence ODbL, © OpenStreetMap přispěvatelé)
- Počasí a hydrologie: ČHMÚ
- Otužilecké spolky a party: ručně kurátorováno z otuzovani.eu a zimni-plavani.info
  (Česká otužilecká unie) – viz zdroj u každého záznamu
- Sauny u vody: ručně kurátorováno z kudyznudy.cz, mujaltan.cz a oficiálních stránek – viz
  zdroj u každého záznamu
- Komunitní hlášení: orientační, moderovaná; nikdy nemění oficiální kvalitu vody

## Upozornění
Informace jsou orientační; rozhodující jsou oficiální zdroje. U nesledovaných míst
je koupání na vlastní riziko. Web nezveřejňuje návody k obcházení zákazů.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
