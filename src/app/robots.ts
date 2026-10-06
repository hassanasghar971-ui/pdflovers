import type { MetadataRoute } from "next";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Robots directives
 *  Welcomes search + AI crawlers, protects internal routes.
 * ------------------------------------------------------------------ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdflovers.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/", "/*?*utm_", "/*?*fbclid"],
      },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Googlebot-Image", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "YandexBot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "AhrefsBot", allow: "/" },
      { userAgent: "SemrushBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
