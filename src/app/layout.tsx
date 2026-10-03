import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { AdSenseScript, AdsterraScript } from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdflovers-gzxg.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PDF Lovers — 42 Free PDF Tools in Your Browser",
    template: "%s | PDF Lovers",
  },
  description:
    "Merge, split, compress, convert, sign and protect PDFs with 42 free, privacy-first tools that run 100% in your browser. No uploads, no watermarks, no signup.",
  keywords: ["PDF tools", "merge PDF", "compress PDF", "PDF to Word", "edit PDF", "PDF converter", "free PDF editor"],
  authors: [{ name: "Hassan Asghar" }],
  creator: "Hassan Asghar",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "PDF Lovers",
    title: "PDF Lovers — 42 Free PDF Tools in Your Browser",
    description: "Merge, split, compress, convert, sign and protect PDFs — entirely client-side, entirely free.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Lovers — 42 Free PDF Tools in Your Browser",
    description: "Merge, split, compress, convert, sign and protect PDFs — entirely client-side, entirely free.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a14" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PDF Lovers",
            url: SITE_URL,
            logo: `${SITE_URL}/icon.svg`,
            founder: { "@type": "Person", name: "Hassan Asghar" },
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "hassanasghar7868686@gmail.com",
                telephone: "+923451098607",
              },
            ],
          }}
        />
        <ThemeProvider>
          <Header />
          <main className="mx-auto min-h-[60vh] max-w-7xl px-3 pb-16 pt-8 sm:px-6">{children}</main>
          <Footer />
        </ThemeProvider>
        <AdSenseScript />
        <AdsterraScript />
      </body>
    </html>
  );
}
