import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { LEGAL_ENTITY_NAME, OWNER_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `The legally binding Terms and Conditions governing your use of ${SITE_NAME} and its 42 browser-based PDF tools.`,
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      description={`These Terms and Conditions ("Terms") form a legally binding agreement between you and ${LEGAL_ENTITY_NAME} governing your access to and use of ${SITE_URL}.`}
      lastUpdated="May 20, 2024"
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using {SITE_NAME} (the &ldquo;Service&rdquo;), you agree to be bound by these Terms
        and our Privacy Policy. If you do not agree to these Terms, you must not access or use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        {SITE_NAME} provides a suite of 42 free PDF utility tools — including merging, splitting,
        converting, compressing, signing, and editing PDF documents — that execute entirely within your
        web browser using client-side WebAssembly technology. No file is uploaded to, or processed by, any
        server operated by {LEGAL_ENTITY_NAME}. All document processing happens locally on your own device.
      </p>

      <h2>3. Browser-Side Operation &amp; No Server Liability</h2>
      <p>
        You acknowledge and agree that all processing performed by the Service occurs on your local device
        using your device&rsquo;s own processing power and memory. {LEGAL_ENTITY_NAME} has no visibility
        into, control over, or responsibility for the content, accuracy, or outcome of any file you process,
        as we never receive or store a copy of such files.
      </p>

      <h2>4. Ownership of Processed Documents</h2>
      <p>
        You retain full ownership and all copyright and intellectual property rights in any document you
        upload to, create with, or process using the Service. {LEGAL_ENTITY_NAME} claims no ownership,
        license, or rights whatsoever over any file processed through our tools, as such files are never
        transmitted to or stored by us.
      </p>

      <h2>5. Acceptable Use Policy</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Process, create, or distribute content that is illegal, infringing, defamatory, obscene, or violates the rights of any third party;</li>
        <li>Attempt to reverse-engineer, decompile, or interfere with the Service&rsquo;s client-side code beyond what is permitted by applicable open-source licenses;</li>
        <li>Use automated scripts, bots, or scrapers to abuse or overload the Service&rsquo;s front-end infrastructure or CDN;</li>
        <li>Misrepresent your identity or impersonate any person or entity while using the Service;</li>
        <li>Circumvent, disable, or interfere with security-related features of the Service.</li>
      </ul>

      <h2>6. Fair Use Limits</h2>
      <p>
        The Service is provided free of charge for personal and commercial use within reasonable fair-use
        limits. Because processing occurs on your own device, practical limits are generally governed by
        your device&rsquo;s available memory and processing power rather than any artificial quota imposed
        by us. We reserve the right to introduce reasonable technical safeguards (e.g., client-side file
        size warnings) to ensure stable performance across all users&rsquo; devices.
      </p>

      <h2>7. Intellectual Property of the Service</h2>
      <p>
        The {SITE_NAME} name, logo, website design, source code (excluding open-source third-party
        libraries such as <code>pdf-lib</code> and <code>pdfjs-dist</code>, which remain subject to their
        own respective licenses), and all associated branding are the exclusive property of{" "}
        {LEGAL_ENTITY_NAME}. You may not reproduce, duplicate, copy, sell, resell, or exploit any portion
        of the Service without express written permission.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT
        WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE
        UNINTERRUPTED, ERROR-FREE, OR THAT CONVERSION RESULTS WILL BE 100% ACCURATE FOR EVERY FILE TYPE OR
        EDGE CASE. YOU ARE SOLELY RESPONSIBLE FOR VERIFYING THE ACCURACY AND INTEGRITY OF ANY OUTPUT FILE
        BEFORE RELYING ON IT FOR LEGAL, FINANCIAL, OR BUSINESS PURPOSES.
      </p>

      <h2>9. Absolute Limitation of Liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, {LEGAL_ENTITY_NAME}, ITS FOUNDER, EMPLOYEES, AND
        AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR BUSINESS OPPORTUNITY, ARISING OUT OF OR IN CONNECTION
        WITH YOUR USE OF (OR INABILITY TO USE) THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
        DAMAGES. OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING FROM THE SERVICE SHALL NOT EXCEED
        FIFTY US DOLLARS (USD $50), AS THE SERVICE IS PROVIDED FREE OF CHARGE.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless {LEGAL_ENTITY_NAME} and its founder from any
        claims, damages, liabilities, costs, or expenses (including reasonable legal fees) arising out of
        your violation of these Terms or your misuse of the Service.
      </p>

      <h2>11. Third-Party Advertisements and Links</h2>
      <p>
        The Service displays third-party advertisements via Google AdSense and Adsterra. We do not endorse
        and are not responsible for the content, products, or services offered by these third-party
        advertisers or any external links they may contain.
      </p>

      <h2>12. Termination</h2>
      <p>
        We reserve the right to suspend or restrict access to the Service, in whole or in part, at any
        time, without notice, for conduct that we believe violates these Terms or is harmful to other
        users, us, or third parties.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with applicable international
        e-commerce and digital service regulations, without regard to conflict-of-law principles. Any
        disputes shall first be attempted to be resolved informally by contacting us directly.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We may revise these Terms from time to time. Material changes will be reflected by updating the
        &ldquo;Last Updated&rdquo; date above. Your continued use of the Service after changes are posted
        constitutes your acceptance of the revised Terms.
      </p>

      <h2>15. Contact Information</h2>
      <p>
        For questions regarding these Terms, contact us at{" "}
        <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>.
      </p>
    </LegalLayout>
  );
}
