"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PlacePhoto({
  slug,
  name,
  officialPhoto,
  officialCredit,
}: {
  slug: string;
  name: string;
  officialPhoto?: string;
  officialCredit?: string;
}) {
  const [communityPhoto, setCommunityPhoto] = useState<{ url: string; nick: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [needLogin, setNeedLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (officialPhoto) {
      setLoaded(true);
      return;
    }
    fetch(`/api/place-info?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.photos && d.photos.length) setCommunityPhoto({ url: d.photos[0].url, nick: d.photos[0].nick });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [slug, officialPhoto]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/place-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind: "photo", photoUrl: url }),
      });
      if (res.status === 401) {
        setNeedLogin(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nepovedlo se.");
        return;
      }
      setCommunityPhoto({ url, nick: "ty" });
      setShowForm(false);
      setUrl("");
    } catch {
      setError("Chyba spojení.");
    } finally {
      setBusy(false);
    }
  }

  const photo = officialPhoto || communityPhoto?.url;
  const credit = officialPhoto ? officialCredit : communityPhoto ? `Foto: ${communityPhoto.nick}` : undefined;

  if (photo) {
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={name} className="h-52 w-full object-cover sm:h-64" />
        {credit && (
          <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
            © {credit}
          </span>
        )}
      </div>
    );
  }

  if (!loaded) return <div className="h-40 w-full animate-pulse bg-slate-100" />;

  // Žádná fotka → výzva k nahrání
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 to-cyan-50 px-4 py-8 text-center">
      <div className="text-3xl">📷</div>
      <p className="text-sm font-medium text-slate-700">Tahle lokalita ještě nemá fotku.</p>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="brand-gradient rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm hover:brightness-105"
        >
          ＋ Přidat fotku (+20 bodů)
        </button>
      ) : (
        <form onSubmit={submit} className="w-full max-w-sm">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            placeholder="https://… odkaz na fotku"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="náhled" className="mt-2 h-28 w-full rounded-lg border border-slate-200 object-cover" />
          )}
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          {needLogin && (
            <p className="mt-1 text-xs text-slate-600">
              Pro nahrání fotky se{" "}
              <Link href="/profil" className="font-medium text-brand hover:underline">přihlas</Link>.
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !url}
            className="brand-gradient mt-2 w-full rounded-xl px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Ukládám…" : "Uložit fotku"}
          </button>
        </form>
      )}
      <p className="text-[11px] text-slate-400">Vlož odkaz na fotku z internetu (např. z tvého úložiště).</p>
    </div>
  );
}
