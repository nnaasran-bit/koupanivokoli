import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentLayout from "@/components/ContentLayout";
import { allLocations } from "@/lib/data";
import { otuzovaniLocations } from "@/lib/otuzovani";
import { REGIONS, regionBySlug } from "@/lib/regions";
import { SPOLKY, spolkyByRegion, TYPE_LABEL } from "@/lib/spolky";
import { listSpolekSubmissions } from "@/lib/store";
import { nearestWaterTemp } from "@/lib/watertemp";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { QUALITY_COLORS, QUALITY_LABELS, TYPE_LABELS } from "@/lib/quality";

// Spolky přidané komunitou (bez registrace) se do krajského přehledu promítnou
// do pár minut, ne při každém requestu.
export const revalidate = 120;

export function generateStaticParams() {
  return REGIONS.map((r) => ({ kraj: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kraj: string }>;
}): Promise<Metadata> {
  const { kraj } = await params;
  const region = regionBySlug(kraj);
  if (!region) return { title: "Kraj nenalezen" };
  const list = otuzovaniLocations(allLocations).filter((l) => l.region === region.name);
  const spolky = spolkyByRegion(region.name);
  const description = `Otužování v ${region.name}: ${list.length} přírodních míst vhodných k otužování a ${spolky.length} otužileckých part/oddílů v kraji.`;
  return {
    title: `Otužování – ${region.name}`,
    description,
    alternates: { canonical: `/otuzovani/${region.slug}` },
    openGraph: { title: `Otužování v ${region.name}`, description, url: `${SITE_URL}/otuzovani/${region.slug}` },
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

export default async function OtuzovaniRegionPage({ params }: { params: Promise<{ kraj: string }> }) {
  const { kraj } = await params;
  const region = regionBySlug(kraj);
  if (!region) notFound();

  const list = otuzovaniLocations(allLocations)
    .filter((l) => l.region === region.name)
    .sort((a, b) => a.name.localeCompare(b.name, "cs"));
  const spolky = spolkyByRegion(region.name);
  const submissions = (await listSpolekSubmissions().catch(() => [])).filter((s) => s.region === region.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Otužování v ${region.name}`,
    url: `${SITE_URL}/otuzovani/${region.slug}`,
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
      { "@type": "ListItem", position: 2, name: "Otužování", item: `${SITE_URL}/otuzovani` },
      { "@type": "ListItem", position: 3, name: region.name, item: `${SITE_URL}/otuzovani/${region.slug}` },
    ],
  };

  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> ·{" "}
        <Link href="/otuzovani" className="hover:text-brand">Otužování</Link> ·{" "}
        <span className="text-slate-700">{region.name}</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        ❄️ Otužování v {region.name}
      </h1>
      <p className="mt-2 text-slate-600">
        Přírodní místa vhodná k otužování a otužilecké party/oddíly v kraji – vše na jednom místě.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat value={list.length} label="míst k otužování" />
        <Stat value={spolky.length + submissions.length} label="part a oddílů" />
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Kde se otužovat</h2>
      <ul className="mt-3 space-y-2">
        {list.map((l) => {
          const t = nearestWaterTemp(l.lat, l.lng);
          return (
            <li key={l.slug}>
              <Link
                href={`/lokalita/${l.slug}`}
                className="block overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderLeftColor: QUALITY_COLORS[l.quality.class] }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold text-slate-900">{l.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {t && (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                        🌡️ {t.tempC.toFixed(1)} °C
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: QUALITY_COLORS[l.quality.class] }} />
                      {QUALITY_LABELS[l.quality.class]}
                    </span>
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {TYPE_LABELS[l.type]}
                  {l.municipality ? ` · ${l.municipality}` : ""}
                </div>
              </Link>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            Pro tento kraj zatím nemáme vytipovaná místa.
          </li>
        )}
      </ul>

      {(spolky.length > 0 || submissions.length > 0) && (
        <>
          <h2 className="mt-8 text-lg font-bold text-slate-900">Otužilecké party a oddíly</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {spolky.map((s) => (
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
            {submissions.map((s) => (
              <div key={s.id} className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    od komunity
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-500">{s.city}</div>
                {s.schedule && <div className="mt-1 text-sm font-medium text-slate-700">🕒 {s.schedule}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/otuzovani/spolky/pridat" className="brand-gradient rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105">
          ➕ Přidat partu z {region.name}
        </Link>
        <Link href="/otuzovani/tipy-a-triky" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700">
          Tipy a triky na otužování
        </Link>
      </div>
    </ContentLayout>
  );
}
