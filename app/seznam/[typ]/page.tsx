import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentLayout from "@/components/ContentLayout";
import { allLocations } from "@/lib/data";
import { ratingStats } from "@/lib/store";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { QUALITY_COLORS, QUALITY_LABELS, POOL_COLOR, CAMP_COLOR } from "@/lib/quality";
import type { Location, LocationType } from "@/lib/types";

export const dynamic = "force-dynamic";

// Mapování hezkých URL na typy (i s nadpisem a popisem).
const LISTS: Record<string, { types: LocationType[]; title: string; one: string; desc: string }> = {
  lomy: { types: ["lom"], title: "Lomy ke koupání v ČR", one: "lom", desc: "Zatopené lomy vhodné ke koupání s kvalitou vody, fotkami a hodnocením." },
  piskovny: { types: ["piskovna"], title: "Pískovny ke koupání v ČR", one: "pískovna", desc: "Zatopené pískovny ke koupání po celém Česku." },
  prehrady: { types: ["prehrada"], title: "Přehrady ke koupání v ČR", one: "přehrada", desc: "Přehrady a vodní nádrže ke koupání s aktuální kvalitou vody." },
  jezera: { types: ["jezero"], title: "Jezera ke koupání v ČR", one: "jezero", desc: "Přírodní i umělá jezera ke koupání." },
  rybniky: { types: ["rybnik"], title: "Rybníky ke koupání v ČR", one: "rybník", desc: "Rybníky vhodné ke koupání." },
  koupaliste: { types: ["koupaliste", "koupaci_oblast", "prirodni_koupaliste"], title: "Koupaliště a koupací oblasti v ČR", one: "koupaliště", desc: "Oficiální koupaliště a sledované koupací oblasti." },
  bazeny: { types: ["bazen"], title: "Bazény a aquaparky v ČR", one: "bazén", desc: "Kryté i venkovní bazény a aquaparky." },
  kempy: { types: ["kemp"], title: "Kempy a tábořiště u vody v ČR", one: "kemp", desc: "Kempy a tábořiště, často u vody (i vodácké)." },
};

export function generateStaticParams() {
  return Object.keys(LISTS).map((typ) => ({ typ }));
}

export async function generateMetadata({ params }: { params: Promise<{ typ: string }> }): Promise<Metadata> {
  const { typ } = await params;
  const def = LISTS[typ];
  if (!def) return { title: "Seznam nenalezen" };
  return {
    title: def.title,
    description: def.desc,
    alternates: { canonical: `/seznam/${typ}` },
    openGraph: { title: def.title, description: def.desc, url: `${SITE_URL}/seznam/${typ}` },
  };
}

function dotColor(l: Location) {
  if (l.type === "bazen") return POOL_COLOR;
  if (l.type === "kemp") return CAMP_COLOR;
  return QUALITY_COLORS[l.quality.class];
}

export default async function SeznamPage({ params }: { params: Promise<{ typ: string }> }) {
  const { typ } = await params;
  const def = LISTS[typ];
  if (!def) notFound();

  const ratings = await ratingStats();
  const items = allLocations
    .filter((l) => def.types.includes(l.type))
    .map((l) => ({ l, r: ratings.get(l.slug) ?? { avg: 0, count: 0 } }))
    .sort((a, b) => b.r.avg - a.r.avg || b.r.count - a.r.count || a.l.name.localeCompare(b.l.name, "cs"));

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: def.title, item: `${SITE_URL}/seznam/${typ}` },
    ],
  };

  return (
    <ContentLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> · <span className="text-slate-700">{def.title}</span>
      </nav>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{def.title}</h1>
      <p className="mt-2 text-slate-600">{def.desc} Celkem {items.length} míst, seřazeno podle hodnocení.</p>

      {/* Odkazy na další typy */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(LISTS).map(([k, v]) => (
          <Link
            key={k}
            href={`/seznam/${k}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              k === typ ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {v.one}
          </Link>
        ))}
      </div>

      <ul className="mt-5 space-y-2">
        {items.map(({ l, r }) => (
          <li key={l.slug}>
            <Link
              href={`/lokalita/${l.slug}`}
              className="flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderLeftColor: dotColor(l) }}
            >
              <div className="min-w-0">
                <div className="truncate font-bold text-slate-900">{l.name}</div>
                <div className="truncate text-xs text-slate-400">
                  {l.region || "ČR"}
                  {l.municipality ? ` · ${l.municipality}` : ""}
                  {l.type !== "bazen" && l.type !== "kemp" ? ` · ${QUALITY_LABELS[l.quality.class]}` : ""}
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
      </ul>
    </ContentLayout>
  );
}
