import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE, hashPassword } from "@/lib/auth";
import { createSession, createUser, findUserByNick, toPublic } from "@/lib/store";

export async function POST(req: Request) {
  let body: { nick?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  const nick = String(body.nick ?? "").trim();
  const password = String(body.password ?? "");
  if (nick.length < 2) return NextResponse.json({ error: "Přezdívka musí mít aspoň 2 znaky." }, { status: 400 });
  if (password.length < 4) return NextResponse.json({ error: "Heslo musí mít aspoň 4 znaky." }, { status: 400 });
  if (await findUserByNick(nick)) return NextResponse.json({ error: "Tuto přezdívku už někdo má." }, { status: 409 });

  const { salt, hash } = hashPassword(password);
  const user = await createUser(nick, salt, hash);
  const token = await createSession(user.id);
  const res = NextResponse.json({ user: toPublic(user) });
  res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
  return res;
}
