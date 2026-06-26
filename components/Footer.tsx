import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-base">💧</span>
            <span className="font-extrabold tracking-tight text-slate-900">{SITE_NAME}</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Aktuální stav koupání v Česku na jedné mapě – kvalita vody, přístup, rizika a počasí.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Objevuj</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-brand">Mapa</Link></li>
            <li><Link href="/koupani" className="hover:text-brand">Koupání podle krajů</Link></li>
            <li><Link href="/kvalita-vody" className="hover:text-brand">Kvalita vody</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Komunita</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/nahlasit" className="hover:text-brand">Nahlásit místo / stav</Link></li>
            <li><Link href="/zebricek" className="hover:text-brand">Žebříček</Link></li>
            <li><Link href="/profil" className="hover:text-brand">Můj profil</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">Zdroje dat</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>Kvalita vody: EEA / SZÚ / KHS</li>
            <li>Místa: OpenStreetMap (ODbL)</li>
            <li>Hranice krajů: INSPIRE (CC-BY)</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-slate-400">
          Informace jsou orientační; rozhodující jsou oficiální zdroje. U nesledovaných míst je
          koupání na vlastní riziko. © {new Date().getFullYear()} {SITE_NAME}.
        </div>
      </div>
    </footer>
  );
}
