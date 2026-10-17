import type { Metadata } from "next";
import ToolsExplorer from "@/components/ToolsExplorer";
import NativeBanner from "@/components/NativeBanner";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/json-ld";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { TOOLS } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: "All 42 Free PDF Tools — Merge, Convert, Compress & More",
  description: `Browse the full directory of ${TOOLS.length} free, private, browser-based PDF tools from ${SITE_NAME}. Search or filter by category to find the exact tool you need.`,
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "All Tools", url: `${SITE_URL}/tools` },
        ])}
      />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white">
              The Complete PDF Tool Directory
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              {TOOLS.length} free tools across 6 categories — every single one runs locally in your browser
              via WebAssembly. No uploads, no limits, no sign-up.
            </p>
          </div>
          <ToolsExplorer />
        </div>
      </section>
      <div className="px-4 pb-20 sm:px-6 lg:px-8">
        <NativeBanner />
      </div>
    </>
  );
}
