"use client";

import { useMemo, useState } from "react";
import MapView from "./Map";
import { allLocations } from "@/lib/data";
import { otuzovaniLocations, OTUZOVANI_TYPE_GROUPS } from "@/lib/otuzovani";
import { DEFAULT_FILTERS, distanceKm, filterLocations, type Filters } from "@/lib/filters";
import { ACCESS_LABELS, QUALITY_COLORS, QUALITY_LABELS, TYPE_LABELS } from "@/lib/quality";
import type { LocationType } from "@/lib/types";

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
          ? "border-transparent bg-sky-700 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
      }`}
    >
      {children}
    </button>
  );
}

// Mapa vytipovaných zimních míst – zjednodušená verze hlavního MapExploreru
// (bez geocoderu), omezená jen na přírodní vody vhodné k posouzení pro
// otužování (viz lib/otuzovani.ts).
export default function OtuzovaniExplorer() {
  const base = useMemo(() => otuzovaniLocations(allLocations), []);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [focus, setFocus] = useState<{ id: string; lat: number; lng: number } | null>(null);
  const [area, setArea] = useState<{ lat: number; lng: number; km: number } | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const groupActive = (types: LocationType[]) => types.every((t) => filters.types.includes(t));
  const toggleGroup = (types: LocationType[]) =>
    setFilters((f) => {
      const on = types.every((t) => f.types.includes(t));
      return {
        ...f,
        types: on ? f.types.filter((x) => !types.includes(x)) : [...new Set([...f.types, ...types])],
      };
    });

  const filtered = useMemo(() => filterLocations(base, filters), [base, filters]);
  const listed = useMemo(() => {
    const center = userLoc || area;
    const arr = filtered.map((l) => ({ l, d: center ? distanceKm(center, l) : null }));
    if (center) arr.sort((a, b) => (a.d ?? 0) - (b.d ?? 0));
    return arr;
  }, [filtered, userLoc, area]);

  const handleNearby = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoMsg("Geolokace není v tomto prohlížeči dostupná.");
      return;
    }
    setGeoMsg("Zjišťuji polohu…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setArea({ ...loc, km: 40 });
        setListOpen(true);
        setGeoMsg(null);
      },
      () => setGeoMsg("Polohu se nepodařilo zjistit."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-2.5 border-b border-slate-200 bg-white px-3 py-3">
        <div className="flex gap-2">
          <input
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Hledat lokalitu nebo obec…"
            className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
          <button
            onClick={handleNearby}
            className="shrink-0 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 active:scale-95"
          >
            📍 V okolí
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {OTUZOVANI_TYPE_GROUPS.map((g) => (
            <Chip key={g.label} active={groupActive(g.types)} onClick={() => toggleGroup(g.types)}>
              {g.label}
            </Chip>
          ))}
        </div>
        {geoMsg && <div className="text-xs text-slate-500">{geoMsg}</div>}
      </div>

      <div className="relative min-h-[55vh] flex-1">
        <MapView locations={filtered} userLocation={userLoc} focus={focus} area={area} />

        {listOpen ? (
          <aside className="absolute bottom-3 left-3 top-3 z-10 flex w-[320px] max-w-[86vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur">
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
                    style={{ borderLeftColor: QUALITY_COLORS[l.quality.class] }}
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
                        style={{ background: QUALITY_COLORS[l.quality.class] }}
                      />
                      {TYPE_LABELS[l.type]}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {l.region || "ČR"}
                      {l.municipality ? ` · ${l.municipality}` : ""} · {QUALITY_LABELS[l.quality.class]}
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
      </div>
    </div>
  );
}
