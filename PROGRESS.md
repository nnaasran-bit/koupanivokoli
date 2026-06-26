# Postup projektu – Mapa koupání ČR

> Tento soubor je „zápisník", kde vždy vidíš, co je hotové a co je další krok.

**Poslední aktualizace:** 2026-06-26
**Stav:** kompletní web s novým designem, značkou „Koupání v okolí" a doménou koupanivokoli.cz ✅ (běží lokálně, připraven na nasazení)
**Doména:** koupanivokoli.cz · **Návod na nasazení:** NAVOD-NASAZENI.txt

---

## ✅ Hotovo

### Design & značka
- **Vodní design** napříč webem – sjednocené téma (`app/globals.css`: brand-gradient, text-brand,
  slate paleta), sdílená hlavička `SiteHeader`, patička `Footer`, shell `ContentLayout`.
- **Značka „Koupání v okolí"** (= doména) v hlavičce, titulcích, JSON-LD, manifestu i llms.txt.
- Přepracovaný detail (barevný hero podle kvality, ikonové karty, hezká historie), krajské stránky,
  profil (gradientová karta úrovně), žebříček, mapa (krásná lišta filtrů + seznam s akcentem).
- **Oprava mapy:** podklad přepnut z rozbitého OSM/openmaptiles na vektorový **Carto Voyager**
  (bez klíče, s písmy) – `components/Map.tsx`.

### Základ a mapa
- Next.js 16 + TypeScript + Tailwind v4 + App Router (alias `@/*`).
- MapLibre GL JS: clustering, barvy podle kvality vody, obrys podle přístupu
  (černý = zákaz, oranžový = omezení), popup, geolokace, OSM podklad.
- Datový model s **oddělenými doménami** (kvalita / přístup / bezpečnost) – `lib/types.ts`.
- Filtry + vyhledávání + „📍 V okolí" + seznam propojený s mapou – `components/MapExplorer.tsx`.
- Detail lokality: dvě karty „Kvalita vody | Přístup a pravidla", rizika, GPS, zdroj, disclaimer (SSG, SEO).

### Reálná data
- **156 oficiálních koupacích vod z EEA** (WISE, ArcGIS, sezóna 2022) s klasifikací + 10letou historií – `scripts/import-eea.mjs`.
- **491 reálných míst z OpenStreetMap** (Overpass API, licence ODbL) – `scripts/import-osm.mjs`.
- Spojení 3 zdrojů podle důvěry (ověřené → EEA → OSM), dedup do 400 m – `lib/data.ts`. Celkem ~533 lokalit.
- Re-import: `node scripts/import-eea.mjs` a `node scripts/import-osm.mjs`.

### Komunita + gamifikace
- **Login** (přezdívka + heslo, scrypt, session cookie) – `lib/auth.ts`, `app/api/auth/*`.
- **Hlášení** (stav vody / sinice / nebezpečí / nové místo) – `app/api/reports`, `components/ReportForm.tsx`.
  Hlášení NIKDY nemění oficiální kvalitu – jen vytvoří „čeká na ověření".
- **Body, úrovně, odznaky** – `lib/gamify.ts` (Nováček → Vodní mistr).
- **Profil** `/profil`, **žebříček** `/zebricek`, komunitní hlášení na detailu lokality.
- Lokální úložiště `.data/community.json` (gitignored) – `lib/store.ts`.

### Hub lokality + SEO / geo / LLM
- **Hub každé lokality** – generovaný unikátní popis, historie kvality vody (timeline),
  vybavení a tipy od komunity, hlášení, GPS, zdroje, disclaimer – `app/lokalita/[slug]/page.tsx`.
- **Komunita přidává info** – potvrzování vybavení (+5) a tipy (+10) – `app/api/place-info`,
  `components/CommunityInfo.tsx`.
- **Strukturovaná data** – JSON-LD (TouristAttraction + BreadcrumbList), geo meta (geo.position, ICBM).
- **SEO/LLM infrastruktura** – `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`,
  metadataBase + OpenGraph (`app/layout.tsx`, `lib/site.ts`), obsahová stránka `/kvalita-vody`.

### Geo + SEO na maximum
- **Kraje přiřazeny souřadnicemi** (point-in-polygon z oficiálních hranic INSPIRE, CC-BY) –
  `scripts/assign-regions.mjs`, `data/kraje.geojson`. Praha správně oddělena od Středočeského (díry).
- **Stránky krajů** `/koupani` + `/koupani/[kraj]` (14) – seznam míst, statistiky, JSON-LD CollectionPage/ItemList.
- **Strukturovaná data**: WebSite + Organization + SearchAction (home), FAQPage (/kvalita-vody),
  TouristAttraction + containedInPlace + hasMap + BreadcrumbList (detail), drobečky napříč.
- **`?q=` vyhledávání** napojené na filtr (funkční SearchAction).
- **PWA manifest** (`app/manifest.ts`), theme-color, sitemap rozšířen o kraje, `llms.txt` o kraje.
- **noindex** na /profil a /nahlasit; kanonické URL a OpenGraph všude.

### Ověřeno
- `npm run build` prochází čistě, 563 stránek (533 lokalit + 14 krajů) prerenderováno.
- Otestováno (HTTP 200): registrace, hlášení (+body), přidání vybavení/tipu (+body), EEA lokalita,
  /koupani + kraj, drobečky s prokliky na kraj, sitemap.xml (vč. krajů), robots.txt, llms.txt, manifest.

## ▶️ Jak to spustit

```bash
npm run dev      # http://localhost:3000
npm run build    # produkční build
node scripts/import-eea.mjs     # přenačíst oficiální kvalitu (EEA)
node scripts/import-osm.mjs     # přenačíst místa z OpenStreetMap
node scripts/assign-regions.mjs # přiřadit kraje (spustit PO importech)
```
Reset komunitních dat: smazat složku `.data/`.

## 🧭 Klíčová rozhodnutí

- Barva bodu = kvalita vody; obrys = přístupový status (dva nezávislé signály).
- Uživatelský report = nízká důvěra, vždy „pending"; nepřepisuje oficiální data.
- Lokální JSON úložiště (běží bez DB). **Produkce (Vercel) → nahradit PostgreSQL**
  (souborové úložiště na Vercelu nepřežije). Migrace beze změny stránek (vše jde přes `lib/store.ts` a `lib/data.ts`).
- Podklad mapy: OSM raster bez klíče → pro produkci vektorové dlaždice (MapTiler/self-host).

## 📂 Struktura

```
app/page.tsx                 # mapa (úvod)
app/lokalita/[slug]/page.tsx # detail lokality (SSG)
app/nahlasit, /profil, /zebricek   # komunita (dynamické)
app/api/auth/*, app/api/reports    # API
components/Map.tsx, MapExplorer.tsx, ReportForm.tsx, AuthForms.tsx,
           CommunityReports.tsx, LogoutButton.tsx
lib/types.ts, quality.ts, filters.ts, data.ts, gamify.ts, store.ts, auth.ts
data/locations.sample.json   # ručně ověřená data
data/locations.osm.json      # vygenerováno z OpenStreetMap
scripts/import-osm.mjs       # importér
```

## ⏭️ Další kroky (priorita shora)

1. **Aktuální sezóna** – live data z portálu Koupací vody / SZÚ (EEA má roční zpoždění – teď sezóna 2022).
2. **Moderace hlášení** – admin rozhraní (schválit/zamítnout, +bonus body), „čeká na ověření" → na mapě.
3. **Stránky okresů** `/koupani/[kraj]/[okres]` (kraje + per-page SEO/LLM hotové: JSON-LD, sitemap,
   robots, llms.txt, /kvalita-vody, manifest, WebSite/FAQ data).
4. **Migrace na PostgreSQL + PostGIS** (Supabase/Neon) a nasazení **GitHub → Vercel**.
5. **Fotky k hlášení** (Cloudflare R2 + GDPR kontrola – stripnout EXIF, obličeje/SPZ).
6. **PWA** (manifest + service worker), počasí ČHMÚ na detailu.
7. **Notifikace** oblíbených míst (sinice/teplota) – prémiová funkce.
