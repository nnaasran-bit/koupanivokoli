import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kořen projektu (kvůli více lockfile na disku Next jinak hádá špatně).
  turbopack: { root: __dirname },
};

export default nextConfig;
