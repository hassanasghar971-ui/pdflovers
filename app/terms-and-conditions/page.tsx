import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the Terms and Conditions governing your use of PDF Lovers Pro's client-side PDF tools.",
  alternates: { canonical: `${siteConfig.url}/terms-and-conditions` },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms and Conditions" lastUpdated="June 1, 2024">
      <h2>1. Agreement to Terms</h2>
      <p>
        These Terms and Conditions ("Terms") constitute a legally binding
        agreement between you ("User," "you") and{" "}
        <strong>{siteConfig.legalEntity}</strong> ("{siteConfig.name}," "we,"
        "us," or "our") governing your access to and use of{" "}
        {siteConfig.url} and all associated tools and services (the
        "Service"). By accessing or using the Service, you agree to be bound
        by these Terms. If you do not agree, you must not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        {siteConfig.name} provides free, browser-based PDF utilities —
        including merging, splitting, compressing, and format conversion —
        that execute entirely on the client side using WebAssembly and
        JavaScript. We do not operate a backend server that receives, stores,
        or processes your document content. No account, registration, or
        payment is required to use the core Service.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 13 years of age (or the age of digital consent in
        your jurisdiction) to use the Service. By using the Service, you
        represent that you meet this requirement.
      </p>

      <h2>4. License to Use</h2>
      <p>
        Subject to your compliance with these Terms, we grant you a limited,
        non-exclusive, non-transferable, revocable license to access and use
        the Service for your personal or internal business purposes. This
        license does not include any right to: (a) resell or make commercial
        use of the Service without written permission; (b) reverse-engineer,
        decompile, or extract source code from the Service except as
        permitted by applicable law; (c) copy, reproduce, or create derivative
        works of our software, branding, or content.
      </p>

      <h2>5. User Responsibilities &amp; Acceptable Use</h2>
      <p>You agree that you will not use the Service to:</p>
      <ul>
        <li>Process, upload (to third parties), or generate content that is unlawful, infringing, defamatory, obscene, or violates the rights of any third party;</li>
        <li>Attempt to probe, scan, or test the vulnerability of our systems or circumvent our security measures;</li>
        <li>Introduce malware, viruses, or any malicious code via the Service;</li>
        <li>Use automated means (bots, scrapers) to access the Service in a manner that sends excessive requests or degrades performance for other users;</li>
        <li>Misrepresent your identity or impersonate any person or entity;</li>
        <li>Use the Service in violation of any applicable local, national, or international law.</li>
      </ul>
      <p>
        Because all file processing occurs locally within your own browser, we
        have no visibility into the specific content you process. You remain
        solely responsible for ensuring your use of any document complies with
        applicable copyright, privacy, and data protection laws.
      </p>

      <h2>6. Intellectual Property Rights</h2>
      <p>
        The Service, including its design, logos, trademarks ("PDF Lovers
        Pro"), source code, and original content, is the exclusive property of
        {" "}{siteConfig.legalEntity} and is protected by applicable
        intellectual property laws. You retain all ownership rights to any
        documents or files you process using the Service — we claim no
        ownership interest in your content whatsoever, consistent with the
        fact that we never receive or store it.
      </p>

      <h2>7. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES
        OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
        IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE UNINTERRUPTED,
        ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. WE DO NOT WARRANT THE
        ACCURACY OR COMPLETENESS OF ANY FILE CONVERSION OR PROCESSING OUTCOME.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL{" "}
        {siteConfig.legalEntity}, ITS FOUNDER, OFFICERS, OR AFFILIATES BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, PROFITS, OR BUSINESS
        OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF (OR INABILITY
        TO USE) THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
        DAMAGES. OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING FROM THE
        SERVICE SHALL NOT EXCEED FIFTY US DOLLARS (USD $50).
      </p>

      <h2>9. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless {siteConfig.legalEntity}
        and its founder from any claims, liabilities, damages, losses, and
        expenses (including reasonable legal fees) arising out of or in any
        way connected with your access to or use of the Service, your
        violation of these Terms, or your violation of any third-party right,
        including intellectual property or privacy rights.
      </p>

      <h2>10. Third-Party Links &amp; Advertising</h2>
      <p>
        The Service may display third-party advertisements served via Google
        AdSense, and may contain links to third-party websites. We do not
        endorse and are not responsible for the content, privacy practices, or
        accuracy of any third-party sites or advertisements. Your interactions
        with advertisers found through the Service are solely between you and
        the advertiser.
      </p>

      <h2>11. Copyright / DMCA</h2>
      <p>
        We respect intellectual property rights. If you believe content
        accessible through our Service infringes your copyright, please refer
        to our dedicated{" "}
        <a href="/dmca-notice">DMCA Notice</a> page for the applicable
        takedown procedure.
      </p>

      <h2>12. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to the
        Service at our sole discretion, without notice, for conduct that we
        believe violates these Terms or is harmful to other users, us, or
        third parties. Since no account exists, "termination" refers to
        blocking access by technical means (e.g., IP-based restrictions)
        where necessary.
      </p>

      <h2>13. Governing Law &amp; Jurisdiction</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the {siteConfig.jurisdiction}, without regard to its conflict
        of law provisions. Any disputes arising under these Terms shall be
        subject to the exclusive jurisdiction of the competent courts, unless
        otherwise required by mandatory consumer protection laws applicable in
        your jurisdiction of residence.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We may revise these Terms at any time. Updated Terms will be posted on
        this page with a revised "Last Updated" date. Continued use of the
        Service after changes take effect constitutes your acceptance of the
        revised Terms.
      </p>

      <h2>15. Severability</h2>
      <p>
        If any provision of these Terms is held to be invalid or
        unenforceable, the remaining provisions shall continue in full force
        and effect.
      </p>

      <h2>16. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy and DMCA Notice,
        constitute the entire agreement between you and {siteConfig.legalEntity}
        regarding the Service, superseding any prior agreements.
      </p>

      <h2>17. Contact Information</h2>
      <p>
        Questions about these Terms may be directed to{" "}
        <strong>{siteConfig.founder.name}</strong>, Founder, at{" "}
        <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a>{" "}
        or via WhatsApp at{" "}
        <a href={siteConfig.founder.whatsapp}>{siteConfig.founder.phoneDisplay}</a>.
      </p>
    </LegalLayout>
  );
}
