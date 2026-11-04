import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Content-Security-Policy
 * -----------------------
 * Adsterra (Social Bar + Native Banner) loads further scripts, iframes and images from
 * rotating third-party hosts, so `https:` must be allowed for script/img/frame/connect.
 * A nonce-based "strict-dynamic" policy would break the ad network, so this is the
 * tightest policy that still keeps monetisation working.
 * Everything else is locked down: no <object>, no foreign <base>, no foreign form posts,
 * and framing is limited to same-origin.
 * Workers are limited to 'self' and blob: (pdf.js and tesseract.js workers).
 * 'wasm-unsafe-eval' is required by the tesseract.js WebAssembly core.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' data: blob: https:",
  "worker-src 'self' blob:",
  "child-src 'self' blob: https:",
  "frame-src 'self' https:",
  "media-src 'self' data: blob: https:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
  images: { unoptimized: true }, // fully static / client-side app, no image optimiser server

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Service worker must never be cached by the CDN, or PWA updates get stuck.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Make sure Googlebot always fetches a fresh sitemap and robots file.
        source: '/:file(sitemap.xml|robots.txt)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, s-maxage=3600, must-revalidate' }],
      },
    ];
  },

  async redirects() {
    return [
      {
        // One canonical host (apex) keeps Search Console clean.
        source: '/:path*',
        has: [{ type: 'host', value: 'www.pdflovers.com' }],
        destination: 'https://pdflovers.com/:path*',
        permanent: true,
      },
    ];
  },

  /**
   * pdfjs-dist tries to `require('canvas')` for Node rendering.
   * In the browser bundle that import must resolve to nothing.
   */
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, unknown> | undefined),
      canvas: false,
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback as Record<string, unknown> | undefined),
      canvas: false,
      ...(isServer
        ? {}
        : {
            fs: false,
            path: false,
            os: false,
            crypto: false,
            stream: false,
            zlib: false,
            http: false,
            https: false,
            url: false,
            child_process: false,
          }),
    };
    return config;
  },
};

export default nextConfig;
