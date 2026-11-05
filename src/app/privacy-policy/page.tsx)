import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
  legalLinkClass,
} from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | PDF Lovers Pro",
  description:
    "PDF Lovers Pro processes your PDFs locally in your browser. Your files never touch our servers. Read how we handle cookies, analytics, and third-party services.",
  alternates: { canonical: "https://pdflovers.com/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="January 2026">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="text-base font-semibold text-emerald-900">
          The short version
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-emerald-800">
          Our PDF tools run 100% in your browser using WebAssembly. Your
          documents are never uploaded to our servers, and we cannot see,
          store, or share them.
        </p>
      </div>

      <LegalSection title="Introduction">
        <p>
          PDF Lovers Pro (
          <a href="https://pdflovers.com" className={legalLinkClass}>
            pdflovers.com
          </a>
          ), led by founder and architect Hassan Asghar, respects your privacy.
          This policy explains what we do and don&apos;t collect when you use
          our website and tools.
        </p>
      </LegalSection>

      <LegalSection title="Files You Process">
        <p>
          We do not store, view, retain, or transmit any PDF documents or files
          you process. Merging, splitting, editing, and analysing all happen
          locally on your device. When you close or refresh the page, your
          files and results are cleared from memory.
        </p>
      </LegalSection>

      <LegalSection title="Information We May Collect">
        <p>
          We do not require an account and we do not ask for your name or email
          address to use our tools. Like most websites, we and our hosting
          provider may automatically receive limited technical information,
          such as:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>IP address, browser type, and device type</li>
          <li>Pages visited, referring page, and time of visit</li>
          <li>Approximate location derived from the IP address</li>
        </ul>
        <p>
          This information is used to keep the site secure, diagnose errors,
          and understand how the tools are used. It never includes the contents
          of your files.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and Analytics">
        <p>
          We may use cookies or similar technologies to remember preferences
          and to measure site traffic in aggregate. You can block or delete
          cookies in your browser settings; the tools will continue to work.
        </p>
      </LegalSection>

      <LegalSection title="Third-Party Services">
        <p>
          Our website is hosted on Vercel. Some features may also load code
          libraries or language data (for example, for OCR) from content
          delivery networks. These requests may expose your IP address to the
          provider, but they do not include your documents.
        </p>
        <p>
          If we display advertising or use analytics from third parties such as
          Google, those providers may use cookies to serve ads or measure
          performance under their own privacy policies. You can manage Google
          ad personalisation at{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className={legalLinkClass}
          >
            adssettings.google.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Data Security">
        <p>
          Because your files stay on your device, they are not exposed to us or
          to anyone else in transit. Our site is served over HTTPS. Please keep
          your own device and browser up to date, as that is where your
          documents are processed.
        </p>
      </LegalSection>

      <LegalSection title="Children's Privacy">
        <p>
          Our service is not directed to children under 13, and we do not
          knowingly collect personal information from them.
        </p>
      </LegalSection>

      <LegalSection title="Your Rights">
        <p>
          Depending on where you live, you may have the right to access,
          correct, or delete personal data held about you. Since we do not
          collect personal data through the tools, there is usually nothing to
          retrieve, but you can contact us with any request.
        </p>
      </LegalSection>

      <LegalSection title="Changes to This Policy">
        <p>
          We may update this policy from time to time. The &quot;Last
          updated&quot; date at the top shows when it was last revised, and
          continued use of the site means you accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact Us">
        <p>
          Questions about this policy? Visit our{" "}
          <Link href="/contact-us" className={legalLinkClass}>
            Contact Us
          </Link>{" "}
          page. See also our{" "}
          <Link href="/terms-and-conditions" className={legalLinkClass}>
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
