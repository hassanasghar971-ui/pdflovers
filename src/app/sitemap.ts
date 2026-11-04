import type { MetadataRoute } from 'next';
import { TOOLS, LEGAL_PAGES, POPULAR_SLUGS, TOOL_COUNT } from '@/lib/tools-registry';

/**
 * Bulletproof sitemap for Google Search Console ("Couldn't fetch" fix):
 *  - fully static (generated at build time, served as plain XML)
 *  - every URL is absolute and hardcoded to https://pdflovers.com (no env vars, no runtime host detection)
 *  - ISO 8601 timestamps
 *  - no trailing slashes, no query strings, no duplicate URLs
 */
export const dynamic = 'force-static';

const BASE = 'https://pdflovers.com';

export default function sitemap(): MetadataRoute.Sitemap {
  if (TOOLS.length !== TOOL_COUNT) {
    throw new Error(`Sitemap integrity check failed: expected ${TOOL_COUNT} tools, got ${TOOLS.length}.`);
  }

  const lastModified = new Date().toISOString(); // ISO 8601, e.g. 2025-01-31T10:20:30.000Z

  const home: MetadataRoute.Sitemap = [
    { url: `${BASE}`, lastModified, changeFrequency: 'daily', priority: 1.0 },
  ];

  const tools: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${BASE}/tools/${tool.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: POPULAR_SLUGS.includes(tool.slug) ? 0.9 : 0.8,
  }));

  const legal: MetadataRoute.Sitemap = LEGAL_PAGES.map((page) => ({
    url: `${BASE}/${page.slug}`,
    lastModified,
    changeFrequency: 'yearly',
    priority: page.slug === 'about-us' || page.slug === 'contact-us' ? 0.5 : 0.3,
  }));

  return [...home, ...tools, ...legal];
}
