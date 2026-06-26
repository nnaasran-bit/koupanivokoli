import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { allLocations } from "@/lib/data";
import { REGIONS } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Koupání podle krajů ČR",
  description:
    "Vyber si kraj a najdi koupaliště, jezera, lomy, přehrady a další místa ke koupání s aktuální kvalitou vody, přístupem a riziky.",
  alternates: { canonical: "/koupani" },
};

export default function KoupaniIndex() {
  const counts = new Map<string, number>();
  for (const l of allLocations) counts.set(l.region, (counts.get(l.region) ?? 0) + 1);

  return (
    <ContentLayout wide>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Koupání podle <span className="text-gradient">krajů</span>
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Prohlédni si místa ke koupání v jednotlivých krajích Česka – od oficiálních koupališť po
          jezera, lomy a přehrady, s kvalitou vody a přístupem.
        </p>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/koupani/${r.slug}`}
              className="group flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-lg">
                  🏊
                </span>
                <span className="font-bold text-slate-900 group-hover:text-brand">{r.name}</span>
              </span>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sm font-semibold text-sky-700">
                {counts.get(r.name) ?? 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ContentLayout>
  );
}
