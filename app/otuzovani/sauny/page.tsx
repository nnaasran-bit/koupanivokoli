import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { SAUNY } from "@/lib/sauny";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sauny u vody – kontrastní koupel k otužování",
  description:
    `${SAUNY.length} sauen a wellness u přírodní vody po celém Česku – plovoucí sauny, sauny u jezer a řek, ideální na kontrastní koupel po otužování.`,
  alternates: { canonical: "/otuzovani/sauny" },
  openGraph: {
    title: "Sauny u vody – kontrastní koupel k otužování",
    description: "Sauny a wellness u přírodní vody po celém Česku – kontrastní koupel k otužování.",
    url: `${SITE_URL}/otuzovani/sauny`,
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Otužování", item: `${SITE_URL}/otuzovani` },
    { "@type": "ListItem", position: 3, name: "Sauny u vody", item: `${SITE_URL}/otuzovani/sauny` },
  ],
};

export default function SaunyPage() {
  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> ·{" "}
        <Link href="/otuzovani" className="hover:text-brand">Otužování</Link> ·{" "}
        <span className="text-slate-700">Sauny u vody</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        🔥 Sauny u vody
      </h1>
      <p className="mt-2 max-w-3xl text-slate-600">
        Kontrastní koupel (studená voda → sauna → studená voda) je oblíbené a příjemné pokračování
        otužování, i když k otužování samotnému potřeba není. Tady je {SAUNY.length} sauen a
        wellness míst přímo u přírodní vody po celém Česku.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SAUNY.map((s) => (
          <a
            key={s.name}
            href={s.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
          >
            <div className="font-bold text-slate-900">{s.name}</div>
            <div className="mt-0.5 text-sm text-slate-500">{s.city}</div>
            <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
            <div className="mt-2 text-xs text-slate-400">Zdroj: {s.sourceName} →</div>
          </a>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        <Link href="/otuzovani" className="rounded-full bg-sky-700 px-3.5 py-1.5 font-semibold text-white hover:brightness-105">
          ❄️ Mapa míst k otužování
        </Link>
        <Link href="/otuzovani/tipy-a-triky" className="rounded-full border border-sky-200 bg-white px-3.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-50">
          Tipy a triky
        </Link>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-zinc-400">
        Výběr je ručně kurátorovaný z veřejných zdrojů (u každého místa odkaz) – nejde o vlastní
        recenze ani placené umístění. Otevírací doby a ceny si ověř přímo u provozovatele. Znáš
        sauny u vody, co tu chybí? Napiš nám přes{" "}
        <Link href="/nahlasit" className="text-brand hover:underline">formulář hlášení</Link>.
      </p>
    </ContentLayout>
  );
}
