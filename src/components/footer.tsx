import Link from "next/link";
import { FileStack, Mail, Phone, MessageCircle } from "lucide-react";
import { TOOLS } from "@/lib/tools-registry";

export default function Footer() {
  const year = new Date().getFullYear();
  const popularTools = TOOLS.slice(0, 6);

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
                <FileStack size={18} />
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                PDF Lovers Pro
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              42+ free online PDF tools processed 100% client-side with
              WebAssembly. No uploads. No servers. Total privacy, always.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Popular Tools
            </h3>
            <ul className="space-y-2.5">
              {popularTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tools"
                  className="text-sm font-medium text-red-600 dark:text-red-500"
                >
                  View all tools →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about-us"
                  className="text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca-notice"
                  className="text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  DMCA Notice
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Get In Touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hassanasghar7868686@gmail.com"
                  className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  <Mail size={15} /> hassanasghar7868686@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923451098607"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  <Phone size={15} /> +92 345 1098607
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923004977264"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                >
                  <MessageCircle size={15} /> Support WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500 sm:flex-row">
          <p>
            © {year} PDF Lovers Pro. All rights reserved. Founded by{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Hassan Asghar
            </span>
            .
          </p>
          <p>Built with Next.js & WebAssembly · Zero servers · Zero tracking files</p>
        </div>
      </div>
    </footer>
  );
}
