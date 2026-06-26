import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-lg shadow-sm ring-1 ring-black/5">
        💧
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-tight text-slate-900">{SITE_NAME}</span>
        <span className="text-[11px] font-medium text-slate-400">mapa kvality vody v ČR</span>
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2.5">
        <BrandLogo />
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link href="/koupani" className="hidden rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 sm:block">
            Kraje
          </Link>
          <Link href="/kvalita-vody" className="hidden rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 md:block">
            Kvalita vody
          </Link>
          <Link href="/zebricek" className="hidden rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 sm:block">
            🏆 Žebříček
          </Link>
          <Link href="/profil" className="hidden rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 sm:block">
            Profil
          </Link>
          <Link
            href="/nahlasit"
            className="brand-gradient ml-1 rounded-lg px-3.5 py-2 font-semibold text-white shadow-sm hover:brightness-105"
          >
            ＋ Nahlásit
          </Link>
        </nav>
      </div>
    </header>
  );
}
