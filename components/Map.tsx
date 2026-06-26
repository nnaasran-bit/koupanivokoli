"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ACCESS_LABELS,
  QUALITY_COLORS,
  QUALITY_LABELS,
  TYPE_LABELS,
  formatDateCz,
  freshness,
} from "@/lib/quality";
import type { Location } from "@/lib/types";

// Vektorový podklad bez API klíče (Carto Voyager – včetně písem a atribuce).
// Pozn.: při vyšším provozu zvážit vlastní/MapTiler tiles.
const STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

function geojson(locations: Location[]) {
  return {
    type: "FeatureCollection" as const,
    features: locations.map((l) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [l.lng, l.lat] },
      properties: {
        id: l.id,
        color: QUALITY_COLORS[l.quality.class],
        access: l.access.status,
      },
    })),
  };
}

function popupHtml(l: Location): string {
  const f = freshness(l.quality.sampledAt);
  const color = QUALITY_COLORS[l.quality.class];
  const cyano = l.quality.cyanobacteria
    ? `<div style="margin-top:4px;color:#b45309;font-weight:600;">⚠ Výskyt sinic</div>`
    : "";
  const reason = l.access.reason
    ? `<div style="color:#6b7280;">Důvod: ${l.access.reason}</div>`
    : "";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:220px;max-width:260px;">
      <div style="font-weight:700;font-size:15px;line-height:1.2;">${l.name}</div>
      <div style="color:#6b7280;font-size:12px;margin-bottom:8px;">${TYPE_LABELS[l.type]} · ${l.region}</div>
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
  const mapRef = useRef<any>(null);
  const mlRef = useRef<any>(null);
  const readyRef = useRef(false);
  const userMarkerRef = useRef<any>(null);
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  // Vytvoření mapy (jednou)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      mlRef.current = maplibregl;
      if (cancelled || !containerRef.current) return;

      const map: any = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: [15.47, 49.82],
        zoom: 6.6,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        "top-right",
      );

      map.on("load", () => {
        map.addSource("locations", {
          type: "geojson",
          data: geojson(locationsRef.current),
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 11,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "locations",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#1d4ed8",
            "circle-opacity": 0.85,
            "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "locations",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Open Sans Regular"],
            "text-size": 13,
          },
          paint: { "text-color": "#ffffff" },
        });
        map.addLayer({
          id: "points",
          type: "circle",
          source: "locations",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": 8,
            "circle-stroke-color": [
              "match",
              ["get", "access"],
              "zakazano",
              "#000000",
              "omezeno",
              "#b45309",
              "#ffffff",
            ],
            "circle-stroke-width": ["match", ["get", "access"], "zakazano", 3, "omezeno", 3, 1.5],
          },
        });

        map.on("click", "clusters", (e: any) => {
          const feature = e.features?.[0];
          if (!feature) return;
          map
            .getSource("locations")
            .getClusterExpansionZoom(feature.properties.cluster_id)
            .then((zoom: number) => map.easeTo({ center: feature.geometry.coordinates, zoom }));
        });

        map.on("click", "points", (e: any) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const loc = locationsRef.current.find((l) => l.id === String(feature.properties.id));
          if (!loc) return;
          new maplibregl.Popup({ offset: 12, closeButton: true })
            .setLngLat([loc.lng, loc.lat])
            .setHTML(popupHtml(loc))
            .addTo(map);
        });

        for (const layer of ["clusters", "points"]) {
          map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
        }

        readyRef.current = true;
      });
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Aktualizace dat při změně filtrů
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const src = map.getSource("locations");
    if (src) src.setData(geojson(locations));
  }, [locations]);

  // Poloha uživatele („v okolí")
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !userLocation) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userMarkerRef.current = new ml.Marker({ color: "#2563eb" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 10 });
  }, [userLocation]);

  // Proklik ze seznamu → přiblížit + otevřít popup
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    if (!map || !ml || !focus) return;
    map.flyTo({ center: [focus.lng, focus.lat], zoom: 12 });
    const loc = locationsRef.current.find((l) => l.id === focus.id);
    if (loc) {
      new ml.Popup({ offset: 12, closeButton: true })
        .setLngLat([loc.lng, loc.lat])
        .setHTML(popupHtml(loc))
        .addTo(map);
    }
  }, [focus]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
