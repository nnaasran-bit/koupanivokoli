import ContentLayout from "@/components/ContentLayout";
import AdminPanel from "@/components/AdminPanel";
import { isAdmin } from "@/lib/admin";
import { listSpolekSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administrace", robots: { index: false } };

export default async function AdminPage() {
  const admin = await isAdmin();
  const spolekSubmissions = admin ? await listSpolekSubmissions() : [];
  return (
    <ContentLayout>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Administrace</h1>
      <p className="mt-1 text-sm text-slate-500">Správa komunity a dat.</p>
      <div className="mt-5">
        <AdminPanel isAdmin={admin} spolekSubmissions={spolekSubmissions} />
      </div>
    </ContentLayout>
  );
}
