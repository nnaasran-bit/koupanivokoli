import { NextResponse } from "next/server";
import { ADMIN_SECRET, isAdmin } from "@/lib/admin";
import { wipeAllUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

// Smaže všechny uživatele (žebříček, hlášení, příspěvky). Vyžaduje admin přihlášení
// nebo hlavičku x-admin-key. Po smazání se mohou všichni znovu zaregistrovat/přihlásit.
export async function POST(req: Request) {
  const headerKey = req.headers.get("x-admin-key");
  if (!(await isAdmin()) && headerKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Přístup jen pro admina." }, { status: 401 });
  }
  await wipeAllUsers();
  return NextResponse.json({ ok: true, message: "Všichni uživatelé smazáni." });
}
