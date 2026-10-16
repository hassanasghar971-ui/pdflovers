import Link from "next/link";
import { siteConfig, toolRoutes, legalRoutes } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {siteConfig.name}
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              100% client-side PDF tools. No uploads. No servers. No tracking of your files. Ever.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              Tools
            </h4>
            <ul className="mt-4 space-y-2">
              {toolRoutes.map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/${tool.slug}`} className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400">
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              Company
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about-us" className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400">About Us</Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
              Legal
            </h4>
            <ul className="mt-4 space-y-2">
              {legalRoutes
                .filter((r) => r.slug !== "about-us" && r.slug !== "contact-us")
                .map((page) => (
                  <li key={page.slug}>
                    <Link href={`/${page.slug}`} className="text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400">
                      {page.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-slate-800 sm:flex-row">
          <p>© {year} {siteConfig.legalEntity}. All rights reserved.</p>
          <p>
            Built with ❤️ by{" "}
            <a
              href={siteConfig.founder.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 hover:underline"
            >
              {siteConfig.founder.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
