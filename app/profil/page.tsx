import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { reportsByUser } from "@/lib/store";
import { badgesFor, kindDef, levelFor } from "@/lib/gamify";
import AuthForms from "@/components/AuthForms";
import LogoutButton from "@/components/LogoutButton";
import ContentLayout from "@/components/ContentLayout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Můj profil", robots: { index: false } };

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  const { error } = await searchParams;

  return (
    <ContentLayout>
      {!user ? (
        <div>
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">Připoj se ke komunitě 🏊</h1>
          <p className="mb-4 text-sm text-zinc-600">
            Hlas stav vody, navrhuj nová místa a sbírej body a odznaky.
          </p>
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <AuthForms redirectTo="/profil" />
        </div>
      ) : (
        <Profile userId={user.id} nick={user.nick} points={user.points} reportCount={user.reportCount} />
      )}
    </ContentLayout>
  );
}

async function Profile({
  userId,
  nick,
  points,
  reportCount,
}: {
  userId: string;
  nick: string;
  points: number;
  reportCount: number;
}) {
  const reports = await reportsByUser(userId);
  const lvl = levelFor(points);
  const badges = badgesFor({ points, reportCount }, reports);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">{nick}</h1>
        <LogoutButton />
      </div>

      {/* Úroveň + postup */}
      <div className="brand-gradient mt-4 overflow-hidden rounded-3xl p-5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold">
            {lvl.current.emoji} {lvl.current.name}
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold leading-none">{points}</div>
            <div className="text-xs font-medium text-white/80">bodů</div>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white" style={{ width: `${lvl.progress}%` }} />
        </div>
        <div className="mt-1.5 text-xs font-medium text-white/90">
          {lvl.next
            ? `Do úrovně „${lvl.next.name}" zbývá ${lvl.next.min - points} bodů.`
            : "Maximální úroveň! 👑"}
        </div>
      </div>

      {/* Odznaky */}
      <h2 className="mt-6 text-sm font-semibold text-zinc-800">Odznaky</h2>
      {badges.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">Zatím žádné. Pošli první hlášení! 🌟</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              title={b.desc}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <span className="mr-1">{b.emoji}</span>
              <span className="font-medium text-zinc-800">{b.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Moje hlášení */}
      <h2 className="mt-6 text-sm font-semibold text-zinc-800">Moje hlášení ({reports.length})</h2>
      <ul className="mt-2 space-y-2">
        {reports.length === 0 && (
          <li className="text-sm text-zinc-500">
            Žádná hlášení.{" "}
            <Link href="/nahlasit" className="text-blue-600 hover:underline">
              Nahlásit první →
            </Link>
          </li>
        )}
        {reports.map((r) => {
          const def = kindDef(r.kind);
          return (
            <li key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm">
              <span>
                {def?.emoji} {def?.label}
                <span className="text-zinc-400">
                  {" "}
                  · {r.newPlaceName ?? r.locationName ?? "—"}
                </span>
              </span>
              <span className="text-xs text-zinc-400">
                {r.status === "pending" ? "⏳ čeká" : r.status === "approved" ? "✅" : "✕"} +{r.points}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <Link
          href="/nahlasit"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          ＋ Nahlásit a získat body
        </Link>
      </div>
    </div>
  );
}
