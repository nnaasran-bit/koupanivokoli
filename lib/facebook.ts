// Konfigurace Facebook OAuth. App ID smí být v kódu/proměnné, App Secret jen v proměnné.
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || "1037913315848009";
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || "";
export const FB_STATE_COOKIE = "fb_oauth_state";
export const FB_GRAPH = "https://graph.facebook.com/v19.0";

export function facebookRedirectUri(origin: string): string {
  return `${origin}/api/auth/callback/facebook`;
}
