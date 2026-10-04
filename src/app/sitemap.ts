import { MetadataRoute } from "next";
import { SITE_CONFIG, TOOL_SLUGS, LEGAL_PAGES, BLOG_POSTS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const domain = SITE_CONFIG.domain;
  const now = new Date();

  return [
    { url: domain, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${domain}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${domain}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...TOOL_SLUGS.map((slug) => ({
      url: `${domain}/tools/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...LEGAL_PAGES.map((slug) => ({
      url: `${domain}/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${domain}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
