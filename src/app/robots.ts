import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://pdflovers.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't block /_next/ assets: Googlebot needs the JS and CSS to render tool pages.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
