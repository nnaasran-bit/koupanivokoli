import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { FACEBOOK_CLIENT_ID, FB_STATE_COOKIE, facebookRedirectUri } from "@/lib/facebook";

// Nikdy necachovat – každý uživatel musí dostat čerstvý state.
export const dynamic = "force-dynamic";

// Zahájení přihlášení přes Facebook.
export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  if (!FACEBOOK_CLIENT_ID) {
    return NextResponse.redirect(
      `${origin}/profil?error=${encodeURIComponent("Facebook přihlášení zatím není nastavené.")}`,
    );
  }
  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    redirect_uri: facebookRedirectUri(origin),
    state,
    response_type: "code",
    scope: "public_profile",
  });
  const res = NextResponse.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
  res.cookies.set(FB_STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
