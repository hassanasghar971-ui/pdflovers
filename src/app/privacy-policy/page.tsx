import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/tools-registry';

const UPDATED = 'January 1, 2026'; // set to your real publish date

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE.name} handles your files, your data and advertising.`,
  alternates: { canonical: `${SITE.url}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {UPDATED}</p>

      <h2 className="mt-8 text-xl font-semibold">Your files stay on your device</h2>
      <p className="mt-2">
        {SITE.name} runs in your browser. When you use a tool, your PDF, image or document is
        processed on your own device using WebAssembly. We do not upload your files to our servers,
        and we do not store, view or copy them. Closing or refreshing the page releases the memory
        used.
      </p>
      <p className="mt-2">
        Two features fetch resources from third-party hosts the first time they are used: text
        recognition (OCR) downloads its language data, and some PDF rendering features can load font
        and character-map files. Your documents are not sent in those requests.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Information we collect</h2>
      <p className="mt-2">
        We do not require an account and we do not ask for personal details to use the tools. Our
        hosting provider (Vercel) may keep standard server logs, such as IP address, browser type and
        requested URL, for security and operation. If you email or message us, we receive the
        details you choose to send.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Advertising and third parties</h2>
      <p className="mt-2">
        We show ads from Adsterra. Their scripts run on the same page as the tools and may set
        cookies or use similar technologies to serve and measure ads. Those scripts are operated by
        Adsterra under its own policies; they do not receive the contents of your files from us, but
        because they run in your browser we cannot promise a page is free of third-party tracking.
        Where the law requires your consent for advertising cookies, you should be asked for it.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Local storage and the service worker</h2>
      <p className="mt-2">
        We store a small timestamp in your browser to limit how often an ad prompt appears, and a
        service worker may cache site files so the app loads faster. You can clear both in your
        browser settings.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Security of protected files</h2>
      <p className="mt-2">
        Protect PDF uses a self-written AES-256 implementation that has not been independently
        audited. Redaction without the rasterize option only draws boxes over text, and the text can
        still be copied. Please check results before relying on them.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Children</h2>
      <p className="mt-2">The site is not directed at children under 13, and we do not knowingly collect their data.</p>

      <h2 className="mt-8 text-xl font-semibold">Changes and contact</h2>
      <p className="mt-2">
        We may update this policy and will change the date above when we do. Questions? Visit our{' '}
        <Link href="/contact-us" className="text-brand-600 underline">contact page</Link>.
      </p>
    </article>
  );
}
