import type { Metadata, Viewport } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/newsreader/500.css";
import "@fontsource-variable/figtree";
import "@fontsource/caveat/400.css";
import "@fontsource/caveat/500.css";
import "./globals.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: { default: `${BRAND.name} · ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  openGraph: { siteName: BRAND.name, locale: "es_AR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#f3ebdd" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
