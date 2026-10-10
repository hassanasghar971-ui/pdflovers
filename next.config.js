module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['your-cdn.com'], // replace with real CDN hostname
  },
  async headers() {
    return [
      {
        // Apply security headers ONLY to real page routes.
        // Explicitly exclude machine-readable endpoints (sitemap, robots,
        // manifest, API routes, static assets) so nothing can interfere
        // with how crawlers / validators fetch them.
        source: "/((?!sitemap\\.xml|robots\\.txt|manifest\\.json|api/|_next/).*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' *.google-analytics.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: *.your-cdn.com",
              "connect-src 'self' *.google-analytics.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};
