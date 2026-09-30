import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Otužování: 10 tipů a triků pro začátečníky i pokročilé",
  description:
    "Praktické tipy na otužování ve studené vodě: dýchání, vybavení, jak často a jak dlouho, kombinace se saunou, deník otužování a nejčastější začátečnické chyby.",
  alternates: { canonical: "/otuzovani/tipy-a-triky" },
  openGraph: {
    title: "Otužování: 10 tipů a triků pro začátečníky i pokročilé",
    description: "Praktické tipy na otužování ve studené vodě – dýchání, vybavení, frekvence, chyby začátečníků.",
    url: `${SITE_URL}/otuzovani/tipy-a-triky`,
  },
};

const TIPS: { title: string; text: string }[] = [
  {
    title: "1. Dýchej klidně, ne rychle",
    text:
      "Hned po vstupu přijde reflexní zalapání po dechu (cold shock) – tělo se ho snaží zrychlit dech. Vědomě ho zpomal: nádech nosem, delší výdech ústy. Dechové techniky typu Wim Hof (rychlé hluboké dýchání se zádrží) cvič výhradně na suchu, v sedě, nikdy ve vodě ani před ponorem – ve vodě po nich hrozí mdloba (tzv. shallow water blackout).",
  },
  {
    title: "2. Chraň konce – ruce, nohy, hlavu",
    text:
      "Prsty na rukou a nohou a hlava chladnou nejrychleji a bolí první. Neoprenové boty, rukavice a čepice prodlouží čas, který ve vodě vydržíš v pohodě, a zásadně sníží riziko, že si poškodíš kůži na mrazu při vstupu/výstupu z namrzlého břehu.",
  },
  {
    title: "3. Po vylezení se hýbej, nečekej",
    text:
      "Tělo se ještě několik minut po výstupu dochlazuje (\"after-drop\") – krev ze studených končetin se vrací do jádra. Osuš se, obleč suché vrstvy a aktivně se rozhýbej (chůze, dřepy), místo abys nehybně postával a čekal, až tě zahřeje slunce nebo termoska.",
  },
  {
    title: "4. Piš si deník otužování",
    text:
      "Datum, teplota vody, délka ponoru, jak ti bylo – po pár týdnech uvidíš vlastní pokrok černé na bílém, což motivuje víc než snaha trumfnout ostatní. Check-in \"Byl jsem tady\" a profil s body na tomhle webu můžeš použít přesně k tomu.",
  },
  {
    title: "5. Sauna ano, ale ne hned po jídle nebo alkoholu",
    text:
      "Kontrastní koupel (studená voda → sauna → studená voda) je oblíbená a příjemná pro krevní oběh. Vynech ji ale po těžkém jídle, alkoholu nebo intenzivním cvičení – kombinace velké zátěže srdce a rychlých teplotních změn je riziková i pro jinak zdravé lidi.",
  },
  {
    title: "6. Ranní otužování bývá nejpříjemnější",
    text:
      "Spousta otužilců chodí do vody hned ráno – je to zvyk, který se snáz udrží (než rozhodovat se znovu každý večer) a řada lidí popisuje příjemný nával energie na celý den. Není to ale pravidlo – funguje i večer, důležitější je pravidelnost než denní doba.",
  },
  {
    title: "7. Prodlužuj postupně, ne rekordně",
    text:
      "Cíl není vydržet co nejdéle jednou, ale otužovat se pravidelně (klidně jen 30–60 vteřin, 2–3× týdně) a čas prodlužovat v řádu týdnů až měsíců. Jednorázový extrémní ponor bez přípravy riziko jen zvyšuje, adaptaci nezrychlí.",
  },
  {
    title: "8. Sleduj vlastní signály, ne hodinky",
    text:
      "Silný nekontrolovatelný třes, zmatenost, necitlivost nebo namodralé rty jsou signál vylézt hned, bez ohledu na to, kolik času sis naplánoval. Tělo je přesnější ukazatel než stopky.",
  },
  {
    title: "9. Otužuj se s někým, nikdy sám v neznámé vodě",
    text:
      "I zkušení otužilci se občas nachladí hůř, než čekali. Parta navíc pomáhá udržet pravidelnost a je znatelně bezpečnější, zvlášť u neznámých míst s proudem nebo ledem. Podívej se na mapu vhodných míst a zkus, jestli poblíž nemáš i komunitu otužilců.",
  },
  {
    title: "10. V zimě si vždy ověř led a proud na místě",
    text:
      "Tenký led u břehu, silnější uprostřed (nebo naopak) a proud pod hladinou nejsou z mapy ani z fotky poznat. Než vlezeš, projdi břeh, zkontroluj led klackem a zeptej se, jestli tam někdo místní chodí – žádná appka ti aktuální stav ledu nezaručí.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Jak často se má člověk otužovat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pravidelnost je důležitější než délka jednoho ponoru. Osvědčuje se otužovat 2–3× týdně po celou sezónu – tělo se adaptuje na opakovaný mírný chlad, ne na jednorázový extrém.",
      },
    },
    {
      "@type": "Question",
      name: "Je lepší otužovat se ráno, nebo večer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Obojí funguje, ráno je ale oblíbenější – snáz se stane zvykem a mnoho lidí ho spojuje s nastartováním energie na den. Důležitější než denní doba je konzistence.",
      },
    },
    {
      "@type": "Question",
      name: "Jak dlouho trvá, než si tělo na studenou vodu zvykne?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "První výraznou úlevu od cold shocku popisuje většina lidí po 1–2 týdnech pravidelného otužování, plnější adaptace přichází v řádu 4–6 týdnů. Tempo je ale hodně individuální.",
      },
    },
    {
      "@type": "Question",
      name: "Musím při otužování cvičit Wim Hof dýchání?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ne, je to jen jedna z metod. Dýchací cvičení se zádrží dechu navíc patří na suchou zem před nebo po ponoru, nikdy ne do vody – hrozí při nich mdloba.",
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
    { "@type": "ListItem", position: 3, name: "Tipy a triky", item: `${SITE_URL}/otuzovani/tipy-a-triky` },
  ],
};

export default function OtuzovaniTipyPage() {
  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> ·{" "}
        <Link href="/otuzovani" className="hover:text-brand">Otužování</Link> ·{" "}
        <span className="text-slate-700">Tipy a triky</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Otužování: 10 tipů a triků pro začátečníky i pokročilé
      </h1>
      <p className="mt-2 text-zinc-600">
        Základní bezpečnostní zásady (kdy otužování raději vynechat, jak dlouho vydržet jako
        začátečník) najdeš na{" "}
        <Link href="/otuzovani" className="text-brand hover:underline">hlavní stránce otužování</Link>.
        Tady jsou praktické tipy a triky, které ti otužování usnadní a zpříjemní.
      </p>

      <ol className="mt-6 space-y-4">
        {TIPS.map((t) => (
          <li key={t.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="font-semibold text-slate-900">{t.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{t.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <div className="font-semibold text-slate-900">Kam dál</div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Link href="/otuzovani" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Mapa míst k otužování
          </Link>
          <Link href="/otuzovani/sauny" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            🔥 Sauny u vody
          </Link>
          <Link href="/nahlasit" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Nahlásit led / otužování na místě
          </Link>
          <Link href="/zebricek" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
            Žebříček komunity
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-zinc-400">
        Tipy jsou obecné a nenahrazují lékařskou radu. Při zdravotních potížích nebo nejistotě se
        poraď s lékařem – viz kontraindikace na stránce otužování.
      </p>
    </ContentLayout>
  );
}
