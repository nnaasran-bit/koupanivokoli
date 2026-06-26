import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE } from "@/lib/auth";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  OAUTH_STATE_COOKIE,
  googleRedirectUri,
} from "@/lib/google";
import { createSession, findOrCreateOAuthUser } from "@/lib/store";

function fail(origin: string, msg: string) {
  return NextResponse.redirect(`${origin}/profil?error=${encodeURIComponent(msg)}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const c = await cookies();
  const savedState = c.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return fail(origin, "Přihlášení přes Google se nezdařilo (ověření). Zkus to znovu.");
  }
  if (!GOOGLE_CLIENT_SECRET) {
    return fail(origin, "Google přihlášení zatím není nastavené (chybí secret).");
  }

  // Výměna kódu za přístupový token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail(origin, "Google odmítl ověření. Zkus to znovu.");
  const token = await tokenRes.json();

  // Načtení profilu (e-mail, jméno)
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) return fail(origin, "Nepodařilo se načíst profil z Google.");
  const info = await infoRes.json();
  const email = String(info.email ?? "").trim();
  if (!email) return fail(origin, "Google nevrátil e-mail.");

  const user = await findOrCreateOAuthUser(email, String(info.name ?? info.given_name ?? ""));
  const sessionToken = await createSession(user.id);

  const res = NextResponse.redirect(`${origin}/profil`);
  res.cookies.set(SESSION_COOKIE, sessionToken, COOKIE_OPTS);
  res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
