import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import OtuzovaniExplorer from "@/components/OtuzovaniExplorer";
import { allLocations } from "@/lib/data";
import { otuzovaniLocations } from "@/lib/otuzovani";
import { REGIONS } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Otužování v okolí – kde se otužovat a jak bezpečně začít",
  description:
    "Kde se v Česku otužovat v přírodní vodě: mapa řek, jezer, lomů, rybníků a přehrad vhodných k otužování v zimě, bezpečnostní zásady, kontraindikace a postup pro začátečníky.",
  alternates: { canonical: "/otuzovani" },
  openGraph: {
    title: "Otužování v okolí – kde se otužovat a jak bezpečně začít",
    description:
      "Mapa míst k otužování v přírodní vodě po celém Česku + bezpečnostní zásady a postup pro začátečníky.",
    url: `${SITE_URL}/otuzovani`,
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Je otužování ve studené vodě bezpečné?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pro zdravého dospělého člověka je otužování při postupné adaptaci a krátké době ponoru obecně bezpečné. Rizikem je zejména tzv. cold shock (mimovolní zalapání po dechu a zrychlení srdce) hned po vstupu do vody a podchlazení při delším pobytu. Lidé se srdečním onemocněním, vysokým krevním tlakem, těhotné ženy a lidé po nedávné nemoci by se měli nejdřív poradit s lékařem.",
      },
    },
    {
      "@type": "Question",
      name: "Jak dlouho má začátečník zůstat ve studené vodě?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Začátečníkům se doporučuje jen několik desítek sekund až 1–2 minuty, s postupným prodlužováním v řádu týdnů. Délka ponoru se neřídí tím, kolik vydrží zkušení otužilci, ale vlastním pocitem – při silném třesu nebo necitlivosti je čas vylézt.",
      },
    },
    {
      "@type": "Question",
      name: "Kde se dá v Česku otužovat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Otužovat se dá v jakékoli přírodní vodě dostupné i mimo sezónu – v řekách, jezerech, zatopených lomech a pískovnách, rybnících i přehradách. Vhodná místa najdeš na mapě na této stránce; vždy je ale potřeba na místě posoudit aktuální stav (led, proud, přístup).",
      },
    },
    {
      "@type": "Question",
      name: "Musím otužování kombinovat se saunou?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ne, není to nutné. Kombinace studené vody a sauny (kontrastní koupel) je oblíbená a příjemná, ale samotné otužování ve studené vodě funguje i bez sauny. Po vylezení z vody je hlavní se rychle a v suchu zahřát vlastním pohybem a teplým oblečením.",
      },
    },
  ],
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Otužování", item: `${SITE_URL}/otuzovani` },
  ],
};

export default function OtuzovaniPage() {
  const count = otuzovaniLocations(allLocations).length;

  return (
    <ContentLayout wide>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> · <span className="text-slate-700">Otužování</span>
      </nav>

      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          ❄️ Otužování v okolí
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Stejná mapa, kterou v létě používáš na koupání, funguje i v zimě – naprostá většina řek,
          jezer, lomů, rybníků a přehrad je přístupná celoročně. Vybrali jsme{" "}
          <strong>{count} přírodních míst</strong>, která jsou mimo sezónu bez plotu a dozoru, a
          hodí se tedy k posouzení pro otužování. Vždy si ale na místě sám ověř aktuální stav (led,
          proud, přístup) – to za tebe mapa neudělá.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/otuzovani/spolky" className="rounded-full bg-sky-700 px-3.5 py-1.5 font-semibold text-white hover:brightness-105">
            Najít partu ve svém okolí →
          </Link>
          <Link href="/otuzovani/tipy-a-triky" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            10 tipů a triků
          </Link>
          <Link href="/kvalita-vody" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Jak číst kvalitu vody
          </Link>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Otužování podle kraje</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <Link
            key={r.slug}
            href={`/otuzovani/${r.slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700"
          >
            {r.name}
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Mapa míst k otužování</h2>
      <p className="mt-1 text-sm text-slate-500">
        Filtruj podle typu vody nebo najdi místa ve svém okolí. Barva tečky ukazuje poslední
        známou kvalitu vody, oranžový štítek 🌡️ aktuální teplotu vody z nejbližší stanice ČHMÚ
        (do 15 km) – led ani proud stále nesledujeme, to je na tvém vlastním posouzení na místě.
      </p>
      <div className="mt-3 flex h-[70vh] max-h-[720px] min-h-[420px]">
        <OtuzovaniExplorer />
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">Jak bezpečně začít</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-semibold text-slate-900">1. Jdi na to postupně</div>
          <p className="mt-1 text-sm text-slate-600">
            Začni na podzim, dokud voda ještě není nejstudenější, a otužuj se pravidelně (i 2–3×
            týdně). Tělo se adaptuje na opakovaný, ne na jednorázový extrémní chlad.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-semibold text-slate-900">2. Nikdy sám a nikdy po alkoholu</div>
          <p className="mt-1 text-sm text-slate-600">
            Cold shock může přijít i u zkušených otužilců. Choď s někým, kdo tě vidí, vyhýbej se
            hluboké vodě o samotě a nikdy nekombinuj se alkoholem ani po intenzivním cvičení.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-semibold text-slate-900">3. Krátce a s klidným dechem</div>
          <p className="mt-1 text-sm text-slate-600">
            Vstupuj pomalu, dýchej klidně a zůstaň jen krátce (začátečníci desítky sekund až
            jednotky minut). Dýchací techniky (např. Wim Hof) pomáhají zvládnout první šok, ale
            necvič je přímo ve vodě ani při zadržování dechu pod hladinou.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-semibold text-slate-900">4. Zahřátí hned po vylezení</div>
          <p className="mt-1 text-sm text-slate-600">
            Osuš se, obleč suché teplé vrstvy (čepice, rukavice, ponožky) a rozhýbej se. Tělo se
            ještě chvíli po výstupu z vody dochlazuje ("after-drop") – proto suché oblečení a
            pohyb, ne horkou sprchu hned na místě.
          </p>
        </div>
      </div>

      <p className="mt-4 space-y-1">
        <Link href="/otuzovani/tipy-a-triky" className="block text-sm font-semibold text-brand hover:underline">
          → Dalších 10 tipů a triků (dýchání, vybavení, deník otužování, časté chyby)
        </Link>
        <Link href="/otuzovani/spolky" className="block text-sm font-semibold text-brand hover:underline">
          → Otužilecké spolky a party – najdi partu ve svém kraji
        </Link>
      </p>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Kdy se otužování raději vyhnout</h2>
      <p className="mt-2 text-sm text-slate-600">
        Otužování se nedoporučuje při srdečně-cévních onemocněních, vysokém krevním tlaku,
        těhotenství, akutní nemoci nebo horečce, a obecně u čehokoli, co ti lékař výslovně
        nedoporučil zkoušet. V pochybnostech se poraď s lékařem – tahle stránka lékařskou radu
        nenahrazuje.
      </p>

      <p className="mt-8 text-xs leading-relaxed text-zinc-400">
        Místa jsme vytipovali podle typu vodní plochy (přírodní voda bez sezónního zákazu vstupu).
        Nejde o potvrzení, že je místo v danou chvíli bezpečné – led, proud i přístup se mohou
        měnit ze dne na den. Informace jsou orientační; rozhodující je vždy stav na místě a tvůj
        vlastní úsudek.
      </p>
    </ContentLayout>
  );
}
