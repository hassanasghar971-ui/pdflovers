"use client";

import React, { useEffect, useState } from "react";

interface AdSlotProps {
  type?: "native" | "banner" | "banner-large";
  className?: string;
}

export default function AdSlot({ type = "native", className = "" }: AdSlotProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={`ad-slot-wrapper my-6 ${className}`}>
      <span className="ad-label">Advertisement</span>
      <div className="min-h-[100px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        {/* Adsterra / Adsense Script Container */}
        <p className="text-xs text-gray-400">Sponsored Content</p>
      </div>
    </div>
  );
}
