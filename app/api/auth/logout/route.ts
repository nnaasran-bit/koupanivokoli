import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE } from "@/lib/auth";
import { deleteSession } from "@/lib/store";

export async function POST() {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  if (sid) await deleteSession(sid);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  return res;
}
