import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_OPTS, SESSION_COOKIE } from "@/lib/auth";
import {
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FB_GRAPH,
  FB_STATE_COOKIE,
  facebookRedirectUri,
} from "@/lib/facebook";
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
  const savedState = c.get(FB_STATE_COOKIE)?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return fail(origin, "Přihlášení přes Facebook se nezdařilo (ověření). Zkus to znovu.");
  }
  if (!FACEBOOK_CLIENT_SECRET) {
    return fail(origin, "Facebook přihlášení zatím není nastavené (chybí secret).");
  }

  // Výměna kódu za token
  const tokenParams = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    client_secret: FACEBOOK_CLIENT_SECRET,
    redirect_uri: facebookRedirectUri(origin),
    code,
  });
  const tokenRes = await fetch(`${FB_GRAPH}/oauth/access_token?${tokenParams}`);
  if (!tokenRes.ok) return fail(origin, "Facebook odmítl ověření. Zkus to znovu.");
  const token = await tokenRes.json();

  // Profil (id, jméno, e-mail)
  const infoRes = await fetch(
    `${FB_GRAPH}/me?fields=id,name,email&access_token=${encodeURIComponent(token.access_token)}`,
  );
  if (!infoRes.ok) return fail(origin, "Nepodařilo se načíst profil z Facebooku.");
  const info = await infoRes.json();

  // Facebook nemusí vrátit e-mail – pak použijeme náhradní identifikátor.
  const email = info.email ? String(info.email).trim() : `fb-${info.id}@facebook.koupanivokoli.cz`;
  const user = await findOrCreateOAuthUser(email, String(info.name ?? "Plavec"));
  const sessionToken = await createSession(user.id);

  const res = NextResponse.redirect(`${origin}/profil`);
  res.cookies.set(SESSION_COOKIE, sessionToken, COOKIE_OPTS);
  res.cookies.set(FB_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
