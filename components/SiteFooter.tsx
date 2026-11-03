import Link from 'next/link';
import CookieSettingsButton from './CookieSettingsButton';
import { SITE } from '@/lib/site';

const LINKS = [
  { href: '/about-us', label: 'About' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms' },
  { href: '/dmca-notice', label: 'DMCA' },
  { href: '/contact-us', label: 'Contact' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} {SITE.name} (pdflovers.com). All rights reserved.</p>
      <nav aria-label="Legal" className="mt-3 flex flex-wrap justify-center gap-4">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:underline">{l.label}</Link>
        ))}
        <CookieSettingsButton />
      </nav>
    </footer>
  );
}
