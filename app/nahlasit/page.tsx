import { getCurrentUser } from "@/lib/auth";
import AuthForms from "@/components/AuthForms";
import ReportForm from "@/components/ReportForm";
import ContentLayout from "@/components/ContentLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nahlásit stav vody nebo nové místo", robots: { index: false } };

export default async function NahlasitPage({
  searchParams,
}: {
  searchParams: Promise<{ misto?: string; nazev?: string }>;
}) {
  const { misto, nazev } = await searchParams;
  const user = await getCurrentUser();
  const back = `/nahlasit${misto ? `?misto=${encodeURIComponent(misto)}&nazev=${encodeURIComponent(nazev ?? "")}` : ""}`;

  return (
    <ContentLayout>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Nahlásit 📝</h1>
      <p className="mb-4 mt-1 text-sm text-slate-600">
        Pomoz komunitě – nahlas aktuální stav vody nebo navrhni nové místo. Za každé hlášení získáš
        body. 🏆
      </p>

      {user ? (
        <ReportForm presetSlug={misto} presetName={nazev} />
      ) : (
        <div>
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Pro hlášení se přihlas nebo si vytvoř účet (stačí přezdívka).
          </div>
          <AuthForms redirectTo={back} />
        </div>
      )}
    </ContentLayout>
  );
}
