import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { siteConfig } from "@/lib/site-config";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with PDF Lovers Pro and founder Hassan Asghar via email or WhatsApp. We respond to all privacy, support, and business inquiries.",
  alternates: { canonical: `${siteConfig.url}/contact-us` },
};

export default function ContactUsPage() {
  return (
    <LegalLayout title="Contact Us" lastUpdated="June 1, 2024">
      <h2>We'd Love to Hear From You</h2>
      <p>
        Whether you have a question about privacy, a bug report, a feature
        suggestion, or a business partnership inquiry, the fastest way to
        reach us is directly. {siteConfig.legalEntity} is a founder-operated
        project, and every message is personally read and answered by{" "}
        <strong>{siteConfig.founder.name}</strong>.
      </p>

      <h3>Direct Contact Channels</h3>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a>
        </li>
        <li>
          <strong>WhatsApp:</strong>{" "}
          <a href={siteConfig.founder.whatsapp} target="_blank" rel="noopener noreferrer">
            {siteConfig.founder.phoneDisplay}
          </a>
        </li>
        <li>
          <strong>Response Time:</strong> We aim to respond to all inquiries
          within 24–48 hours.
        </li>
      </ul>

      <h3>What You Can Contact Us About</h3>
      <ul>
        <li>Technical support or bug reports related to any PDF tool;</li>
        <li>Privacy, GDPR, or CCPA data subject requests;</li>
        <li>DMCA / copyright concerns (see our <a href="/dmca-notice">DMCA Notice</a>);</li>
        <li>Advertising, sponsorship, or partnership inquiries;</li>
        <li>General feedback and feature requests.</li>
      </ul>

      <h3>Send Us a Message</h3>
      <p>
        Fill out the form below — it will open your default email client with
        your message pre-filled, addressed directly to our founder. No data is
        transmitted to or stored on any server; this form uses your own email
        client to send the message, consistent with our zero-server
        philosophy.
      </p>
      <ContactForm />
    </LegalLayout>
  );
}
