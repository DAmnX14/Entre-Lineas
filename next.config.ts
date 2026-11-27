import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se usa el modelo de render clásico: las páginas que leen la base de datos
  // declaran `export const dynamic = "force-dynamic"`.
  cacheComponents: false,
  serverExternalPackages: ["pdf-lib"],
  experimental: {
    serverActions: { bodySizeLimit: "60mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
