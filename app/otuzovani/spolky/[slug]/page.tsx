import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentLayout from "@/components/ContentLayout";
import { SPOLKY, spolekBySlug, spolkyByRegion, TYPE_LABEL } from "@/lib/spolky";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return SPOLKY.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = spolekBySlug(slug);
  if (!s) return { title: "Spolek nenalezen" };
  const title = `${s.name} – otužování v ${s.city}`;
  const description = s.schedule
    ? `${s.name}: otužování v ${s.city} (${s.region}), sraz ${s.schedule}${s.place ? ` na místě ${s.place}` : ""}.`
    : `${s.name}: ${TYPE_LABEL[s.type].toLowerCase()} pro otužování v ${s.city} (${s.region}).`;
  return {
    title,
    description,
    alternates: { canonical: `/otuzovani/spolky/${s.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/otuzovani/spolky/${s.slug}` },
  };
}

export default async function SpolekPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = spolekBySlug(slug);
  if (!s) notFound();

  const others = spolkyByRegion(s.region).filter((x) => x.slug !== s.slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: s.name,
    url: `${SITE_URL}/otuzovani/spolky/${s.slug}`,
    ...(s.website ? { sameAs: [s.website] } : {}),
    address: { "@type": "PostalAddress", addressLocality: s.city, addressRegion: s.region, addressCountry: "CZ" },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Otužování", item: `${SITE_URL}/otuzovani` },
      { "@type": "ListItem", position: 3, name: "Spolky a party", item: `${SITE_URL}/otuzovani/spolky` },
      { "@type": "ListItem", position: 4, name: s.name, item: `${SITE_URL}/otuzovani/spolky/${s.slug}` },
    ],
  };

  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> ·{" "}
        <Link href="/otuzovani" className="hover:text-brand">Otužování</Link> ·{" "}
        <Link href="/otuzovani/spolky" className="hover:text-brand">Spolky a party</Link> ·{" "}
        <span className="text-slate-700">{s.name}</span>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{s.name}</h1>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              s.type === "parta" ? "bg-orange-50 text-orange-700" : "bg-sky-50 text-sky-700"
            }`}
          >
            {TYPE_LABEL[s.type]}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {s.city} · {s.region}
          {s.district ? ` · okres ${s.district}` : ""}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {s.schedule && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">🕒 Kdy se scházejí</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{s.schedule}</div>
              {s.place && <div className="mt-1 text-sm text-slate-600">📍 {s.place}</div>}
            </div>
          )}
          {s.members && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">👥 Orientační počet členů</div>
              <div className="mt-1 text-lg font-bold text-slate-900">{s.members}</div>
            </div>
          )}
        </div>

        {s.desc && <p className="mt-4 text-sm leading-relaxed text-slate-700">{s.desc}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={s.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-gradient rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
          >
            {s.website ? "Web spolku" : "Kontakt a víc info"} →
          </a>
          {s.contactPerson && (
            <span className="flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600">
              Kontaktní osoba: <span className="ml-1 font-medium text-slate-900">{s.contactPerson}</span>
            </span>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-slate-900">Další spolky v kraji {s.region}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/otuzovani/spolky/${o.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700"
              >
                {o.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-relaxed text-slate-400">
        Údaje jsou kurátorované ručně z veřejného zdroje:{" "}
        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          {s.sourceName}
        </a>
        . Časy srazů, kontakty i aktivita party se mohou měnit – ověř si aktuální stav přímo u nich.
        Vidíš chybu nebo znáš svou vlastní partu?{" "}
        <Link href="/nahlasit" className="text-brand hover:underline">Napiš nám</Link>.
      </p>
    </ContentLayout>
  );
}
