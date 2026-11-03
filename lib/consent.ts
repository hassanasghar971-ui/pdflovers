import { useSyncExternalStore } from 'react';

export type Consent = 'granted' | 'denied' | null;

const KEY = 'plp-consent-v1';
const EVENT = 'plp-consent-change';

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: 'granted' | 'denied'): void {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useConsent(): Consent | 'unknown' {
  return useSyncExternalStore<Consent | 'unknown'>(subscribe, readConsent, () => 'unknown');
}
