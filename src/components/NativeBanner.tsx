'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_UNIT = '8af9b4ea9bf1c8a1daa4e46faa003ae7';
const DEFAULT_SRC = 'https://pl31646499.profitableratecpmnetwork.com/8af9b4ea9bf1c8a1daa4e46faa003ae7/invoke.js';

const claimed = new Set<string>();

export interface NativeBannerProps {
  unitId?: string;
  scriptSrc?: string;
  className?: string;
}

export default function NativeBanner({ unitId = DEFAULT_UNIT, scriptSrc = DEFAULT_SRC, className = '' }: NativeBannerProps) {
  const wrapRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    if (claimed.has(unitId)) {
      setDuplicate(true);
      return;
    }
    claimed.add(unitId);
    setDuplicate(false);

    const wrap = wrapRef.current;
    let script: HTMLScriptElement | null = null;
    let observer: IntersectionObserver | null = null;
    let timer: number | undefined;
    let cancelled = false;

    const inject = () => {
      if (cancelled || script || !wrap) return;
      script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = scriptSrc;
      wrap.appendChild(script);
    };

    const arm = () => {
      if (cancelled || !wrap) return;
      if (!('IntersectionObserver' in window)) {
        inject();
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            observer = null;
            inject();
          }
        },
        { rootMargin: '300px 0px' },
      );
      observer.observe(wrap);
    };

    const onLoad = () => {
      timer = window.setTimeout(arm, 300);
    };

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelled = true;
      claimed.delete(unitId);
      window.removeEventListener('load', onLoad);
      if (timer !== undefined) window.clearTimeout(timer);
      observer?.disconnect();
      script?.remove();
      slotRef.current?.replaceChildren();
    };
  }, [unitId, scriptSrc]);

  if (duplicate) return null;

  return (
    <aside ref={wrapRef} className={`ad-wrap ${className}`.trim()} aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <div id={`container-${unitId}`} ref={slotRef} className="ad-slot" style={{ minHeight: 280 }} />
    </aside>
  );
}
