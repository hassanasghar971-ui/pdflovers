
// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    // add any domains you hot-link from
    domains: ['your-cdn.com'],
  },
  async headers() {
    return [
      {
        // apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' *.google-analytics.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: *.your-cdn.com",
              "connect-src 'self' *.vercel.app *.google-analytics.com",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-XSS-Protection',       value: '1; mode=block' }
        ]
      }
    ]
  }
}
