import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { OWNER_EMAIL, OWNER_NAME, OWNER_WHATSAPP, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "DMCA Notice",
  description: `${SITE_NAME}'s Digital Millennium Copyright Act (DMCA) policy, takedown procedure, and designated copyright agent contact information.`,
  alternates: { canonical: "/dmca-notice" },
};

export default function DmcaPage() {
  return (
    <LegalLayout
      title="DMCA Notice & Copyright Policy"
      description={`${SITE_NAME} respects the intellectual property rights of others and expects its users to do the same.`}
      lastUpdated="May 20, 2024"
    >
      <h2>1. Our Commitment to Copyright Compliance</h2>
      <p>
        {SITE_NAME} operates as a client-side, Zero-Server toolkit: our platform does not host, store, or
        serve any user-generated PDF files or copyrighted documents on our infrastructure, because all
        processing occurs locally in each visitor&rsquo;s own browser. However, in the event that any
        content hosted directly on the {SITE_NAME} website itself (such as text, graphics, or code)
        infringes a copyright, we comply fully with the Digital Millennium Copyright Act (DMCA), 17 U.S.C.
        § 512, and will respond promptly to valid takedown notices.
      </p>

      <h2>2. Filing a DMCA Takedown Notice</h2>
      <p>
        If you believe that content appearing on {SITE_NAME} infringes your copyright, please submit a
        written notification containing the following information, as required under 17 U.S.C. § 512(c)(3):
      </p>
      <ol>
        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf;</li>
        <li>Identification of the copyrighted work claimed to have been infringed;</li>
        <li>Identification of the material claimed to be infringing, with sufficient detail (e.g., a specific URL) to allow us to locate it;</li>
        <li>Your contact information, including your address, telephone number, and email address;</li>
        <li>A statement that you have a good-faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law; and</li>
        <li>A statement, made under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner.</li>
      </ol>

      <h2>3. Designated Copyright Agent</h2>
      <p>Please send all DMCA takedown notices to our designated agent:</p>
      <div className="not-prose rounded-xl border border-black/10 bg-white/60 p-5 text-sm dark:border-white/10 dark:bg-white/5">
        <p><strong>Designated Agent:</strong> {OWNER_NAME}</p>
        <p><strong>Role:</strong> Founder &amp; Lead Engineer, {SITE_NAME}</p>
        <p><strong>Email:</strong> <a className="text-[#DC2626]" href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a></p>
        <p><strong>WhatsApp / Phone:</strong> {OWNER_WHATSAPP}</p>
      </div>

      <h2>4. Counter-Notification Procedure</h2>
      <p>
        If you believe that material you posted or that is associated with you was removed or disabled by
        mistake or misidentification, you may submit a counter-notification containing:
      </p>
      <ol>
        <li>Your physical or electronic signature;</li>
        <li>Identification of the material that was removed and its location before removal;</li>
        <li>A statement under penalty of perjury that you have a good-faith belief the material was removed as a result of mistake or misidentification;</li>
        <li>Your name, address, telephone number, and a statement consenting to the jurisdiction of the federal court in your judicial district.</li>
      </ol>
      <p>
        Upon receipt of a valid counter-notification, we may restore the removed material within 10–14
        business days unless the original complainant files a court action seeking a restraining order.
      </p>

      <h2>5. Repeat Infringer Policy</h2>
      <p>
        In accordance with the DMCA, {SITE_NAME} maintains a policy of terminating, in appropriate
        circumstances, access for users who are determined to be repeat infringers.
      </p>

      <h2>6. False Claims Warning</h2>
      <p>
        Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents
        that material is infringing may be subject to liability for damages, including costs and attorneys&rsquo;
        fees incurred by us or the alleged infringer as a result of relying upon such misrepresentation.
      </p>

      <h2>7. Response Time</h2>
      <p>
        We aim to review and respond to all valid DMCA notices within 3–5 business days of receipt.
      </p>
    </LegalLayout>
  );
}
