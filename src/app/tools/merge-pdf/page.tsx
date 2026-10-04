import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getSoftwareApplicationSchema, getBreadcrumbSchema, getFaqSchema } from "@/lib/structuredData";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import AdsterraNativeBanner from "@/components/ads/AdsterraNativeBanner";
import { SITE_CONFIG } from "@/lib/constants";

// ✅ ssr:false — keeps pdf-lib/pdfjs out of the server bundle entirely
const MergePdfTool = dynamic(() => import("@/components/pdf/MergePdfTool"), {
  ssr: false,
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100 rounded-2xl" />,
});

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free — No Upload, 100% Private",
  description: "Combine multiple PDF files into a single document instantly in your browser. No uploads, no size limits, completely free and private.",
  alternates: { canonical: "/tools/merge-pdf" },
};

const faqs = [
  { question: "Is it safe to merge PDFs here?", answer: "Yes. All processing happens locally in your browser — your files never leave your device." },
  { question: "Is there a file size limit?", answer: "No artificial limit — only your device's available memory matters." },
];

export default function MergePdfPage() {
  const softwareSchema = getSoftwareApplicationSchema({
    name: "Merge PDF — PDF Lovers",
    description: "Free client-side tool to merge multiple PDF files into one document.",
    slug: "merge-pdf",
  });
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_CONFIG.domain },
    { name: "Tools", url: `${SITE_CONFIG.domain}/tools` },
    { name: "Merge PDF", url: `${SITE_CONFIG.domain}/tools/merge-pdf` },
  ]);
  const faqSchema = getFaqSchema(faqs);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <main className="lg:col-span-3 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">Merge PDF Files Online — Free & Private</h1>

          {/* Tool + split-view PdfDownloadManager lives inside this client component */}
          <MergePdfTool />

          {/* AdSense placed AFTER the tool — never overlapping functional buttons */}
          <AdSenseUnit slot="1234567890" />
        </main>

        {/* ✅ Adsterra correctly placed: sticky sidebar, isolated from ZIP/View actions */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <AdsterraNativeBanner />
          </div>
        </aside>
      </div>
    </>
  );
}
