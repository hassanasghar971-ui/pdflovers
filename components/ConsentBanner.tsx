'use client';

import Link from 'next/link';
import { useConsent, writeConsent } from '@/lib/consent';

export default function ConsentBanner() {
  const consent = useConsent();
  if (consent !== null) return null;

  const choose = (value: 'granted' | 'denied') => {
    const adsAlreadyLoaded = !!document.getElementById('plp-ads');
    writeConsent(value);
    if (value === 'denied' && adsAlreadyLoaded) window.location.reload();
  };

  const btn =
    'rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2';

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="text-sm text-slate-700 dark:text-slate-300">
        This site is supported by ads. With your permission, our advertising partner may use cookies.
        Your PDFs are processed in your browser. See our{' '}
        <Link href="/privacy-policy" className="text-indigo-600 underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => choose('granted')}
          className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose('denied')}
          className={`${btn} border border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800`}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
