import type { Metadata } from "next";
import Link from "next/link";
import MapExplorer from "@/components/MapExplorer";
import SiteHeader from "@/components/SiteHeader";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { currentSeason } from "@/lib/season";

// Homepage se automaticky přebarvuje podle sezóny (titulek/popisek ve
// vyhledávání). Sezóna se mění jen 2× ročně, hodinová revalidace ale zajistí,
// že se přepnutí projeví bez čekání na další nasazení.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const zima = currentSeason() === "zima";
  const title = zima
    ? "Otužování a koupání v okolí – mapa vod v ČR"
    : "Koupání v okolí – mapa kvality vody v ČR";
  const description = zima
    ? "Právě běží sezóna otužování: mapa přírodních vod k otužování po celém Česku, bezpečnostní zásady pro začátečníky a kvalita vody, přístup i rizika na koupání po celý rok."
    : SITE_DESCRIPTION;
  return { title, description, openGraph: { title, description, url: SITE_URL } };
}

const webSiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "cs-CZ",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function Home() {
  const zima = currentSeason() === "zima";
  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <SiteHeader />
      {zima && (
        <Link
          href="/otuzovani"
          className="flex items-center justify-center gap-2 bg-sky-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-sky-800"
        >
          ❄️ Právě běží sezóna otužování – najdi místa k otužování ve svém okolí →
        </Link>
      )}
      <MapExplorer />
    </div>
  );
}
