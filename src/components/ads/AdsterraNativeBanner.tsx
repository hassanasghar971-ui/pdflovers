
"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";

export default function AdsterraNativeBanner({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  // Unique id per route so the invoke script re-fires correctly on client-side navigation
  const scriptId = `adsterra-invoke-${pathname.replace(/\W/g, "-")}`;

  return (
    <div
      className={`adsterra-native-wrapper ${className}`}
      style={{ minHeight: 250 }}
      aria-label="Advertisement"
    >
      <span className="ad-label">Advertisement</span>

      {/* Container ID MUST match the hash in the Adsterra invoke.js URL */}
      <div id={SITE_CONFIG.ads.adsterraContainerId} style={{ minHeight: 250 }} />

      <Script
        id={scriptId}
        src={SITE_CONFIG.ads.adsterraInvokeSrc}
        strategy="lazyOnload"
        data-cfasync="false"
      />
    </div>
  );
}
