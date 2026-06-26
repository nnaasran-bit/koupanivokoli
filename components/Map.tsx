"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  ACCESS_LABELS,
  QUALITY_COLORS,
  QUALITY_LABELS,
  TYPE_LABELS,
  formatDateCz,
  freshness,
} from "@/lib/quality";
import type { Location } from "@/lib/types";

function popupHtml(l: Location): string {
  const f = freshness(l.quality.sampledAt);
  const color = QUALITY_COLORS[l.quality.class];
  const cyano = l.quality.cyanobacteria
    ? `<div style="margin-top:4px;color:#b45309;font-weight:600;">⚠ Výskyt sinic</div>`
    : "";
  const reason = l.access.reason ? `<div style="color:#6b7280;">Důvod: ${l.access.reason}</div>` : "";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:210px;max-width:250px;">
      <div style="font-weight:700;font-size:15px;line-height:1.2;">${l.name}</div>
      <div style="color:#6b7280;font-size:12px;margin-bottom:8px;">${TYPE_LABELS[l.type]} · ${l.region || "ČR"}</div>
      <div style="display:flex;align-items:center;gap:6px;font-weight:600;">
        <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};border:1px solid #00000022;"></span>
        ${QUALITY_LABELS[l.quality.class]}
      </div>
      ${cyano}
      <div style="font-size:12px;color:#6b7280;margin-top:2px;">
        ${l.quality.sampledAt ? `Odběr: ${formatDateCz(l.quality.sampledAt)} (${f.label})` : "Bez měření"}
        ${l.quality.source ? `<br/>Zdroj: ${l.quality.source}` : ""}
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;font-weight:600;">
        ${ACCESS_LABELS[l.access.status]}
      </div>
      ${reason}
      <a href="/lokalita/${l.slug}" style="display:inline-block;margin-top:10px;font-size:13px;color:#2563eb;font-weight:600;text-decoration:none;">Detail lokality →</a>
    </div>`;
}

interface MapProps {
  locations: Location[];
  userLocation?: { lat: number; lng: number } | null;
  focus?: { id: string; lat: number; lng: number } | null;
}

export default function MapView({ locations, userLocation, focus }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersById = useRef<Map<string, any>>(new Map());
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  function rebuild() {
    const L = LRef.current;
    const cluster = clusterRef.current;
    if (!L || !cluster) return;
    cluster.clearLayers();
    markersById.current.clear();
    const markers: any[] = [];
    for (const l of locationsRef.current) {
      const color = QUALITY_COLORS[l.quality.class];
      const ban =
        l.access.status === "zakazano"
          ? `<circle cx="13" cy="13" r="5.5" fill="none" stroke="#111827" stroke-width="2"/>`
          : "";
      const icon = L.divIcon({
        className: "koupani-pin",
        html: `<svg width="28" height="40" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 2.5px rgba(0,0,0,.45))">
          <path d="M13 0C6.1 0 .5 5.6 .5 12.5 .5 22 13 37 13 37s12.5-15 12.5-24.5C25.5 5.6 19.9 0 13 0z" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="13" cy="13" r="5" fill="#ffffff"/>${ban}
        </svg>`,
        iconSize: [28, 40],
        iconAnchor: [14, 39],
        popupAnchor: [0, -34],
      });
      const m = L.marker([l.lat, l.lng], { icon });
      m.bindPopup(popupHtml(l), { minWidth: 210 });
      markers.push(m);
      markersById.current.set(l.id, m);
    }
    cluster.addLayers(markers);
  }

  // Inicializace mapy (jednou)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod: any = await import("leaflet");
      const L = mod.default ?? mod;
      LRef.current = L;
      await import("leaflet.markercluster");
      if (cancelled || !containerRef.current || mapRef.current) return;

      LRef.current = L;
      const map = L.map(containerRef.current, {
        center: [49.82, 15.47],
        zoom: 7,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> přispěvatelé',
      }).addTo(map);

      const cluster = (L as any).markerClusterGroup({
        maxClusterRadius: 55,
        chunkedLoading: true,
        showCoverageOnHover: false,
        iconCreateFunction: (c: any) => {
          const n = c.getChildCount();
          const size = n < 10 ? 38 : n < 100 ? 46 : 54;
          return L.divIcon({
            className: "koupani-cluster",
            html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border-radius:50%;
              background:radial-gradient(circle at 30% 30%, #38bdf8, #0284c7);color:#fff;font-weight:800;font-size:13px;
              border:3px solid rgba(255,255,255,.9);box-shadow:0 3px 8px rgba(2,132,199,.45);">${n}</div>`,
            iconSize: [size, size],
          });
        },
      });
      clusterRef.current = cluster;
      map.addLayer(cluster);

      rebuild();
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 400);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Aktualizace bodů při změně filtrů
  useEffect(() => {
    rebuild();
  }, [locations]);

  // Poloha uživatele
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: "#2563eb",
      fillOpacity: 1,
    }).addTo(map);
    map.setView([userLocation.lat, userLocation.lng], 11);
  }, [userLocation]);

  // Proklik ze seznamu → přiblížit + otevřít popup
  useEffect(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!map || !focus) return;
    const m = markersById.current.get(focus.id);
    map.setView([focus.lat, focus.lng], 13);
    if (m && cluster?.zoomToShowLayer) {
      cluster.zoomToShowLayer(m, () => m.openPopup());
    } else if (m) {
      m.openPopup();
    }
  }, [focus]);

  return <div ref={containerRef} className="absolute inset-0" style={{ background: "#e8eef2" }} />;
}
