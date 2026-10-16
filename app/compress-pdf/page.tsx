import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Compress PDF Files Online — Free & Private",
  description:
    "Reduce your PDF file size entirely in your browser, with no uploads. Launching soon on PDF Lovers Pro.",
  alternates: { canonical: `${siteConfig.url}/compress-pdf` },
};

export default function CompressPdfPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        🚧 Launching Soon
      </span>
      <h1 className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
        Compress PDF Files
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Shrink large PDF files for faster sharing and emailing — fully
        client-side, with no uploads. Our WebAssembly compression engine is
        being finalized and will launch shortly.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          Want to be notified the moment Compress PDF goes live?
        </p>
        <a
          href={`mailto:${siteConfig.founder.email}?subject=Notify me: Compress PDF tool`}
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Notify Me by Email
        </a>
      </div>

      <section className="prose prose-slate mt-16 max-w-none dark:prose-invert">
        <h2>How Compression Will Work</h2>
        <p>
          Image downsampling, font subsetting, and stream optimization will
          all be performed locally using WebAssembly-compiled compression
          libraries, meaning your sensitive documents never leave your device
          during compression.
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
