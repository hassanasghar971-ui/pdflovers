import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone, Clock } from "lucide-react";
import { OWNER_EMAIL, OWNER_WHATSAPP, OWNER_WHATSAPP_LINK, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with the ${SITE_NAME} team for support, feedback, or business inquiries. Direct email and WhatsApp support channels available.`,
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <LegalLayout
      title="Contact Us"
      description="We usually respond within 24 hours, Monday through Saturday."
      lastUpdated="May 20, 2024"
    >
      <div className="not-prose grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Have a question, found a bug, or want to suggest a new tool? Our founder personally reads every
            message sent through this page. Fill out the form and your default email client will open with
            your message pre-filled — nothing is routed through a third-party backend server, consistent
            with our Zero-Server privacy architecture.
          </p>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#DC2626]" />
              <a href={`mailto:${OWNER_EMAIL}`} className="hover:text-[#DC2626]">{OWNER_EMAIL}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#DC2626]" />
              <a href={OWNER_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626]">
                {OWNER_WHATSAPP} (WhatsApp)
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#DC2626]" />
              Average response time: under 24 hours (Mon–Sat)
            </li>
          </ul>

          <div className="mt-8 rounded-xl border border-black/10 bg-white/60 p-5 text-sm dark:border-white/10 dark:bg-white/5">
            <h4 className="mb-2 font-semibold text-neutral-900 dark:text-white">Before you contact us</h4>
            <p className="text-neutral-600 dark:text-neutral-400">
              Since all processing happens locally in your browser, most issues can be resolved by
              refreshing the page, trying a different browser (Chrome or Firefox recommended), or ensuring
              your browser is up to date. If the issue persists, please include your browser name/version
              and a description of the tool you were using in your message.
            </p>
          </div>
        </div>
        <ContactForm />
      </div>
    </LegalLayout>
  );
}
