import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SITE } from '@/lib/site';
import ConsentBanner from '@/components/ConsentBanner';
import AdLoader from '@/components/AdLoader';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  title: {
    default: 'PDF Lovers Pro - 100% Free Client-Side PDF Tools',
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  authors: [{ name: SITE.contact.founder }],
  verification: { google: 'pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        {children}
        <ConsentBanner />
        <AdLoader />
      </body>
    </html>
  );
}
