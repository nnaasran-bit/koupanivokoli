import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { createSession, findUserByNick, toPublic } from "@/lib/store";

export async function POST(req: Request) {
  let body: { nick?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  const nick = String(body.nick ?? "").trim();
  const password = String(body.password ?? "");
  const user = findUserByNick(nick);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return NextResponse.json({ error: "Špatná přezdívka nebo heslo." }, { status: 401 });
  }
  const token = createSession(user.id);
  const res = NextResponse.json({ user: toPublic(user) });
  res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
  return res;
}
