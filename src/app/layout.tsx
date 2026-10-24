import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AdsterraSocialBar from "@/components/ads/adsterra-social-bar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const SITE_URL = "https://pdflovers.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "PDF Lovers Pro – Free Online PDF Tools | Merge, Split, Compress & Convert PDF",
    template: "%s | PDF Lovers Pro",
  },
  description:
    "PDF Lovers Pro offers 42+ free online PDF tools to merge, split, compress, convert, rotate, watermark, and edit PDF files. 100% client-side WebAssembly processing — your files never leave your browser.",
  keywords: [
    "pdf tools",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to word",
    "word to pdf",
    "pdf to jpg",
    "jpg to pdf",
    "pdf converter online free",
    "edit pdf online",
    "free pdf tools no upload",
    "client side pdf processing",
  ],
  authors: [{ name: "Hassan Asghar", url: SITE_URL }],
  creator: "Hassan Asghar",
  publisher: "PDF Lovers Pro",
  applicationName: "PDF Lovers Pro",
  category: "Technology",
  verification: {
    google: "pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "PDF Lovers Pro",
    title: "PDF Lovers Pro – Free Online PDF Tools",
    description:
      "42+ free online PDF tools. Merge, split, compress, convert and edit PDF files 100% securely in your browser. No uploads. No installs.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PDF Lovers Pro - Free Online PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Lovers Pro – Free Online PDF Tools",
    description:
      "42+ free online PDF tools processed 100% client-side with WebAssembly. Private. Fast. Secure.",
    images: [`${SITE_URL}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  colorScheme: "dark light",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PDF Lovers Pro",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  founder: {
    "@type": "Person",
    name: "Hassan Asghar",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "hassanasghar7868686@gmail.com",
      contactType: "customer support",
      telephone: "+92-345-1098607",
    },
  ],
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PDF Lovers Pro",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/tools?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta
          name="google-site-verification"
          content="pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AdsterraSocialBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
