import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the team behind PDF Lovers Pro.',
};

export default function ContactUsPage() {
  return (
    <LegalPage title="Contact Us" showDate={false}>
      <p>Have questions, feature requests, or feedback? Reach out to the founder and lead architect directly.</p>
      <h2>Founder & Architect</h2>
      <p><strong>Name:</strong> {SITE.contact.founder}</p>
      <p><strong>Email:</strong> <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a></p>
      <p><strong>Primary WhatsApp:</strong> {SITE.contact.whatsapp[0].display}</p>
      <p><strong>Secondary WhatsApp:</strong> {SITE.contact.whatsapp[1].display}</p>
    </LegalPage>
  );
}
