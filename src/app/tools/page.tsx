import type { Metadata } from "next";
import { Suspense } from "react";
import ToolsExplorer from "@/components/tools-explorer";

const SITE_URL = "https://pdflovers.com";

export const metadata: Metadata = {
  title: "All PDF Tools – 42+ Free Online PDF Utilities",
  description:
    "Browse all 42+ free online PDF tools: merge, split, compress, convert, rotate, watermark, OCR and more. 100% client-side WebAssembly processing.",
  alternates: { canonical: `${SITE_URL}/tools` },
};

export default function ToolsIndexPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          All PDF Tools
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Explore our complete library of 42+ free online PDF tools. Every
          tool runs 100% inside your browser using WebAssembly — no uploads,
          no accounts, no limits.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-red-600" />
          </div>
        }
      >
        <ToolsExplorer />
      </Suspense>
    </main>
  );
}
