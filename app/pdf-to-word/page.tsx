import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "PDF to Word Converter — Free & Private",
  description:
    "Convert PDF documents into editable Word files, entirely in your browser. Launching soon on PDF Lovers Pro.",
  alternates: { canonical: `${siteConfig.url}/pdf-to-word` },
};

export default function PdfToWordPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        🚧 Launching Soon
      </span>
      <h1 className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
        PDF to Word Converter
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Convert PDFs into fully editable .docx Word documents — processed
        locally in your browser via WebAssembly, with zero uploads to any
        server. This engine is in final development.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          Want to be notified the moment PDF to Word goes live?
        </p>
        <a
          href={`mailto:${siteConfig.founder.email}?subject=Notify me: PDF to Word tool`}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Notify Me by Email
        </a>
      </div>

      <section className="prose prose-slate mt-16 max-w-none dark:prose-invert">
        <h2>Why Client-Side Conversion Is Hard — And Worth It</h2>
        <p>
          Accurate PDF-to-Word conversion requires sophisticated text and
          layout reconstruction. We're building this entirely with
          WebAssembly-based parsing so that even this complex operation never
          requires uploading your document to a server.
        </p>
        <h2>In the Meantime</h2>
        <p>
          Try our fully functional{" "}
          <Link href="/merge-pdf">Merge PDF tool</Link> today.
        </p>
      </section>
    </div>
  );
}
