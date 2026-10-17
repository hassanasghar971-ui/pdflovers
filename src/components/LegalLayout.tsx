import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbSchema } from "@/lib/json-ld";
import { SITE_URL } from "@/lib/constants";

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/dmca-notice", label: "DMCA Notice" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
];

interface Props {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, description, lastUpdated, children }: Props) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: title, url: SITE_URL },
        ])}
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_260px]">
          <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-[#DC2626] prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-lg">
            <h1 className="mb-2 text-3xl font-extrabold text-neutral-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Last Updated: {lastUpdated}</p>
            <p className="lead text-neutral-600 dark:text-neutral-300">{description}</p>
            <hr className="my-6 border-black/10 dark:border-white/10" />
            {children}
          </article>

          <aside className="h-fit rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-white">
              Legal &amp; Trust Center
            </h4>
            <ul className="space-y-3 text-sm">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-neutral-600 hover:text-[#DC2626] dark:text-neutral-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
