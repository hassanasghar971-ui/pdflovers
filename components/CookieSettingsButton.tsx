'use client';

import { clearConsent } from '@/lib/consent';

export default function CookieSettingsButton() {
  return (
    <button type="button" onClick={() => clearConsent()} className="hover:underline">
      Cookie settings
    </button>
  );
}
