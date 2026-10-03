"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Lazy-loaded, non-blocking monetization slot. Reads client/zone IDs from
 * public env vars — if they aren't configured yet the slot simply renders a
 * subtle placeholder instead of breaking the page.
 */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;
  return (
    <Script
      async
      strategy="lazyOnload"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}

export function AdSenseUnit({ slot, className = "" }: { slot: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!client) return;
    try {
      (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
    } catch {
      /* ad blocked or not yet loaded — ignore */
    }
  }, [client]);

  if (!client) {
    return (
      <div className={`glass-card flex min-h-[90px] items-center justify-center rounded-2xl text-xs text-secondary ${className}`}>
        Ad space
      </div>
    );
  }

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

export function AdsterraScript() {
  const key = process.env.NEXT_PUBLIC_ADSTERRA_KEY;
  if (!key) return null;
  return (
    <Script id="adsterra-config" strategy="lazyOnload">
      {`
        atOptions = { key: '${key}', format: 'iframe', height: 90, width: 728, params: {} };
      `}
    </Script>
  );
}
