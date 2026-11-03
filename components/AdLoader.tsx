'use client';

import Script from 'next/script';
import { SITE } from '@/lib/site';
import { useConsent } from '@/lib/consent';

export default function AdLoader() {
  const consent = useConsent();
  if (process.env.NODE_ENV !== 'production' || consent !== 'granted') return null;
  return <Script id="plp-ads" src={SITE.ads.scriptSrc} strategy="afterInteractive" />;
}
