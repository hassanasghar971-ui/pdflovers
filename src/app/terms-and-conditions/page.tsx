import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileCheck2 } from "lucide-react";

const SITE_URL = "https://pdflovers.com";
const LAST_UPDATED = "January 15, 2025";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions for using PDF Lovers Pro's free online PDF tools, including acceptable use, intellectual property, and liability disclaimers.",
  alternates: { canonical: `${SITE_URL}/terms-and-conditions` },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Terms and Conditions
        </span>
      </nav>

      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
          <FileCheck2 size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Terms and Conditions
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-red-600">
        <p>
          These Terms and Conditions ("Terms") govern your access to and use
          of PDF Lovers Pro (<Link href={SITE_URL}>pdflovers.com</Link>), a
          website operated by Hassan Asghar ("we," "us," "our"). By accessing
          or using our Site and its 42+ client-side PDF tools, you agree to
          be bound by these Terms. If you do not agree, please discontinue
          use of the Site immediately.
        </p>

        <h2>1. Description of Service</h2>
        <p>
          PDF Lovers Pro provides free, browser-based tools for manipulating
          PDF, Word, Excel, and image files, including but not limited to
          merging, splitting, compressing, rotating, watermarking, converting,
          and performing optical character recognition (OCR) on documents.
          All processing is performed entirely client-side using
          WebAssembly-powered JavaScript libraries running in your own
          browser; no files are uploaded to our servers.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 13 years of age to use this Service. By using
          PDF Lovers Pro, you represent and warrant that you meet this
          eligibility requirement and that you have the legal capacity to
          enter into these Terms.
        </p>

        <h2>3. Acceptable Use</h2>
        <p>You agree not to use PDF Lovers Pro to:</p>
        <ul>
          <li>
            Process, generate, or distribute any content that is unlawful,
            defamatory, infringing, obscene, or otherwise objectionable
          </li>
          <li>
            Attempt to reverse-engineer, decompile, or extract the source
            code of our client-side processing engine beyond what is
            permitted by applicable open-source licenses
          </li>
          <li>
            Use automated scripts, bots, or scrapers to overwhelm, degrade,
            or disrupt the Site's availability or performance
          </li>
          <li>
            Circumvent, disable, or otherwise interfere with security-related
            features of the Site, including our Content Security Policy
          </li>
          <li>
            Use the Service to infringe upon the intellectual property,
            privacy, or other legal rights of any third party
          </li>
        </ul>

        <h2>4. Your Content and Files</h2>
        <p>
          You retain full ownership of any files you process using PDF
          Lovers Pro. Because all processing occurs locally within your
          browser's memory, we never gain access to, store, or claim any
          rights over your documents, images, or extracted data. You are
          solely responsible for ensuring you have the legal right to process
          any file you upload into our tools.
        </p>

        <h2>5. No Warranty</h2>
        <p>
          PDF Lovers Pro is provided on an "AS IS" and "AS AVAILABLE" basis
          without warranties of any kind, whether express or implied,
          including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement. We do not warrant that the Service will be
          uninterrupted, error-free, or completely secure, as browser
          performance can vary based on your device's hardware and available
          memory.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, Hassan Asghar
          and PDF Lovers Pro shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, including
          but not limited to loss of data, loss of profits, or business
          interruption, arising out of or related to your use of or
          inability to use the Service, even if advised of the possibility
          of such damages. Because processing occurs locally on your device,
          we strongly recommend maintaining independent backups of any
          important files before processing them.
        </p>

        <h2>7. Third-Party Advertising</h2>
        <p>
          PDF Lovers Pro is supported by advertising served through Google
          AdSense and the Adsterra advertising network. We are not
          responsible for the content, accuracy, or practices of
          third-party advertisers or the websites they link to. Your
          interactions with any advertisement are solely between you and the
          relevant advertiser, governed by their own terms and privacy
          policies.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          The PDF Lovers Pro name, logo, website design, and underlying
          source code (excluding open-source third-party libraries used
          under their respective licenses, such as pdf-lib, pdfjs-dist,
          xlsx, jszip, file-saver, and tesseract.js) are the intellectual
          property of Hassan Asghar. You may not reproduce, distribute, or
          create derivative works from our proprietary branding or source
          code without prior written permission.
        </p>

        <h2>9. Modifications to the Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of
          the Service at any time without prior notice. We also reserve the
          right to update these Terms periodically; continued use of the
          Site following any changes constitutes your acceptance of the
          revised Terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with
          applicable international e-commerce and digital service
          regulations, without regard to conflict-of-law principles. Any
          disputes arising from these Terms shall first be attempted to be
          resolved informally by contacting us directly.
        </p>

        <h2>11. Contact Information</h2>
        <p>For any questions regarding these Terms, please contact:</p>
        <ul>
          <li>
            <strong>Founder:</strong> Hassan Asghar
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
      </article>
    </main>
  );
}
