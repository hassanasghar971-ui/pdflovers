import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { OWNER_EMAIL, OWNER_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${SITE_NAME}'s Privacy Policy explains our Zero-Server architecture, GDPR/CCPA rights, and how ad networks like Google AdSense and Adsterra use cookies.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description={`This Privacy Policy describes how ${SITE_NAME} ("we," "us," or "our") handles information when you visit ${SITE_URL}.`}
      lastUpdated="May 20, 2024"
    >
      <h2>1. Our Core Privacy Promise: Zero-Server File Storage</h2>
      <p>
        {SITE_NAME} is built on a 100% client-side, WebAssembly-powered architecture. Every PDF tool on
        this website — including Merge PDF, Compress PDF, PDF to Word, Sign PDF, and all other 42 tools —
        processes your files entirely within your own device&rsquo;s browser memory (RAM) using technologies
        like <code>pdf-lib</code> and <code>pdfjs-dist</code> compiled to WebAssembly. We do not operate a
        backend file-upload server, we do not use any cloud storage bucket, and we do not maintain a
        database of user-submitted documents. Your PDF files, images, and any personal data contained
        within them never leave your device and are never transmitted to, or stored on, our infrastructure
        or any third party&rsquo;s infrastructure under our control. Once you close or refresh the browser
        tab, the in-memory file data is permanently discarded.
      </p>

      <h2>2. Information We Do Not Collect</h2>
      <ul>
        <li>We do not collect, view, copy, or retain the content of any PDF, image, or document you process using our tools.</li>
        <li>We do not require account registration, so we do not collect names, passwords, or account credentials.</li>
        <li>We do not log file names, file content, or file metadata on any server.</li>
      </ul>

      <h2>3. Information We May Automatically Collect</h2>
      <p>
        Like most websites, our hosting provider (Vercel) and analytics tools may automatically collect
        limited, non-identifying technical information necessary for the website to function and to
        understand aggregate traffic patterns. This may include: IP address (used transiently for routing
        and security, not stored long-term by us), browser type and version, device type, operating
        system, referring URL, pages visited, and timestamps. This information relates to your visit to
        our website, not to the content of any file you process with our tools.
      </p>

      <h2>4. Cookies and Similar Technologies</h2>
      <p>
        We use a minimal set of cookies and browser storage (such as <code>localStorage</code> and
        <code> sessionStorage</code>) strictly for functional purposes — for example, remembering your
        light/dark theme preference and preventing duplicate advertisement script injections within the
        same session. We do not use cookies to track, store, or analyze the content of your processed
        documents.
      </p>

      <h2>5. Third-Party Advertising: Google AdSense &amp; Adsterra</h2>
      <p>
        This website is monetized using third-party advertising networks, including Google AdSense and
        Adsterra. These networks may independently use cookies, web beacons, and similar technologies to
        collect information about your visits to this and other websites in order to provide advertisements
        about goods and services of interest to you.
      </p>
      <ul>
        <li>
          <strong>Google AdSense &amp; the DART Cookie:</strong> Google, as a third-party vendor, uses
          cookies (including the DoubleClick DART cookie) to serve ads on this site based on your prior
          visits to this website and other websites on the Internet. You may opt out of the use of the DART
          cookie for interest-based advertising by visiting the{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{" "}
          page. For more information on how Google uses data, please review{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            Google&rsquo;s Partner Sites policy
          </a>
          .
        </li>
        <li>
          <strong>Adsterra Network:</strong> We display Adsterra Social Bar and Native Banner ad units.
          Adsterra and its partners may set cookies or use similar tracking technologies to deliver relevant
          ads and measure ad performance. Adsterra operates independently of {SITE_NAME} and maintains its
          own privacy practices.
        </li>
      </ul>

      <h2>6. Your Rights Under GDPR (EU/EEA Users)</h2>
      <p>If you are located in the European Union or European Economic Area, you have the right to:</p>
      <ul>
        <li>Request access to any personal data we may hold about you (limited to non-file technical data described above);</li>
        <li>Request correction or deletion of such data;</li>
        <li>Object to or restrict certain processing;</li>
        <li>Request data portability; and</li>
        <li>Lodge a complaint with your local data protection supervisory authority.</li>
      </ul>
      <p>
        Because we do not retain your document content under any circumstances, most access/deletion
        requests related to your files are inherently satisfied — the data simply does not exist on our
        servers to begin with.
      </p>

      <h2>7. Your Rights Under the CCPA (California Residents)</h2>
      <p>
        If you are a California resident, the California Consumer Privacy Act (CCPA) grants you the right
        to know what personal information is collected, to request deletion of personal information, and to
        opt out of the sale of personal information. {SITE_NAME} does not sell personal information. The
        limited technical data described in Section 3 may be shared with service providers (such as
        hosting and analytics providers) strictly to operate the website.
      </p>

      <h2>8. Children&rsquo;s Privacy</h2>
      <p>
        Our services are not directed to children under the age of 13, and we do not knowingly collect
        personal information from children under 13. If you believe a child has provided us with personal
        information, please contact us so we can take appropriate action.
      </p>

      <h2>9. Data Security</h2>
      <p>
        Because document processing never leaves your browser, the overwhelming majority of security risk
        associated with traditional online PDF tools (server breaches, intercepted uploads, insecure cloud
        storage) simply does not apply to {SITE_NAME}. We still enforce HTTPS encryption for all website
        traffic and apply standard web security headers to protect against common web vulnerabilities.
      </p>

      <h2>10. International Users</h2>
      <p>
        Our website is hosted on global infrastructure (Vercel). The limited technical/analytics data
        described above may be processed in data centers located outside your country of residence,
        including the United States.
      </p>

      <h2>11. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices or for
        legal, regulatory, or operational reasons. The &ldquo;Last Updated&rdquo; date at the top of this
        page indicates when this policy was last revised. Continued use of the website after changes take
        effect constitutes acceptance of the revised policy.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact {OWNER_NAME}, Founder of{" "}
        {SITE_NAME}, at{" "}
        <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>.
      </p>
    </LegalLayout>
  );
}
