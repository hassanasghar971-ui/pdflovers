import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, toolRoutes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Free Private PDF Tools — 100% Browser-Based",
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

const faqs = [
  {
    q: "Do you upload my files to a server?",
    a: "No. Every tool on PDF Lovers Pro processes your files entirely within your own browser using WebAssembly. Your files never leave your device.",
  },
  {
    q: "Is PDF Lovers Pro really free?",
    a: "Yes. Our core PDF tools are completely free to use, with no sign-up required. The Service is supported by non-intrusive advertising.",
  },
  {
    q: "What happens to my files after I close the tab?",
    a: "Nothing — because nothing was ever stored. Any in-memory data used during processing is discarded immediately when your browser session ends.",
  },
  {
    q: "Which browsers are supported?",
    a: "Any modern browser with WebAssembly support, including Chrome, Firefox, Safari, and Edge.",
  },
];

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white px-4 py-24 text-center dark:from-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            🔒 Zero Uploads · Zero Servers · Zero Tracking of Files
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            PDF Tools That Never Leave Your Browser
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
            {siteConfig.name} runs entirely on WebAssembly inside your device.
            Merge, split, compress, and convert PDFs instantly — with complete
            privacy, guaranteed.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/merge-pdf"
              className="rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-brand-700"
            >
              Start Merging PDFs — Free
            </Link>
            <Link
              href="/about-us"
              className="rounded-xl border border-slate-300 px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Choose Your Tool
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {toolRoutes.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 dark:text-white">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
              >
                <h3 className="font-bold text-slate-900 dark:text-white">{faq.q}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
