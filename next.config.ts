import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Se usa el modelo de render clásico: las páginas que leen la base de datos
  // declaran `export const dynamic = "force-dynamic"`.
  cacheComponents: false,
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
  // Fuentes y logo que usa el generador de PDF.
  outputFileTracingIncludes: { "/api/descargas/[token]": ["./assets/pdf/**"] },
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
