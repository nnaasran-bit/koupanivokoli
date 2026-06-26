"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { allLocations } from "@/lib/data";
import { TYPE_LABELS } from "@/lib/quality";
import type { LocationType } from "@/lib/types";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Druhy hlášení u existujícího místa.
const EXISTING_KINDS = [
  { id: "kvalita_zhorsena", label: "Zhoršená voda / zákal", emoji: "🌫️", points: 10 },
  { id: "sinice", label: "Sinice / zelená voda", emoji: "🦠", points: 15 },
  { id: "riziko", label: "Nebezpečí / odpad", emoji: "⚠️", points: 15 },
  { id: "kvalita_ok", label: "Voda vypadá čistě", emoji: "💧", points: 10 },
];

const NEW_TYPES: LocationType[] = ["lom", "piskovna", "jezero", "rybnik", "prehrada", "reka", "neoficialni"];

export default function ReportWizard() {
  const [mode, setMode] = useState<"choose" | "new" | "existing">("choose");
  const [success, setSuccess] = useState<{ earned: number; points: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  // Nové místo
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<LocationType>("lom");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Existující místo
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<(typeof allLocations)[number] | null>(null);
  const [kind, setKind] = useState("kvalita_zhorsena");

  // Sdílené
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const matches = useMemo(() => {
    const q = norm(query.trim());
    if (q.length < 2 || picked) return [];
    return allLocations
      .filter((l) => norm(`${l.name} ${l.municipality ?? ""}`).includes(q))
      .slice(0, 8);
  }, [query, picked]);

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setCoords({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) }),
    );
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const body =
        mode === "new"
          ? {
              kind: "nove_misto",
              newPlaceName: newName,
              lat: coords?.lat,
              lng: coords?.lng,
              text: `Typ: ${TYPE_LABELS[newType]}. ${text}`.trim(),
              photoUrl,
              website,
            }
          : {
              kind,
              locationSlug: picked?.slug,
              locationName: picked?.name,
              text,
              photoUrl,
              website,
            };
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Něco se nepovedlo.");
        return;
      }
      setSuccess({ earned: data.earned, points: data.points });
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
          Získal jsi <strong>+{success.earned} bodů</strong> (celkem {success.points}).
        </p>
        <p className="mt-2 text-sm text-green-600">Hlášení čeká na ověření a nemění oficiální kvalitu vody.</p>
        <button
          onClick={() => {
            setSuccess(null);
            setMode("choose");
            setNewName("");
            setCoords(null);
            setQuery("");
            setPicked(null);
            setText("");
            setPhotoUrl("");
          }}
          className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
        >
          Nahlásit další
        </button>
      </div>
    );
  }

  // Výběr cesty
  if (mode === "choose") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setMode("new")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
        >
          <div className="text-3xl">📍</div>
          <div className="mt-2 font-bold text-slate-900">Navrhnout nové místo</div>
          <p className="mt-1 text-sm text-slate-500">Ukážeš na mapě, kde je, a pojmenuješ ho. (+25 bodů)</p>
        </button>
        <button
          onClick={() => setMode("existing")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
        >
          <div className="text-3xl">🔍</div>
          <div className="mt-2 font-bold text-slate-900">Nahlásit u existujícího místa</div>
          <p className="mt-1 text-sm text-slate-500">Najdeš místo a nahlásíš stav vody, sinice nebo riziko.</p>
        </button>
      </div>
    );
  }

  const honeypot = (
    <input
      type="text"
      value={website}
      onChange={(e) => setWebsite(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute left-[-9999px] h-0 w-0 opacity-0"
    />
  );

  const sharedFields = (
    <>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Poznámka (nepovinné)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
          placeholder="Co jsi viděl? Popiš třeba přístup, parkování…"
        />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Odkaz na fotku (nepovinné)</label>
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          inputMode="url"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
          placeholder="https://…"
        />
      </div>
    </>
  );

  // NOVÉ MÍSTO
  if (mode === "new") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {honeypot}
        <button onClick={() => setMode("choose")} className="text-sm text-brand hover:underline">
          ← zpět
        </button>
        <h2 className="mt-2 text-lg font-bold text-slate-900">Navrhnout nové místo 📍</h2>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">Název místa</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder="např. Lom u Skutče"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">Typ</label>
          <div className="flex flex-wrap gap-1.5">
            {NEW_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setNewType(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  newType === t ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300 text-slate-700"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600">Kde to je?</label>
            <button onClick={useMyLocation} className="text-xs font-medium text-brand hover:underline">
              📍 Použít mou polohu
            </button>
          </div>
          <MapPicker value={coords} onPick={setCoords} />
        </div>

        {sharedFields}

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <button
          onClick={submit}
          disabled={busy || !newName.trim() || !coords}
          className="brand-gradient mt-4 w-full rounded-xl px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Odesílám…" : "Odeslat návrh (+25 bodů)"}
        </button>
        {!coords && <p className="mt-2 text-center text-xs text-slate-400">Klikni na mapu a označ místo.</p>}
      </div>
    );
  }

  // EXISTUJÍCÍ MÍSTO
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {honeypot}
      <button onClick={() => setMode("choose")} className="text-sm text-brand hover:underline">
        ← zpět
      </button>
      <h2 className="mt-2 text-lg font-bold text-slate-900">Nahlásit u existujícího místa 🔍</h2>

      {!picked ? (
        <div className="relative mt-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">Najdi místo</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder="název nebo obec…"
          />
          {matches.length > 0 && (
            <ul className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {matches.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setPicked(m)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <span className="truncate text-sm font-medium text-slate-900">{m.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                      {TYPE_LABELS[m.type]}
                      {m.municipality ? ` · ${m.municipality}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-sm font-semibold text-slate-900">{picked.name}</span>
            <button onClick={() => setPicked(null)} className="text-xs text-brand hover:underline">
              změnit
            </button>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-600">Co hlásíš?</label>
            <div className="flex flex-wrap gap-1.5">
              {EXISTING_KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    kind === k.id ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300 text-slate-700"
                  }`}
                >
                  {k.emoji} {k.label}
                </button>
              ))}
            </div>
          </div>

          {sharedFields}

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <button
            onClick={submit}
            disabled={busy}
            className="brand-gradient mt-4 w-full rounded-xl px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Odesílám…" : "Odeslat hlášení"}
          </button>
        </>
      )}
      <p className="mt-3 text-center text-xs text-slate-400">
        Hlášení se moderuje a nemění oficiální kvalitu vody – vytvoří upozornění „čeká na ověření".
      </p>
    </div>
  );
}
