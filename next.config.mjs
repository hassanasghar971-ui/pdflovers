/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdfjs-dist references the optional `canvas` Node binding — disable it for browser bundles
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
