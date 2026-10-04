
"use client";
import { useEffect, useRef } from "react";
import { SITE_CONFIG } from "@/lib/constants";

interface AdSenseUnitProps {
  slot: string;
  format?: string;
  className?: string;
}

export default function AdSenseUnit({ slot, format = "auto", className = "" }: AdSenseUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      // @ts-expect-error - injected globally by layout.tsx Script tag
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      console.error("[AdSense] push failed:", e);
    }
  }, []);

  return (
    // Reserved min-height = zero CLS even before the script resolves
    <div className={`ad-slot-wrapper ${className}`} style={{ minHeight: 280 }}>
      <span className="ad-label">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 280, width: "100%" }}
        data-ad-client={SITE_CONFIG.ads.googleAdsenseClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
