// Lehká autentizace: heslo přes scrypt (Node crypto), session v cookie.
// Server-only.
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getSessionUser } from "./store";
import type { PublicUser } from "./gamify";

export const SESSION_COOKIE = "sid";
export const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 dní
};

export function hashPassword(pw: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(pw: string, salt: string, hash: string): boolean {
  const h = scryptSync(pw, salt, 64);
  const hb = Buffer.from(hash, "hex");
  return h.length === hb.length && timingSafeEqual(h, hb);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const c = await cookies();
  const sid = c.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  return getSessionUser(sid);
}
