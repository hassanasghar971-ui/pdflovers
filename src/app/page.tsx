import type { Metadata } from "next";
import { CloudOff, Cpu, Lock, Zap, ShieldCheck, Sparkles } from "lucide-react";
import ToolsExplorer from "@/components/ToolsExplorer";
import NativeBanner from "@/components/NativeBanner";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/json-ld";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { TOOLS } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: `${SITE_NAME} — 42 Free Online PDF Tools, 100% Private & Browser-Based`,
  description:
    "Merge, split, compress, convert, sign and edit PDF files for free — directly in your browser using WebAssembly. No uploads, no servers, no tracking of your documents.",
  alternates: { canonical: "/" },
};

const FEATURES = [
  { icon: CloudOff, title: "No File Uploads", desc: "Your PDFs never leave your device. All computation happens locally inside your browser tab." },
  { icon: Cpu, title: "WebAssembly Engine", desc: "Near-native performance using compiled libraries (pdf-lib, pdfjs-dist) running as WASM modules." },
  { icon: ShieldCheck, title: "GDPR & CCPA Ready", desc: "Because we never store or transmit your documents, there is nothing for us to leak or sell." },
  { icon: Lock, title: "Works Fully Offline", desc: "Once a tool is loaded, most features continue working even without an active internet connection." },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: SITE_URL }])} />

      {/* HERO + SEARCH */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#DC2626]/20 blur-[140px]"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DC2626]/30 bg-[#DC2626]/10 px-4 py-1.5 text-sm font-medium text-[#DC2626]">
            <Sparkles className="h-4 w-4" /> 42 Tools · 0 Uploads · 100% Free
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl">
            The PDF Toolkit That <span className="text-[#DC2626]">Never Sees Your Files</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
            Merge, convert, compress, sign and edit PDFs instantly — powered entirely by WebAssembly
            running inside your own browser. Zero servers. Zero database. Zero compromise on privacy.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-2"><CloudOff className="h-4 w-4 text-[#DC2626]" /> Zero Server Uploads</span>
            <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-[#DC2626]" /> Bank-Grade Local Encryption</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-[#DC2626]" /> Instant WebAssembly Speed</span>
          </div>
        </div>
      </section>

      {/* TOOL DIRECTORY GRID */}
      <section id="all-tools" className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white">All {TOOLS.length} PDF Tools</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Organized, searchable, and ready to use — no sign-up required.
            </p>
          </div>
          <ToolsExplorer />
        </div>
      </section>

      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <NativeBanner />
      </div>

      {/* TRUST FEATURES */}
      <section className="border-y border-black/5 bg-white/40 px-4 py-20 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <f.icon className="mb-4 h-8 w-8 text-[#DC2626]" />
              <h3 className="font-bold text-neutral-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HIGH-INTENT SEO CONTENT (600+ words) */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="prose prose-neutral mx-auto max-w-4xl dark:prose-invert prose-h2:text-2xl prose-h2:font-extrabold prose-h3:text-xl">
          <h2>How PDF Lovers Pro Works: True Zero-Server PDF Processing</h2>
          <p>
            Most &ldquo;free&rdquo; online PDF tools quietly upload your files to a remote server, process them
            there, and then — eventually — delete them. That single step is where most of the privacy risk
            lives: once your document leaves your device, you have no real control over how long it sits
            on a stranger&rsquo;s hard drive, who has access to it, or whether it gets cached, logged, or
            scanned by an automated system. PDF Lovers Pro was built specifically to eliminate that risk
            entirely. Every single one of our 42 tools runs as compiled WebAssembly (WASM) code executing
            directly inside your browser&rsquo;s JavaScript engine. There is no upload button that sends your
            file anywhere, because there is no server-side processing pipeline to send it to.
          </p>

          <h3>The WebAssembly Advantage</h3>
          <p>
            WebAssembly is a low-level, binary instruction format that runs at near-native speed inside
            modern browsers like Chrome, Firefox, Safari, and Edge. Under the hood, PDF Lovers Pro uses
            battle-tested, open-source PDF engines — including <code>pdf-lib</code> for document creation
            and manipulation, and <code>pdfjs-dist</code> (the same rendering engine that powers Firefox&rsquo;s
            built-in PDF viewer) for parsing and rendering. These libraries are compiled and bundled to run
            entirely client-side. When you drop a file into one of our tools, your browser allocates a
            chunk of local RAM, loads the file bytes into that memory space, and performs every operation —
            merging, compressing, converting, signing — using your own device&rsquo;s CPU. The result is
            generated locally and offered to you as an instant download. At no point does a network request
            carrying your file content leave your machine.
          </p>

          <h3>Your Privacy Is Not a Feature — It&rsquo;s Architecture</h3>
          <p>
            We deliberately did not build a backend database, a file storage bucket, or an API that accepts
            file uploads. This isn&rsquo;t a policy decision that could change with a new product manager —
            it is a structural fact of how the application is built. Zero server storage means zero data
            breach risk for your documents, zero chance of a misconfigured cloud bucket exposing your
            contracts or tax forms, and zero third-party subpoena risk because we simply never possess your
            files to begin with. This architecture also means PDF Lovers Pro can legitimately promise
            compliance with strict privacy regulations like the GDPR and CCPA for document content, since
            we are structurally incapable of processing your personal documents on our infrastructure.
          </p>

          <h3>How to Use Any Tool in 3 Simple Steps</h3>
          <ol>
            <li><strong>Choose a tool.</strong> Browse or search the directory above and click the tool that matches your task — for example, Merge PDF or Compress PDF.</li>
            <li><strong>Drop or select your file(s).</strong> Your browser reads the file locally; nothing is transmitted over the network.</li>
            <li><strong>Download the result.</strong> The processed file is generated in memory and offered directly as a download — the original source file is discarded from memory the moment you close or refresh the tab.</li>
          </ol>

          <h3>Why Choose PDF Lovers Pro Over Traditional Online Converters</h3>
          <p>
            Beyond privacy, running everything client-side has real practical benefits. Processing starts
            instantly because there&rsquo;s no upload queue or server round-trip, which makes tools like
            Compress PDF and Merge PDF feel nearly instantaneous even on large files. There are no file-size
            caps imposed by server timeout limits, no daily usage quotas tied to an account, and no
            mandatory sign-up wall. Because the entire toolkit is a static, serverless web application, it
            is also exceptionally resilient — there is no database to go down and no backend API that can
            be rate-limited or taken offline. Whether you need to quickly sign a contract, compress a scan
            before emailing it, or convert a spreadsheet into a shareable PDF, PDF Lovers Pro gives you a
            professional-grade, secure toolkit without asking you to trust us with your files in the first
            place.
          </p>
        </div>
      </section>
    </>
  );
}
