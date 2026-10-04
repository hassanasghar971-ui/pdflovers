import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/", "/admin/"] },
    ],
    sitemap: `${SITE_CONFIG.domain}/sitemap.xml`,
    host: SITE_CONFIG.domain,
  };
}
