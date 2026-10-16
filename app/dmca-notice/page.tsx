import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "DMCA Notice & Copyright Policy",
  description:
    "PDF Lovers Pro's DMCA takedown procedure and copyright infringement policy, including our designated agent contact details.",
  alternates: { canonical: `${siteConfig.url}/dmca-notice` },
};

export default function DMCAPage() {
  return (
    <LegalLayout title="DMCA Notice & Copyright Policy" lastUpdated="June 1, 2024">
      <h2>1. Overview</h2>
      <p>
        <strong>{siteConfig.legalEntity}</strong> ("{siteConfig.name}")
        respects the intellectual property rights of others and expects its
        users to do the same. We respond to clear notices of alleged copyright
        infringement in accordance with the Digital Millennium Copyright Act
        ("DMCA"), 17 U.S.C. § 512, and equivalent international frameworks.
      </p>
      <p>
        <strong>Important architectural note:</strong> {siteConfig.name}{" "}
        operates on a zero-server, 100% client-side architecture. Documents
        you merge, split, compress, or convert using our tools are processed
        entirely within your own browser and are{" "}
        <strong>never uploaded to, stored on, or hosted by our servers</strong>.
        As a result, we have no technical ability to access, host, or remove
        any document content you process privately using our tools, because
        we never receive or retain that content in the first place. This DMCA
        policy applies to original content that we do publish directly on{" "}
        {siteConfig.url} (such as text, graphics, or other materials
        authored or hosted by us).
      </p>

      <h2>2. Designated DMCA Agent</h2>
      <p>
        If you believe that content appearing on {siteConfig.url} infringes
        your copyright, please send a written notification to our designated
        agent:
      </p>
      <ul>
        <li><strong>Name:</strong> {siteConfig.founder.name}</li>
        <li><strong>Title:</strong> Founder &amp; DMCA Designated Agent, {siteConfig.legalEntity}</li>
        <li><strong>Email:</strong> <a href={`mailto:${siteConfig.founder.email}?subject=DMCA Takedown Notice`}>{siteConfig.founder.email}</a></li>
        <li><strong>WhatsApp/Phone:</strong> <a href={siteConfig.founder.whatsapp}>{siteConfig.founder.phoneDisplay}</a></li>
      </ul>

      <h2>3. Filing a Valid DMCA Takedown Notice</h2>
      <p>
        To be effective, your notification must be in writing and include
        substantially the following, as required under 17 U.S.C. § 512(c)(3):
      </p>
      <ol>
        <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner;</li>
        <li>Identification of the copyrighted work claimed to have been infringed;</li>
        <li>Identification of the material claimed to be infringing, with sufficient detail (e.g., exact URL) to allow us to locate it;</li>
        <li>Your contact information, including address, telephone number, and email address;</li>
        <li>A statement that you have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;</li>
        <li>A statement, made under penalty of perjury, that the above information is accurate and that you are the copyright owner or authorized to act on the owner's behalf.</li>
      </ol>
      <p>
        Notices that do not comply with these requirements may not receive a
        response.
      </p>

      <h2>4. Counter-Notification Procedure</h2>
      <p>
        If you believe content you posted or that is attributed to you was
        removed or disabled by mistake or misidentification, you may submit a
        counter-notification to our designated agent containing:
      </p>
      <ol>
        <li>Your physical or electronic signature;</li>
        <li>Identification of the material removed and its location before removal;</li>
        <li>A statement under penalty of perjury that you have a good-faith belief the material was removed as a result of mistake or misidentification;</li>
        <li>Your name, address, telephone number, and a statement consenting to the jurisdiction of the federal court in your district (or, if outside the United States, an appropriate judicial forum), and that you will accept service of process from the person who filed the original notice.</li>
      </ol>
      <p>
        Upon receipt of a valid counter-notification, we may reinstate the
        removed material within 10–14 business days unless the original
        complainant files a court action seeking a restraining order.
      </p>

      <h2>5. Repeat Infringer Policy</h2>
      <p>
        In accordance with the DMCA and other applicable laws, we maintain a
        policy of restricting access, where technically feasible, to users who
        are determined to be repeat infringers.
      </p>

      <h2>6. False Claims Warning</h2>
      <p>
        Please note that under Section 512(f) of the DMCA, any person who
        knowingly materially misrepresents that material is infringing may be
        subject to liability for damages, including costs and attorney's fees.
      </p>

      <h2>7. Contact</h2>
      <p>
        For all DMCA-related correspondence, contact {siteConfig.founder.name}{" "}
        at <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a>.
      </p>
    </LegalLayout>
  );
}
