import type { MetadataRoute } from "next";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Dynamic Sitemap
 *  Emits home + static routes + all 42 tool routes with max priority.
 * ------------------------------------------------------------------ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdflovers.com";

const TOOL_SLUGS: string[] = [
  /* Organize (13) */
  "merge-pdf",
  "split-pdf",
  "organize-pdf",
  "remove-pages",
  "extract-pages",
  "rotate-pdf",
  "crop-pdf",
  "resize-pdf",
  "n-up-pdf",
  "add-bookmarks",
  "table-of-contents",
  "header-footer",
  "page-numbers",
  /* Convert (13) */
  "pdf-to-word",
  "pdf-to-excel",
  "pdf-to-powerpoint",
  "pdf-to-jpg",
  "pdf-to-text",
  "pdf-to-markdown",
  "pdf-to-epub",
  "word-to-pdf",
  "excel-to-pdf",
  "powerpoint-to-pdf",
  "jpg-to-pdf",
  "html-to-pdf",
  "text-to-pdf",
  /* Optimize (4) */
  "compress-pdf",
  "repair-pdf",
  "flatten-pdf",
  "metadata-editor",
  /* Edit (5) */
  "watermark-pdf",
  "stamp-pdf",
  "annotate-pdf",
  "fill-forms",
  "compare-pdf",
  /* Secure (4) */
  "protect-pdf",
  "unlock-pdf",
  "sign-pdf",
  "redact-pdf",
  /* Extract (3) */
  "ocr-pdf",
  "extract-text",
  "extract-images",
];

const CATEGORY_ENTRIES: string[] = [
  "Organize",
  "Convert",
  "Optimize",
  "Edit",
  "Secure",
  "Extract",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  };

  const directory: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/tools`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  };

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_ENTRIES.map((category) => ({
    url: `${SITE_URL}/tools?category=${category}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolEntries: MetadataRoute.Sitemap = TOOL_SLUGS.map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const companyEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const legalEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/dmca`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    home,
    directory,
    ...categoryEntries,
    ...toolEntries,
    ...companyEntries,
    ...legalEntries,
  ];
}
