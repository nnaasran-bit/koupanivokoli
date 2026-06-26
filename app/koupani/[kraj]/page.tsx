import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentLayout from "@/components/ContentLayout";
import { allLocations } from "@/lib/data";
import { REGIONS, regionBySlug } from "@/lib/regions";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { ACCESS_LABELS, QUALITY_COLORS, QUALITY_LABELS, TYPE_LABELS, freshness } from "@/lib/quality";
import type { Location } from "@/lib/types";

export function generateStaticParams() {
  return REGIONS.map((r) => ({ kraj: r.slug }));
}

function locationsIn(regionName: string): Location[] {
  return allLocations
    .filter((l) => l.region === regionName)
    .sort((a, b) => Number(b.monitored) - Number(a.monitored) || a.name.localeCompare(b.name, "cs"));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kraj: string }>;
}): Promise<Metadata> {
  const { kraj } = await params;
  const region = regionBySlug(kraj);
  if (!region) return { title: "Kraj nenalezen" };
  const list = locationsIn(region.name);
  const monitored = list.filter((l) => l.monitored).length;
  const description = `Koupání v ${region.name}: ${list.length} míst ke koupání, z toho ${monitored} oficiálně sledovaných. Kvalita vody, koupaliště, jezera, lomy a přehrady na mapě.`;
  return {
    title: `Koupání – ${region.name}`,
    description,
    alternates: { canonical: `/koupani/${region.slug}` },
    openGraph: { title: `Koupání v ${region.name}`, description, url: `${SITE_URL}/koupani/${region.slug}` },
  };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

export default async function RegionPage({ params }: { params: Promise<{ kraj: string }> }) {
  const { kraj } = await params;
  const region = regionBySlug(kraj);
  if (!region) notFound();

  const list = locationsIn(region.name);
  const monitored = list.filter((l) => l.monitored).length;
  const suitable = list.filter((l) => l.quality.class === "vyborna" || l.quality.class === "vhodna").length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Koupání v ${region.name}`,
    url: `${SITE_URL}/koupani/${region.slug}`,
    about: { "@type": "AdministrativeArea", name: region.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: list.length,
      itemListElement: list.slice(0, 30).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: l.name,
        url: `${SITE_URL}/lokalita/${l.slug}`,
      })),
    },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Koupání podle krajů", item: `${SITE_URL}/koupani` },
      { "@type": "ListItem", position: 3, name: region.name, item: `${SITE_URL}/koupani/${region.slug}` },
    ],
  };

  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link>
        {" · "}
        <Link href="/koupani" className="hover:text-brand">Kraje</Link>
        {" · "}
        <span className="text-slate-700">{region.name}</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Koupání v {region.name}
      </h1>
      <p className="mt-2 text-slate-600">
        Místa ke koupání v kraji – kvalita vody, koupaliště, jezera, lomy a přehrady.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat value={list.length} label="míst celkem" />
        <Stat value={monitored} label="sledovaných" />
        <Stat value={suitable} label="vhodných" />
      </div>

      <ul className="mt-6 space-y-2">
        {list.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/lokalita/${l.slug}`}
              className="block overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderLeftColor: QUALITY_COLORS[l.quality.class] }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-bold text-slate-900">{l.name}</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: QUALITY_COLORS[l.quality.class] }} />
                  {QUALITY_LABELS[l.quality.class]}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {TYPE_LABELS[l.type]}
                {l.monitored ? ` · ${freshness(l.quality.sampledAt).label}` : ""}
                {l.access.status !== "povoleno" ? ` · ${ACCESS_LABELS[l.access.status]}` : ""}
              </div>
            </Link>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            Pro tento kraj zatím nemáme žádná místa.
          </li>
        )}
      </ul>
    </ContentLayout>
  );
}
