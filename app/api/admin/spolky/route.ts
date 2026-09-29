import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { deleteSpolekSubmission } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: undefined }));
  if (!id) return NextResponse.json({ error: "Chybí id." }, { status: 400 });
  await deleteSpolekSubmission(String(id));
  return NextResponse.json({ ok: true });
}
