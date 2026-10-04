"use client";

import MergePdfTool from "@/components/pdf/MergePdfToolLoader";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = {
  title: `Merge PDF Files Online Free — ${SITE_CONFIG.name}`,
  description: SITE_CONFIG.description,
};

export default function MergePdfPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Merge PDF Files</h1>
      <MergePdfTool />
    </div>
  );
}


const MergePdfTool = dynamic(() => import("@/components/pdf/MergePdfTool"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
  ),
});

export default MergePdfTool;
