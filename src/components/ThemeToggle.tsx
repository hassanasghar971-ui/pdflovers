"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS: Array<{ value: string; label: string; icon: string }> = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "system", label: "Auto", icon: "🖥️" },
  { value: "glass", label: "Glass", icon: "✨" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 w-[168px] rounded-full bg-black/5 dark:bg-white/5" />;
  }

  return (
    <div className="glass-pill flex items-center gap-0.5 rounded-full p-1" role="group" aria-label="Theme switcher">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            title={opt.label}
            aria-pressed={active}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-300 ${
              active
                ? "scale-105 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md"
                : "text-current opacity-60 hover:opacity-100"
            }`}
          >
            <span aria-hidden>{opt.icon}</span>
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
