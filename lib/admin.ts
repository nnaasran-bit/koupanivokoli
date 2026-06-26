// Jednoduchá admin autentizace přes heslo (z env ADMIN_SECRET).
// Server-only.
import { cookies } from "next/headers";

// Výchozí heslo lze přepsat proměnnou ADMIN_SECRET ve Vercelu (doporučeno).
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "Koupani-Admin-2026-9X7tQ2pL";
export const ADMIN_COOKIE = "kvo_admin";

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value === ADMIN_SECRET;
}
