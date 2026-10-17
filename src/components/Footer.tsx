import Link from "next/link";
import { FileStack, Mail, Phone } from "lucide-react";
import { SITE_NAME, OWNER_EMAIL, OWNER_WHATSAPP, OWNER_WHATSAPP_LINK } from "@/lib/constants";
import { CATEGORIES } from "@/lib/tools-data";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/5 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-neutral-900 dark:text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DC2626] text-white">
                <FileStack className="h-5 w-5" />
              </span>
              {SITE_NAME}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              42 free WebAssembly-powered PDF tools that run 100% in your browser. No uploads, no servers, no accounts — ever.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-white">
              Categories
            </h5>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link href={`/tools?category=${encodeURIComponent(c)}`} className="hover:text-[#DC2626]">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-white">
              Company
            </h5>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li><Link href="/about-us" className="hover:text-[#DC2626]">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-[#DC2626]">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#DC2626]">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-[#DC2626]">Terms &amp; Conditions</Link></li>
              <li><Link href="/dmca-notice" className="hover:text-[#DC2626]">DMCA Notice</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-white">
              Get in Touch
            </h5>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#DC2626]" />
                <a href={`mailto:${OWNER_EMAIL}`} className="hover:text-[#DC2626]">{OWNER_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#DC2626]" />
                <a href={OWNER_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626]">
                  {OWNER_WHATSAPP}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-xs text-neutral-500 dark:border-white/10 sm:flex-row">
          <p>© {year} PDF Lovers Pro. All rights reserved.</p>
          <p>Built with Next.js, WebAssembly &amp; zero servers.</p>
        </div>
      </div>
    </footer>
  );
}
