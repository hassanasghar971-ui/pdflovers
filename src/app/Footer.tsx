import Link from "next/link";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Footer
 *  Category sitemap · Legal coverage · Hassan Asghar ownership block
 * ------------------------------------------------------------------ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdflovers.com";

const CATEGORY_LINKS: { label: string; href: string }[] = [
  { label: "Organize PDF tools", href: "/tools?category=Organize" },
  { label: "Convert PDF tools", href: "/tools?category=Convert" },
  { label: "Optimize PDF tools", href: "/tools?category=Optimize" },
  { label: "Edit PDF tools", href: "/tools?category=Edit" },
  { label: "Secure PDF tools", href: "/tools?category=Secure" },
  { label: "Extract & OCR tools", href: "/tools?category=Extract" },
];

const POPULAR_LINKS: { label: string; href: string }[] = [
  { label: "Merge PDF", href: "/tools/merge-pdf" },
  { label: "Split PDF", href: "/tools/split-pdf" },
  { label: "Compress PDF", href: "/tools/compress-pdf" },
  { label: "PDF to Word", href: "/tools/pdf-to-word" },
  { label: "OCR PDF", href: "/tools/ocr-pdf" },
  { label: "Sign PDF", href: "/tools/sign-pdf" },
  { label: "Protect PDF", href: "/tools/protect-pdf" },
  { label: "Redact PDF", href: "/tools/redact-pdf" },
];

const COMPANY_LINKS: { label: string; href: string }[] = [
  { label: "About PDF Lovers", href: "/about" },
  { label: "Contact & Support", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "DMCA / Copyright", href: "/dmca" },
  { label: "All 42 Tools", href: "/tools" },
];

function GemMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" role="img" aria-label="PDF Lovers logo">
      <defs>
        <linearGradient id="plGemFoot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="45%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>
        <linearGradient id="plGlossFoot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#0F172A" />
      <rect x="1" y="1" width="46" height="46" rx="13" fill="none" stroke="rgba(225,29,72,.5)" strokeWidth="1" />
      <path d="M24 6 L40 19 L24 42 L8 19 Z" fill="url(#plGemFoot)" />
      <path d="M8 19 H40" stroke="#FDA4AF" strokeWidth="1.4" opacity="0.6" />
      <path d="M24 6 L16.5 19 L24 42 L31.5 19 Z" fill="url(#plGlossFoot)" opacity="0.5" />
      <path d="M24 6 L40 19 L24 42 L8 19 Z" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
      <circle cx="17" cy="13" r="2" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GemMark />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "#fff", letterSpacing: "-.03em" }}>
                PDF <span style={{ color: "#FB7185" }}>Lovers</span>
              </span>
            </div>
            <p>
              42 free, browser-native PDF tools powered by WebAssembly. Your documents are processed on
              your own device and never uploaded to any server — not even ours.
            </p>
            <div className="owner-card">
              <b>Maintained by Hassan Asghar</b>
              <a href="mailto:hassanasghar7868686@gmail.com">hassanasghar7868686@gmail.com</a>
            </div>
          </div>

          <nav className="footer-col" aria-label="Tool categories">
            <h4>Tool Categories</h4>
            {CATEGORY_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className="footer-col" aria-label="Popular tools">
            <h4>Popular Tools</h4>
            {POPULAR_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className="footer-col" aria-label="Company and legal">
            <h4>Company &amp; Legal</h4>
            {COMPANY_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} PDF Lovers · Owned and maintained by Hassan Asghar. All rights reserved.
          </span>
          <nav className="footer-legal" aria-label="Legal documents">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/dmca">DMCA</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>

        <p style={{ fontSize: ".74rem", color: "#64748B", paddingBottom: 28, maxWidth: "88ch" }}>
          PDF Lovers is an independent client-side document utility. All trademarks, brand names and
          file formats referenced on this site belong to their respective owners and are used only for
          descriptive compatibility purposes. Canonical domain:{" "}
          <span style={{ color: "#94A3B8" }}>{SITE_URL}</span>.
        </p>
      </div>
    </footer>
  );
}
