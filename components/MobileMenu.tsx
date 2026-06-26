"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <nav className="absolute right-3 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block border-b border-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className="brand-gradient block px-4 py-3 text-center text-sm font-bold text-white"
            >
              Přihlásit
            </Link>
          </nav>
        </>
      )}
    </>
  );
}
