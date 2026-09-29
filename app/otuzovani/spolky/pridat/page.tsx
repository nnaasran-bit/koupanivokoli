import type { Metadata } from "next";
import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import SpolekSubmitForm from "@/components/SpolekSubmitForm";

export const metadata: Metadata = {
  title: "Přidat otužileckou partu",
  description: "Přidej svou otužileckou partu nebo spolek do seznamu – bez registrace, stačí pár údajů.",
  alternates: { canonical: "/otuzovani/spolky/pridat" },
  robots: { index: false }, // formulář, ne obsahová stránka pro vyhledávače
};

export default function PridatSpolekPage() {
  return (
    <ContentLayout>
      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">Mapa</Link> ·{" "}
        <Link href="/otuzovani" className="hover:text-brand">Otužování</Link> ·{" "}
        <Link href="/otuzovani/spolky" className="hover:text-brand">Spolky a party</Link> ·{" "}
        <span className="text-slate-700">Přidat</span>
      </nav>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Přidat otužileckou partu
      </h1>
      <p className="mt-2 text-slate-600">
        Chodíte se pravidelně otužovat a chcete, aby vás lidi ve vašem okolí našli? Vyplňte pár
        údajů – bez registrace, bez čekání na schválení. Vaše parta se objeví v seznamu rovnou.
      </p>

      <div className="mt-6">
        <SpolekSubmitForm />
      </div>
    </ContentLayout>
  );
}
