"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AMENITIES } from "@/lib/gamify";

interface AmenityCount {
  id: string;
  label: string;
  emoji: string;
  count: number;
}
interface Tip {
  nick: string;
  text: string;
  createdAt: string;
}

export default function CommunityInfo({ slug }: { slug: string }) {
  const [amenities, setAmenities] = useState<AmenityCount[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [tipText, setTipText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/place-info?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setAmenities(d.amenities ?? []);
        setTips(d.tips ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [slug]);

  useEffect(load, [load]);

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/place-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...payload }),
      });
      if (res.status === 401) {
        setNeedLogin(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setFlash(data.error ?? "Nepovedlo se.");
        return;
      }
      setFlash(`Díky! +${data.earned} bodů 🎉`);
      load();
    } catch {
      setFlash("Chyba spojení.");
    } finally {
      setBusy(false);
    }
  }

  const confirmedIds = new Set(amenities.map((a) => a.id));

  return (
    <section className="mt-4 rounded-xl border border-zinc-200 p-4">
      <h2 className="text-sm font-semibold text-zinc-800">Vybavení a tipy od komunity</h2>

      {/* Potvrzené vybavení */}
      {amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
              title={`${a.count}× potvrzeno`}
            >
              {a.emoji} {a.label} <span className="text-blue-400">×{a.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Přidat / potvrdit vybavení */}
      <div className="mt-3">
        <div className="mb-1 text-xs font-medium text-zinc-500">Potvrď, co tu je (+5 bodů):</div>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((a) => (
            <button
              key={a.id}
              disabled={busy}
              onClick={() => post({ kind: "amenity", amenity: a.id })}
              className={`rounded-full border px-2.5 py-1 text-xs transition hover:bg-zinc-50 disabled:opacity-50 ${
                confirmedIds.has(a.id) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-zinc-300 text-zinc-700"
              }`}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipy */}
      <div className="mt-4">
        <div className="mb-1 text-xs font-medium text-zinc-500">Tipy návštěvníků</div>
        {loaded && tips.length === 0 && (
          <p className="text-sm text-zinc-500">Zatím žádný tip. Přidej první a získej +10 bodů!</p>
        )}
        <ul className="space-y-1.5">
          {tips.map((t, i) => (
            <li key={i} className="text-sm text-zinc-700">
              💬 {t.text} <span className="text-zinc-400">— {t.nick}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="Tvůj tip (parkování, vstup, voda…)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            disabled={busy || tipText.trim().length < 3}
            onClick={() => {
              post({ kind: "tip", text: tipText });
              setTipText("");
            }}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Přidat tip
          </button>
        </div>
      </div>

      {flash && <p className="mt-2 text-sm font-medium text-green-700">{flash}</p>}
      {needLogin && (
        <p className="mt-2 text-sm text-zinc-600">
          Pro přidávání informací se{" "}
          <Link href="/profil" className="font-medium text-blue-600 hover:underline">
            přihlas nebo zaregistruj
          </Link>
          .
        </p>
      )}
      <p className="mt-3 text-xs text-zinc-400">
        Komunitní informace jsou orientační a doplňují oficiální data.
      </p>
    </section>
  );
}
