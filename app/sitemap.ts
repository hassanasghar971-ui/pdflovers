import type { MetadataRoute } from 'next';
import { getLiveTools } from '@/lib/tools-registry';
import { SITE } from '@/lib/site';

const LAST_MODIFIED = new Date();
const STATIC_PATHS = ['', '/about-us', '/contact-us', '/privacy-policy', '/terms-and-conditions', '/dmca-notice'];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = STATIC_PATHS.map((path) => ({ url: `${SITE.url}${path}`, lastModified: LAST_MODIFIED }));
  const toolRoutes = getLiveTools().map((tool) => ({ url: `${SITE.url}/tools/${tool.slug}`, lastModified: LAST_MODIFIED }));
  return [...staticRoutes, ...toolRoutes];
}
