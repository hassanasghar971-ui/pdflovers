import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { Cpu, ShieldCheck, Code2 } from "lucide-react";
import { OWNER_EMAIL, OWNER_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn the story behind ${SITE_NAME}, our Zero-Server WebAssembly architecture, and our founder Hassan Asghar's mission to build 100% private PDF tools.`,
  alternates: { canonical: "/about-us" },
};

export default function AboutUsPage() {
  return (
    <LegalLayout
      title="About PDF Lovers Pro"
      description="Building the world's most private PDF toolkit, one WebAssembly module at a time."
      lastUpdated="May 20, 2024"
    >
      <h2>Our Mission</h2>
      <p>
        {SITE_NAME} was founded on a simple, uncompromising idea: a PDF tool should never require you to
        hand your documents — contracts, tax forms, medical records, personal photos — over to a stranger&rsquo;s
        server just to merge two pages or compress a file for email. Every mainstream &ldquo;free&rdquo;
        PDF website on the internet today follows the same pattern: you upload your file, it travels across
        the internet to a remote data center, gets processed there, and is (hopefully) deleted afterward.
        We believe that model is fundamentally broken from a privacy standpoint, and we set out to build
        something structurally different.
      </p>

      <h2>The Zero-Server Difference</h2>
      <p>
        {SITE_NAME} runs 100% of its 42 PDF tools using client-side WebAssembly (WASM) technology directly
        inside your web browser. There is no upload endpoint, no file storage bucket, and no database
        anywhere in our stack. When you use our Merge PDF, Compress PDF, or Sign PDF tool, the entire
        operation — reading the file, manipulating its internal structure, and generating the output — runs
        on your own device&rsquo;s processor and memory. Your file is never serialized into a network
        request. This isn&rsquo;t a marketing claim; it is a direct consequence of how the application is
        architected and can be verified by inspecting the network traffic in your browser&rsquo;s developer
        tools while using any of our tools.
      </p>

      <div className="not-prose my-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <Cpu className="mb-3 h-6 w-6 text-[#DC2626]" />
          <h4 className="font-semibold">WebAssembly Core</h4>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Near-native in-browser performance for every tool.</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <ShieldCheck className="mb-3 h-6 w-6 text-[#DC2626]" />
          <h4 className="font-semibold">Zero-Server Storage</h4>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Your files never touch our infrastructure. Ever.</p>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <Code2 className="mb-3 h-6 w-6 text-[#DC2626]" />
          <h4 className="font-semibold">Open Engineering</h4>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Built on trusted open-source libraries like pdf-lib and pdfjs-dist.</p>
        </div>
      </div>

      <h2>Our Technical Architecture</h2>
      <p>
        Under the hood, {SITE_NAME} is a Next.js application deployed as a static, serverless front-end on
        Vercel&rsquo;s global edge network. Document creation and manipulation tools (merging, splitting,
        watermarking, page reordering, metadata editing) are powered by <code>pdf-lib</code>, a
        battle-tested JavaScript library for creating and modifying PDF documents. Document rendering,
        parsing, and text/image extraction (used for previews, PDF-to-image conversion, and text
        extraction) is powered by <code>pdfjs-dist</code>, the same core rendering engine Mozilla uses in
        Firefox&rsquo;s native PDF viewer. Both libraries compile cleanly to run inside the browser without
        any server dependency, which is precisely why we chose them as the foundation of our entire tool
        suite.
      </p>

      <h2>Meet the Founder: Hassan Asghar</h2>
      <p>
        {SITE_NAME} is founded and personally engineered by <strong>{OWNER_NAME}</strong>, a full-stack
        software engineer specializing in performance-focused, privacy-first web applications. Frustrated
        by the number of popular PDF conversion websites that silently upload user files to opaque backend
        servers, Hassan set out to prove that a complete, professional-grade PDF toolkit could be built
        entirely on modern browser technology — no compromises, no hidden uploads, no accounts required.
        Every tool on this site has been built and tested personally with a singular focus: your documents
        belong to you, and only you.
      </p>
      <p>
        You can reach Hassan directly for technical questions, partnership inquiries, or feedback at{" "}
        <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>.
      </p>

      <h2>Our Commitment Going Forward</h2>
      <p>
        As we continue to expand {SITE_NAME} with new tools and features, our founding architectural
        principle will never change: no server-side file processing, no mandatory accounts, and no hidden
        data collection of document content. We will continue to be transparent about how our tools work,
        how our business is funded (through privacy-respecting advertising via Google AdSense and
        Adsterra), and how we handle the limited technical data described in our Privacy Policy.
      </p>
    </LegalLayout>
  );
}
