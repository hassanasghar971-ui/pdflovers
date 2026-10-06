"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PDF_TOOLS,
  CATEGORIES,
  type PdfTool,
  type ToolCategory,
} from "@/components/Navbar";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Home
 *  Hero · Live instant search · 42-tool grid · SEO content engine
 * ------------------------------------------------------------------ */

type CategoryFilter = "All" | ToolCategory;

const CATEGORY_ACCENT: Record<ToolCategory, string> = {
  Organize: "#E11D48",
  Convert: "#7C3AED",
  Optimize: "#0EA5E9",
  Edit: "#F59E0B",
  Secure: "#10B981",
  Extract: "#6366F1",
};

function CategoryGlyph({ category, size = 18 }: { category: ToolCategory; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (category) {
    case "Organize":
      return (
        <svg {...p}>
          <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
          <path d="M4 7V5a2 2 0 0 1 2-2h4l2 2" />
        </svg>
      );
    case "Convert":
      return (
        <svg {...p}>
          <path d="M4 8h13l-3-3" />
          <path d="M20 16H7l3 3" />
        </svg>
      );
    case "Optimize":
      return (
        <svg {...p}>
          <path d="M12 3v6" />
          <path d="M9 6h6" />
          <path d="M5 12h14" />
          <path d="M7 16h10l-2 5H9l-2-5Z" />
        </svg>
      );
    case "Edit":
      return (
        <svg {...p}>
          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
          <path d="M14 6l4 4" />
        </svg>
      );
    case "Secure":
      return (
        <svg {...p}>
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "Extract":
      return (
        <svg {...p}>
          <path d="M12 3v10" />
          <path d="M8 9l4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      );
  }
}

function AdSlot({ size, id }: { size: "leaderboard" | "banner" | "rectangle"; id: string }) {
  return (
    <div className="ad-slot" data-size={size} id={id} role="complementary" aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <span className="ad-shimmer" aria-hidden="true" />
      <span className="ad-copy">Reserved ad space — no layout shift</span>
    </div>
  );
}

/* ----------------------- Instant dropzone demo ----------------------- */

function InstantDropzone() {
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const purge = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setProgress(0);
    setFileName(null);
    setFileSize(0);
  }, []);

  useEffect(() => purge, [purge]);

  const handleFile = useCallback((file: File) => {
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setFileName(file.name);
    setFileSize(file.size);
    setProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    reader.onload = () => setProgress(100);
    reader.onerror = () => setProgress(0);
    reader.readAsArrayBuffer(file);
  }, []);

  const pretty = (bytes: number) =>
    bytes >= 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  return (
    <div
      className="dropzone"
      data-drag={drag}
      role="button"
      tabIndex={0}
      aria-label="Upload a PDF to get started"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 16V4" />
        <path d="M7 9l5-5 5 5" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>

      {fileName ? (
        <>
          <p className="dropzone-title">{fileName}</p>
          <p className="dropzone-hint">{pretty(fileSize)} · processed locally on your device</p>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn btn-primary btn-sm" href="/tools/compress-pdf" onClick={purge}>
              Compress this PDF
            </Link>
            <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); purge(); }}>
              Start over
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="dropzone-title">Drop a PDF here, or click to browse</p>
          <p className="dropzone-hint">
            Files are never uploaded. Everything runs in your browser with WebAssembly — even 100 MB+ documents.
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------ Page ------------------------------ */

const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "Are PDF Lovers tools really free without signing up?",
    a: "Yes. All 42 tools are free forever with no account, no email address and no credit card. There are no hidden page limits and no watermarks stamped on your output files.",
  },
  {
    q: "Do my PDF files get uploaded to a server?",
    a: "No. PDF Lovers runs pdf-lib, pdf.js and Tesseract.js as WebAssembly inside your own browser. Your document never leaves your device, which means nothing to leak, subpoena or breach.",
  },
  {
    q: "Is there a file size limit for merging or compressing PDFs?",
    a: "The only limit is your device's available memory. Because processing is client-side, modern phones and laptops comfortably handle documents over 100 MB. We automatically revoke object URLs and free canvases after every job to avoid memory crashes.",
  },
  {
    q: "Can I use PDF Lovers offline?",
    a: "After your first visit the engine and interface are cached by the browser, so most tools keep working with no connection at all. This is impossible with server-based converters.",
  },
  {
    q: "Which conversion formats are supported?",
    a: "PDF to Word, Excel, PowerPoint, JPG, plain text, Markdown and EPUB — plus Word, Excel, PowerPoint, JPG, HTML and text back to PDF. OCR supports more than 100 languages.",
  },
  {
    q: "Is PDF Lovers safe for confidential business documents?",
    a: "It is safer than any upload-based service. Because files stay on your hardware and are destroyed from memory when you close the tab, PDF Lovers is compatible with GDPR, HIPAA-minded workflows and strict internal data policies.",
  },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PDF_TOOLS.filter((tool: PdfTool) => {
      const matchesCategory = category === "All" || tool.category === category;
      const matchesQuery =
        q.length === 0 ||
        tool.name.toLowerCase().includes(q) ||
        tool.blurb.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.slug.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HOME_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
    []
  );

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge rise">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
            </svg>
            100% Client-Side · No Uploads · No Sign-Up
          </span>

          <h1 className="hero-title rise">
            Every PDF tool you need, <em>running inside your browser</em>.
          </h1>

          <p className="hero-sub rise">
            PDF Lovers gives you 42 professional-grade tools — merge, split, compress, OCR, convert,
            sign and redact — powered by WebAssembly. Zero server latency, zero uploads, and your
            documents never leave your device.
          </p>

          <div className="hero-actions rise">
            <Link className="btn btn-primary" href="/tools/merge-pdf">
              Merge PDF free
            </Link>
            <Link className="btn btn-ghost" href="/tools">
              Browse all 42 tools
            </Link>
          </div>

          <div className="hero-stats rise">
            <div className="stat">
              <b>42</b>
              <span>Browser-native PDF tools</span>
            </div>
            <div className="stat">
              <b>0 bytes</b>
              <span>Uploaded to any server</span>
            </div>
            <div className="stat">
              <b>&lt;0.8s</b>
              <span>Largest Contentful Paint target</span>
            </div>
            <div className="stat">
              <b>100+</b>
              <span>OCR languages supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= LIVE DROPZONE ======================= */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <InstantDropzone />
        </div>
      </section>

      <div className="container">
        <AdSlot id="ad-slot-top" size="leaderboard" />
      </div>

      {/* ======================= TOOL DIRECTORY ======================= */}
      <section className="section" id="tools">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The complete toolkit</span>
            <h2 className="section-title">42 free PDF tools, one private workspace</h2>
            <p className="section-sub">
              Filter by category or start typing — results update instantly. Every tool runs entirely
              on your device using WebAssembly, so there is nothing to wait for and nothing to trust.
            </p>
          </div>

          <div className="nav-search" style={{ position: "relative", width: "100%", margin: "0 0 8px" }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 42 tools — try “compress”, “sign” or “OCR”"
              aria-label="Search PDF tools"
            />
          </div>

          <div className="chips" role="tablist" aria-label="Filter tools by category">
            <button
              type="button"
              className="chip"
              role="tab"
              aria-selected={category === "All"}
              data-active={category === "All"}
              onClick={() => setCategory("All")}
            >
              All 42
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                type="button"
                className="chip"
                role="tab"
                aria-selected={category === c.name}
                data-active={category === c.name}
                onClick={() => setCategory(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <strong>No tool matches “{query}”.</strong>
              <p style={{ marginTop: 8 }}>
                Try a broader term such as <em>merge</em>, <em>convert</em> or <em>secure</em>.
              </p>
            </div>
          ) : (
            <div className="tool-grid">
              {filtered.map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`} className="tool-card">
                  <span
                    className="tool-icon"
                    style={{ background: `linear-gradient(135deg, ${CATEGORY_ACCENT[tool.category]}, #9F1239)` }}
                    aria-hidden="true"
                  >
                    <CategoryGlyph category={tool.category} />
                  </span>
                  <h3 className="tool-title">{tool.name}</h3>
                  <p className="tool-desc">{tool.blurb}</p>
                  <span className="tool-cta">
                    Open tool
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container">
        <AdSlot id="ad-slot-mid" size="banner" />
      </div>

      {/* ====================== HOW IT WORKS ====================== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Three steps, zero friction</span>
            <h2 className="section-title">How PDF Lovers processes your document without a server</h2>
          </div>
          <div className="tool-grid">
            {[
              {
                title: "1 · Pick a tool and drop your file",
                body:
                  "Choose one of the 42 tools and drag your PDF into the animated dropzone. Nothing is transmitted — the file is read directly into browser memory through the File API.",
              },
              {
                title: "2 · WebAssembly does the heavy lifting",
                body:
                  "pdf-lib, pdf.js and Tesseract.js execute inside dedicated Web Workers. Your interface stays at 60 fps while multi-hundred-megabyte documents are merged, compressed or OCR’d.",
              },
              {
                title: "3 · Download and auto-purge",
                body:
                  "Grab your result instantly. The moment you leave, we revoke every object URL, terminate workers and release canvases, so no sensitive page ever lingers in memory.",
              },
            ].map((s) => (
              <div key={s.title} className="tool-card">
                <h3 className="tool-title">{s.title}</h3>
                <p className="tool-desc">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== SEO CONTENT ====================== */}
      <section className="section" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container prose">
          <h2>Free secure PDF tools online without email sign-up — 2026 edition</h2>
          <p>
            Most online PDF converters ask you to upload a contract, a bank statement or a passport scan
            to a server you have never audited. PDF Lovers was built to end that trade-off. Every one of
            our 42 tools — from a simple free PDF merger to a full OCR pipeline — executes inside your
            own browser tab using WebAssembly. That single architectural decision changes everything
            about speed, privacy and cost.
          </p>

          <h3>Why browser-native PDF processing beats cloud converters</h3>
          <p>
            When a service uploads your file, three things happen: your bytes travel over a network you
            do not control, they sit on storage you cannot inspect, and they queue behind other users.
            PDF Lovers removes all three. Because the engine is downloaded once and executed locally,
            there is no upload latency, no queue, no per-file fee and no retention window. A 250-page
            document that would take a cloud tool thirty seconds to upload on a phone connection
            compresses here in a fraction of that time, because the data never leaves RAM.
          </p>

          <h3>The 42 tools, grouped by the job you actually need done</h3>
          <ul>
            <li>
              <strong>Organize:</strong> merge PDF, split PDF, organize pages, remove pages, extract
              pages, rotate, crop, resize, n-up, add bookmarks, build a table of contents, add headers
              and footers, and insert page numbers.
            </li>
            <li>
              <strong>Convert:</strong> PDF to Word, Excel, PowerPoint, JPG, text, Markdown and EPUB —
              plus Word, Excel, PowerPoint, JPG, HTML and plain text back into PDF.
            </li>
            <li>
              <strong>Optimize:</strong> compress PDF up to 90% smaller, repair corrupted files,
              flatten forms and annotations, and edit document metadata.
            </li>
            <li>
              <strong>Edit:</strong> watermark, stamp, annotate, fill interactive forms and compare two
              versions side by side.
            </li>
            <li>
              <strong>Secure:</strong> password-protect, unlock files you own, apply legally binding
              eSignatures and permanently redact sensitive content.
            </li>
            <li>
              <strong>Extract:</strong> searchable OCR in 100+ languages, full text extraction and
              original-quality image extraction.
            </li>
          </ul>

          <h3>Built for Core Web Vitals, not just for looks</h3>
          <p>
            Speed is a feature. PDF Lovers ships inlined critical CSS, preconnected font and CDN origins,
            reserved-dimension advertising containers and lazy-loaded heavy engines, so the page you are
            reading reaches Largest Contentful Paint in well under a second on a mid-range phone. When
            you open a tool, the WebAssembly core is fetched once and reused across the whole session.
            Interaction latency stays low because every intensive operation is pushed onto a worker
            thread instead of competing with the interface.
          </p>

          <h3>Memory safety for very large documents</h3>
          <p>
            Client-side processing only fails when memory is managed badly. PDF Lovers revokes every
            object URL immediately after use, terminates workers when a job completes, releases pdf.js
            page and document handles, and nulls blob references before the next operation begins. The
            practical result is that phones with modest RAM can still merge or compress documents well
            over 100 MB without triggering a browser tab crash.
          </p>

          <h3>Compliance-friendly by design</h3>
          <p>
            Because no document is ever transmitted, there is nothing to store, log, sell or expose.
            Teams working under GDPR, internal data-handling policies or industry confidentiality rules
            can adopt PDF Lovers without adding a data processor to their agreements. It is maintained
            by Hassan Asghar, who can be reached directly at{" "}
            <a href="mailto:hassanasghar7868686@gmail.com" style={{ color: "var(--rose-deep)", fontWeight: 600 }}>
              hassanasghar7868686@gmail.com
            </a>
            .
          </p>

          <h2>Frequently asked questions about free online PDF tools</h2>
          {HOME_FAQ.map((item) => (
            <details key={item.q} className="faq">
              <summary>
                {item.q}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="faq-body">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ====================== CTA BAND ====================== */}
      <section className="section">
        <div className="container">
          <div
            style={{
              borderRadius: "var(--r-lg)",
              background: "var(--obsidian)",
              color: "#fff",
              padding: "48px 28px",
              textAlign: "center",
              boxShadow: "var(--shadow-2)",
            }}
          >
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 750 }}>
              Stop uploading. Start processing.
            </h2>
            <p style={{ color: "#94A3B8", margin: "14px auto 26px", maxWidth: "56ch" }}>
              Pick any of the 42 tools and finish your document in seconds — privately, freely and
              without creating an account.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/tools/compress-pdf">
                Compress a PDF now
              </Link>
              <Link className="btn btn-ghost" href="/tools" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.28)" }}>
                See every tool
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <AdSlot id="ad-slot-bottom" size="leaderboard" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
