"use client";

import { useState } from "react";
import { REGIONS } from "@/lib/regions";

// Přidání vlastní party BEZ registrace – jen honeypot + IP limit na serveru.
export default function SpolekSubmitForm() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState(REGIONS[0].name);
  const [schedule, setSchedule] = useState("");
  const [place, setPlace] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/spolky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, region, schedule, place, desc, contact, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Něco se nepovedlo.");
        return;
      }
      setSuccess(true);
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
        <h2 className="mt-2 text-lg font-bold text-green-800">Díky!</h2>
        <p className="mt-1 text-green-700">
          Vaše parta se objeví v seznamu se štítkem „od komunity" – ostatní ji uvidí hned, my ji
          jen občas projdeme kvůli spamu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Název party / spolku *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder="např. Otužilci od Pahorku"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Město *</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            maxLength={80}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder="např. Pelhřimov"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Kraj *</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          >
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Kdy se scházíte</label>
          <input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            maxLength={120}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder="např. neděle 17:00, za každého počasí"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Kde přesně (místo srazu)</label>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          maxLength={160}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
          placeholder="např. u Pahorku, rybník…"
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Pár slov o partě (nepovinné)</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
          placeholder="Kdo jste, koho rádi přivítáte…"
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-slate-600">Kontakt (FB skupina, telefon…)</label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={200}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-400"
          placeholder="odkaz na FB skupinu nebo telefon"
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={busy || !name.trim() || !city.trim()}
        className="brand-gradient mt-4 w-full rounded-xl px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "Odesílám…" : "Přidat naši partu"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">
        Bez registrace, jen se snažíme udržet seznam bez spamu.
      </p>
    </form>
  );
}
