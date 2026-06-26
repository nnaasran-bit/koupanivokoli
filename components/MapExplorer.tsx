"use client";

import { useEffect, useMemo, useState } from "react";
import MapView from "./Map";
import { allLocations } from "@/lib/data";
import { DEFAULT_FILTERS, distanceKm, filterLocations, type Filters } from "@/lib/filters";
import { ACCESS_LABELS, CAMP_COLOR, POOL_COLOR, QUALITY_COLORS, QUALITY_LABELS, TYPE_LABELS, freshness } from "@/lib/quality";
import type { Location, LocationType } from "@/lib/types";

const dotColor = (l: Location) =>
  l.type === "bazen" ? POOL_COLOR : l.type === "kemp" ? CAMP_COLOR : QUALITY_COLORS[l.quality.class];

// Sjednocené skupiny typů (jeden filtr = více typů).
const TYPE_GROUPS: { label: string; types: LocationType[] }[] = [
  { label: "Koupaliště a oblasti", types: ["koupaliste", "koupaci_oblast", "prirodni_koupaliste"] },
  { label: "Lomy, pískovny, jezera", types: ["lom", "piskovna", "jezero"] },
  { label: "Rybníky a přehrady", types: ["rybnik", "prehrada"] },
  { label: "Bazény", types: ["bazen"] },
  { label: "Kempy", types: ["kemp"] },
];

const LEGEND = [
  { color: "#2563eb", label: "Výborná" },
  { color: "#16a34a", label: "Vhodná" },
  { color: "#eab308", label: "Zhoršená" },
  { color: "#dc2626", label: "Nevhodná" },
  { color: "#111827", label: "Zákaz" },
  { color: "#9ca3af", label: "Nesledováno" },
  { color: "#a855f7", label: "Bazén / aquapark" },
  { color: "#a3b314", label: "Kemp" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
        active
          ? "border-transparent bg-sky-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function MapExplorer() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [focus, setFocus] = useState<{ id: string; lat: number; lng: number } | null>(null);
  const [listOpen, setListOpen] = useState(false); // na mobilu výchozí skrytý (ať je vidět mapa)
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setFilters((f) => ({ ...f, query: q }));
    // Na větších obrazovkách seznam rovnou otevřeme.
    if (typeof window !== "undefined" && window.innerWidth >= 768) setListOpen(true);
  }, []);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const groupActive = (types: LocationType[]) => types.every((t) => filters.types.includes(t));
  const toggleGroup = (types: LocationType[]) =>
    setFilters((f) => {
      const on = types.every((t) => f.types.includes(t));
      return {
        ...f,
        types: on
          ? f.types.filter((x) => !types.includes(x))
          : [...new Set([...f.types, ...types])],
      };
    });

  const filtered = useMemo(() => filterLocations(allLocations, filters), [filters]);
  const listed = useMemo(() => {
    const arr = filtered.map((l) => ({ l, d: userLoc ? distanceKm(userLoc, l) : null }));
    if (userLoc) arr.sort((a, b) => (a.d ?? 0) - (b.d ?? 0));
    return arr;
  }, [filtered, userLoc]);

  const handleNearby = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoMsg("Geolokace není v tomto prohlížeči dostupná.");
      return;
    }
    setGeoMsg("Zjišťuji polohu…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoMsg(null);
      },
      () => setGeoMsg("Polohu se nepodařilo zjistit."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Vyhledávání + filtry */}
      <div className="space-y-2.5 border-b border-slate-200 bg-white px-3 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              value={filters.query}
              onChange={(e) => set({ query: e.target.value })}
              placeholder="Hledat lokalitu, obec, kraj…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <button
            onClick={handleNearby}
            className="brand-gradient shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:scale-95"
          >
            📍 V okolí
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_GROUPS.map((g) => (
            <Chip key={g.label} active={groupActive(g.types)} onClick={() => toggleGroup(g.types)}>
              {g.label}
            </Chip>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
          <Chip active={filters.monitoredOnly} onClick={() => set({ monitoredOnly: !filters.monitoredOnly })}>
            Jen sledované
          </Chip>
          <Chip active={filters.hideCyano} onClick={() => set({ hideCyano: !filters.hideCyano })}>
            Bez sinic
          </Chip>
          <Chip active={filters.restrictedOnly} onClick={() => set({ restrictedOnly: !filters.restrictedOnly })}>
            ⛔ Zákazy
          </Chip>
        </div>
        {geoMsg && <div className="text-xs text-slate-500">{geoMsg}</div>}
      </div>

      {/* Mapa + seznam + legenda */}
      <div className="relative min-h-[60vh] flex-1">
        <MapView locations={filtered} userLocation={userLoc} focus={focus} />

        {listOpen ? (
          <aside className="absolute bottom-3 left-3 top-3 z-10 flex w-[340px] max-w-[86vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <span className="text-sm font-bold text-slate-800">
                {listed.length} <span className="font-medium text-slate-400">míst</span>
              </span>
              <button
                onClick={() => setListOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                skrýt ✕
              </button>
            </div>
            <ul className="flex-1 divide-y divide-slate-50 overflow-y-auto">
              {listed.map(({ l, d }) => (
                <li key={l.id}>
                  <button
                    onClick={() => setFocus({ id: l.id, lat: l.lat, lng: l.lng })}
                    className="block w-full border-l-4 px-4 py-2.5 text-left transition hover:bg-slate-50"
                    style={{ borderLeftColor: dotColor(l) }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{l.name}</span>
                      {d != null && (
                        <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                          {d.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                        style={{ background: dotColor(l) }}
                      />
                      {l.type === "bazen"
                        ? "Bazén / aquapark"
                        : l.type === "kemp"
                          ? "Kemp / tábořiště"
                          : QUALITY_LABELS[l.quality.class]}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {TYPE_LABELS[l.type]} · {l.region || "ČR"}
                      {l.access.status !== "povoleno" ? ` · ${ACCESS_LABELS[l.access.status]}` : ""}
                    </div>
                  </button>
                </li>
              ))}
              {listed.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-slate-400">
                  Žádná lokalita neodpovídá filtrům.
                </li>
              )}
            </ul>
          </aside>
        ) : (
          <button
            onClick={() => setListOpen(true)}
            className="absolute left-3 top-3 z-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-lg hover:bg-slate-50"
          >
            📋 Seznam ({listed.length})
          </button>
        )}

        <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Kvalita vody</div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                  style={{ background: item.color }}
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
