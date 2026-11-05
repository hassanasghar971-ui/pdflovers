import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
  legalLinkClass,
} from "@/components/legal/legal-layout";

const DMCA_EMAIL = "hassanasghar7868686@gmail.com"; // ← replace with a business address

export const metadata: Metadata = {
  title: "DMCA Notice | PDF Lovers Pro",
  description:
    "How to report alleged copyright infringement to PDF Lovers Pro. Our tools process files locally in your browser and we do not host user documents.",
  alternates: { canonical: "https://pdflovers.com/dmca-notice" },
};

export default function DmcaNoticePage() {
  return (
    <LegalLayout title="DMCA Notice" updated="January 2026">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-base font-semibold text-slate-900">
          We do not host your files
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          PDF Lovers Pro tools run entirely in your browser. Documents you
          process are never uploaded to or stored on our servers, so we have no
          user-uploaded content that we could remove.
        </p>
      </div>

      <LegalSection title="Our Policy">
        <p>
          PDF Lovers Pro respects intellectual property rights and expects
          users to do the same. We respond to valid notices of alleged
          copyright infringement under the Digital Millennium Copyright Act
          (DMCA), 17 U.S.C. § 512.
        </p>
        <p>
          Only process documents that you own or have permission to use. You
          are responsible for how you use our tools on your own files.
        </p>
      </LegalSection>

      <LegalSection title="What This Site Contains">
        <p>
          The website itself (text, design, code, and branding) is operated by
          PDF Lovers Pro. If you believe material on the website infringes your
          copyright, you can submit a notice as described below.
        </p>
      </LegalSection>

      <LegalSection title="Submitting a Copyright Notice">
        <p>Your written notice must include all of the following:</p>
        <ol className="list-decimal space-y-1 pl-6">
          <li>
            Your physical or electronic signature (or that of a person
            authorised to act for the copyright owner).
          </li>
          <li>
            Identification of the copyrighted work you claim has been
            infringed.
          </li>
          <li>
            The exact URL of the material on our site that you claim is
            infringing, with enough detail for us to locate it.
          </li>
          <li>
            Your name, mailing address, telephone number, and email address.
          </li>
          <li>
            A statement that you have a good-faith belief that the use is not
            authorised by the copyright owner, its agent, or the law.
          </li>
          <li>
            A statement, under penalty of perjury, that the information in the
            notice is accurate and that you are the copyright owner or are
            authorised to act on the owner&apos;s behalf.
          </li>
        </ol>
        <p>Send your notice to:</p>
        <p>
          <strong className="text-slate-900">Copyright Contact</strong>
          <br />
          PDF Lovers Pro
          <br />
          Email:{" "}
          <a
            href={`mailto:${DMCA_EMAIL}?subject=DMCA%20Notice`}
            className={legalLinkClass}
          >
            {DMCA_EMAIL}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Counter-Notification">
        <p>
          If you believe material was removed or disabled by mistake or
          misidentification, you may send a counter-notification that includes
          your signature, identification of the removed material and where it
          appeared, a statement under penalty of perjury that you believe the
          removal was a mistake, your contact details, and consent to the
          jurisdiction of the federal court for your address.
        </p>
      </LegalSection>

      <LegalSection title="Repeat Infringers">
        <p>
          In appropriate circumstances, we may restrict access for users who
          are repeat infringers of copyright.
        </p>
      </LegalSection>

      <LegalSection title="False Claims">
        <p>
          Under 17 U.S.C. § 512(f), anyone who knowingly misrepresents that
          material is infringing may be liable for damages, including costs and
          attorneys&apos; fees. Please make sure a claim is valid before you
          submit it.
        </p>
      </LegalSection>

      <LegalSection title="Related Pages">
        <p>
          See our{" "}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms-and-conditions" className={legalLinkClass}>
            Terms &amp; Conditions
          </Link>
          , or{" "}
          <Link href="/contact-us" className={legalLinkClass}>
            contact us
          </Link>{" "}
          with other questions.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
