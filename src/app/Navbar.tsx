"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Navbar
 *  Glassmorphic sticky header · Mega dropdown · Mobile drawer · Live search
 * ------------------------------------------------------------------ */

export type ToolCategory = "Organize" | "Convert" | "Optimize" | "Edit" | "Secure" | "Extract";

export interface PdfTool {
  slug: string;
  name: string;
  category: ToolCategory;
  blurb: string;
}

export const CATEGORIES: { name: ToolCategory; blurb: string; accent: string }[] = [
  { name: "Organize", blurb: "Merge, split, reorder, rebuild", accent: "#E11D48" },
  { name: "Convert", blurb: "PDF ⇄ Office, images, text", accent: "#7C3AED" },
  { name: "Optimize", blurb: "Compress, repair, flatten", accent: "#0EA5E9" },
  { name: "Edit", blurb: "Watermark, annotate, forms", accent: "#F59E0B" },
  { name: "Secure", blurb: "Encrypt, sign, redact", accent: "#10B981" },
  { name: "Extract", blurb: "OCR, text, images", accent: "#6366F1" },
];

export const PDF_TOOLS: PdfTool[] = [
  /* ---------------- ORGANIZE (13) ---------------- */
  { slug: "merge-pdf", name: "Merge PDF", category: "Organize", blurb: "Combine unlimited PDFs into one polished document in seconds." },
  { slug: "split-pdf", name: "Split PDF", category: "Organize", blurb: "Split large PDFs into single pages or custom ranges instantly." },
  { slug: "organize-pdf", name: "Organize PDF", category: "Organize", blurb: "Drag, reorder and rearrange PDF pages with a visual editor." },
  { slug: "remove-pages", name: "Remove Pages", category: "Organize", blurb: "Delete unwanted pages from any PDF with one clean click." },
  { slug: "extract-pages", name: "Extract Pages", category: "Organize", blurb: "Pull selected pages out into a brand-new PDF file." },
  { slug: "rotate-pdf", name: "Rotate PDF", category: "Organize", blurb: "Fix sideways scans — rotate pages 90, 180 or 270 degrees." },
  { slug: "crop-pdf", name: "Crop PDF", category: "Organize", blurb: "Trim margins and whitespace with precise visual crop handles." },
  { slug: "resize-pdf", name: "Resize PDF", category: "Organize", blurb: "Scale pages to A4, Letter, Legal or fully custom dimensions." },
  { slug: "n-up-pdf", name: "N-Up PDF", category: "Organize", blurb: "Fit 2, 4 or 8 pages per sheet to save paper and ink." },
  { slug: "add-bookmarks", name: "Add Bookmarks", category: "Organize", blurb: "Create clickable navigation bookmarks inside long documents." },
  { slug: "table-of-contents", name: "Table of Contents", category: "Organize", blurb: "Auto-generate a linked table of contents for any PDF." },
  { slug: "header-footer", name: "Header & Footer", category: "Organize", blurb: "Add headers, footers, dates and labels across every page." },
  { slug: "page-numbers", name: "Page Numbers", category: "Organize", blurb: "Insert clean page numbers in any position, font or style." },

  /* ---------------- CONVERT (13) ---------------- */
  { slug: "pdf-to-word", name: "PDF to Word", category: "Convert", blurb: "Turn PDFs into fully editable DOCX files with layout intact." },
  { slug: "pdf-to-excel", name: "PDF to Excel", category: "Convert", blurb: "Extract tables into editable XLSX spreadsheets automatically." },
  { slug: "pdf-to-powerpoint", name: "PDF to PowerPoint", category: "Convert", blurb: "Convert PDF pages into editable PPTX slide decks." },
  { slug: "pdf-to-jpg", name: "PDF to JPG", category: "Convert", blurb: "Export every page as a crisp high-resolution JPG image." },
  { slug: "pdf-to-text", name: "PDF to Text", category: "Convert", blurb: "Pull clean, copy-ready plain text from any PDF instantly." },
  { slug: "pdf-to-markdown", name: "PDF to Markdown", category: "Convert", blurb: "Convert PDFs into structured Markdown for docs and blogs." },
  { slug: "pdf-to-epub", name: "PDF to EPUB", category: "Convert", blurb: "Reformat PDFs into reflowable EPUB ebooks for any reader." },
  { slug: "word-to-pdf", name: "Word to PDF", category: "Convert", blurb: "Convert DOCX files into pixel-perfect, shareable PDFs." },
  { slug: "excel-to-pdf", name: "Excel to PDF", category: "Convert", blurb: "Transform spreadsheets into clean, print-ready PDF reports." },
  { slug: "powerpoint-to-pdf", name: "PowerPoint to PDF", category: "Convert", blurb: "Turn PPTX decks into professional PDF handouts in seconds." },
  { slug: "jpg-to-pdf", name: "JPG to PDF", category: "Convert", blurb: "Combine images into one organized, shareable PDF document." },
  { slug: "html-to-pdf", name: "HTML to PDF", category: "Convert", blurb: "Capture any web page as a pixel-perfect PDF snapshot." },
  { slug: "text-to-pdf", name: "Text to PDF", category: "Convert", blurb: "Turn plain text notes into beautifully typeset PDF files." },

  /* ---------------- OPTIMIZE (4) ---------------- */
  { slug: "compress-pdf", name: "Compress PDF", category: "Optimize", blurb: "Shrink PDF size up to 90% with zero visible quality loss." },
  { slug: "repair-pdf", name: "Repair PDF", category: "Optimize", blurb: "Recover corrupted or damaged PDFs and restore full access." },
  { slug: "flatten-pdf", name: "Flatten PDF", category: "Optimize", blurb: "Merge layers, forms and annotations into a fixed final PDF." },
  { slug: "metadata-editor", name: "Metadata Editor", category: "Optimize", blurb: "Edit title, author, keywords and document properties safely." },

  /* ---------------- EDIT (5) ---------------- */
  { slug: "watermark-pdf", name: "Watermark PDF", category: "Edit", blurb: "Brand every page with custom text or image watermarks." },
  { slug: "stamp-pdf", name: "Stamp PDF", category: "Edit", blurb: "Apply approved, draft or custom stamps anywhere on a page." },
  { slug: "annotate-pdf", name: "Annotate PDF", category: "Edit", blurb: "Highlight, comment and draw directly on any PDF document." },
  { slug: "fill-forms", name: "Fill PDF Forms", category: "Edit", blurb: "Complete interactive PDF forms and save them securely." },
  { slug: "compare-pdf", name: "Compare PDF", category: "Edit", blurb: "Spot every difference between two PDF versions side by side." },

  /* ---------------- SECURE (4) ---------------- */
  { slug: "protect-pdf", name: "Protect PDF", category: "Secure", blurb: "Encrypt PDFs with strong passwords and permission controls." },
  { slug: "unlock-pdf", name: "Unlock PDF", category: "Secure", blurb: "Remove passwords from PDFs you own to regain full access." },
  { slug: "sign-pdf", name: "Sign PDF", category: "Secure", blurb: "Draw, type or upload legally binding eSignatures in seconds." },
  { slug: "redact-pdf", name: "Redact PDF", category: "Secure", blurb: "Permanently black out sensitive text, images and metadata." },

  /* ---------------- EXTRACT (3) ---------------- */
  { slug: "ocr-pdf", name: "OCR PDF", category: "Extract", blurb: "Make scanned PDFs searchable with 100+ language OCR." },
  { slug: "extract-text", name: "Extract Text", category: "Extract", blurb: "Mine every word from PDFs into clean, editable text." },
  { slug: "extract-images", name: "Extract Images", category: "Extract", blurb: "Pull every embedded image out of a PDF in original quality." },
];

function GemLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="PDF Lovers logo">
      <defs>
        <linearGradient id="plGemNav" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="45%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>
        <linearGradient id="plGlossNav" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#0F172A" />
      <rect x="1" y="1" width="46" height="46" rx="13" fill="none" stroke="rgba(225,29,72,.5)" strokeWidth="1" />
      <path d="M24 6 L40 19 L24 42 L8 19 Z" fill="url(#plGemNav)" />
      <path d="M8 19 H40" stroke="#FDA4AF" strokeWidth="1.4" opacity="0.6" />
      <path d="M24 6 L16.5 19 L24 42 L31.5 19 Z" fill="url(#plGlossNav)" opacity="0.5" />
      <path d="M24 6 L40 19 L24 42 L8 19 Z" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
      <circle cx="17" cy="13" r="2" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

function useToolSearch(query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PDF_TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.slug.includes(q)
    ).slice(0, 8);
  }, [query]);
}

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [drawerQuery, setDrawerQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<ToolCategory | null>("Organize");

  const results = useToolSearch(query);
  const drawerResults = useToolSearch(drawerQuery);

  const closeAll = useCallback(() => {
    setToolsOpen(false);
    setDrawerOpen(false);
  }, []);

  /* Close everything on route change */
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  /* Click outside the header closes the mega menu */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* Body scroll lock while the drawer is open */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = drawerOpen ? "hidden" : previous || "";
    return () => {
      document.body.style.overflow = previous || "";
    };
  }, [drawerOpen]);

  const grouped = useMemo(() => {
    return CATEGORIES.map((category) => ({
      ...category,
      tools: PDF_TOOLS.filter((t) => t.category === category.name),
    }));
  }, []);

  return (
    <>
      <header className="site-header" ref={headerRef}>
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="PDF Lovers — home">
            <GemLogo />
            <span>
              PDF<em>&nbsp;Lovers</em>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Primary navigation">
            <button
              type="button"
              className="nav-trigger"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => setToolsOpen((v) => !v)}
            >
              Tools
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"
                style={{ transform: toolsOpen ? "rotate(180deg)" : "none", transition: "transform .18s var(--ease)" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <Link className="nav-link" href="/tools" data-active={pathname === "/tools"}>
              All 42 Tools
            </Link>
            <Link className="nav-link" href="/about" data-active={pathname === "/about"}>
              About
            </Link>
            <Link className="nav-link" href="/contact" data-active={pathname === "/contact"}>
              Contact
            </Link>
          </nav>

          <div className="nav-search">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 42 tools…"
              aria-label="Search all PDF tools"
              aria-expanded={results.length > 0}
            />
            {query.trim().length > 0 && (
              <div className="search-pop" role="listbox" aria-label="Tool search results">
                {results.length === 0 ? (
                  <p className="search-empty">No tool found for “{query}”.</p>
                ) : (
                  results.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="search-result"
                      role="option"
                      aria-selected="false"
                      onClick={() => setQuery("")}
                    >
                      <b>{tool.name}</b>
                      <span>
                        {tool.category} · {tool.blurb}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link className="btn btn-primary nav-cta" href="/tools/merge-pdf">
            Merge PDF free
          </Link>

          <button
            type="button"
            className="hamburger"
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* ------------------- Mega dropdown ------------------- */}
        <div className="mega" data-open={toolsOpen} aria-hidden={!toolsOpen}>
          <div className="mega-grid">
            {grouped.map((category) => (
              <div key={category.name} className="mega-col">
                <h4 style={{ color: category.accent }}>{category.name}</h4>
                <ul>
                  {category.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link className="mega-link" href={`/tools/${tool.slug}`} tabIndex={toolsOpen ? 0 : -1}>
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
              42 tools · 100% client-side · no sign-up required
            </span>
            <Link className="btn btn-primary btn-sm" href="/tools" tabIndex={toolsOpen ? 0 : -1}>
              Browse the full directory
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------- Scrim (outside header: header has backdrop-filter) ------------------- */}
      <div
        className="nav-scrim"
        data-open={toolsOpen || drawerOpen}
        onClick={closeAll}
        aria-hidden="true"
      />

      {/* ------------------- Mobile drawer ------------------- */}
      <aside
        id="mobile-drawer"
        className="drawer"
        data-open={drawerOpen}
        aria-hidden={!drawerOpen}
        aria-label="Mobile navigation"
      >
        <div className="drawer-search">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ left: 14, top: 27 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={drawerQuery}
            onChange={(e) => setDrawerQuery(e.target.value)}
            placeholder="Search all 42 tools…"
            aria-label="Search all PDF tools"
            tabIndex={drawerOpen ? 0 : -1}
          />
        </div>

        {drawerQuery.trim().length > 0 ? (
          <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "#fff", overflow: "hidden", marginBottom: 14 }}>
            {drawerResults.length === 0 ? (
              <p className="search-empty">No tool found for “{drawerQuery}”.</p>
            ) : (
              drawerResults.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="search-result"
                  tabIndex={drawerOpen ? 0 : -1}
                  onClick={() => {
                    setDrawerQuery("");
                    setDrawerOpen(false);
                  }}
                >
                  <b>{tool.name}</b>
                  <span>
                    {tool.category} · {tool.blurb}
                  </span>
                </Link>
              ))
            )}
          </div>
        ) : (
          grouped.map((category) => {
            const isOpen = openCategory === category.name;
            return (
              <div key={category.name} className="drawer-acc">
                <button
                  type="button"
                  className="drawer-acc-btn"
                  aria-expanded={isOpen}
                  tabIndex={drawerOpen ? 0 : -1}
                  onClick={() => setOpenCategory(isOpen ? null : category.name)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span
                      aria-hidden="true"
                      style={{ width: 8, height: 8, borderRadius: 999, background: category.accent, display: "inline-block" }}
                    />
                    {category.name}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .18s var(--ease)" }}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="drawer-acc-body">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        tabIndex={drawerOpen ? 0 : -1}
                        onClick={() => setDrawerOpen(false)}
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <Link
            className="btn btn-primary"
            href="/tools"
            tabIndex={drawerOpen ? 0 : -1}
            onClick={() => setDrawerOpen(false)}
          >
            Browse all 42 tools
          </Link>
          <Link
            className="btn btn-ghost"
            href="/about"
            tabIndex={drawerOpen ? 0 : -1}
            onClick={() => setDrawerOpen(false)}
          >
            About PDF Lovers
          </Link>
        </div>

        <nav className="drawer-legal" aria-label="Legal">
          {[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/dmca", label: "DMCA" },
            { href: "/contact", label: "Contact" },
          ].map((l) => (
            <Link key={l.href} href={l.href} tabIndex={drawerOpen ? 0 : -1} onClick={() => setDrawerOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
