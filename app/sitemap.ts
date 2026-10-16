import { MetadataRoute } from "next";

// Force static generation at build time — prevents the "Could not fetch / 404" issue on Vercel
export const dynamic = "force-static";
export const revalidate = 86400; // regenerate once per day

const BASE_URL = "https://pdflovers.com";

// 👇 Replace/confirm these 42 slugs match your actual /tools/[slug] routes exactly
const TOOL_SLUGS: string[] = [
  "merge-pdf", "split-pdf", "compress-pdf", "pdf-to-word", "word-to-pdf",
  "pdf-to-excel", "excel-to-pdf", "pdf-to-powerpoint", "powerpoint-to-pdf",
  "pdf-to-jpg", "jpg-to-pdf", "pdf-to-png", "png-to-pdf", "edit-pdf",
  "sign-pdf", "watermark-pdf", "rotate-pdf", "unlock-pdf", "protect-pdf",
  "organize-pdf", "pdf-to-pdfa", "ocr-pdf", "crop-pdf", "delete-pages",
  "extract-pages", "add-page-numbers", "compare-pdf", "redact-pdf",
  "repair-pdf", "html-to-pdf", "pdf-to-html", "pdf-to-text", "text-to-pdf",
  "merge-images-to-pdf", "pdf-to-epub", "epub-to-pdf", "pdf-reader",
  "fill-and-sign", "flatten-pdf", "pdf-metadata-editor",
  "split-by-bookmark", "pdf-page-extractor",
];

const LEGAL_SLUGS: string[] = [
  "privacy-policy",
  "terms-and-conditions",
  "dmca-notice",
  "about-us",
  "contact-us",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString(); // ISO 8601, e.g. 2025-05-01T00:00:00.000Z

  const home: MetadataRoute.Sitemap[number] = {
    url: BASE_URL,
    lastModified,
    changeFrequency: "daily",
    priority: 1.0,
  };

  const tools: MetadataRoute.Sitemap = TOOL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/tools/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const legal: MetadataRoute.Sitemap = LEGAL_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.3,
  }));

  return [home, ...tools, ...legal];
}
