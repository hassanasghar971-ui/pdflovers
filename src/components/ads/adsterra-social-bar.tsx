"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://pl31804194.profitableratecpmnetwork.com/72/bc/4b/72bc4b4ca161783e4681f10c50bbf607.js";
const SCRIPT_ID = "adsterra-social-bar-script";
const INTERACTION_THRESHOLD = 2;

/**
 * Smart Frequency-Capped Adsterra Social Bar.
 * Only injects the ad script after the user has performed at least
 * INTERACTION_THRESHOLD genuine interactions (click/scroll/keydown/touch),
 * protecting UX and avoiding ad-blocker lockout screens on first paint.
 */
export default function AdsterraSocialBar() {
  const interactionCount = useRef(0);
  const injected = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (document.getElementById(SCRIPT_ID)) {
      injected.current = true;
      return;
    }

    function cleanup() {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    }

    function injectScript() {
      if (injected.current || document.getElementById(SCRIPT_ID)) {
        injected.current = true;
        cleanup();
        return;
      }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
      injected.current = true;
      cleanup();
    }

    function handleInteraction() {
      interactionCount.current += 1;
      if (interactionCount.current >= INTERACTION_THRESHOLD) {
        injectScript();
      }
    }

    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, {
      passive: true,
    });

    return cleanup;
  }, []);

  return null;
}
