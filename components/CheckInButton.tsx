"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckInButton({ slug, typeLabel }: { slug: string; typeLabel: string }) {
  const [visits, setVisits] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/place-info?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setVisits(d.visits ?? 0))
      .catch(() => setVisits(0));
  }, [slug]);

  async function checkIn() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/place-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind: "visit" }),
      });
      if (res.status === 401) {
        setNeedLogin(true);
        return;
      }
      const data = await res.json();
      if (res.status === 409) {
        setDone(true);
        setMsg("Tady už máš návštěvu zaznamenanou ✓");
        return;
      }
      if (!res.ok) {
        setMsg(data.error ?? "Nepovedlo se.");
        return;
      }
      setDone(true);
      setVisits((v) => (v ?? 0) + 1);
      setMsg(`🎉 Zaznamenáno! +${data.earned} bodů`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-emerald-900">Byl jsem tady 📍</h2>
          <p className="text-xs text-emerald-700">
            Označ návštěvu a soutěž v{" "}
            <Link href="/zebricek" className="font-medium underline">
              žebříčku návštěvníků
            </Link>
            .{visits != null && ` Toto místo navštívilo ${visits} lidí.`}
          </p>
        </div>
        <button
          onClick={checkIn}
          disabled={busy || done}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {done ? "✓ Navštíveno" : busy ? "…" : "✅ Byl jsem tady (+15)"}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm font-medium text-emerald-800">{msg}</p>}
      {needLogin && (
        <p className="mt-2 text-sm text-emerald-800">
          Pro zaznamenání návštěvy se{" "}
          <Link href="/profil" className="font-bold underline">přihlas</Link> (zdarma).
        </p>
      )}
    </section>
  );
}
