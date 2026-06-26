import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Povolujeme i AI/LLM crawlery (GPTBot, ClaudeBot, …) – chceme být dohledatelní.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/profil"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
