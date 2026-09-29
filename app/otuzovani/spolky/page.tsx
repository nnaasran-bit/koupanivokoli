import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { REGIONS } from "@/lib/regions";
import { SPOLKY, spolkyByRegion, TYPE_LABEL } from "@/lib/spolky";
import { listSpolekSubmissions } from "@/lib/store";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Komunitní party (bez registrace přidané) se objeví do pár minut, ne hned při
// každém requestu – ať je stránka rychlá a nešahá na DB pořád.
export const revalidate = 120;

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

export default async function SpolkyPage() {
  const submissions = await listSpolekSubmissions().catch(() => []);
  const byRegion = REGIONS.map((r) => ({
    region: r,
    items: spolkyByRegion(r.name),
    community: submissions.filter((s) => s.region === r.name),
  })).filter((g) => g.items.length > 0 || g.community.length > 0);
  const total = SPOLKY.length + submissions.length;

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
        Otužování ve partě je bezpečnější a víc vydrží. Tady je {total} neformálních part i
        registrovaných oddílů po celém Česku – s městem, dnem a časem srazu (pokud je známý) a
        odkazem na jejich vlastní stránku. {SPOLKY.length} je kurátorovaných z veřejných zdrojů,
        zbytek přidala komunita přímo na webu.
      </p>

      <Link
        href="/otuzovani/spolky/pridat"
        className="brand-gradient mt-4 inline-block rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
      >
        ➕ Přidat vlastní partu (bez registrace)
      </Link>

      {/* Rychlá navigace na kraje */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {byRegion.map(({ region, items, community }) => (
          <a
            key={region.slug}
            href={`#${region.slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700"
          >
            {region.name} ({items.length + community.length})
          </a>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {byRegion.map(({ region, items, community }) => (
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
              {community.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      od komunity
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{s.city}</div>
                  {s.schedule && <div className="mt-1 text-sm font-medium text-slate-700">🕒 {s.schedule}</div>}
                  {s.place && <div className="mt-0.5 text-xs text-slate-500">📍 {s.place}</div>}
                  {s.desc && <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>}
                  {s.contact && <div className="mt-1.5 text-xs text-slate-500">Kontakt: {s.contact}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs leading-relaxed text-zinc-400">
        Znáš partu, která tu chybí? <Link href="/otuzovani/spolky/pridat" className="text-brand hover:underline">Přidej ji</Link>{" "}
        rovnou bez registrace. Změnil se u některé čas srazu? Napiš nám přes{" "}
        <Link href="/nahlasit" className="text-brand hover:underline">formulář hlášení</Link>.
      </p>
    </ContentLayout>
  );
}
