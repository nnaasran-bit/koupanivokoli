"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { kindDef, type Report } from "@/lib/gamify";

export default function CommunityReports({ slug, name }: { slug: string; name: string }) {
  const [reports, setReports] = useState<Report[] | null>(null);

  useEffect(() => {
    fetch(`/api/reports?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []))
      .catch(() => setReports([]));
  }, [slug]);

  const pending = reports?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <section className="mt-4 rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800">Komunitní hlášení</h2>
        <Link
          href={`/nahlasit?misto=${encodeURIComponent(slug)}&nazev=${encodeURIComponent(name)}`}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          ＋ Nahlásit stav
        </Link>
      </div>

      {pending > 0 && (
        <div className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          ⏳ {pending}× čeká na ověření
        </div>
      )}

      {reports === null ? (
        <p className="mt-3 text-sm text-zinc-400">Načítám…</p>
      ) : reports.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          Zatím žádné hlášení. Buď první a získej body! 🏆
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {reports.slice(0, 8).map((r) => {
            const def = kindDef(r.kind);
            return (
              <li key={r.id} className="flex gap-2 text-sm">
                <span>{def?.emoji ?? "📝"}</span>
                <div>
                  <span className="font-medium text-zinc-800">{def?.label ?? r.kind}</span>
                  <span className="text-zinc-400">
                    {" "}
                    · {r.nick} · {new Date(r.createdAt).toLocaleDateString("cs-CZ")}
                  </span>
                  {r.text && <p className="text-zinc-600">{r.text}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-zinc-400">
        Hlášení od návštěvníků jsou orientační a nemění oficiální kvalitu vody.
      </p>
    </section>
  );
}
