import { createHash } from "node:crypto";

// Anonymní otisk IP (kvůli „1 IP = 1 hlas"). IP neukládáme v čitelné podobě.
export function ipHash(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  return createHash("sha256").update(`koupani:${ip}`).digest("hex").slice(0, 32);
}
