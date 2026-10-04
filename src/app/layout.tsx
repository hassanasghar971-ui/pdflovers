
// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import { getOrganizationSchema } from "@/lib/structuredData";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: "PDF Lovers — Free Online PDF Tools (Merge, Split, Compress) | 100% Private",
    template: "%s | PDF Lovers",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "merge pdf", "split pdf", "compress pdf", "pdf to word",
    "free pdf tools", "client side pdf editor", "pdf converter online",
  ],
  authors: [{ name: SITE_CONFIG.owner.name, url: SITE_CONFIG.domain }],
  creator: SITE_CONFIG.owner.name,
  publisher: SITE_CONFIG.name,
  category: "Technology",

  // ✅ Self-referential canonical
  alternates: { canonical: "/" },

  // ✅ FIX APPLIED HERE — renders <meta name="google-site-verification" content="..." />
  verification: {
    google: SITE_CONFIG.gscVerificationCode,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.domain,
    siteName: SITE_CONFIG.name,
    title: "PDF Lovers — Free Online PDF Tools",
    description: SITE_CONFIG.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF Lovers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Lovers — Free Online PDF Tools",
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
    creator: SITE_CONFIG.social.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationSchema = getOrganizationSchema();

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {children}

        <Script
          id="adsbygoogle-init"
          strategy="lazyOnload"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.ads.googleAdsenseClient}`}
        />
      </body>
    </html>
  );
}
