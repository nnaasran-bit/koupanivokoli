import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { currentSeason } from "@/lib/season";
import MobileMenu from "./MobileMenu";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label={SITE_NAME}>
      <Image src="/logo.png" alt={SITE_NAME} width={520} height={186} priority className="h-12 w-auto sm:h-14" />
    </Link>
  );
}

const MAPA = { href: "/", label: "🗺️ Mapa" };
const KRAJE = { href: "/koupani", label: "Kraje" };
const OTUZOVANI = { href: "/otuzovani", label: "❄️ Otužování" };
const LOMY = { href: "/seznam/lomy", label: "Lomy" };
const KVALITA = { href: "/kvalita-vody", label: "Kvalita vody" };
const ZEBRICEK = { href: "/zebricek", label: "🏆 Žebříček" };
const PROFIL = { href: "/profil", label: "Profil" };

// Pořadí položek se sezónně přehodí – v otužovací sezóně (září–duben) je
// odkaz hned vedle mapy, v koupací sezóně dál v menu.
function navItems() {
  return currentSeason() === "zima"
    ? [MAPA, OTUZOVANI, KRAJE, LOMY, KVALITA, ZEBRICEK, PROFIL]
    : [MAPA, KRAJE, LOMY, KVALITA, OTUZOVANI, ZEBRICEK, PROFIL];
}

export default function SiteHeader() {
  const NAV = navItems();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2">
        <BrandLogo />

        {/* Desktop navigace */}
        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900">
              {n.label}
            </Link>
          ))}
          <Link
            href="/profil"
            className="brand-gradient ml-1 rounded-lg px-3.5 py-2 font-semibold text-white shadow-sm hover:brightness-105"
          >
            Přihlásit
          </Link>
        </nav>

        {/* Mobilní – tlačítko Mapa + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            🗺️ Mapa
          </Link>
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}
