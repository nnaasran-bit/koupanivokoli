import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { createSession, findUserByEmail, toPublic } from "@/lib/store";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return NextResponse.json({ error: "Špatný e-mail nebo heslo." }, { status: 401 });
  }
  const token = await createSession(user.id);
  const res = NextResponse.json({ user: toPublic(user) });
  res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
  return res;
}
