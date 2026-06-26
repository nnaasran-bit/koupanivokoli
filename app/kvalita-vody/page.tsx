import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { QUALITY_COLORS, QUALITY_LABELS } from "@/lib/quality";
import type { QualityClass } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kvalita vody ke koupání – co znamenají barvy a stupně",
  description:
    "Jak číst kvalitu vody ke koupání v Česku: význam barev (modrá, zelená, žlutá, červená, černá, šedá), stupně jakosti, sinice a zdroje dat (Koupací vody, SZÚ, KHS).",
  alternates: { canonical: "/kvalita-vody" },
};

const SCALE: { c: QualityClass; desc: string }[] = [
  { c: "vyborna", desc: "Voda výborné jakosti, vhodná ke koupání bez výhrad." },
  { c: "vhodna", desc: "Voda vhodná ke koupání, jakost je dobrá." },
  { c: "zhorsena", desc: "Zhoršená jakost – koupání nemusí být vhodné pro citlivé osoby a děti." },
  { c: "nevhodna", desc: "Voda nevhodná ke koupání, hrozí zdravotní riziko." },
  { c: "zakaz_koupani", desc: "Zákaz koupání vyhlášený hygienickou stanicí (např. silný výskyt sinic)." },
  { c: "nesledovano", desc: "Jakost není oficiálně sledována – koupání na vlastní riziko." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Co znamenají barvy kvality vody na mapě?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Modrá = voda výborná, zelená = vhodná, žlutá = zhoršená, červená = nevhodná, černá = zákaz koupání a šedá = nesledováno. Barva označuje zdravotní kvalitu vody, samostatný odznak pak právní přístup.",
      },
    },
    {
      "@type": "Question",
      name: "Která místa ke koupání jsou oficiálně sledovaná?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oficiálně sledováno je v ČR jen několik set koupacích oblastí a přírodních koupališť, kde jakost vody pravidelně kontrolují krajské hygienické stanice. Většina lomů, pískoven a jezer sledována není a koupání je na vlastní riziko.",
      },
    },
    {
      "@type": "Question",
      name: "Jsou sinice ve vodě nebezpečné?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sinice (vodní květ) se množí v létě ve stojatých vodách a jejich toxiny mohou způsobit vyrážky a zažívací potíže. Místa se zvýšeným výskytem označujeme upozorněním, v krajním případě hygiena koupání zakáže.",
      },
    },
    {
      "@type": "Question",
      name: "Odkud pocházejí data o kvalitě vody?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oficiální jakost přebíráme z dat Ministerstva zdravotnictví, SZÚ a krajských hygienických stanic (portál Koupací vody) a z EEA. Body míst pocházejí z OpenStreetMap. Komunitní hlášení jsou orientační a nemění oficiální kvalitu vody.",
      },
    },
  ],
};

export default function KvalitaVodyPage() {
  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Kvalita vody ke koupání: jak číst barvy a stupně
      </h1>
      <p className="mt-2 text-zinc-600">
        Na mapě koupání používáme jednotnou barevnou škálu, abys během pár sekund poznal, jestli je
        voda v pořádku. Barva označuje <strong>zdravotní kvalitu vody</strong>, samostatný odznak
        pak <strong>právní přístup</strong> (povoleno / omezeno / zákaz). Tyto dvě věci se nepletou.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-zinc-900">Barevná škála</h2>
      <ul className="mt-3 space-y-2">
        {SCALE.map(({ c, desc }) => (
          <li key={c} className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
            <span
              className="mt-0.5 inline-block h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ background: QUALITY_COLORS[c] }}
            />
            <div>
              <div className="font-medium text-zinc-900">{QUALITY_LABELS[c]}</div>
              <div className="text-sm text-zinc-600">{desc}</div>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-lg font-semibold text-zinc-900">Sledovaná vs. nesledovaná místa</h2>
      <p className="mt-2 text-zinc-600">
        Oficiálně sledováno je v ČR jen několik set koupacích oblastí a přírodních koupališť, kde
        jakost vody pravidelně kontrolují krajské hygienické stanice. Naprostá většina lomů,
        pískoven a jezer oficiálně sledována není – proto je na mapě uvádíme šedě a koupání je na
        nich na vlastní riziko.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-zinc-900">Sinice (vodní květ)</h2>
      <p className="mt-2 text-zinc-600">
        V létě se ve stojatých vodách množí sinice. Jejich toxiny mohou způsobit vyrážky a zažívací
        potíže. Místa se zvýšeným výskytem sinic označujeme upozorněním a v krajním případě je
        hygiena uzavře.
      </p>

      <h2 className="mt-6 text-lg font-semibold text-zinc-900">Zdroje dat</h2>
      <p className="mt-2 text-zinc-600">
        Oficiální jakost vody přebíráme z Ministerstva zdravotnictví, Státního zdravotního ústavu a
        krajských hygienických stanic (portál Koupací vody). Body míst pocházejí z OpenStreetMap
        (licence ODbL). Komunitní hlášení jsou orientační a nikdy nemění oficiální kvalitu vody.
      </p>

      <p className="mt-6 text-xs leading-relaxed text-zinc-400">
        Informace jsou orientační; rozhodující jsou vždy oficiální zdroje.
      </p>
    </ContentLayout>
  );
}
