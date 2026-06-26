// Konfigurace Google OAuth. Client ID není tajné (smí být v kódu),
// Client Secret čteme jen z proměnné prostředí GOOGLE_CLIENT_SECRET.
export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "762304867922-d9f7ttbo0ukr4labqmcquaubp1n1gtdp.apps.googleusercontent.com";

export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const OAUTH_STATE_COOKIE = "g_oauth_state";

export function googleRedirectUri(origin: string): string {
  return `${origin}/api/auth/callback/google`;
}
