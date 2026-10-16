"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "pdflovers_cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleConsent = (value: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-w-3xl p-4 sm:bottom-6 sm:px-6"
    >
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          We use cookies, including Google's DART cookie, to serve ads based on your
          visits to this and other sites, and to analyze traffic. Your PDF files are{" "}
          <strong>never</strong> uploaded or stored — all processing happens locally
          in your browser. Learn more in our{" "}
          <Link href="/privacy-policy" className="font-semibold text-brand-600 hover:underline">
            Privacy Policy
          </Link>.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => handleConsent("accepted")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            Accept All
          </button>
          <button
            onClick={() => handleConsent("rejected")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reject Non-Essential
          </button>
        </div>
      </div>
    </div>
  );
}
