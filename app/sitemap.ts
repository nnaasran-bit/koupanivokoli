import type { MetadataRoute } from "next";
import { allLocations } from "@/lib/data";
import { REGIONS } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/koupani`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/kvalita-vody`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/zebricek`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/nahlasit`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/podminky`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/ochrana-udaju`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const regions: MetadataRoute.Sitemap = REGIONS.map((r) => ({
    url: `${SITE_URL}/koupani/${r.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const lists: MetadataRoute.Sitemap = [
    "lomy", "piskovny", "prehrady", "jezera", "rybniky", "koupaliste", "bazeny", "kempy",
  ].map((t) => ({
    url: `${SITE_URL}/seznam/${t}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const locations: MetadataRoute.Sitemap = allLocations.map((l) => ({
    url: `${SITE_URL}/lokalita/${l.slug}`,
    lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
    changeFrequency: "weekly",
    priority: l.monitored ? 0.8 : 0.6,
  }));
  return [...statics, ...regions, ...lists, ...locations];
}
