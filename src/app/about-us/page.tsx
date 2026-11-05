import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
  legalLinkClass,
} from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "About Us | PDF Lovers Pro",
  description:
    "PDF Lovers Pro is a privacy-first PDF toolkit that runs entirely in your browser using WebAssembly. Meet the founder and learn how it works.",
  alternates: { canonical: "https://pdflovers.com/about-us" },
};

const principles = [
  {
    title: "Private by design",
    body: "Files are processed on your device. They are never uploaded, so we can't see, store, or share them.",
  },
  {
    title: "Fast",
    body: "There is no upload or download queue. Work starts the moment you pick a file.",
  },
  {
    title: "No account needed",
    body: "Open a tool, process your file, and download the result. No sign-up required.",
  },
];

export default function AboutUsPage() {
  return (
    <LegalLayout eyebrow="About" title="About PDF Lovers Pro">
      <p className="text-lg leading-relaxed text-slate-600">
        PDF Lovers Pro is a collection of PDF tools built on one idea: your
        documents are yours, and they should stay on your device.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {principles.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <LegalSection title="Our Story">
        <p>
          Most online PDF tools ask you to upload your files to a remote
          server. For contracts, IDs, invoices, and medical records, that is a
          lot of trust to place in a stranger. PDF Lovers Pro was created by
          founder and architect Hassan Asghar to offer a different approach.
        </p>
      </LegalSection>

      <LegalSection title="How It Works">
        <p>
          Our tools run inside your browser using modern web technologies,
          including WebAssembly. When you merge, split, edit, secure, or
          analyse a PDF, the work happens locally on your device. Closing or
          refreshing the page clears your files from memory.
        </p>
        <p>
          You can read the details in our{" "}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="What You Can Do">
        <ul className="list-disc space-y-1 pl-6">
          <li>Merge, split, rotate, crop, and delete pages</li>
          <li>Add page numbers and watermarks</li>
          <li>Protect PDFs and remove hidden metadata</li>
          <li>Inspect document properties</li>
        </ul>
        <p>
          Browse everything on the{" "}
          <Link href="/" className={legalLinkClass}>
            home page
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Get in Touch">
        <p>
          Questions, bug reports, or ideas for new tools? We would like to hear
          from you on our{" "}
          <Link href="/contact-us" className={legalLinkClass}>
            Contact Us
          </Link>{" "}
          page.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
