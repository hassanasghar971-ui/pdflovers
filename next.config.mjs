
// next.config.mjs

/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'
    https://pagead2.googlesyndication.com
    https://www.googletagservices.com
    https://www.google.com
    https://www.gstatic.com
    https://*.profitableratecpmnetwork.com
    https://*.googlesyndication.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' blob: https://*.googlesyndication.com https://*.profitableratecpmnetwork.com;
  frame-src 'self' https://googleads.g.doubleclick.net https://*.profitableratecpmnetwork.com https://*.google.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig = {
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // ✅ REQUIRED FIX — Next.js 16 uses Turbopack by default.
  // This explicit block resolves the "webpack config with no turbopack config" build error.
  // resolveAlias here replaces the old `webpack.resolve.alias.canvas = false` logic
  // needed by pdfjs-dist, which otherwise tries to import the Node "canvas" package.
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },

  // ✅ Kept ONLY as a fallback for local `next build --webpack` runs.
  // Vercel's default production build on Next 16 ignores this and uses Turbopack above.
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
