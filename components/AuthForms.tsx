"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthForms({ redirectTo = "/profil" }: { redirectTo?: string }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload =
        mode === "register"
          ? { nick, email, password, consentTerms, consentMarketing, website }
          : { email, password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Vytvořit účet
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Přihlásit se
        </button>
      </div>

      {/* Sociální přihlášení */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span className="text-base font-bold text-[#4285F4]">G</span> Google
        </a>
        <a
          href="/api/auth/facebook"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span className="text-base font-bold text-[#1877F2]">f</span> Facebook
        </a>
      </div>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> nebo e-mailem <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {/* honeypot – skryté pole pro boty */}
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
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Přezdívka (zobrazí se ostatním)</label>
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white"
              placeholder="např. VodníKrysa"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white"
            placeholder="tvuj@email.cz"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Heslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white"
            placeholder={mode === "register" ? "aspoň 6 znaků" : "heslo"}
          />
        </div>

        {mode === "register" && (
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span>
                Souhlasím s{" "}
                <Link href="/podminky" target="_blank" className="text-brand hover:underline">podmínkami použití</Link>{" "}
                a{" "}
                <Link href="/ochrana-udaju" target="_blank" className="text-brand hover:underline">
                  zpracováním osobních údajů
                </Link>
                . <span className="text-rose-500">*</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span>
                Souhlasím se zasíláním novinek, tipů a obchodních sdělení e-mailem (volitelné, lze
                kdykoli odhlásit).
              </span>
            </label>
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="brand-gradient w-full rounded-xl px-3 py-3 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-50"
        >
          {busy ? "Pracuji…" : mode === "register" ? "🎉 Založit účet" : "Přihlásit se"}
        </button>
      </form>
    </div>
  );
}
