"use client";

import { useState } from "react";

export default function GpsNavigation({
  lat,
  lng,
  name,
  url,
}: {
  lat: number;
  lng: number;
  name: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);
  const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  async function copyGps() {
    try {
      await navigator.clipboard.writeText(coords);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, text: `${name} – Koupání v okolí`, url });
      } catch {
        /* zrušeno */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* ignore */
      }
    }
  }

  const nav = [
    { href: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, icon: "🗺", label: "Google Maps", hover: "hover:border-green-400 hover:bg-green-50" },
    { href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, icon: "📡", label: "Waze", hover: "hover:border-blue-400 hover:bg-blue-50" },
    { href: `https://maps.apple.com/?daddr=${lat},${lng}`, icon: "🍎", label: "Apple Maps", hover: "hover:border-slate-400 hover:bg-slate-50" },
    { href: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`, icon: "🌍", label: "OpenStreetMap", hover: "hover:border-orange-400 hover:bg-orange-50" },
  ];

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" aria-hidden="true">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
        GPS a navigace
      </h2>

      <div className="mb-4 rounded-xl bg-slate-50 p-4 font-mono text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400">Zeměpisná šířka</span>
            <p className="text-base font-bold text-slate-900">{lat.toFixed(6)}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Zeměpisná délka</span>
            <p className="text-base font-bold text-slate-900">{lng.toFixed(6)}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Formát decimal</span>
            <p className="text-base font-bold text-slate-900">{coords}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={copyGps} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-green-500 hover:text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          {copied ? "Zkopírováno ✓" : "Kopírovat GPS"}
        </button>
        <button onClick={share} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-blue-500 hover:text-blue-700">
          📤 Sdílet lokalitu
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {nav.map((n) => (
          <a
            key={n.label}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-3 transition-all ${n.hover}`}
          >
            <span className="text-2xl">{n.icon}</span>
            <span className="text-xs font-semibold text-slate-700">{n.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
