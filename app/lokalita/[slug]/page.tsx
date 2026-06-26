import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allSlugs, getLocationBySlug } from "@/lib/data";
import CommunityReports from "@/components/CommunityReports";
import CommunityInfo from "@/components/CommunityInfo";
import ContentLayout from "@/components/ContentLayout";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { slugForRegion } from "@/lib/regions";
import {
  ACCESS_LABELS,
  QUALITY_COLORS,
  QUALITY_LABELS,
  TYPE_LABELS,
  formatDateCz,
  freshness,
} from "@/lib/quality";
import type { Location } from "@/lib/types";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

function describe(loc: Location): string {
  const typ = TYPE_LABELS[loc.type].toLowerCase();
  const kde = [loc.region && `v kraji ${loc.region}`, loc.municipality && `(obec ${loc.municipality})`]
    .filter(Boolean)
    .join(" ");
  const sledovani = loc.monitored
    ? `Jakost vody zde sleduje ${loc.quality.source ?? "hygienická stanice"}.`
    : "Jakost vody zde není oficiálně sledována, koupání je na vlastní riziko.";
  return `${loc.name} je ${typ}${kde ? ` ${kde}` : ""}. ${QUALITY_LABELS[loc.quality.class]}. ${sledovani} ${ACCESS_LABELS[loc.access.status]}.`;
}

const ACCESS_COLOR: Record<string, string> = {
  povoleno: "#16a34a",
  omezeno: "#b45309",
  zakazano: "#111827",
  nezname: "#64748b",
};
const ACCESS_ICON: Record<string, string> = {
  povoleno: "🔓",
  omezeno: "⚠️",
  zakazano: "⛔",
  nezname: "❔",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) return { title: "Lokalita nenalezena" };
  const description = describe(loc);
  const url = `${SITE_URL}/lokalita/${loc.slug}`;
  return {
    title: `${loc.name} – kvalita vody a přístup`,
    description,
    alternates: { canonical: `/lokalita/${loc.slug}` },
    openGraph: { title: loc.name, description, url, type: "website" },
    other: {
      "geo.position": `${loc.lat};${loc.lng}`,
      ICBM: `${loc.lat}, ${loc.lng}`,
      "geo.region": "CZ",
      "geo.placename": loc.municipality || loc.region || "Česko",
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) notFound();

  const f = freshness(loc.quality.sampledAt);
  const qColor = QUALITY_COLORS[loc.quality.class];
  const aColor = ACCESS_COLOR[loc.access.status];
  const url = `${SITE_URL}/lokalita/${loc.slug}`;
  const regionSlug = loc.region ? slugForRegion(loc.region) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: loc.name,
    description: describe(loc),
    url,
    geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
    hasMap: `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=15/${loc.lat}/${loc.lng}`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "CZ",
      ...(loc.region ? { addressRegion: loc.region } : {}),
      ...(loc.municipality ? { addressLocality: loc.municipality } : {}),
    },
    ...(loc.region ? { containedInPlace: { "@type": "AdministrativeArea", name: loc.region } } : {}),
    publicAccess: loc.access.status === "povoleno",
  };

  const crumbs: { name: string; item: string }[] = [{ name: SITE_NAME, item: SITE_URL }];
  if (regionSlug && loc.region) crumbs.push({ name: loc.region, item: `${SITE_URL}/koupani/${regionSlug}` });
  crumbs.push({ name: loc.name, item: url });
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
  };

  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link>
        {regionSlug && loc.region && (
          <>
            {" · "}
            <Link href={`/koupani/${regionSlug}`} className="hover:text-brand">{loc.region}</Link>
          </>
        )}
        {" · "}
        <span className="text-slate-700">{loc.name}</span>
      </nav>

      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2.5" style={{ background: qColor }} />
        <div className="p-5 sm:p-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{loc.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {TYPE_LABELS[loc.type]}
            {loc.municipality ? ` · ${loc.municipality}` : ""}
            {loc.district ? ` · okres ${loc.district}` : ""}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* Kvalita vody */}
            <div
              className="rounded-2xl border p-4"
              style={{ backgroundColor: qColor + "12", borderColor: qColor + "33" }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">💧 Kvalita vody</div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full ring-2 ring-white" style={{ background: qColor }} />
                <span className="text-lg font-bold text-slate-900">{QUALITY_LABELS[loc.quality.class]}</span>
              </div>
              {loc.quality.cyanobacteria && (
                <div className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  ⚠ Výskyt sinic
                </div>
              )}
              <div className="mt-2 space-y-0.5 text-sm text-slate-600">
                <div>
                  Poslední kontrola:{" "}
                  <span className="font-medium text-slate-900">
                    {loc.quality.sampledAt ? formatDateCz(loc.quality.sampledAt) : "—"}
                  </span>{" "}
                  <span className="text-slate-400">({f.label})</span>
                </div>
                <div>Zdroj: <span className="font-medium text-slate-900">{loc.quality.source ?? "—"}</span></div>
              </div>
            </div>

            {/* Přístup */}
            <div
              className="rounded-2xl border p-4"
              style={{ backgroundColor: aColor + "12", borderColor: aColor + "33" }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {ACCESS_ICON[loc.access.status]} Přístup a pravidla
              </div>
              <div className="mt-1.5 text-lg font-bold text-slate-900">{ACCESS_LABELS[loc.access.status]}</div>
              <div className="mt-2 space-y-0.5 text-sm text-slate-600">
                {loc.access.reason && (
                  <div>Důvod: <span className="font-medium text-slate-900">{loc.access.reason}</span></div>
                )}
                {loc.access.source && (
                  <div>Zdroj: <span className="font-medium text-slate-900">{loc.access.source}</span></div>
                )}
              </div>
              {loc.access.note && <p className="mt-2 text-sm text-slate-600">{loc.access.note}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bezpečnost */}
      {loc.safety && loc.safety.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-amber-700">⚠ Bezpečnostní upozornění</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {loc.safety.map((s, i) => (
              <li key={i}>{s.text}</li>
            ))}
          </ul>
        </section>
      )}

      {/* O lokalitě */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">O lokalitě</h2>
        {loc.description && <p className="mt-2 text-sm leading-relaxed text-slate-700">{loc.description}</p>}
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{describe(loc)}</p>
      </section>

      {/* Historie kvality vody */}
      {loc.history && loc.history.length > 0 && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Historie kvality vody</h2>
          <ol className="mt-4 flex flex-wrap gap-5">
            {loc.history.map((h, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white shadow-sm"
                  style={{ background: QUALITY_COLORS[h.class] }}
                  title={QUALITY_LABELS[h.class]}
                />
                <span className="text-[11px] font-medium text-slate-500">{formatDateCz(h.date)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Vybavení a tipy od komunity */}
      <CommunityInfo slug={loc.slug} />

      {/* Komunitní hlášení */}
      <CommunityReports slug={loc.slug} name={loc.name} />

      {/* GPS + zdroj */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <div className="flex justify-between gap-2">
          <span>📍 GPS</span>
          <span className="font-medium text-slate-900">
            {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
          </span>
        </div>
        {loc.quality.sourceUrl && (
          <div className="mt-1.5 flex justify-between gap-2">
            <span>Oficiální zdroj</span>
            <a href={loc.quality.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
              odkaz →
            </a>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-relaxed text-slate-400">
        Informace jsou orientační. Rozhodující jsou oficiální zdroje (KHS, SZÚ). U nesledovaných
        lokalit je koupání na vlastní riziko. Web nenese odpovědnost za porušení zákazů a
        nezveřejňuje návody k jejich obcházení.
      </p>
    </ContentLayout>
  );
}
