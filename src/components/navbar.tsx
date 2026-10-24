"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, FileStack, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/tools-registry";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/tools?search=${encodeURIComponent(trimmed)}` : "/tools"
    );
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring flex shrink-0 items-center gap-2 rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
            <FileStack size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            PDF Lovers<span className="text-red-600"> Pro</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/tools"
            className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            All Tools
          </Link>
          {ALL_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/tools?category=${category}`}
              className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearchSubmit}
          className="ml-auto hidden max-w-xs flex-1 items-center sm:flex"
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PDF tools..."
              className="focus-ring w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search PDF tools..."
                className="focus-ring w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            <Link
              href="/tools"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              All Tools <ChevronRight size={16} />
            </Link>
            {ALL_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/tools?category=${category}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {CATEGORY_LABELS[category]} <ChevronRight size={16} />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
