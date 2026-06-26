"use client";

import { useState } from "react";
import { REPORT_KINDS, type ReportKind } from "@/lib/gamify";

export default function ReportForm({
  presetSlug,
  presetName,
}: {
  presetSlug?: string;
  presetName?: string;
}) {
  const [kind, setKind] = useState<ReportKind>(presetSlug ? "kvalita_ok" : "kvalita_ok");
  const [locationName, setLocationName] = useState(presetName ?? "");
  const [newPlaceName, setNewPlaceName] = useState("");
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ earned: number; points: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const def = REPORT_KINDS.find((k) => k.id === kind)!;

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          locationName: def.isNewPlace ? undefined : locationName,
          locationSlug: def.isNewPlace ? undefined : presetSlug,
          newPlaceName: def.isNewPlace ? newPlaceName : undefined,
          lat: coords?.lat,
          lng: coords?.lng,
          text,
          photoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Něco se nepovedlo.");
        return;
      }
      setSuccess({ earned: data.earned, points: data.points });
      setText("");
      setNewPlaceName("");
      setPhotoUrl("");
    } catch {
      setError("Chyba spojení.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-2 text-lg font-bold text-green-800">Díky za hlášení!</h2>
        <p className="mt-1 text-green-700">
          Získal jsi <strong>+{success.earned} bodů</strong>. Máš celkem {success.points} bodů.
        </p>
        <p className="mt-2 text-sm text-green-600">
          Hlášení čeká na ověření a nemění oficiální kvalitu vody.
        </p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Nahlásit další
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-1 text-sm font-medium text-zinc-700">Co chceš nahlásit?</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {REPORT_KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              kind === k.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {k.emoji} {k.label}{" "}
            <span className={kind === k.id ? "text-blue-100" : "text-zinc-400"}>+{k.points}</span>
          </button>
        ))}
      </div>

      {def.isNewPlace ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Název místa</label>
            <input
              value={newPlaceName}
              onChange={(e) => setNewPlaceName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="např. Lom u Skutče"
            />
          </div>
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            📍 Použít mou polohu
          </button>
          {coords && (
            <p className="text-xs text-zinc-500">
              Poloha: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Které místo?</label>
          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            disabled={!!presetSlug}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-zinc-100"
            placeholder="název lokality"
          />
        </div>
      )}

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-zinc-600">Poznámka (nepovinné)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Co jsi viděl?"
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-zinc-600">Odkaz na fotku (nepovinné)</label>
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          inputMode="url"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="https://… (odkaz na fotku z internetu)"
        />
        {photoUrl.trim() !== "" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Náhled"
            className="mt-2 h-28 w-full rounded-lg border border-zinc-200 object-cover"
          />
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Odesílám…" : `Odeslat hlášení (+${def.points} bodů)`}
      </button>
      <p className="mt-3 text-center text-xs text-zinc-400">
        Komunitní hlášení se moderuje a nemění oficiální kvalitu vody – jen vytvoří upozornění
        „čeká na ověření".
      </p>
    </form>
  );
}
