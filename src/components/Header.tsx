"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { categories, tools } from "@/lib/tools";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="glass-card-strong mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-400 text-white shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 2.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20V4a1.5 1.5 0 0 1 1.5-1.5Z" fill="#fff" />
              <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" stroke="#8b5cf6" strokeOpacity="0.4" />
            </svg>
          </span>
          <span className="text-lg">
            PDF <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Lovers</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {categories.map((cat) => (
            <div key={cat} className="group relative">
              <button className="rounded-full px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-current">
                {cat}
              </button>
              <div className="invisible absolute left-1/2 top-full z-20 grid w-[420px] -translate-x-1/2 translate-y-1 grid-cols-2 gap-1 rounded-2xl p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 glass-card-strong">
                {tools
                  .filter((t) => t.category === cat)
                  .map((t) => (
                    <Link
                      key={t.slug}
                      href={`/${t.slug}`}
                      className={`rounded-xl px-3 py-2 text-sm text-secondary hover:bg-violet-500/10 hover:text-current ${
                        pathname === `/${t.slug}` ? "bg-violet-500/10 text-current" : ""
                      }`}
                    >
                      {t.name}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="glass-pill flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="glass-card-strong mx-auto mt-2 max-w-7xl rounded-2xl p-4 lg:hidden">
          <div className="grid max-h-[60vh] grid-cols-1 gap-1 overflow-y-auto scrollbar-thin sm:grid-cols-2">
            {tools.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-secondary hover:bg-violet-500/10 hover:text-current"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
