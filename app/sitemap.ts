import type { MetadataRoute } from "next";
import { siteConfig, toolRoutes, legalRoutes } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date().toISOString();

  const homeEntry: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  const toolEntries: MetadataRoute.Sitemap = toolRoutes.map((tool) => ({
    url: `${baseUrl}/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const legalEntries: MetadataRoute.Sitemap = legalRoutes.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...homeEntry, ...toolEntries, ...legalEntries];
}
