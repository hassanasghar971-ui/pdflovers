"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig, toolRoutes } from "@/lib/site-config";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg">
            PL
          </span>
          <span className="text-slate-900 dark:text-white">
            {siteConfig.shortName}
            <span className="text-brand-600"> Pro</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button className="text-sm font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-200">
              Tools
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {toolRoutes.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/${tool.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {tool.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/about-us" className="text-sm font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-200">
            About
          </Link>
          <Link href="/contact-us" className="text-sm font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-200">
            Contact
          </Link>
          <Link
            href="/merge-pdf"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-brand-700"
          >
            Launch App
          </Link>
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 md:hidden dark:border-slate-800">
          {toolRoutes.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              onClick={() => setOpen(false)}
            >
              {tool.title}
            </Link>
          ))}
          <Link href="/about-us" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/contact-us" className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200" onClick={() => setOpen(false)}>
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
