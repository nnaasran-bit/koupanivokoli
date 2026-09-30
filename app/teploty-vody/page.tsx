import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { allStationsCount, coldestStations, warmestStations, type WaterTempStation } from "@/lib/watertemp";
import { freshness, formatDateCz } from "@/lib/quality";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Teplota vody v Česku – aktuální rekordy (nejstudenější i nejteplejší)",
  description:
    "Živá teplota vody v českých řekách z dat ČHMÚ: kde je teď nejstudenější a nejteplejší voda v ČR, aktualizováno v reálném čase.",
  alternates: { canonical: "/teploty-vody" },
  openGraph: {
    title: "Teplota vody v Česku – aktuální rekordy",
    description: "Kde je teď nejstudenější a nejteplejší voda v ČR – živá data ČHMÚ.",
    url: `${SITE_URL}/teploty-vody`,
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Odkud pochází teplota vody?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Z otevřených hydrologických dat ČHMÚ (opendata.chmi.cz). Měří se na hydrologických profilech na řekách, ne přímo na konkrétních koupacích místech – u jezer, lomů a rybníků proto ukazujeme teplotu z nejbližší říční stanice jako orientační odhad.",
      },
    },
    {
      "@type": "Question",
      name: "Jak často se teplota aktualizuje?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stanice ČHMÚ hlásí nová měření v řádu desítek minut až hodin, náš web je stahuje pravidelně během dne.",
      },
    },
    {
      "@type": "Question",
      name: "Kde najdu teplotu konkrétního místa, kde chci plavat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Na detailu každé lokality a v mapě otužování zobrazujeme teplotu z nejbližší stanice do 15 km, pokud existuje.",
      },
    },
  ],
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Teplota vody", item: `${SITE_URL}/teploty-vody` },
  ],
};

function StationRow({ s, accent }: { s: WaterTempStation; accent: string }) {
  const f = freshness(s.measuredAt);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${s.river}`)}`;
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="min-w-0">
        <div className="truncate font-bold text-slate-900">{s.name}</div>
        <div className="truncate text-xs text-slate-400">
          {s.river} · měřeno {formatDateCz(s.measuredAt)} ({f.label})
        </div>
      </div>
      <div className="shrink-0 text-xl font-extrabold" style={{ color: accent }}>
        {s.tempC.toFixed(1)} °C
      </div>
    </a>
  );
}

export default function TeplotyVodyPage() {
  const cold = coldestStations(10);
  const warm = warmestStations(10);
  const count = allStationsCount();

  return (
    <ContentLayout wide>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> · <span className="text-slate-700">Teplota vody</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        🌡️ Teplota vody v Česku – aktuální rekordy
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Živá data z {count} hydrologických stanic ČHMÚ. Ať plánuješ letní koupání, nebo hledáš tu
        nejstudenější vodu na otužování, tady je aktuální žebříček.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            🧊 Nejstudenější právě teď
          </h2>
          <div className="mt-3 space-y-2">
            {cold.map((s) => (
              <StationRow key={s.stationId} s={s} accent="#2563eb" />
            ))}
          </div>
        </section>
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            ☀️ Nejteplejší právě teď
          </h2>
          <div className="mt-3 space-y-2">
            {warm.map((s) => (
              <StationRow key={s.stationId} s={s} accent="#dc2626" />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        <Link href="/otuzovani" className="rounded-full bg-sky-700 px-3.5 py-1.5 font-semibold text-white hover:brightness-105">
          ❄️ Mapa míst k otužování
        </Link>
        <Link href="/" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
          ☀️ Mapa koupání
        </Link>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-zinc-400">
        Teplota se měří na hydrologických profilech ČHMÚ na řekách, ne přímo na koupacích místech –
        u stojatých vod (jezera, lomy, rybníky, přehrady) jde o orientační odhad z nejbližší říční
        stanice. Zdroj: otevřená data ČHMÚ (opendata.chmi.cz).
      </p>
    </ContentLayout>
  );
}
