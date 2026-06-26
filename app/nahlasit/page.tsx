import { getCurrentUser } from "@/lib/auth";
import AuthForms from "@/components/AuthForms";
import ReportWizard from "@/components/ReportWizard";
import ContentLayout from "@/components/ContentLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nahlásit stav vody nebo nové místo", robots: { index: false } };

export default async function NahlasitPage() {
  const user = await getCurrentUser();

  return (
    <ContentLayout>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Nahlásit 📝</h1>
      <p className="mb-4 mt-1 text-sm text-slate-600">
        Pomoz komunitě – navrhni nové místo nebo nahlas stav vody u existujícího. Za každé hlášení
        získáš body. 🏆
      </p>

      {user ? (
        <ReportWizard />
      ) : (
        <div>
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Pro hlášení se přihlas nebo si vytvoř účet.
          </div>
          <AuthForms redirectTo="/nahlasit" />
        </div>
      )}
    </ContentLayout>
  );
}
