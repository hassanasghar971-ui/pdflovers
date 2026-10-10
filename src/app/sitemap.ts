import type { MetadataRoute } from "next";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Static Sitemap (Google-Optimized, Production-Ready)
 * ------------------------------------------------------------------ */

// Force fully static generation at build time. This guarantees the route
// is pre-rendered once and served as a cached file rather than computed
// per-request — removing cold-start/timeout risk, which is one of the
// real-world causes of "Could not fetch" in GSC.
export const dynamic = "force-static";

// Regenerate once a day on platforms that support ISR for route handlers.
// Safe to remove if you prefer pure build-time-only generation.
export const revalidate = 86400; // 24h

/**
 * Normalizes the base URL:
 * - Falls back safely on empty string / missing env var (not just undefined).
 * - Strips ALL trailing slashes via URL parsing instead of regex.
 * - Fails safe to the known-good production domain if the env var is malformed,
 *   instead of emitting broken/relative sitemap URLs.
 */
function normalizeBaseUrl(raw: string | undefined): string {
  const fallback = "https://pdflovers.com";
  const candidate = raw?.trim() ? raw.trim() : fallback;

  try {
    return new URL(candidate).origin; // origin has no trailing slash, no path
  } catch {
    return fallback;
  }
}

const SITE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);

// Computed once at build time — NOT per request. Avoid calling `new Date()`
// inside the exported function; on platforms that treat the route as
// dynamic, that would make every URL "change" on every crawl, which
// degrades the value of the lastmod signal and wastes crawl budget.
const BUILD_DATE = new Date();

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

interface RouteDef {
  path: string; // "" for home, otherwise starts with "/"
  changeFrequency: ChangeFreq;
  priority: number;
}

// De-duplicated defensively (Set) so a future copy-paste duplicate
// can't sneak a repeated URL into the sitemap.
const TOOL_SLUGS: string[] = Array.from(
  new Set<string>([
    /* Organize (13) */
    "merge-pdf", "split-pdf", "organize-pdf", "remove-pages", "extract-pages",
    "rotate-pdf", "crop-pdf", "resize-pdf", "n-up-pdf", "add-bookmarks",
    "table-of-contents", "header-footer", "page-numbers",
    /* Convert (13) */
    "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint", "pdf-to-jpg",
    "pdf-to-text", "pdf-to-markdown", "pdf-to-epub", "word-to-pdf",
    "excel-to-pdf", "powerpoint-to-pdf", "jpg-to-pdf", "html-to-pdf",
    "text-to-pdf",
    /* Optimize (4) */
    "compress-pdf", "repair-pdf", "flatten-pdf", "metadata-editor",
    /* Edit (5) */
    "watermark-pdf", "stamp-pdf", "annotate-pdf", "fill-forms", "compare-pdf",
    /* Secure (4) */
    "protect-pdf", "unlock-pdf", "sign-pdf", "redact-pdf",
    /* Extract (3) */
    "ocr-pdf", "extract-text", "extract-images",
  ])
);

const STATIC_ROUTES: RouteDef[] = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/tools", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/dmca", changeFrequency: "yearly", priority: 0.3 },
];

/** Builds a clean, canonical, query-free absolute URL (no double slashes). */
function buildUrl(path: string): string {
  const cleanPath = path ? `/${encodeURI(path).replace(/^\/+/, "")}` : "";
  return `${SITE_URL}${cleanPath}`;
}

function toEntry(
  path: string,
  changeFrequency: ChangeFreq,
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: buildUrl(path),
    lastModified: BUILD_DATE,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((r) =>
    toEntry(r.path, r.changeFrequency, r.priority)
  );

  const toolEntries = TOOL_SLUGS.map((slug) =>
    toEntry(`/tools/${slug}`, "weekly", 0.8)
  );

  return [...staticEntries, ...toolEntries];
}
