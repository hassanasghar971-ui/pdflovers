import Link from "next/link";
import { categories, tools } from "@/lib/tools";

const legalLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="mt-20 px-3 pb-6 sm:px-6">
      <div className="glass-card-strong mx-auto max-w-7xl rounded-3xl p-8 sm:p-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-400 text-white shadow-md">
                PL
              </span>
              <span className="text-lg">PDF Lovers</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-secondary">
              42 free, privacy-first PDF tools that run entirely in your browser. Nothing you upload ever touches a
              server — merge, convert, sign, protect and more, instantly.
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-secondary">
              <p className="font-semibold text-current">Hassan Asghar</p>
              <p>Owner &amp; Lead Architect</p>
              <p>
                WhatsApp:{" "}
                <a className="hover:text-violet-500" href="https://wa.me/923451098607">
                  00923451098607
                </a>{" "}
                /{" "}
                <a className="hover:text-violet-500" href="https://wa.me/923497726469">
                  00923497726469
                </a>
              </p>
              <p>
                Email:{" "}
                <a className="hover:text-violet-500" href="mailto:hassanasghar7868686@gmail.com">
                  hassanasghar7868686@gmail.com
                </a>
              </p>
            </div>
          </div>

          {categories.map((cat) => (
            <div key={cat}>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-secondary">{cat}</h4>
              <ul className="mt-3 space-y-2">
                {tools
                  .filter((t) => t.category === cat)
                  .slice(0, 6)
                  .map((t) => (
                    <li key={t.slug}>
                      <Link href={`/${t.slug}`} className="text-sm text-secondary hover:text-violet-500">
                        {t.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-current/10 pt-6 text-sm text-secondary sm:flex-row">
          <p>© {new Date().getFullYear()} PDF Lovers. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-violet-500">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
