"use client";

import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC =
  "https://pl31646499.profitableratecpmnetwork.com/8af9b4ea9bf1c8a1daa4e46faa003ae7/invoke.js";

interface NativeBannerProps {
  className?: string;
  label?: string;
}

/**
 * Zero-CLS Native Banner with lazyOnload strategy.
 * Reserves a fixed min-height container (see .adsterra-native-slot in
 * globals.css) and only loads the ad script once the slot scrolls into
 * the viewport, preventing layout shift and wasted ad calls off-screen.
 */
export default function NativeBanner({ className, label }: NativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const injected = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "250px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || injected.current || !containerRef.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = SCRIPT_SRC;
    containerRef.current.appendChild(script);
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`adsterra-native-slot ${className ?? ""}`}
      aria-label="Advertisement"
      role="complementary"
    >
      {!isVisible && (
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          {label ?? "Advertisement"}
        </span>
      )}
    </div>
  );
}
