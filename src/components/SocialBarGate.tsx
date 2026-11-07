'use client';

import { useEffect } from 'react';

const SOCIAL_BAR_SRC =
  'https://pl31804194.profitableratecpmnetwork.com/72/bc/4b/72bc4b4ca161783e4681f10c50bbf607.js';
const SCRIPT_ID = 'adsterra-social-bar';
const COUNT_KEY = 'plp_sb_loads';
const MAX_LOADS_PER_SESSION = 2;
const INTERACTIONS_NEEDED = 2;

/** Returns null when sessionStorage is unavailable (then we do not load the ad). */
function readLoads(): number | null {
  try {
    const raw = window.sessionStorage.getItem(COUNT_KEY);
    const n = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return null;
  }
}

function writeLoads(n: number): void {
  try {
    window.sessionStorage.setItem(COUNT_KEY, String(n));
  } catch {
    /* storage unavailable: readLoads() returns null, so nothing loads */
  }
}

export default function SocialBarGate(): null {
  useEffect(() => {
    const initial = readLoads();
    if (initial === null || initial >= MAX_LOADS_PER_SESSION) return;
    if (document.getElementById(SCRIPT_ID)) return;

    let interactions = 0;
    let loaded = false;

    function stop(): void {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('plp:action', load);
      document.removeEventListener('plp:action', load);
    }

    function load(): void {
      if (loaded) return;
      loaded = true;
      stop();
      if (document.getElementById(SCRIPT_ID)) return;
      const used = readLoads();
      if (used === null || used >= MAX_LOADS_PER_SESSION) return;
      writeLoads(used + 1);

      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = SOCIAL_BAR_SRC;
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      document.body.appendChild(s);
    }

    function onInteract(): void {
      interactions += 1;
      if (interactions >= INTERACTIONS_NEEDED) load();
    }

    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract, { passive: true });
    window.addEventListener('plp:action', load);
    document.addEventListener('plp:action', load);

    return stop;
  }, []);

  return null;
}
