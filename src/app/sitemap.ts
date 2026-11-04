import { MetadataRoute } from 'next';
import { TOOLS_REGISTRY } from '@/lib/tools-registry';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pdflovers.com';
  const currentDate = new Date().toISOString();

  const staticPages = ['', '/privacy-policy', '/terms-and-conditions', '/dmca-notice', '/about-us', '/contact-us'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const toolPages = Object.keys(TOOLS_REGISTRY).map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...toolPages];
}
