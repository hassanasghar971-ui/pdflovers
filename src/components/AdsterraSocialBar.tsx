"use client";

import { useEffect, useRef } from "react";

const SOCIAL_BAR_SRC =
  "https://pl31804194.profitableratecpmnetwork.com/72/bc/4b/72bc4b4ca161783e4681f10c50bbf607.js";
const CLICK_THRESHOLD = 2;

export default function AdsterraSocialBar() {
  const loadedRef = useRef(false);
  const clicksRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("plp_social_bar_loaded") === "1") return;

    const handleInteraction = () => {
      clicksRef.current += 1;
      if (clicksRef.current >= CLICK_THRESHOLD && !loadedRef.current) {
        loadedRef.current = true;
        const script = document.createElement("script");
        script.src = SOCIAL_BAR_SRC;
        script.async = true;
        document.body.appendChild(script);
        sessionStorage.setItem("plp_social_bar_loaded", "1");
        document.removeEventListener("click", handleInteraction);
      }
    };

    document.addEventListener("click", handleInteraction);
    return () => document.removeEventListener("click", handleInteraction);
  }, []);

  return null;
}
