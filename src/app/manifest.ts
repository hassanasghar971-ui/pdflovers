import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/tools-registry';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    lang: 'en',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#e5322d',
    categories: ['productivity', 'utilities', 'business'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Merge PDF', short_name: 'Merge', url: '/tools/merge-pdf' },
      { name: 'Compress PDF', short_name: 'Compress', url: '/tools/compress-pdf' },
      { name: 'Split PDF', short_name: 'Split', url: '/tools/split-pdf' },
      { name: 'PDF to JPG', short_name: 'PDF to JPG', url: '/tools/pdf-to-jpg' },
    ],
  };
}
