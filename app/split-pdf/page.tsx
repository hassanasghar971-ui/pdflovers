import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Split PDF Files Online — Free & Private",
  description:
    "Extract and separate pages from your PDF files entirely in your browser. Launching soon on PDF Lovers Pro.",
  alternates: { canonical: `${siteConfig.url}/split-pdf` },
};

export default function SplitPdfPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        🚧 Launching Soon
      </span>
      <h1 className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
        Split PDF Files
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Extract specific pages or divide a PDF into multiple files — all
        processed locally in your browser, with zero uploads. This tool's
        client-side engine is currently being finalized and will be live
        shortly.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          Want to be notified the moment Split PDF goes live?
        </p>
        <a
          href={`mailto:${siteConfig.founder.email}?subject=Notify me: Split PDF tool`}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Notify Me by Email
        </a>
      </div>

      <section className="prose prose-slate mt-16 max-w-none dark:prose-invert">
        <h2>How Split PDF Will Work</h2>
        <ol>
          <li>Upload a PDF — processed entirely in your browser, never transmitted anywhere.</li>
          <li>Select the page ranges you want to extract or choose "split every page into its own file."</li>
          <li>Instantly download the resulting file(s), generated locally via WebAssembly.</li>
        </ol>
        <h2>In the Meantime</h2>
        <p>
          Explore our fully functional{" "}
          <Link href="/merge-pdf">Merge PDF tool</Link>, available right now.
        </p>
      </section>
    </div>
  );
}
