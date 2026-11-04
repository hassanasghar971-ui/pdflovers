import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack empty config to satisfy Next.js 16 default behavior when using webpack aliases
  turbopack: {},
  webpack: (config) => {
    // Resolve canvas fallback for pdfjs-dist / tesseract in client-side bundling
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.profitableratecpmnetwork.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' blob: https://*.profitableratecpmnetwork.com https://cdnjs.cloudflare.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
