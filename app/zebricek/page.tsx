import Link from "next/link";
import ContentLayout from "@/components/ContentLayout";
import { leaderboard, visitLeaderboard } from "@/lib/store";
import { levelFor } from "@/lib/gamify";

export const dynamic = "force-dynamic";
export const metadata = { title: "Žebříček komunity" };

export default async function ZebricekPage() {
  const [users, visitors] = await Promise.all([leaderboard(50), visitLeaderboard(20)]);

  return (
    <ContentLayout>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">🏆 Žebříček komunity</h1>
      <p className="mt-1 text-slate-500">Nejaktivnější hlásiči stavu vody a nejlepší cestovatelé.</p>

      {/* Soutěž v návštěvách */}
      <h2 className="mt-6 text-lg font-bold text-slate-900">🥾 Nejvíc navštívených míst</h2>
      {visitors.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Zatím nikdo. Označ „Byl jsem tady" u lomů a míst a začni soutěžit!
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {visitors.map((v, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            return (
              <li
                key={v.nick}
                className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 text-center text-lg font-bold text-emerald-500">{medal}</span>
                  <span className="font-semibold text-slate-900">{v.nick}</span>
                </div>
                <div className="text-lg font-bold text-emerald-600">{v.visits} míst</div>
              </li>
            );
          })}
        </ol>
      )}

      <h2 className="mt-8 text-lg font-bold text-slate-900">⭐ Nejvíc bodů</h2>

      {users.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          Zatím tu nikdo není.{" "}
          <Link href="/profil" className="text-blue-600 hover:underline">
            Buď první →
          </Link>
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {users.map((u, i) => {
            const lvl = levelFor(u.points);
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            return (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 text-center text-lg font-bold text-zinc-400">{medal}</span>
                  <div>
                    <div className="font-semibold text-zinc-900">{u.nick}</div>
                    <div className="text-xs text-zinc-500">
                      {lvl.current.emoji} {lvl.current.name} · {u.reportCount} hlášení
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">{u.points}</div>
              </li>
            );
          })}
        </ol>
      )}
    </ContentLayout>
  );
}
