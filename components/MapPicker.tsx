"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function MapPicker({
  value,
  onPick,
}: {
  value: { lat: number; lng: number } | null;
  onPick: (p: { lat: number; lng: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod: any = await import("leaflet");
      const L = mod.default ?? mod;
      LRef.current = L;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { center: [49.82, 15.47], zoom: 7 });
      mapRef.current = map;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const setMarker = (lat: number, lng: number) => {
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else markerRef.current = L.marker([lat, lng]).addTo(map);
      };

      map.on("click", (e: any) => {
        setMarker(e.latlng.lat, e.latlng.lng);
        onPick({ lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) });
      });

      if (value) {
        setMarker(value.lat, value.lng);
        map.setView([value.lat, value.lng], 13);
      }
      setTimeout(() => map.invalidateSize(), 60);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aktualizace markeru zvenčí (např. „moje poloha").
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !value) return;
    if (markerRef.current) markerRef.current.setLatLng([value.lat, value.lng]);
    else markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
    map.setView([value.lat, value.lng], 13);
  }, [value]);

  return (
    <div>
      <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-xl border border-slate-200" />
      <p className="mt-1 text-xs text-slate-500">
        Klikni na mapu a označ přesné místo
        {value ? ` · ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : ""}
      </p>
    </div>
  );
}
