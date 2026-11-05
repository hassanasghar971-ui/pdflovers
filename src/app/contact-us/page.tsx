import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
  legalLinkClass,
} from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Contact Us | PDF Lovers Pro",
  description:
    "Get in touch with PDF Lovers Pro. Reach out to founder Hassan Asghar with questions, feedback, or support inquiries.",
  alternates: { canonical: "https://pdflovers.com/contact-us" },
};

export default function ContactUsPage() {
  return (
    <LegalLayout title="Contact Us" updated="January 2026">
      <LegalSection title="Get in Touch">
        <p>
          Have questions, feedback, or suggestions about PDF Lovers Pro? We would
          love to hear from you.
        </p>
      </LegalSection>

      <LegalSection title="Direct Support">
        <p>
          You can reach out directly via email at{" "}
          <a href="mailto:support@pdflovers.com" className={legalLinkClass}>
            support@pdflovers.com
          </a>{" "}
          or contact the founder and architect, Hassan Asghar.
        </p>
      </LegalSection>

      <LegalSection title="Privacy & Security Inquiries">
        <p>
          Since our tools run 100% locally in your browser via WebAssembly, we
          never store or have access to your documents. If you have questions
          regarding our privacy practices, please review our{" "}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
