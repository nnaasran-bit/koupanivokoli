"use client";

import { useState } from "react";
import type { SpolekSubmission } from "@/lib/spolky";

export default function AdminPanel({
  isAdmin,
  spolekSubmissions = [],
}: {
  isAdmin: boolean;
  spolekSubmissions?: SpolekSubmission[];
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submissions, setSubmissions] = useState(spolekSubmissions);

  async function removeSpolek(id: string) {
    if (!confirm("Smazat tento návrh party?")) return;
    const res = await fetch("/api/admin/spolky", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "Chyba.");
        return;
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  async function wipe() {
    if (!confirm("Opravdu smazat VŠECHNY uživatele, hlášení a body? Tato akce je nevratná.")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/wipe-users", { method: "POST" });
      const data = await res.json();
      setMsg(res.ok ? "✅ " + data.message : "❌ " + (data.error ?? "Chyba"));
    } finally {
      setBusy(false);
    }
  }

  if (!isAdmin) {
    return (
      <form onSubmit={login} className="max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-xs font-medium text-slate-600">Admin heslo</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white"
          placeholder="heslo"
        />
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="brand-gradient mt-3 w-full rounded-xl px-3 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "…" : "Přihlásit jako admin"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="text-sm font-bold text-rose-800">Smazat všechny uživatele</h2>
        <p className="mt-1 text-sm text-rose-700">
          Smaže všechny účty, hlášení, příspěvky a body. Lidé se pak mohou znovu zaregistrovat.
        </p>
        <button
          onClick={wipe}
          disabled={busy}
          className="mt-3 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {busy ? "Mažu…" : "🗑️ Smazat všechny uživatele"}
        </button>
        {msg && <p className="mt-3 text-sm font-medium text-slate-800">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">
          Otužilecké party od komunity ({submissions.length})
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Přidané bez registrace na /otuzovani/spolky/pridat. Zjevný spam smaž.
        </p>
        <ul className="mt-3 divide-y divide-slate-100">
          {submissions.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-500">
                  {s.city} · {s.region}
                  {s.schedule ? ` · ${s.schedule}` : ""}
                </div>
                {s.desc && <div className="mt-0.5 text-xs text-slate-400">{s.desc}</div>}
              </div>
              <button
                onClick={() => removeSpolek(s.id)}
                className="shrink-0 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Smazat
              </button>
            </li>
          ))}
          {submissions.length === 0 && (
            <li className="py-6 text-center text-sm text-slate-400">Zatím žádné návrhy.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
