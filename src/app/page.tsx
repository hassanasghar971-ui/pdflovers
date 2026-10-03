import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools";
import ToolExplorer from "@/components/ToolExplorer";
import JsonLd from "@/components/JsonLd";
import { AdSenseUnit } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "PDF Lovers — 42 Free PDF Tools That Run Entirely in Your Browser",
  description:
    "Merge, split, compress, convert, sign, watermark and protect PDFs with 42 free tools — no uploads, no signup, no watermark. 100% private, client-side processing.",
  alternates: { canonical: "/" },
};

const stats = [
  { label: "Free tools", value: "42" },
  { label: "Average rating", value: "4.9★" },
  { label: "Files uploaded to a server", value: "0" },
  { label: "Signup required", value: "Never" },
];

const features = [
  {
    title: "100% client-side",
    desc: "Every tool runs with WebAssembly & JS right inside your browser tab — your files never touch a server.",
    icon: "🔒",
  },
  {
    title: "Blazing fast",
    desc: "Dynamic code-splitting loads only what each tool needs, so pages stay light and snappy.",
    icon: "⚡",
  },
  {
    title: "Crash-proof",
    desc: "Built-in error boundaries gracefully catch corrupted or unexpected files without breaking your flow.",
    icon: "🛡️",
  },
  {
    title: "Works everywhere",
    desc: "Desktop, tablet or phone — glassmorphic UI adapts beautifully with Light, Dark, Auto and Glass themes.",
    icon: "🎨",
  },
];

export default function HomePage() {
  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PDF Lovers",
          url: process.env.NEXT_PUBLIC_SITE_URL || "https://pdflovers-gzxg.vercel.app",
          potentialAction: {
            "@type": "SearchAction",
            target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://pdflovers-gzxg.vercel.app"}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <section className="relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-secondary">
            ⭐ 4.9/5 average rating · trusted by PDF lovers everywhere
          </span>
          <h1 className="mt-6 text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight">
            Every PDF tool you need,
            <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400 bg-clip-text text-transparent">
              zero uploads required.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-secondary sm:text-lg">
            42 beautifully designed, lightning-fast PDF tools — merge, split, compress, convert, sign and protect — all
            processed locally in your browser for total privacy.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/merge-pdf"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 py-3.5 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-105"
            >
              Start Merging PDFs →
            </Link>
            <a
              href="#tools"
              className="glass-pill rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:scale-105"
            >
              Browse all 42 tools
            </a>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl px-4 py-5 text-center">
              <p className="text-2xl font-extrabold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <AdSenseUnit slot="1111111111" className="mx-auto max-w-4xl" />
      </section>

      <section id="tools" className="mt-16 scroll-mt-24">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">42 tools. One beautiful workspace.</h2>
          <p className="mx-auto mt-3 max-w-xl text-secondary">
            Organize, convert, edit, secure and optimize PDFs — search or filter by category to find exactly what you
            need.
          </p>
        </div>
        <ToolExplorer tools={tools} />
      </section>

      <section className="mt-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card hover-lift rounded-3xl p-6">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <AdSenseUnit slot="2222222222" className="mx-auto max-w-4xl" />
      </section>
    </div>
  );
}
