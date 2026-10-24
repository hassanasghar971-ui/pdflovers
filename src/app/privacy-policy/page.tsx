import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";

const SITE_URL = "https://pdflovers.com";
const LAST_UPDATED = "January 15, 2025";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the PDF Lovers Pro Privacy Policy covering GDPR, CCPA, and DART cookie disclosures. Learn how our 100% client-side WebAssembly tools protect your data.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Privacy Policy
        </span>
      </nav>

      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
          <ShieldCheck size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-red-600">
        <p>
          PDF Lovers Pro ("we," "us," "our," or "the Service"), operated by
          Hassan Asghar, is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, and safeguard
          information when you use our website located at{" "}
          <Link href={SITE_URL}>pdflovers.com</Link> (the "Site") and the
          42+ PDF processing tools we provide. By using our Site, you agree
          to the terms described in this policy.
        </p>

        <h2>1. The Core Privacy Principle: Client-Side Processing</h2>
        <p>
          Unlike most online PDF tools, PDF Lovers Pro does not operate a
          backend file-processing server. Every single tool on our platform —
          including Merge PDF, Split PDF, Compress PDF, Rotate PDF, Watermark
          PDF, PDF to Word, Excel to PDF, and OCR PDF — runs entirely inside
          your own web browser using WebAssembly-compiled libraries such as
          pdf-lib, pdfjs-dist, xlsx, jszip, and tesseract.js. This means:
        </p>
        <ul>
          <li>
            Your documents are never uploaded, transmitted, or sent to any
            remote server operated by us or any third party.
          </li>
          <li>
            We do not have access to, nor do we store copies of, the content
            of any file you process using our tools.
          </li>
          <li>
            All processing occurs in your device's local random-access
            memory (RAM) and is automatically purged using garbage collection
            routines (including explicit <code>URL.revokeObjectURL()</code>{" "}
            calls and canvas memory purging) once you download your result,
            reset the tool, or close the browser tab.
          </li>
        </ul>

        <h2>2. Information We Do Not Collect</h2>
        <p>
          Because PDF Lovers Pro has no database and requires no user
          accounts, we do NOT collect, store, or have access to:
        </p>
        <ul>
          <li>The content of any PDF, Word, Excel, or image file you process</li>
          <li>Names, email addresses, or passwords (no account creation exists)</li>
          <li>Payment information (the Service is entirely free)</li>
          <li>File metadata extracted from your uploaded documents</li>
        </ul>

        <h2>3. Information We May Automatically Collect</h2>
        <p>
          Like most websites, our hosting infrastructure (Vercel) and
          third-party advertising partners may automatically collect limited
          technical information through standard web server logs and
          cookies, including:
        </p>
        <ul>
          <li>IP address (used only for basic security and fraud prevention)</li>
          <li>Browser type, device type, and operating system</li>
          <li>Pages visited, referring URLs, and approximate session duration</li>
          <li>General geographic location (country/region level, not precise GPS)</li>
        </ul>
        <p>
          This information is aggregated and anonymized where possible and is
          used solely to monitor Site performance, improve user experience,
          and detect abuse.
        </p>

        <h2>4. Cookies &amp; Advertising Technology (DART Disclosure)</h2>
        <p>
          PDF Lovers Pro displays advertisements served by third-party
          advertising networks, including Google AdSense and Adsterra. These
          partners may use cookies, web beacons, and similar tracking
          technologies to serve ads based on your prior visits to this
          website and other websites across the internet.
        </p>
        <ul>
          <li>
            <strong>Google DART Cookie:</strong> Google uses the DART cookie
            to serve ads to our users based on their visit to our Site and
            other sites on the Internet. You may opt out of the use of the
            DART cookie by visiting the{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>{" "}
            page.
          </li>
          <li>
            <strong>Adsterra Network:</strong> Our Social Bar and Native
            Banner advertisements are served through Adsterra's ad network,
            which may place its own cookies to measure ad performance and
            prevent fraud. Adsterra's practices are governed by their own{" "}
            <a
              href="https://adsterra.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Third-Party Vendors:</strong> Third-party vendors,
            including Google, use cookies to serve ads based on a user's
            prior visits to our website or other websites.
          </li>
        </ul>
        <p>
          You can manage or disable cookies at any time through your browser
          settings. Disabling cookies may limit certain functionality but
          will not affect your ability to use our core PDF tools, since they
          function entirely offline within your browser's local memory.
        </p>

        <h2>5. GDPR Compliance (European Economic Area Users)</h2>
        <p>
          If you are located in the European Economic Area (EEA), you have
          certain rights under the General Data Protection Regulation
          (GDPR), including:
        </p>
        <ul>
          <li>The right to access any personal data we may hold about you</li>
          <li>The right to request correction or deletion of your data</li>
          <li>The right to object to or restrict processing of your data</li>
          <li>The right to data portability</li>
          <li>The right to lodge a complaint with a supervisory authority</li>
        </ul>
        <p>
          Since our tools do not transmit or store your file content, the
          vast majority of GDPR data-subject requests are inherently
          satisfied by our architecture. For any residual analytics or
          advertising-related data concerns, please contact us using the
          details in Section 9.
        </p>

        <h2>6. CCPA Compliance (California Residents)</h2>
        <p>
          If you are a California resident, the California Consumer Privacy
          Act (CCPA) grants you the right to:
        </p>
        <ul>
          <li>Know what personal information is collected about you</li>
          <li>Know whether your personal information is sold or disclosed</li>
          <li>Opt out of the sale of your personal information</li>
          <li>Request deletion of your personal information</li>
          <li>Not be discriminated against for exercising your privacy rights</li>
        </ul>
        <p>
          PDF Lovers Pro does not sell personal information to third parties.
          Any advertising-related data sharing with networks like Google
          AdSense and Adsterra is limited to standard programmatic
          advertising practices as disclosed in Section 4.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our Service is not directed to children under the age of 13, and we
          do not knowingly collect personal information from children. Since
          no account registration or personal data submission is required to
          use our tools, the risk of inadvertent data collection from minors
          is minimal.
        </p>

        <h2>8. Data Security</h2>
        <p>
          While we do not store your files, we take reasonable technical
          measures to secure our Site, including enforced HTTPS encryption,
          a strict Content Security Policy, X-Content-Type-Options: nosniff,
          X-Frame-Options: SAMEORIGIN, and Permissions-Policy headers
          configured at the infrastructure level to protect against common
          web vulnerabilities such as cross-site scripting (XSS) and
          clickjacking.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data
          practices, please contact:
        </p>
        <ul>
          <li>
            <strong>Lead Architect &amp; Founder:</strong> Hassan Asghar
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:hassanasghar7868686@gmail.com">
              hassanasghar7868686@gmail.com
            </a>
          </li>
          <li>
            <strong>WhatsApp:</strong> +92 345 1098607
          </li>
        </ul>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically to reflect changes
          in our practices or for legal, operational, or regulatory reasons.
          We encourage you to review this page periodically. Continued use
          of the Site after any changes constitutes acceptance of the
          revised policy.
        </p>
      </article>
    </main>
  );
}
