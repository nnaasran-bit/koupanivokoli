"use client";

import { useEffect, useState } from "react";

export default function RatingWidget({ slug }: { slug: string }) {
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/rating?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setAvg(d.avg ?? 0);
        setCount(d.count ?? 0);
        setMine(d.mine ?? null);
      })
      .catch(() => {});
  }, [slug]);

  async function rate(value: number) {
    setBusy(true);
    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, value }),
      });
      const d = await res.json();
      if (res.ok) {
        setAvg(d.avg ?? 0);
        setCount(d.count ?? 0);
        setMine(d.mine ?? value);
      }
    } finally {
      setBusy(false);
    }
  }

  const shown = hover || mine || Math.round(avg);

  return (
    <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-amber-900">Hodnocení místa</h2>
          <p className="text-xs text-amber-700">
            {count > 0 ? `Průměr ${avg.toFixed(1)} z 5 (${count} hodnocení)` : "Zatím nikdo nehodnotil – buď první!"}
          </p>
        </div>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              disabled={busy}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              className="text-2xl leading-none transition-transform hover:scale-110 disabled:opacity-50"
              aria-label={`${n} hvězd`}
            >
              <span className={n <= shown ? "text-amber-500" : "text-amber-200"}>★</span>
            </button>
          ))}
        </div>
      </div>
      {mine != null && <p className="mt-2 text-xs font-medium text-amber-800">Tvoje hodnocení: {mine}★ (lze změnit)</p>}
    </section>
  );
}
