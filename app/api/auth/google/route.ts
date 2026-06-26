import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, OAUTH_STATE_COOKIE, googleRedirectUri } from "@/lib/google";

// Nikdy necachovat – každý uživatel musí dostat čerstvý state.
export const dynamic = "force-dynamic";

// Zahájení přihlášení přes Google – přesměruje uživatele na souhlasnou obrazovku Google.
export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
