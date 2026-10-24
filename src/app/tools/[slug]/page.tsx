import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck } from "lucide-react";
import DynamicIcon from "@/components/dynamic-icon";
import ToolCard from "@/components/tool-card";
import ToolProcessor from "@/components/tool-processor";
import NativeBanner from "@/components/ads/native-banner";
import {
  TOOLS,
  getAllToolSlugs,
  getToolBySlug,
  CATEGORY_LABELS,
} from "@/lib/tools-registry";

const SITE_URL = "https://pdflovers.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested PDF tool could not be found.",
    };
  }

  const url = `${SITE_URL}/tools/${tool.slug}`;

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: tool.metaTitle,
      description: tool.metaDescription,
      siteName: "PDF Lovers Pro",
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const url = `${SITE_URL}/tools/${tool.slug}`;
  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug
  ).slice(0, 4);

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: tool.metaDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "985",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: `${SITE_URL}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: url,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/tools" className="hover:text-red-600">
          Tools
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {tool.name}
        </span>
      </nav>

      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
          <DynamicIcon name={tool.icon} className="h-7 w-7" />
        </span>
        <div>
          <span className="mb-1 inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {CATEGORY_LABELS[tool.category]}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {tool.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <ToolProcessor tool={tool} />

      <div className="my-10">
        <NativeBanner />
      </div>

      <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-red-600">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          About the {tool.name} Tool
        </h2>
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {tool.content.intro}
        </p>

        <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-white">
          {tool.content.howItWorksTitle}
        </h2>
        <ol className="space-y-2">
          {tool.content.steps.map((step, i) => (
            <li
              key={i}
              className="leading-relaxed text-zinc-600 dark:text-zinc-400"
            >
              {step}
            </li>
          ))}
        </ol>

        <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-white">
          Key Benefits
        </h2>
        <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tool.content.benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
                <DynamicIcon name={benefit.icon} className="h-4 w-4" />
              </span>
              <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {benefit.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="not-prose mt-8 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-500"
          />
          <div>
            <h3 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-400">
              WebAssembly Security &amp; Privacy Note
            </h3>
            <p className="text-xs leading-relaxed text-green-700 dark:text-green-500">
              {tool.content.securityNote}
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="not-prose space-y-3">
          {tool.content.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-800 marker:content-none dark:text-zinc-100">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </article>

      {relatedTools.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">
            Related PDF Tools
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((related) => (
              <ToolCard key={related.slug} tool={related} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
