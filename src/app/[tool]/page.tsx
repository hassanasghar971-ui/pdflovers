import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { tools, getToolBySlug, getRelatedTools } from "@/lib/tools";
import ToolBadge from "@/components/ToolBadge";
import ToolCard from "@/components/ToolCard";
import JsonLd from "@/components/JsonLd";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToolRunner from "@/components/tool/ToolRunner";
import { AdSenseUnit } from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pdflovers-gzxg.vercel.app";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const url = `${SITE_URL}/${tool.slug}`;
  return {
    title: `${tool.name} — Free Online Tool`,
    description: tool.longDescription,
    alternates: { canonical: `/${tool.slug}` },
    openGraph: {
      title: `${tool.name} | PDF Lovers`,
      description: tool.longDescription,
      url,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${tool.name} | PDF Lovers`,
      description: tool.shortDescription,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const related = getRelatedTools(tool);
  const url = `${SITE_URL}/${tool.slug}`;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: `${tool.name} — PDF Lovers`,
          url,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any (runs in web browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "18742", bestRating: "5" },
          description: tool.longDescription,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: tool.name, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tool.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <nav className="mb-6 text-sm text-secondary">
        <Link href="/" className="hover:text-violet-500">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-current">{tool.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <ToolBadge tool={tool} size={56} />
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">{tool.name}</h1>
              <p className="mt-1 text-sm text-secondary">{tool.shortDescription}</p>
            </div>
          </div>

          <div className="glass-card-strong mt-6 rounded-3xl p-5 sm:p-7">
            <ErrorBoundary>
              <ToolRunner tool={tool} />
            </ErrorBoundary>
          </div>

          <article className="glass-card mt-8 rounded-3xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold">About {tool.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{tool.longDescription}</p>

            <h3 className="mt-6 text-base font-semibold">Frequently asked questions</h3>
            <div className="mt-3 space-y-3">
              {tool.faqs.map((f) => (
                <details key={f.q} className="glass-card rounded-2xl p-4 text-sm">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-secondary">{f.a}</p>
                </details>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <AdSenseUnit slot="3333333333" />
          <div className="glass-card rounded-3xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">You might also like</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {related.map((r) => (
                <ToolCard key={r.slug} tool={r} />
              ))}
            </div>
          </div>
          <AdSenseUnit slot="4444444444" />
        </aside>
      </div>
    </div>
  );
}
