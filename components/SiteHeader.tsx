import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label={SITE_NAME}>
      <Image
        src="/logo.png"
        alt={SITE_NAME}
        width={520}
        height={186}
        priority
        className="h-12 w-auto sm:h-14"
      />
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2">
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
            href="/profil"
            className="brand-gradient ml-1 rounded-lg px-3.5 py-2 font-semibold text-white shadow-sm hover:brightness-105"
          >
            Přihlásit
          </Link>
        </nav>
      </div>
    </header>
  );
}
