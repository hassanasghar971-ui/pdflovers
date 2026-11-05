import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import './globals.css';
import { SITE, LEGAL_PAGES, TOOL_COUNT } from '@/lib/tools-registry';

/* ---------------------------------- SEO ----------------------------------- */

const DEFAULT_TITLE = `${SITE.name}: ${TOOL_COUNT} Free PDF Tools in Your Browser`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  generator: 'Next.js',
  keywords: [
    'pdf tools',
    'merge pdf',
    'split pdf',
    'compress pdf',
    'pdf to word',
    'word to pdf',
    'pdf to jpg',
    'free pdf editor',
    'private pdf tools',
    'ocr pdf',
    'pdflovers',
  ],
  authors: [{ name: SITE.founder, url: SITE.url }],
  creator: SITE.founder,
  publisher: SITE.name,
  category: 'technology',
  manifest: '/manifest.webmanifest',
  // Renders: <meta name="google-site-verification" content="pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI" />
  verification: { google: SITE.googleVerification },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: DEFAULT_TITLE,
    description: SITE.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e5322d',
  colorScheme: 'light',
};

/* ------------------------------ Structured data --------------------------- */

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      founder: { '@type': 'Person', name: SITE.founder, jobTitle: SITE.founderTitle },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: SITE.email,
          availableLanguage: ['English', 'Urdu'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      publisher: { '@id': `${SITE.url}/#organization` },
      inLanguage: 'en',
    },
  ],
};

const jsonLdString = JSON.stringify(siteJsonLd).replace(/</g, '\\u003c');

/* ------------------------ Adsterra Social Bar (gated) ---------------------- */
/**
 * Smart frequency capping:
 *  - Loads only after 2 genuine user interactions (click / tap),
 *    OR immediately after a tool action fires `window.dispatchEvent(new Event('plp:action'))`.
 *  - Once per 30 minutes per browser (localStorage cooldown).
 *  - Never loads twice in a page view.
 */
const SOCIAL_BAR_SRC =
  'https://pl31804194.profitableratecpmnetwork.com/72/bc/4b/72bc4b4ca161783e4681f10c50bbf607.js';

const socialBarGate = `
(function () {
  var SRC = ${JSON.stringify(SOCIAL_BAR_SRC)};
  var KEY = 'plp_sb_ts';
  var COOLDOWN = 30 * 60 * 1000;
  var NEEDED = 2;
  var count = 0;
  var done = false;
  try {
    var last = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (last && Date.now() - last < COOLDOWN) return;
  } catch (e) {}
  function cleanup() {
    document.removeEventListener('click', onInteract, true);
    document.removeEventListener('touchend', onInteract, true);
    window.removeEventListener('plp:action', onAction);
  }
  function load() {
    if (done) return;
    done = true;
    cleanup();
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    var s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    document.body.appendChild(s);
  }
  function onInteract() { count++; if (count >= NEEDED) load(); }
  function onAction() { load(); }
  document.addEventListener('click', onInteract, true);
  document.addEventListener('touchend', onInteract, true);
  window.addEventListener('plp:action', onAction);
})();
`;

/* ---------------------------------- Layout -------------------------------- */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-red-600 focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight" aria-label={`${SITE.name} home`}>
              <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-white">
                P
              </span>
              <span>
                PDF Lovers <span className="text-red-600">Pro</span>
              </span>
            </Link>
            <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium text-slate-700">
              <Link href="/#all-tools" className="hover:text-red-600">
                All Tools
              </Link>
              <Link href="/about-us" className="hidden hover:text-red-600 sm:inline">
                About
              </Link>
              <Link href="/contact-us" className="hover:text-red-600">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
            <div>
              <p className="text-lg font-bold">{SITE.name}</p>
              <p className="mt-2 text-sm text-slate-600">{SITE.tagline}</p>
              <p className="mt-3 text-sm text-slate-600">
                Built by <strong>{SITE.founder}</strong>, {SITE.founderTitle}.
              </p>
            </div>

            <nav aria-label="Legal and company">
              <p className="font-semibold">Company</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {LEGAL_PAGES.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/${p.slug}`} className="hover:text-red-600">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="font-semibold">Get in touch</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:text-red-600">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  WhatsApp:{' '}
                  <a href={SITE.whatsappPrimaryLink} target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    {SITE.whatsappPrimary}
                  </a>
                </li>
                <li>
                  WhatsApp:{' '}
                  <a href={SITE.whatsappSecondaryLink} target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                    {SITE.whatsappSecondary}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} {SITE.name} · pdflovers.com · Files are processed in your browser and are not uploaded to our servers.
          </div>
        </footer>

        {/* Organization + WebSite structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />

        {/* Adsterra Social Bar – interaction-gated with frequency cap */}
        <Script id="adsterra-social-bar-gate" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: socialBarGate }} />
      </body>
    </html>
  );
}
