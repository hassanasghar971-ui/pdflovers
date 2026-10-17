"use client";

import { useEffect, useRef } from "react";

const CONTAINER_ID = "container-8af9b4ea9bf1c8a1daa4e46faa003ae7";
const SCRIPT_SRC =
  "https://pl31646499.profitableratecpmnetwork.com/8af9b4ea9bf1c8a1daa4e46faa003ae7/invoke.js";

export default function NativeBanner({ className = "" }: { className?: string }) {
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = SCRIPT_SRC;
    document.getElementById(CONTAINER_ID)?.appendChild(script);
  }, []);

  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`} style={{ minHeight: 280 }}>
      <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-neutral-400">
        Advertisement
      </p>
      <div id={CONTAINER_ID} style={{ minHeight: 250 }} />
    </div>
  );
}
