import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import MobileMenu from "./MobileMenu";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label={SITE_NAME}>
      <Image src="/logo.png" alt={SITE_NAME} width={520} height={186} priority className="h-12 w-auto sm:h-14" />
    </Link>
  );
}

const NAV = [
  { href: "/", label: "🗺️ Mapa" },
  { href: "/koupani", label: "Kraje" },
  { href: "/seznam/lomy", label: "Lomy" },
  { href: "/kvalita-vody", label: "Kvalita vody" },
  { href: "/zebricek", label: "🏆 Žebříček" },
  { href: "/profil", label: "Profil" },
];

export default function SiteHeader() {
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
