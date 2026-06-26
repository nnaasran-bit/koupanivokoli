"use client";

import { useState } from "react";

export default function AuthForms({ redirectTo = "/profil" }: { redirectTo?: string }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Něco se nepovedlo.");
        return;
      }
      window.location.assign(redirectTo);
    } catch {
      setError("Chyba spojení.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            mode === "register" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          Vytvořit účet
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            mode === "login" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          Přihlásit se
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Přezdívka</label>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="např. VodníKrysa"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Heslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="aspoň 4 znaky"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Pracuji…" : mode === "register" ? "🎉 Založit účet" : "Přihlásit se"}
        </button>
      </form>
      <p className="mt-3 text-center text-xs text-zinc-400">
        Stačí přezdívka a heslo. Žádný e-mail. Začni sbírat body za hlášení! 🏆
      </p>
    </div>
  );
}
