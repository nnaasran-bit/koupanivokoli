import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE, hashPassword } from "@/lib/auth";
import { isBot } from "@/lib/antispam";
import { createSession, createUser, findUserByEmail, findUserByNick, toPublic } from "@/lib/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: {
    nick?: string;
    email?: string;
    password?: string;
    consentTerms?: boolean;
    consentMarketing?: boolean;
    website?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  if (isBot(body)) return NextResponse.json({ error: "Detekován spam." }, { status: 400 });
  const nick = String(body.nick ?? "").trim();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (nick.length < 2) return NextResponse.json({ error: "Přezdívka musí mít aspoň 2 znaky." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Zadej platný e-mail." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Heslo musí mít aspoň 6 znaků." }, { status: 400 });
  if (!body.consentTerms)
    return NextResponse.json({ error: "Pro registraci je nutný souhlas s podmínkami a zpracováním údajů." }, { status: 400 });

  if (await findUserByNick(nick)) return NextResponse.json({ error: "Tuto přezdívku už někdo má." }, { status: 409 });
  if (await findUserByEmail(email)) return NextResponse.json({ error: "Tento e-mail už je registrovaný." }, { status: 409 });

  const { salt, hash } = hashPassword(password);
  const user = await createUser(nick, email, salt, hash, !!body.consentMarketing);
  const token = await createSession(user.id);
  const res = NextResponse.json({ user: toPublic(user) });
  res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
  return res;
}
