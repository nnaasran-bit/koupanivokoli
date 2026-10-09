import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentLayout from "@/components/ContentLayout";
import { allLocations } from "@/lib/data";
import { CITIES, cityBySlug } from "@/lib/cities";
import { distanceKm } from "@/lib/filters";
import { ratingStats } from "@/lib/store";
import { QUALITY_COLORS, QUALITY_LABELS, TYPE_LABELS } from "@/lib/quality";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Location } from "@/lib/types";

// Žebříček je pomalu proměnný (nová hodnocení), ne nutný na každý request.
export const revalidate = 3600;

const RADIUS_KM = 35;
const EXCLUDE_TYPES = new Set(["bazen", "kemp"]);
const EXCLUDE_QUALITY = new Set(["nevhodna", "zakaz_koupani"]);

export function generateStaticParams() {
  return CITIES.map((c) => ({ mesto: c.slug }));
}

function nearbyGoodLocations(city: { lat: number; lng: number }): Location[] {
  return allLocations.filter(
    (l) =>
      !EXCLUDE_TYPES.has(l.type) &&
      !EXCLUDE_QUALITY.has(l.quality.class) &&
      l.access.status !== "zakazano" &&
      distanceKm(city, l) <= RADIUS_KM,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mesto: string }>;
}): Promise<Metadata> {
  const { mesto } = await params;
  const city = cityBySlug(mesto);
  if (!city) return { title: "Město nenalezeno" };
  const title = `Nejlepší místa na koupání u ${city.genitive} – Top 10`;
  const description = `Nejlépe hodnocená místa ke koupání do ${RADIUS_KM} km od ${city.genitive}: jezera, lomy, rybníky a přehrady seřazené podle hodnocení komunity.`;
  return {
    title,
    description,
    alternates: { canonical: `/nejlepsi-mista/${city.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/nejlepsi-mista/${city.slug}` },
  };
}

export default async function NejlepsiMistaPage({ params }: { params: Promise<{ mesto: string }> }) {
  const { mesto } = await params;
  const city = cityBySlug(mesto);
  if (!city) notFound();

  const ratings = await ratingStats();
  const candidates = nearbyGoodLocations(city);
  const ranked = candidates
    .map((l) => ({
      l,
      d: distanceKm(city, l),
      r: ratings.get(l.slug) ?? { avg: 0, count: 0 },
    }))
    .sort((a, b) => b.r.avg - a.r.avg || b.r.count - a.r.count || a.d - b.d || a.l.name.localeCompare(b.l.name, "cs"))
    .slice(0, 10);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Nejlepší místa u ${city.genitive}`, item: `${SITE_URL}/nejlepsi-mista/${city.slug}` },
    ],
  };
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ranked.map(({ l }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: l.name,
      url: `${SITE_URL}/lokalita/${l.slug}`,
    })),
  };

  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> · <span className="text-slate-700">Nejlepší místa u {city.genitive}</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Nejlepší místa na koupání u {city.genitive}
      </h1>
      <p className="mt-2 text-slate-600">
        {ranked.length > 0
          ? `Top ${ranked.length} míst do ${RADIUS_KM} km od ${city.genitive}, seřazeno podle hodnocení komunity.`
          : `Zatím tu nemáme dost hodnocených míst do ${RADIUS_KM} km od ${city.genitive}.`}
      </p>

      <ol className="mt-6 space-y-2">
        {ranked.map(({ l, d, r }, i) => (
          <li key={l.slug}>
            <Link
              href={`/lokalita/${l.slug}`}
              className="flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderLeftColor: QUALITY_COLORS[l.quality.class] }}
            >
              <span className="w-6 shrink-0 text-center text-lg font-extrabold text-slate-300">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-slate-900">{l.name}</div>
                <div className="truncate text-xs text-slate-400">
                  {TYPE_LABELS[l.type]} · {d.toFixed(0)} km · {QUALITY_LABELS[l.quality.class]}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {r.count > 0 ? (
                  <>
                    <div className="text-sm font-bold text-amber-500">★ {r.avg.toFixed(1)}</div>
                    <div className="text-[11px] text-slate-400">{r.count}×</div>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-300">bez hodnocení</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <h2 className="mt-8 text-sm font-bold text-slate-900">Další města</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
          <Link
            key={c.slug}
            href={`/nejlepsi-mista/${c.slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs leading-relaxed text-zinc-400">
        Pořadí vychází z hodnocení návštěvníků webu (1 IP = 1 hlas u každého místa); místa bez
        hodnocení řadíme podle vzdálenosti. Ohodnoť místa, která znáš, na jejich detailu – pomůže to
        přesnosti žebříčku pro ostatní.
      </p>
    </ContentLayout>
  );
}
