import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SECRET } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  if (String(body.password ?? "") !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Špatné heslo." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, ADMIN_SECRET, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
