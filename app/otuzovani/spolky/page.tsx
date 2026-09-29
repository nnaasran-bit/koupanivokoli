import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { REGIONS } from "@/lib/regions";
import { SPOLKY, spolkyByRegion, TYPE_LABEL } from "@/lib/spolky";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Otužilecké spolky a party v ČR – najdi partu ve svém okolí",
  description:
    `Seznam ${SPOLKY.length} otužileckých part a registrovaných oddílů po celém Česku – kde a kdy se scházejí, kontakt a odkaz na jejich stránku. Otužování je bezpečnější a zábavnější ve partě.`,
  alternates: { canonical: "/otuzovani/spolky" },
  openGraph: {
    title: "Otužilecké spolky a party v ČR",
    description: `${SPOLKY.length} otužileckých part a oddílů po celém Česku – kde a kdy se scházejí.`,
    url: `${SITE_URL}/otuzovani/spolky`,
  },
};

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: SPOLKY.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/otuzovani/spolky/${s.slug}`,
    name: s.name,
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Otužování", item: `${SITE_URL}/otuzovani` },
    { "@type": "ListItem", position: 3, name: "Spolky a party", item: `${SITE_URL}/otuzovani/spolky` },
  ],
};

export default function SpolkyPage() {
  const byRegion = REGIONS.map((r) => ({ region: r, items: spolkyByRegion(r.name) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <ContentLayout wide>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> ·{" "}
        <Link href="/otuzovani" className="hover:text-brand">Otužování</Link> ·{" "}
        <span className="text-slate-700">Spolky a party</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Otužilecké spolky a party v ČR
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Otužování ve partě je bezpečnější a víc vydrží. Tady je {SPOLKY.length} neformálních part i
        registrovaných oddílů po celém Česku – s městem, dnem a časem srazu (pokud je známý) a
        odkazem na jejich vlastní stránku. Data jsou kurátorovaná ručně z veřejných zdrojů (viz
        citace u každé skupiny) – ověř si prosím aktuálnost přímo u nich.
      </p>

      {/* Rychlá navigace na kraje */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {byRegion.map(({ region, items }) => (
          <a
            key={region.slug}
            href={`#${region.slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700"
          >
            {region.name} ({items.length})
          </a>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {byRegion.map(({ region, items }) => (
          <section key={region.slug} id={region.slug} className="scroll-mt-20">
            <h2 className="text-lg font-bold text-slate-900">{region.name}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {items.map((s) => (
                <Link
                  key={s.slug}
                  href={`/otuzovani/spolky/${s.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        s.type === "parta" ? "bg-orange-50 text-orange-700" : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {TYPE_LABEL[s.type]}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{s.city}</div>
                  {s.schedule && <div className="mt-1 text-sm font-medium text-slate-700">🕒 {s.schedule}</div>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs leading-relaxed text-zinc-400">
        Znáš partu, která tu chybí, nebo se u některé změnil čas srazu? Napiš nám přes{" "}
        <Link href="/nahlasit" className="text-brand hover:underline">formulář hlášení</Link> a doplníme to.
      </p>
    </ContentLayout>
  );
}
