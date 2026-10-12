import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kořen projektu (kvůli více lockfile na disku Next jinak hádá špatně).
  turbopack: { root: __dirname },
  images: {
    // Oficiální fotky lokalit (Wikimedia Commons) – next/image je smí
    // optimalizovat. Komunitní fotky mají libovolnou doménu (uživatel
    // vloží odkaz), ty zůstávají jako obyčejný <img>, viz PlacePhoto.tsx.
    remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }],
  },
};

export default nextConfig;
