import type { Metadata } from 'next';
import { SITE } from '@/lib/tools-registry';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact the ${SITE.name} team by email or WhatsApp.`,
  alternates: { canonical: `${SITE.url}/contact-us` },
};

const EMAIL = 'hassanasghar7868686@gmail.com';

const WHATSAPP = [
  { label: 'WhatsApp (primary)', shown: '03451098607', href: 'https://wa.me/923451098607' },
  { label: 'WhatsApp (secondary)', shown: '03497726469', href: 'https://wa.me/923497726469' },
];

export default function ContactUsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-3">
        {SITE.name} is built and maintained by Hassan Asghar, Lead Architect &amp; Founder. Reach
        out for support, bug reports, feedback or copyright notices.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Email</h2>
      <p className="mt-2">
        <a className="text-brand-600 underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>

      <h2 className="mt-8 text-xl font-semibold">WhatsApp</h2>
      <ul className="mt-2 space-y-2">
        {WHATSAPP.map((w) => (
          <li key={w.href}>
            {w.label}:{' '}
            <a className="text-brand-600 underline" href={w.href} target="_blank" rel="noopener noreferrer">
              {w.shown}
            </a>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Reporting a problem</h2>
      <p className="mt-2">
        Please include the tool name, your browser and device, and what happened. Do not send
        confidential documents. We do not receive your files, so a description or a screenshot of
        the error is enough.
      </p>
    </section>
  );
}
