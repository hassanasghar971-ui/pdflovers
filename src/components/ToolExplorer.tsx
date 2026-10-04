"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ToolExplorerContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  return (
    <div className="w-full">
      {/* Tool Explorer Search & Dynamic Grid Content */}
      <div className="text-center py-4">
        {searchQuery && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing results for: <span className="font-semibold text-indigo-600 dark:text-indigo-400">"{searchQuery}"</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ToolExplorer() {
  return (
    <Suspense fallback={<div className="h-20 w-full animate-pulse bg-gray-200/20 rounded-xl" />}>
      <ToolExplorerContent />
    </Suspense>
  );
}
