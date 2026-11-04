import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Never block /_next/ assets: Googlebot needs the JS and CSS to render the tool pages.
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://pdflovers.com/sitemap.xml',
    host: 'https://pdflovers.com',
  };
}
