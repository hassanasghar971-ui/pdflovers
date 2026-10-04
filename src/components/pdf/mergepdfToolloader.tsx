"use client";

import dynamic from "next/dynamic";

const MergePdfTool = dynamic(() => import("@/components/pdf/MergePdfTool"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
  ),
});

export default MergePdfTool;
