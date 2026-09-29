import stations from "@/data/water-temperature.json";
import { distanceKm } from "./filters";

// Živá teplota vody z ČHMÚ (scripts/import-water-temp.mjs, aktualizuje GitHub
// Actions cron). Stanice jsou na hydrologických profilech, ne na konkrétních
// koupacích místech – proto párujeme na nejbližší lokalitu za běhu webu podle
// vzdálenosti, ne napevno v datech.
export interface WaterTempStation {
  stationId: string;
  name: string;
  river: string;
  lat: number;
  lng: number;
  tempC: number;
  measuredAt: string;
}

export interface NearestWaterTemp extends WaterTempStation {
  distanceKm: number;
}

const STATIONS = stations as WaterTempStation[];

// Do jaké vzdálenosti ještě dává smysl teplotu z profilu nabídnout jako
// orientační odhad pro danou lokalitu.
export const MAX_TEMP_DISTANCE_KM = 15;

export function nearestWaterTemp(
  lat: number,
  lng: number,
  maxKm: number = MAX_TEMP_DISTANCE_KM,
): NearestWaterTemp | null {
  let best: NearestWaterTemp | null = null;
  for (const s of STATIONS) {
    const d = distanceKm({ lat, lng }, { lat: s.lat, lng: s.lng });
    if (d <= maxKm && (!best || d < best.distanceKm)) best = { ...s, distanceKm: d };
  }
  return best;
}
