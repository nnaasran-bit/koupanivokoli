"use client";

import { useState } from "react";

export default function AdminPanel({ isAdmin }: { isAdmin: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    </div>
  );
}
