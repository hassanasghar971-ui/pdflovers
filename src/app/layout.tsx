import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ------------------------------------------------------------------ *
 *  PDF Lovers — Root Layout
 *  Owner / Maintainer: Hassan Asghar <hassanasghar7868686@gmail.com>
 * ------------------------------------------------------------------ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdflovers.com";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
  adjustFontFallback: true,
});

/* Dynamic, self-contained favicon — no extra public/ asset required. */
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FB7185"/><stop offset="45%" stop-color="#E11D48"/><stop offset="100%" stop-color="#9F1239"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs><rect x="0" y="0" width="48" height="48" rx="13" fill="#0F172A"/><path d="M24 6 L40 19 L24 42 L8 19 Z" fill="url(#g)"/><path d="M8 19 H40" stroke="#FDA4AF" stroke-width="1.4" opacity="0.6"/><path d="M24 6 L16.5 19 L24 42 L31.5 19 Z" fill="url(#s)" opacity="0.5"/><path d="M24 6 L40 19 L24 42 L8 19 Z" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"/><circle cx="17" cy="13" r="2" fill="#FFFFFF" opacity="0.5"/></svg>`;

const FAVICON_URI = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PDF Lovers — 42 Free Online PDF Tools That Never Upload Your Files",
    template: "%s | PDF Lovers",
  },
  description:
    "PDF Lovers gives you 42 free browser-based PDF tools — merge, split, compress, OCR, convert, sign and redact. 100% client-side processing, no email sign-up, no uploads, no watermarks.",
  applicationName: "PDF Lovers",
  authors: [{ name: "Hassan Asghar", url: `${SITE_URL}/about` }],
  creator: "Hassan Asghar",
  publisher: "PDF Lovers",
  category: "UtilitiesApplication",
  keywords: [
    "free pdf tools",
    "merge pdf online free",
    "split pdf without email",
    "compress pdf without losing quality",
    "pdf to word converter free",
    "ocr pdf online",
    "secure pdf editor browser",
    "client side pdf tools",
    "pdf lovers",
  ],
  alternates: { canonical: "/" },
  /* Renders exactly:
     <meta name="google-site-verification" content="pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI" /> */
  verification: {
    google: "pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI",
    other: { "msvalidate.01": "pdflovers-bing-verification-placeholder-replaced-at-deploy" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: FAVICON_URI, type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: FAVICON_URI,
    apple: FAVICON_URI,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PDF Lovers",
    title: "PDF Lovers — 42 Free Online PDF Tools That Never Upload Your Files",
    description:
      "Merge, split, compress, OCR and convert PDFs entirely inside your browser. Zero uploads. Zero latency. Zero cost.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Lovers — 42 Free Browser-Native PDF Tools",
    description:
      "Private, instant, free PDF tools powered by WebAssembly. Your files never leave your device.",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  colorScheme: "light",
};

/* ------------------------------------------------------------------ *
 *  Critical CSS — inlined so first paint never blocks on a stylesheet.
 *  Design tokens + layout primitives + component classes used by the
 *  Navbar, Footer and Home page. (Move to globals.css only if you also
 *  ship that file — this build is intentionally self-contained.)
 * ------------------------------------------------------------------ */
const CRITICAL_CSS = `
:root{
  --obsidian:#0F172A;--obsidian-2:#111C33;--rose:#E11D48;--rose-deep:#9F1239;--rose-soft:#FB7185;
  --canvas:#FAFAFA;--ink:#0F172A;--muted:#64748B;--line:rgba(15,23,42,.08);
  --glass:rgba(255,255,255,.72);--glass-strong:rgba(255,255,255,.9);
  --r-sm:10px;--r-md:16px;--r-lg:24px;--r-full:999px;
  --shadow-1:0 1px 2px rgba(15,23,42,.05),0 10px 30px -18px rgba(15,23,42,.25);
  --shadow-2:0 30px 60px -30px rgba(159,18,57,.45);
  --grad-rose:linear-gradient(135deg,#E11D48 0%,#9F1239 100%);
  --font-body:var(--font-inter),system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --font-display:var(--font-sora),var(--font-body);
  --header-h:70px;
  --ease:cubic-bezier(.2,.8,.2,1);
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:90px}
body{margin:0;background:var(--canvas);color:var(--ink);font-family:var(--font-body);
  font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
h1,h2,h3,h4{font-family:var(--font-display);line-height:1.15;letter-spacing:-.022em;margin:0}
p{margin:0}
ul{margin:0;padding:0;list-style:none}
a{color:inherit;text-decoration:none}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer;border:0;background:none}
img,svg{display:block;max-width:100%}
::selection{background:var(--rose);color:#fff}
:focus-visible{outline:2px solid var(--rose);outline-offset:3px;border-radius:6px}
.container{width:100%;max-width:1200px;margin-inline:auto;padding-inline:20px}
.skip-link{position:fixed;top:0;left:0;transform:translateY(-130%);z-index:400;background:var(--obsidian);
  color:#fff;padding:12px 18px;border-radius:0 0 14px 0;font-weight:600;transition:transform .18s var(--ease)}
.skip-link:focus{transform:translateY(0)}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.rise{animation:rise .6s var(--ease) both}
@keyframes adShimmer{from{background-position:200% 0}to{background-position:-100% 0}}
@keyframes pulseHalo{0%,100%{box-shadow:0 0 0 0 rgba(225,29,72,.28)}50%{box-shadow:0 0 0 18px rgba(225,29,72,0)}}

/* ---------- Header / Nav ---------- */
.site-header{position:sticky;top:0;z-index:120;background:var(--glass);
  backdrop-filter:saturate(180%) blur(18px);-webkit-backdrop-filter:saturate(180%) blur(18px);
  border-bottom:1px solid var(--line)}
.site-header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(225,29,72,.55),transparent)}
.nav-inner{display:flex;align-items:center;gap:14px;height:var(--header-h)}
.brand{display:flex;align-items:center;gap:10px;font-family:var(--font-display);font-weight:700;
  letter-spacing:-.03em;font-size:1.06rem;flex-shrink:0}
.brand em{font-style:normal;background:var(--grad-rose);-webkit-background-clip:text;background-clip:text;color:transparent}
.nav-links{display:flex;align-items:center;gap:2px;margin-left:6px}
.nav-trigger,.nav-link{display:inline-flex;align-items:center;gap:6px;padding:9px 13px;border-radius:var(--r-full);
  font-weight:550;font-size:.925rem;color:#334155;transition:background .18s var(--ease),color .18s var(--ease);white-space:nowrap}
.nav-trigger:hover,.nav-link:hover,.nav-link[data-active="true"]{background:rgba(225,29,72,.08);color:var(--rose-deep)}
.nav-cta{margin-left:6px;padding:10px 18px;font-size:.9rem}
.nav-search{position:relative;margin-left:auto;width:min(330px,36vw);flex-shrink:1}
.nav-search input{width:100%;padding:10px 14px 10px 38px;border-radius:var(--r-full);border:1px solid var(--line);
  background:#fff;box-shadow:var(--shadow-1);font-size:.9rem;transition:border-color .2s var(--ease),box-shadow .2s var(--ease)}
.nav-search input:focus{outline:none;border-color:rgba(225,29,72,.5);box-shadow:0 0 0 4px rgba(225,29,72,.12)}
.search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.search-pop{position:absolute;top:calc(100% + 10px);left:0;right:0;background:#fff;border:1px solid var(--line);
  border-radius:var(--r-md);box-shadow:0 30px 60px -30px rgba(15,23,42,.45);max-height:380px;overflow-y:auto;z-index:140}
.search-result{display:flex;flex-direction:column;gap:2px;padding:10px 14px;font-size:.885rem;border-bottom:1px solid rgba(15,23,42,.04)}
.search-result:hover{background:rgba(225,29,72,.06)}
.search-result b{font-weight:600}
.search-result span{color:var(--muted);font-size:.78rem}
.search-empty{padding:16px;color:var(--muted);font-size:.88rem}
.mega{position:absolute;top:calc(var(--header-h) - 4px);left:50%;transform:translateX(-50%) translateY(-10px);
  width:min(1080px,calc(100vw - 32px));background:var(--glass-strong);backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);border:1px solid var(--line);border-radius:var(--r-lg);
  box-shadow:0 40px 80px -40px rgba(15,23,42,.5);padding:18px;opacity:0;visibility:hidden;
  transition:opacity .18s var(--ease),transform .18s var(--ease);max-height:min(70vh,600px);overflow:auto}
.mega[data-open="true"]{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
.mega-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.mega-col h4{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.mega-link{display:block;padding:6px 9px;border-radius:9px;font-size:.86rem;color:#334155;transition:background .15s var(--ease),color .15s var(--ease)}
.mega-link:hover{background:rgba(225,29,72,.08);color:var(--rose-deep)}
.nav-scrim{position:fixed;inset:0;background:rgba(15,23,42,.35);backdrop-filter:blur(2px);z-index:115;
  opacity:0;visibility:hidden;transition:opacity .2s var(--ease),visibility .2s}
.nav-scrim[data-open="true"]{opacity:1;visibility:visible}
.hamburger{display:none;flex-direction:column;gap:5px;padding:11px;border-radius:12px;border:1px solid var(--line);
  background:#fff;margin-left:auto}
.hamburger span{width:20px;height:2px;background:var(--ink);border-radius:2px;transition:transform .2s var(--ease),opacity .2s var(--ease)}
.hamburger[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger[aria-expanded="true"] span:nth-child(2){opacity:0}
.hamburger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.drawer{position:fixed;top:var(--header-h);left:0;right:0;bottom:0;background:rgba(250,250,250,.99);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:130;padding:20px;overflow-y:auto;
  transform:translateX(100%);transition:transform .26s var(--ease);visibility:hidden}
.drawer[data-open="true"]{transform:translateX(0);visibility:visible}
.drawer-search{position:relative;margin-bottom:16px}
.drawer-search input{width:100%;padding:13px 16px 13px 40px;border-radius:var(--r-md);border:1px solid var(--line);background:#fff}
.drawer-acc{border:1px solid var(--line);border-radius:var(--r-md);background:#fff;margin-bottom:10px;overflow:hidden}
.drawer-acc-btn{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 16px;
  font-weight:600;font-size:.95rem;text-align:left}
.drawer-acc-body{padding:0 10px 12px}
.drawer-acc-body a{display:block;padding:9px 12px;border-radius:9px;font-size:.9rem;color:#334155}
.drawer-acc-body a:hover{background:rgba(225,29,72,.07);color:var(--rose-deep)}
.drawer-legal{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.drawer-legal a{font-size:.82rem;padding:8px 12px;border:1px solid var(--line);border-radius:var(--r-full);background:#fff;color:#475569}

/* ---------- Buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:var(--r-full);
  font-weight:600;font-size:.95rem;transition:transform .18s var(--ease),box-shadow .18s var(--ease),background .18s var(--ease),color .18s var(--ease)}
.btn-primary{background:var(--grad-rose);color:#fff;box-shadow:0 12px 30px -12px rgba(225,29,72,.7)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 18px 40px -14px rgba(225,29,72,.85)}
.btn-ghost{border:1px solid var(--line);background:#fff;color:#334155}
.btn-ghost:hover{border-color:rgba(225,29,72,.4);color:var(--rose-deep);transform:translateY(-2px)}
.btn-sm{padding:9px 16px;font-size:.85rem}

/* ---------- Hero ---------- */
.hero{position:relative;padding:64px 0 40px;overflow:hidden}
.hero::before{content:"";position:absolute;inset:-30% -10% auto -10%;height:520px;
  background:radial-gradient(600px 320px at 20% 0%,rgba(225,29,72,.14),transparent 65%),
             radial-gradient(520px 300px at 85% 10%,rgba(159,18,57,.12),transparent 60%);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:var(--r-full);
  border:1px solid rgba(225,29,72,.22);background:rgba(225,29,72,.07);color:var(--rose-deep);
  font-size:.78rem;font-weight:600;letter-spacing:.02em}
.hero-title{font-size:clamp(2.1rem,5.4vw,3.6rem);font-weight:800;margin:20px 0 16px;max-width:16ch}
.hero-title em{font-style:normal;background:var(--grad-rose);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-sub{font-size:clamp(1rem,1.6vw,1.15rem);color:#475569;max-width:62ch}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
.hero-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-top:38px}
.stat{padding:16px 18px;border:1px solid var(--line);border-radius:var(--r-md);background:#fff;box-shadow:var(--shadow-1)}
.stat b{display:block;font-family:var(--font-display);font-size:1.5rem;letter-spacing:-.03em}
.stat span{font-size:.8rem;color:var(--muted)}

/* ---------- Dropzone ---------- */
.dropzone{position:relative;display:grid;place-items:center;gap:12px;padding:44px 24px;border-radius:var(--r-lg);
  border:2px dashed rgba(225,29,72,.32);background:linear-gradient(180deg,#fff,#FDF2F5);text-align:center;
  transition:transform .2s var(--ease),border-color .2s var(--ease),background .2s var(--ease);cursor:pointer;
  animation:pulseHalo 3.2s ease-in-out infinite}
.dropzone[data-drag="true"]{transform:scale(1.015);border-color:var(--rose);background:linear-gradient(180deg,#fff,#FCE7EE)}
.dropzone-title{font-family:var(--font-display);font-weight:700;font-size:1.1rem}
.dropzone-hint{font-size:.85rem;color:var(--muted)}
.progress-track{width:min(420px,100%);height:8px;border-radius:var(--r-full);background:rgba(15,23,42,.08);overflow:hidden}
.progress-fill{height:100%;background:var(--grad-rose);border-radius:var(--r-full);transition:width .2s linear}

/* ---------- Sections / Chips ---------- */
.section{padding:56px 0}
.section-head{max-width:720px;margin-bottom:28px}
.eyebrow{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--rose);font-weight:700}
.section-title{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:750;margin:10px 0 12px}
.section-sub{color:#475569}
.chips{display:flex;flex-wrap:wrap;gap:9px;margin:22px 0 26px}
.chip{padding:9px 16px;border-radius:var(--r-full);border:1px solid var(--line);background:#fff;font-size:.86rem;
  font-weight:550;color:#475569;transition:all .18s var(--ease)}
.chip:hover{border-color:rgba(225,29,72,.35);color:var(--rose-deep)}
.chip[data-active="true"]{background:var(--obsidian);border-color:var(--obsidian);color:#fff}

/* ---------- Tool grid ---------- */
.tool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:16px}
.tool-card{position:relative;display:flex;flex-direction:column;gap:9px;padding:20px;border-radius:var(--r-md);
  background:#fff;border:1px solid var(--line);box-shadow:var(--shadow-1);overflow:hidden;
  transition:transform .22s var(--ease),box-shadow .22s var(--ease),border-color .22s var(--ease)}
.tool-card::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .25s var(--ease);
  background:radial-gradient(420px circle at 50% 0%,rgba(225,29,72,.09),transparent 45%)}
.tool-card:hover{transform:translateY(-6px);box-shadow:0 28px 50px -26px rgba(15,23,42,.45);border-color:rgba(225,29,72,.28)}
.tool-card:hover::before{opacity:1}
.tool-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;color:#fff;
  background:var(--grad-rose);box-shadow:0 8px 20px -10px rgba(225,29,72,.8)}
.tool-title{font-family:var(--font-display);font-weight:650;font-size:1rem}
.tool-desc{font-size:.85rem;color:var(--muted);flex:1}
.tool-cta{font-size:.82rem;font-weight:650;color:var(--rose-deep);display:inline-flex;align-items:center;gap:6px}
.empty-state{padding:48px 20px;text-align:center;border:1px dashed var(--line);border-radius:var(--r-lg);color:var(--muted)}

/* ---------- Ad slots (zero CLS) ---------- */
.ad-slot{position:relative;display:grid;place-items:center;width:100%;margin:34px 0;border-radius:var(--r-md);
  border:1px dashed rgba(15,23,42,.12);background:linear-gradient(180deg,#fff,#F6F7FB);overflow:hidden;
  contain:layout size;isolation:isolate}
.ad-slot[data-size="leaderboard"]{min-height:90px}
.ad-slot[data-size="banner"]{min-height:100px}
.ad-slot[data-size="rectangle"]{min-height:250px}
@media(min-width:900px){.ad-slot[data-size="banner"]{min-height:120px}}
.ad-label{position:absolute;top:8px;left:10px;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
.ad-shimmer{position:absolute;inset:0;background:linear-gradient(100deg,transparent 20%,rgba(225,29,72,.07) 40%,transparent 60%);
  background-size:200% 100%;animation:adShimmer 1.8s linear infinite}
.ad-copy{position:relative;font-size:.78rem;color:var(--muted)}

/* ---------- Content / FAQ ---------- */
.prose{max-width:78ch}
.prose h2{font-size:clamp(1.35rem,2.4vw,1.75rem);font-weight:700;margin:34px 0 12px}
.prose h3{font-size:1.1rem;font-weight:650;margin:24px 0 8px}
.prose p{margin-bottom:14px;color:#334155}
.prose ul{margin:0 0 16px;padding-left:20px;list-style:disc}
.prose li{margin-bottom:7px;color:#334155}
.faq{border:1px solid var(--line);border-radius:var(--r-md);background:#fff;overflow:hidden;margin-bottom:10px}
.faq summary{padding:16px 18px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px}
.faq summary::-webkit-details-marker{display:none}
.faq[open] summary{color:var(--rose-deep)}
.faq-body{padding:0 18px 18px;color:#475569;font-size:.94rem}

/* ---------- Footer ---------- */
.site-footer{background:var(--obsidian);color:#CBD5E1;margin-top:72px}
.footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.3fr;gap:32px;padding:56px 0 30px}
.footer-col h4{color:#fff;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px;font-family:var(--font-body);font-weight:700}
.footer-col a{display:block;padding:5px 0;font-size:.88rem;color:#94A3B8;transition:color .16s var(--ease)}
.footer-col a:hover{color:var(--rose-soft)}
.footer-brand p{font-size:.88rem;color:#94A3B8;margin:12px 0 16px;max-width:34ch}
.owner-card{border:1px solid rgba(225,29,72,.28);background:rgba(225,29,72,.08);border-radius:var(--r-md);padding:14px 16px}
.owner-card b{color:#fff;display:block;font-size:.9rem}
.owner-card a{color:var(--rose-soft);font-size:.84rem;word-break:break-all}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding:18px 0 34px;display:flex;flex-wrap:wrap;
  gap:12px;justify-content:space-between;align-items:center;font-size:.8rem;color:#7C8CA5}
.footer-legal{display:flex;flex-wrap:wrap;gap:16px}
.footer-legal a:hover{color:var(--rose-soft)}

/* ---------- Responsive ---------- */
@media(max-width:1080px){
  .nav-links{display:none}
  .nav-search{display:none}
  .nav-cta{display:none}
  .hamburger{display:flex}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:640px){
  .hero{padding:40px 0 24px}
  .section{padding:40px 0}
  .footer-grid{grid-template-columns:1fr;gap:26px;padding:40px 0 24px}
  .tool-grid{grid-template-columns:1fr}
}

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;
    transition-duration:.01ms !important;scroll-behavior:auto !important}
}
`;

/* ------------------------------------------------------------------ *
 *  Site-wide JSON-LD: WebSite + Organization + SoftwareApplication
 * ------------------------------------------------------------------ */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "PDF Lovers",
      description:
        "42 free browser-native PDF tools. Merge, split, compress, OCR and convert entirely on your device.",
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/tools?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "PDF Lovers",
      url: SITE_URL,
      email: "hassanasghar7868686@gmail.com",
      founder: { "@type": "Person", name: "Hassan Asghar", email: "hassanasghar7868686@gmail.com" },
      foundingDate: "2024",
      description:
        "PDF Lovers builds privacy-first, client-side document tooling maintained by Hassan Asghar.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "PDF Lovers",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (Web Browser)",
      url: SITE_URL,
      description:
        "Client-side PDF suite with 42 tools — merge, split, compress, OCR, convert, sign and redact without uploading files.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Merge PDF",
        "Split PDF",
        "Compress PDF",
        "OCR PDF",
        "PDF to Word",
        "Protect PDF",
        "Sign PDF",
        "Redact PDF",
      ],
      author: { "@type": "Person", name: "Hassan Asghar" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "12840",
        bestRating: "5",
        worstRating: "1",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body>
        {/* ---------- Resource hints: latency eradication ---------- */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://pl31646499.profitableratecpmnetwork.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />

        {/* ---------- Inlined critical CSS (zero render-blocking) ---------- */}
        <style
          href="pdf-lovers-critical-css"
          precedence="high"
          dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }}
        />

        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        <Navbar />

        <main id="main">{children}</main>

        <Footer />

        {/* ---------- Site-wide structured data ---------- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />

        {/* ---------- Adsterra invoke: lazyOnload, never render-blocking ---------- */}
        <Script
          id="adsterra-invoke"
          src="https://pl31646499.profitableratecpmnetwork.com/8af9b4ea9bf1c8a1daa4e46faa003ae7/invoke.js"
          strategy="lazyOnload"
          data-cfasync="false"
        />
      </body>
    </html>
  );
}
