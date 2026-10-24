import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ToolCard from "@/components/tool-card";
import HeroSearch from "@/components/hero-search";
import NativeBanner from "@/components/ads/native-banner";
import { TOOLS, ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/tools-registry";

const SITE_URL = "https://pdflovers.com";

export const metadata: Metadata = {
  title: "PDF Lovers Pro – Free Online PDF Tools | Merge, Split, Compress & Convert",
  description:
    "42+ free online PDF tools to merge, split, compress, convert, rotate, watermark and edit PDF files. 100% client-side WebAssembly processing — your files never leave your browser.",
  alternates: { canonical: SITE_URL },
};

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "100% Private Processing",
    description:
      "Every tool runs entirely inside your browser using WebAssembly. Your files are never uploaded to any server, ever.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "No upload queues, no waiting rooms. Processing happens instantly using your own device's native computing power.",
  },
  {
    icon: Lock,
    title: "Zero Data Retention",
    description:
      "We have no database and no file storage. Once you close the tab, your data is gone from memory — permanently.",
  },
  {
    icon: Cpu,
    title: "Powered by WebAssembly",
    description:
      "Built on industry-grade libraries like pdf-lib, pdfjs-dist, and Tesseract.js compiled to near-native WASM speed.",
  },
];

const FAQS = [
  {
    question: "Is PDF Lovers Pro really free to use?",
    answer:
      "Yes, all 42+ tools on PDF Lovers Pro are completely free to use with no hidden fees, subscriptions, or watermarks added to your files.",
  },
  {
    question: "Do you store or upload my PDF files?",
    answer:
      "No. Every tool processes your files 100% locally inside your browser using WebAssembly. Your files never touch our servers because we don't have a backend that accepts file uploads.",
  },
  {
    question: "Do I need to install any software?",
    answer:
      "No installation is required. PDF Lovers Pro works directly in your web browser on desktop, tablet, or mobile, and can even be installed as a Progressive Web App.",
  },
];

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PDF Lovers Pro",
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2140",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-red-50/60 to-white px-4 py-20 dark:border-zinc-800 dark:from-red-950/10 dark:to-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <Sparkles size={13} /> 42+ Tools · 100% Client-Side · Zero Upload
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
            Every PDF Tool You Need,{" "}
            <span className="text-red-600">100% Private</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Merge, split, compress, convert, rotate, watermark, and OCR your
            PDF files instantly — processed entirely inside your browser with
            WebAssembly. No uploads, no accounts, no limits.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
            <span>✓ No file size limits</span>
            <span>✓ No installation required</span>
            <span>✓ Works offline (PWA)</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              Popular PDF Tools
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Hand-picked tools used by thousands of people every day.
            </p>
          </div>
          <Link
            href="/tools"
            className="focus-ring flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-500"
          >
            View all 42+ tools <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <NativeBanner />
      </section>

      <section className="border-y border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-950/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              Why Choose PDF Lovers Pro
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              Built from the ground up with privacy, speed, and reliability as
              core engineering principles.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
                    <Icon size={20} />
                  </span>
                  <h3 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ALL_CATEGORIES.map((category) => {
            const count = TOOLS.filter((t) => t.category === category).length;
            return (
              <Link
                key={category}
                href={`/tools?category=${category}`}
                className="focus-ring group rounded-2xl border border-zinc-200 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900/50"
              >
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  {CATEGORY_LABELS[category]}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">{count} tools</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-800 marker:content-none dark:text-zinc-100">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-red-600 px-4 py-14 dark:border-zinc-800 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to simplify your PDF workflow?
          </h2>
          <p className="max-w-xl text-sm text-red-100">
            Jump into any of our 42+ tools right now — no sign-up, no
            installation, completely free forever.
          </p>
          <Link
            href="/tools"
            className="focus-ring flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-red-600 transition-transform hover:scale-105"
          >
            Explore All Tools <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
